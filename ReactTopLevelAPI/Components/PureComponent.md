## React.PureComponent

在 React Component 的生命周期中，有一个 `shouldComponentUpdate` 方法。这个方法默认返回值是 `true`。

这意味着就算没有改变组件的 Props 或者 State，也会导致组件的重绘，也就是会重新执行 `render()` 函数。这就经常导致组件因为不相关数据的改变导致重绘，这极大的降低了 React 的渲染效率。

PureComponent 与 Component 的不同在于，PureComponent 内部会基于 Props 和 State 重新渲染前后自动执行一次第一层的 `shallowEqual`（浅比较），来决定是否更新组件，浅比较类似于浅拷贝，只会比较**第一层**。

📌 **组件函数要点：**

* 引用和第一层数据都没有发生改变，`render()` 方法就不会触发重新渲染
* 虽然第一层数据没变，但引用变了，就会造成虚拟 DOM 计算的浪费 [🌐性能问题](#性能问题)
* 第一层数据改变，但引用没变，会造成不渲染，所以需要很小心地操作数据

### 原理

当组件更新时，如果组件的 Props 和 State 都没发生改变， Render 方法就不会触发，省去 Virtual DOM 的生成和比对过程，达到提升性能的目的。

**需要注意的是，PureComponent 自动使用浅比较判断组件是否需要重绘。**

```js
if (this._compositeType === CompositeTypes.PureClass) {
  shouldUpdate = !shallowEqual(prevProps, nextProps)
  || !shallowEqual(inst.state, nextState);
}
```

而 `shallowEqual` 又做了什么呢？会比较 `Object.keys(state | props)` 的长度是否一致，每一个 `key` 是否两者都有，并且是否是一个引用，也就是只比较了第一层的值，确实很浅，所以深层的嵌套数据是对比不出来的。

### 使用指南

Props 和 State 中的原始类型的值的比较是比较合理的，而引用类型的值则是需要注意的。

继承 PureComponent 时，进行的是浅比较，也就是说，如果是引用类型的数据，只会比较是不是同一个地址，而不会比较具体这个地址存的数据是否完全一致。

#### 易变数据不能使用同一引用

由于 `shouldCompoenntUpdate` 前后 Props 和 State 只进行浅比较，也就是引用比较，因此变更数组或对象类型数据需要在原来数据基础上重新建立新的数组引用或对象引用。

* 数组
  * 使用数组的 `concat` 方法： `[].concat(options)` 
  * 使用扩展运算符：`[...options]`
* 对象
  * 使用对象的 `assign` 方法：`Object.assign({}, options)`
  * 使用扩展运算符：`{...options}`

```jsx
class App extends PureComponent {
  state = {
    items: [1, 2, 3]
  }
  handleClick = () => {
    const { items } = this.state;
    items.pop();
    // Bad 不会重新渲染
    this.setState({ items });
    // Better
    this.setState({ items: [].concat(items) });
  }
  render() {
    return (<div>
      <ul>
        {this.state.items.map(i => <li key={i}>{i}</li>)}
      </ul>
      <button onClick={this.handleClick}>delete</button>
    </div>)
  }
}
```

#### 内联函数

函数也经常作为 Props 传递，由于每次需要为内联函数创建一个新的实例，所以每次函数都会指向不同的内存地址。

```jsx
render() {
     <MyInput onChange={e => this.props.update(e.target.value)} />;
}
```

```jsx
update(e) {
     this.props.update(e.target.value);
}
render() {
     return <MyInput onChange={this.update.bind(this)} />;
}
```

以上两个例子都会导致在 `render()` 中创建新的函数实例。

🛠 为了解决这个问题，需要提前绑定 `this` 指针：

```jsx
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

#### 内置生命周期函数冲突

继承 PureComponent 时，不能再重写 `shouldComponentUpdate`，否则会引发警告。

如果 PureComponent 里含有 `shouldComponentUpdate` 函数的话，会直接使用 `shouldComponentUpdate` 的结果作为是否重新渲染的依据，没有 `shouldComponentUpdate` 函数的话，才会判断是否为 PureComponent，是的话再作 `shallowEqual` 比较。

```js
// 这个变量用来控制组件是否需要更新
var shouldUpdate = true;
// inst 是组件实例
if (inst.shouldComponentUpdate) {
  shouldUpdate = inst.shouldComponentUpdate(nextProps, nextState, nextContext);
} else {
  if (this._compositeType === CompositeType.PureClass) {
    shouldUpdate = !shallowEqual(prevProps, nextProps) ||
      !shallowEqual(inst.state, nextState);
  }
}
```

#### 老版本兼容写法

```jsx
import React { PureComponent, Component } from 'react';

class Foo extends (PureComponent || Component) {
  //...
}
```

#### 性能问题

比较原始值和对象引用是低耗时操作。如果你有一列子对象并且其中一个子对象更新，对它们的 Props 和 State 进行检查要比重新渲染每一个子节点要快的多。

### ImmutableJS

[Immutable.js](https://facebook.github.io/immutable-js/) 是 Facebook 在 2014 年出的持久性数据结构的库，持久性指的是数据一旦创建，就不能再被更改，任何修改或添加删除操作都会返回一个新的 Immutable 对象。可以让我们更容易的去处理缓存、回退、数据变化检测等问题，简化开发。并且提供了大量的类似原生 JavaScript 的方法，还有 Lazy Operation 的特性，完全的函数式编程。

---

**参考资料：**

* [React PureComponent 使用指南](http://www.wulv.site/2017-05-31/react-purecomponent.html)
* [当 PureComponent 遇上 ImmutableJS ，让 React 应用性能发挥到极致](http://www.wulv.site/2017-08-22/purecomponent-immutablejs.html)