---
nav:
  title: 基础
  order: 1
group:
  title: 进阶指引
  order: 2
title: setState
order: 2
---

# setState

> `setState()` enqueues changes to the component state and tells React that this component and its children need to be re-rendered with the updated state. This is the primary method you use to update the user interface in response to event handlers and server responses.
>
> `setState()` 将需要处理的变化塞入（译者注：setState 源码中将一个需要改变的变化存放到组件的 state 对象中，采用队列处理）组件的 state 对象中， 并告诉该组件及其子组件需要用更新的状态来重新渲染。这是用于响应事件处理和服务端响应的更新用户界面的主要方式。

官方文档关于 `setState` 的描述部分：

- [英文文档](https://reactjs.org/docs/react-component.html#setstate)
- [中文文档](http://react.yubolun.com/docs/react-component.html#setstate)

为了提高框架性能，React 将 `setState` 设置为 **状态批量处理或推迟更新**，实际上就是 **异步操作函数**，该方法不会以顺序控制流的方式处理相同周期内的事件，同时，我们也不能依赖 `this.state` 用于计算未来状态。

## 基本语法

```js
Component.prototype.setState(updater [, callback])
```

| 参数     | 说明     | 类型               |
| -------- | -------- | ------------------ |
| updater  | 更新器   | object \| function |
| callback | 回调函数 | function           |

### updater 参数

#### 函数形式

`updater` 参数可为一个带签名的函数。

```js
Component.prototype.setState((prevState, props) => stateChange);
```

| stateChange 参数 | 说明                                         | 类型 |
| ---------------- | -------------------------------------------- | ---- |
| prevState        | 未更新前状态的引用。该引用不应该被直接改变。 | obj  |
| props            | 父组件传入的属性                             | obj  |

`updater` 函数接收到的 `prevState`  和  `props` 保证都是最新的。

该函数通过对 `prevState` 或 `props` 的引用构建一个新对象作为输出，该输出后续用于与旧状态（prevState）浅合并。

🌰 **示例：**

```jsx | pure
this.setState((prevState, props) => {
  return {
    index: prevState.index + props.step,
  };
});
```

#### 对象形式

`updater` 参数亦可为对象类型，该对象仅会浅合并到新状态中。

```js
Component.prototype.setState(obj stateChange, [callback])
```

与函数形式相类似，对象形式的 `updater` 参数通过直接构建与旧状态浅合并的新对象作为输出。

🌰 **示例：**

```jsx | pure
this.setState({
  index: 1,
});
```

### callback 参数

`callback` 参数为可选的回调函数，该函数会在 **状态更新完成同时组件被重新渲染之后** 执行。通常，对于此类逻辑，官方推荐使用 `componentDidUpdate` 生命周期函数。

## 基本特性

在了解 `setState` 之前，我们先来简单了解 React 包装结构：**Transaction**

事务（Transaction）是 React 中的一个调用结构，用于包装一个方法，结构为：`initialize - performance(method) - close`。通过事务，可以统一管理一个方法的开始与结束；处于事务流中，表示进程正在执行一些操作；

```jsx | inline
import React from 'react';
import img from '../../assets/transaction-simplicity.jpg';

export default () => <img src={img} width={640} />;
```

### 状态不能直接修改

> 🖍 **常见面试题**：为什么不能直接通过 `this.state` 直接修改状态？

在实际开发中，直接修改状态中的值，虽然事实上改变了组件的内部状态，但是却没有驱动组件进行重新渲染，既然组件没有重新渲染，用户界面中 `this.state` 值对应显示部分也就不会有变化。而 `this.setState()` 函数所处理的事务，首先是改变 `this.setState` 的值，然后驱动组件经历更新过程，这样用户界面上相应的 `this.state` 值才有相应的变化。

```js
// Wrong
this.state.title = 'React';

// Good
this.setState({ title: 'React' });
```

### 异步与同步

`setState` 并不是单纯的异步或同步，这其实与调用时的环境相关。

#### 合成事件和生命周期函数

在 **合成事件** 和 **生命周期函数**（除 `componentDidUpdate` ）中，`setState` 是异步的。

**原因**：因为在 `setState` 的实现中，有一个判断：当更新策略正在 **事务流** 的执行中时，该组件更新会被推入 `dirtyComponents` 队列中等待执行；否则，开始执行 `batchedUpdates` 队列更新。

- 在生命周期函数调用中，更新策略都处于更新之前，组件仍处于事务流中，而 `componentDidUpdate` 是在更新之后，此时组件已经不在事务流中，因此则会同步执行
- 在合成事件中，React 是基于事务流完成的事件委托机制实现，也是处于事务流中；

**问题**：无法在 `setState` 后马上从 `this.state` 上获取更新后的值。

**解决**：如果需要马上同步并获取最新值，可通过 `setState((prevState, props) => {}, callback)` 获取最新的状态。

#### 原生事件和定时器

在 **原生事件** 和 **setTimeout** 中，`setState` 是同步的，可以马上获取更新后的值。

**原因**：原生事件是浏览器本身的实现，与事务流无关，自然是同步的；而 `setTimeout` 是放置于定时器线程中延后执行，此时事务流已结束，因此也是同步。

> 🖍 **常见面试题**：为什么 React 处理 `setState` 要实行异步更新机制？

由于 `setState` 会触发组件的更新渲染，也就会运行组件的 diff 算法。如果每次 `setState` 都要运行这套流程，将会十分消耗性能，并且完全没有必要。

**总结 `state` 实现异步更新的理由**：

- React 运行机制的性能考虑
- 这将破坏 `props` 和 `state` 之间的一致性，引起问题，非常难以调试
- 这将使一些 React 新特性不能实现

深入研究请查阅：📖 [setState](./setState.md)

### 批量更新

在**合成事件**和**生命周期函数**中，`setState` 更新队列时，存储的是合并状态（`Object.assign`）。因此前面设置的键值会被后面设置的键值覆盖，最终只会执行一次更新。

另外需要注意的事，同样不能依赖当前的 `props` 计算下个状态，因为 `props` 一般也是从父组件的 `state` 中获取，依然无法确定在组件状态更新时的值。

由于 Fiber 及合并的问题，官方推荐可以传入函数的形式使用 `setState` 。使用函数式，可以用于避免 `setState` 的批量更新的逻辑，传入的函数将会被**顺序调用**。

批量更新以生命周期为界：

- 组件挂载前的所有 `setState` 批量更新
- 组件挂载后到更新前的所有 `setState` 批量更新
- 每次更新间隙的所有 `setState` 批量更新

⚠️ 注意事项：

- `setState` 合并，在合成事件和生命周期函数中多次连续调用会被优化为一次；
- 当组件已被销毁，如果再次调用 `setState`，React 会被报错警告，通常有两种解决办法
  - 将数据挂载在外部，通过 `props` 传入，如放到 Redux 或父级中；
  - 在组件内部维护一个状态量（`isUnmounted`），`componentWillUnmount` 中标记为 `true`，在 `setState` 前进行判断；
  - 如果是异步请求副作用，可以在 `componentWillUnmount` 中取消未响应的异步请求。

## 最佳实践

- [同周期内多次调用](#同周期内多次调用)
- **同步更新策略**
  - [完成回调](#完成回调)
  - [传入状态计算函数](#传入状态计算函数)

### 同周期内多次调用

当相同周期内多次调用 `setState()` 以更新相同的状态时，这些调用可能会被合并在一起。

设想有一个需求，需要在 `onClick` 里累加两次。

```js
onClick = () => {
  this.setState({ index: this.state.index + 1 });
  this.setState({ index: this.state.index + 1 });
};
```

当 React 对代码进行解析时，会对上述代码作以下解析：

```js
Object.assign(
	previousState,
	{index: state.index + 1},
	{index: state.index + 1},
	...
)
```

由于后面的数据会覆盖前面的更改，所以最终只加了一次。所以如果是下一个 `state` 的更新依赖前一个 `state` 的情况下，推荐 `setState()` 的 `updater` 参数使用函数形式传入。

```js
onClick = () => {
  this.setState((prevState, props) => {
    return { quantity: prevState.quantity + 1 };
  });
  this.setState((prevState, props) => {
    return { quantity: prevState.quantity + 1 };
  });
};
```

### 同步更新策略

由于 `setState` 采取异步批量更新策略，而实际业务中某些场景需要用到同步更新逻辑。

🌰 **示例**：从服务端请求数据并且渲染到页面后，隐藏加载进度条或者外部加载提示 [参考文章](https://zhuanlan.zhihu.com/p/24781259)

```js
componentDidMount() {
  fetch('https://example.com')
    .then((res) => res.json())
    .then(
      (something) => {
        this.setState({ something });
        StatusBar.setNetworkActivityIndicatorVisible(false);
      }
    );
}
```

因为 `setState` 函数并 **不会阻塞** 等待状态更新完毕，因此 `setNetworkActivityIndicatorVisible` 有可能先于数据渲染完毕就执行。我们可以选择在 `componentWillUpdate` 与 `componentDidUpdate` 这两个生命周期的回调函数中执行 `setNetworkActivityIndicatorVisible`，但是会让代码变得破碎，可读性也不好。

实际上在项目开发中我们更频繁遇见此类问题的场景是通过某个变量控制元素可见性：

```js
this.setState({
  showForm: !this.showForm,
});
```

我们预期的效果是每次事件触发后改变表单的可见性，但是在大型应用程序中如果事件的触发速度快于 `setState` 的更新速度，那么我们的值计算完全就是错的。本节就是讨论两种方式来保证 `setState` 的同步更新。

#### 完成回调

`setState` 函数的第二个参数允许传入回调函数，**在状态更新完毕后进行调用**。

```js
this.setState(
  {
    load: !this.state.load,
    count: this.state.count + 1,
  },
  () => {
    console.log(this.state.count);
    console.log('加载完成');
  }
);
```

这里回调函数用法相信大家很熟悉，就是 JavaScript 异步编程相关知识，我们可以引用 Promise 来封装 `setState`：

```jsx | pure
setStateAsync(state) {
	return new Promise((resolve) => {
		this.setState(state, resolve)
	});
}
```

`setStateAsync` 返回的是 Promise 对象，在调用时我们可以使用 Async/Await 语法来优化代码风格：

```jsx | pure
async componentDidMount() {
    StatusBar.setNetworkActivityIndicatorVisible(true)

    const res = await fetch('https://api.ipify.org?format=json')

    const {ip} = await res.json()

    await this.setStateAsync({ipAddress: ip})

    StatusBar.setNetworkActivityIndicatorVisible(false)
}
```

这里我们就可以保证在 setState 渲染完毕之后调用外部状态栏将网络请求状态修改为已结束，整个组件的完整定义为：

```jsx | pure
class AwesomeProject extends Component {
  state = {}
  setStateAsync(state) {
    ...
  }
  async componentDidMount() {
   ...
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          My IP is {this.state.ipAddress || 'Unknown'}
        </Text>
      </View>
    );
  }
}
```

### 浏览器监听事件

```jsx | pure
class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      index: 0,
    };
  }
  componentDidMount() {
    this.setState({ value: this.state.value + 1 });
    console.log(this.state);
    // 第1次输出 0

    this.setState({ value: this.state.value + 1 });
    console.log(this.state);
    // 第2次输出 0

    setTimeout(() => {
      this.setState({ value: this.state.value + 1 });
      console.log(this.state);
      // 第3次输出 2

      this.setState({ value: this.state.value + 1 });
      console.log(this.state);
      // 第4次输出 3
    }, 0);
  }

  click() {
    this.setState({ value: this.state.index + 1 });
  }

  render() {
    return (
      <div>
        <button ref="button" onClick={this.click} />
      </div>
    );
  }
}
```

`setTimeout` 里的两次 `setState` 的值同步更新了，

在 React 中，如果是由 React 引发的事件处理（比如：`onClick` 引发的事件处理），调用 `setState` 不会同步更新 `this.state`，除此之外的 `setState` 调用会同步执行 `this.setState`。「除此之外」指的是：绕过 React 通过 `addEventListener` 直接添加的事件处理函数和 `setTimeout/setInterval` 产生的异步调用。

## 实现流程

`setState` 流程还是很复杂的，设计也很精巧，避免了重复无谓的刷新组件。它的主要流程如下

1. `enqueueSetState` 将 `state` 放入队列中，并调用 `enqueueUpdate` 处理要更新的 Component
2. 如果组件当前正处于 `update` 事务中，则先将 Component 存入 `dirtyComponent` 中。否则调用 `batchedUpdates` 处理。
3. `batchedUpdates` 发起一次 `transaction.perform()` 事务
4. 开始执行事务初始化，运行，结束三个阶段
   - 初始化：事务初始化阶段没有注册方法，故无方法要执行
   - 运行：执行 `setSate` 时传入的 `callback` 方法，一般不会传 `callback` 参数
   - 结束：更新 `isBatchingUpdates` 为 `false`，并执行 `FLUSH_BATCHED_UPDATES` 这个 `wrapper` 中的 `close` 方法
5. `FLUSH_BATCHED_UPDATES` 在 `close` 阶段，会循环遍历所有的 `dirtyComponents，调用` `updateComponent` 刷新组件，并执行它的 `pendingCallbacks`, 也就是 `setState` 中设置的 `callback`。

## 总结

- `setState` 不会立即更改 React 组件内状态
- `setState` 通过引发一次组件的更新过程来引发重新渲染
  - `shouldComponentUpdate`（被调用时，`this.state` 没有更新；如果返回 `false`，生命周期中断，但 `this.state` 仍会更新）
  - `componentWillUpdate`（被调用时 `this.state` 没有更新）
  - `render`（被调用时 `this.setState` 得到更新）
  - `componentDidUpdate`
- `setState` 的多次调用产生的效果将被合并

---

**引用参考：**

- [📝 React：setState 详解](https://juejin.im/post/5a155f906fb9a045284622b4)
- [📝 揭秘 React setState](https://juejin.im/post/5b87d14e6fb9a01a18268caf)
- [📝 React 中 setState 的同步更新策略](https://zhuanlan.zhihu.com/p/24781259)
- [📝 从 setState Promise 化的探讨体会 React 团队设计思想](https://www.jianshu.com/p/7d2f9e582403)
- [📝 React 的生命周期与 setState 的关系](https://juejin.im/post/5b45d406f265da0f8e19d4c8?utm_medium=hao.caibaojian.com&utm_source=hao.caibaojian.com)
- [📝 How Does setState Know What to Do?](https://overreacted.io/how-does-setstate-know-what-to-do/)
