---
nav:
  title: API
  order: 4
group:
  title: React
  order: 1
title: React.PureComponent
order: 1
---

# React.PureComponent

在 React Component 的生命周期中，有一个 `shouldComponentUpdate` 方法。这个方法默认返回值是 `true`。

这意味着就算没有改变组件的 `props` 或者 `state`，也会导致组件的重绘，也就是会重新执行 `render` 函数。这就经常导致组件因为不相关数据的改变导致重绘，这极大的降低了 React 的渲染效率。

PureComponent 与 Component 的不同在于，PureComponent 内部会基于 `props` 和 `state` 重新渲染前后自动执行一次 **第一层** 的 `shallowEqual`（浅比较），来决定是否更新组件，浅比较类似于浅拷贝。

📌 **组件函数要点：**

- 引用和第一层数据都没有发生改变，`render` 方法就不会触发重新渲染
- 虽然第一层数据没变，但引用变了，就会造成虚拟 DOM 计算的浪费 [🌐 性能问题](#性能问题)
- 第一层数据改变，但引用没变，会造成不渲染，所以需要很小心地操作数据

## 实现原理

当组件更新时，如果组件的  `props`  和  `state`  都没发生改变，`render`  方法就不会触发，省去  Virtual DOM  的生成和比对过程，达到提升性能的目的。

**需要注意的是，PureComponent 自动使用浅比较判断组件是否需要重绘。**

```jsx | pure
if (this._compositeType === CompositeTypes.PureClass) {
  shouldUpdate = !shallowEqual(prevProps, nextProps) || !shallowEqual(inst.state, nextState);
}
```

而  `shallowEqual`  又做了什么呢？会比较  `Object.keys(state | props)`  的长度是否一致，每一个  `key`  是否两者都有，并且是否是一个引用，也就是只比较了第一层的值，确实很浅，所以深层的嵌套数据是对比不出来的。

## 使用指南

### 重建引用数据类型

由于 `shouldCompoenntUpdate` 前后 `props` 和 `state` 只进行浅比较，也就是引用比较，因此变更数组或对象类型数据需要在原来数据基础上重新建立新的数组引用或对象引用。

- 数组
  - 使用数组的 `concat` 方法： `[].concat(options)`
  - 使用扩展运算符：`[...options]`
- 对象
  - 使用对象的 `assign` 方法：`Object.assign({}, options)`
  - 使用扩展运算符：`{...options}`

```jsx | pure
class App extends PureComponent {
  state = {
    items: [1, 2, 3],
  };
  handleClick = () => {
    const { items } = this.state;
    items.pop();
    // Bad 不会重新渲染
    this.setState({ items });
    // Better
    this.setState({ items: [].concat(items) });
  };
  render() {
    return (
      <div>
        <ul>
          {this.state.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        <button onClick={this.handleClick}>delete</button>
      </div>
    );
  }
}
```

### 内联函数

函数也经常作为 `props` 传递，由于每次需要为内联函数创建一个新的实例，所以每次函数都会指向不同的内存地址。

**箭头函数写法**：

```jsx | pure
render() {
     <MyInput onChange={(e) => this.props.update(e.target.value)} />;
}
```

**利用 `bind` 函数绑定指针**：

```jsx | pure
update(e) {
     this.props.update(e.target.value);
}
render() {
     return <MyInput onChange={this.update.bind(this)} />;
}
```

以上两个例子都会导致每次 `render` 时都会创建新的函数实例。

📌 为了解决这个问题，需要提前至构造函数 `constructor` 绑定函数调用的 `this` 指针：

```jsx | pure
constructor(props) {
    super(props);
    this.update = this.update.bind(this);
}
update(e) {
    this.props.update(e.target.value);
}
render() {
    return <MyInput onChange={this.update} />;
}
```

### 空引用类型

有时候后台返回的数据中，数组长度为 0 或者对象没有属性会直接给个 `null`，这时候我们需要做些容错。

```jsx | pure
class App extends PureComponent {
  state = {
    items: [{ name: 'abc' }, null, { name: 'c' }],
  };

  store = (id, value) => {
    const { items } = this.state;
    items[id] = assign({}, items[id], { name: value });
    this.setState({ items: [].concat(items) });
  };

  render() {
    return (
      <div>
        <ul>
          {this.state.items.map((i, k) => (
            <Item style={{ color: 'red' }} store={this.store} key={k} id={k} data={i || {}} />
          ))}
        </ul>
      </div>
    );
  }
}
```

当某个自组件调用函数变更列表中某个对象类型值的属性时，触发重新渲染，如果数据是 `null` 的话，`data` 属性每次都是一个空对象 `{}`，`{} === {}` 是 `false`，这样会无端地让这几个子组件重新渲染。

最好为子组件设置 `defaultValue` 为 `{}`。

```jsx | pure
static defaultValue = {}

const style = { color: 'red' }

<Item style={style} store={this.store} key={k} id={k} data={i || defaultValue} />
```

### 与内置生命周期函数冲突

继承 PureComponent 时，不能为组件添加 `shouldComponentUpdate` 生命周期函数，否则会引发警告。

如果 PureComponent 里含有 `shouldComponentUpdate` 函数的话，会直接使用 `shouldComponentUpdate` 的结果作为是否重新渲染的依据，没有 `shouldComponentUpdate` 函数的话，才会判断是否为 PureComponent，是的话再作 `shallowEqual` 比较。

```jsx | pure
// 这个变量用来控制组件是否需要更新
var shouldUpdate = true;

// inst 是组件实例
if (inst.shouldComponentUpdate) {
  shouldUpdate = inst.shouldComponentUpdate(nextProps, nextState, nextContext);
} else {
  if (this._compositeType === CompositeType.PureClass) {
    shouldUpdate = !shallowEqual(prevProps, nextProps) || !shallowEqual(inst.state, nextState);
  }
}
```

### 老版本兼容写法

```js
import React { PureComponent, Component } from 'react';

class Foo extends (PureComponent || Component) {
  //...
}
```

## 同类型对比

### 与无状态组件对比

无状态组件输入输出完全由 `props` 决定，而且不会产生任何副作用。

无状态组件可以通过减少继承 Component 而来的生命周期函数而达到性能优化的效果。从本质上来说，无状态组件就是一个单纯的 `render` 函数，所以无状态组件的缺点也是显而易见的。因为它没有 `shouldComponentUpdate` 生命周期函数，所以每次 `state` 更新，它都会重新绘制 `render` 函数。

> 🖍 什么时候使用 `PureComponent`，什么时候使用无状态组件？

`PureComponent` 提高了性能，因为它减少了应用程序中的渲染操作次数，这对于复杂的 UI 来说是巨大的胜利，因此建议尽可能使用。此外，还有一些情况需要使用 `Component` 的声明周期方法，在这种情况下，我们不能使用无状态组件。

无状态组件易于实施且快速实施，它们适用于非常小的 UI 视图，其中重新渲染成本无关紧要。它们提供更清晰的代码和更少的文件来处理。

### 与 memo 对比

`React.memo` 为高阶组件。它实现的效果与  `React.PureComponent` 相似，不同的是：

- `React.memo` 用于函数组件
- `React.PureComponent` 适用于 class 组件
- `React.PureComponent` 只是浅比较 `props`、`state`，`React.memo` 也是浅比较，但它可以自定义比较函数

## 参考资料

- [📝 React PureComponent 使用指南](http://www.wulv.site/2017-05-31/react-purecomponent.html)
- [📝 当 PureComponent 遇上 ImmutableJS ，让 React 应用性能发挥到极致](http://www.wulv.site/2017-08-22/purecomponent-immutablejs.html)
