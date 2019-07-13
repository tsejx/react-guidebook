# 生命周期

生命周期指 React 组件从装载至卸载的全过程，这个过程内置多个函数供开发者在组件的不同阶段执行需要的逻辑。

- **装载阶段 Mounting**
  - [**`constructor`**](#constructor)
  - [**`static getDerivedStateFromProps`**](#static-getderivedstatefromprops)
  - ⚠️ [`UNSAFE_componentWillMount`](#unsafe_componentwillmount)
  - [**`render`**](#render)
  - [**`componentDidMount`**](#componentdidmount)
- **更新阶段 Updating**
  - ⚠️ [UNSAFE_componentWillReceiveProps](#unsafe_componentwillreceiveprops)
  - [**`static getDerivedStateFromProps`**](#unsafe_componentwillreceivepropsnextprops)
  - [`shouldComponentUpdate`](#shouldcomponentupdate)
  - ⚠️ [UNSAFE_componentWillUpdate](#unsafe_componentwillupdate)
  - **`render`**
  - [`getSnapshotBeforeUpdate`](#getsnapshotbeforeupdate)
  - [**`componentDidUpdate`**](#componentdidupdate)
- **卸载阶段 Unmounting**
  - [**`componentWillUnmount`**](#componentwillunmount)
- **捕捉错误 Error Handling**
  - [`static getDerivedStateFromError`](#static-getderivedstatefromerror)
  - [`componentDidCatch`](#componentdidcatch)

状态组件主要通过 3 个生命周期阶段来管理，分别是 `MOUNT`，`UPDAT` 和 `UNMOUNT`。

从纵向划分，可以划分为 Render 阶段和 Commit 阶段。

- Render 阶段：纯净且不包含副作用，可能会被 React 暂停、中止或重新启动
- Commit 阶段：可以使用 DOM，运行副作用，安排更新

[React Lifecycle Methods Diagram](http://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)

![React Lifecycle Methods Diagram](../snapshots/react-lifecycle-methods-diagram.jpg)

## 装载阶段 Mounting

组件的渲染并且构造 DOM 元素插入到页面的过程称为组件的**装载**。

装载阶段执行的函数会在组件实例被**创建**和**插入** DOM 中时被触发，这个过程主要实现**组件状态的初始化**。

### constructor

**构造函数**。

📜 **语法**：`constructor(props, context, updater)`

- `props`：继承 React.Component 的属性方法，它是不可变的 read-only
- `context`：全局上下文。
- `updater`：包含一些更新方法的对象
  - `this.setState` 最终调用的是 `this.updater.enqueueSetState`
  - `this.forceUpdate` 最终调用的是 `this.updater.enqueueForceUpdate` 方法，所以这些 API 更多是 React 调用使用，暴露出来以备开发者不时之需。

⏱ **触发时机**：在组件初始化的时候触发一次。

💡 **使用建议**：

- 设置初始化状态：因为组件的生命周期中任何函数都可能要访问 State，那么整个周期中第一个被调用的构造函数便是初始化 State 最理想的地方；
- 绑定成员函数上下文引用：
  - 因为在 ES6 语法下，类的每个成员函数在执行时的 `this` 并不是和类实例自动绑定的；
  - 而在构造函数中 `this` 就是当前组件实例，所以，为了方便将来调用，往往在构造函数中将这个实例的特定函数绑定 `this` 为当前类实例；
  - 建议定义函数方法时直接使用箭头函数，就无须在构造函数中进行函数的 `bind` 操作。

在 ES6 中，在构造函数中通过 `this.state` 赋值完成状态初始化；通过给类属性（注意是类属性，而不是类实例对象的属性）`defaultProps` 赋值指定的 Props 初始值。

🌰 **使用示例**：

```js
class Sample extends React.Component {
  constructor(props, context, updater) {
    super(props);
    this.state = {
      foo: 'InitailValue',
    };
  }
}

Sample.defaultProps = {
  bar: 'InitialValue',
};
```

### static getDerivedStateFromProps

📜 **语法**：`static getDerivedStateFromProps(nextProps, prevState)`

⏱ **触发时机**：该函数会在组件化实例化后和重新渲染前调用（生成 VirtualDOM 之后，实际 DOM 挂载之前），意味着无论是父组件的更新、props 的变化或通过 setState 更新组件内部的 State，它都会被调用。

🔙 **返回值**：该生命周期函数必须有返回值，它需要返回一个对象来更新 State，或者返回 `null` 来表明新 Props 不需要更新任何 State。

🆕 **新特性**：当组件实例化时，该方法替代了 componentWillMount，而当接收新的 props 时，该方法替代了 componentWillReceiveProps 和 componentWillUpdate。

⚠️ **注意事项**：

- 在组件装载和更新阶段都会触发。
- 如果父组件导致了组件的重新渲染，即使属性没有更新，这一方法也会被触发；
- 如果你只想处理 Props 的前后变化，你需要将上一个 Props 值存到 State 里作为镜像；

* 该生命周期函数是一个静态函数，所以函数体内无法访问指向当前组件实例的指针 `this`；
* 当需要更新 State 时，需要返回一个对象，否则，返回一个 `null`

🎉 **适用场景**：表单获取默认值

❓ **为什么该生命周期函数要设计成静态方法呢？**

该生命周期函数被设计成静态方法的目的是为了**保持该方法的纯粹**。通过更具父组件输入的 Props 按需更新 State，这种 State 叫做衍生 State，返回的对象就是要增量更新的 State，除此之外不应该在里面执行任何操作。

通过设计成静态方法，能够起到限制开发者无法访问 `this` 也就是实例的作用，这样就不能在里面调用实例方法或者 `setState` 以破坏该生命周期函数的功能。

```jsx
import React, { Component } from 'react';

class App extends Component {
  render() {
    return <div>React</div>;
  }
}
```

这个生命周期函数也经历了一些波折，原本它是被设计成 `初始化`、`父组件更新` 和 `接收到 Props` 才会触发，现在只要渲染就会触发，也就是 `初始化` 和 `更新阶段` 都会触发。

🌰 **使用示例**：

```js
static getDerivedStateFromProps(nextProps, prevState) {
  if (nextProps.translateX !== prevState.translateX) {
    return {
      translateX: nextProps.translateX
    }
  }
  if (nextProps.data !== prevState.data){
      return {
          data: nextProps.data
      }
  }
  return null;
}
```

### UNSAFE_componentWillMount

> 🗑 此生命周期函数将在 React v17 正式废弃。

**预装载函数**。

⏱ **触发时机**：在构造函数和装载组件（将 DOM 树渲染到浏览器中）之间触发。装载组件后将执行 `render` 渲染函数。因此在此生命周期函数里使用 `setState` 同步设置组件内部状态 State 将不会触发重新渲染。

⚠️ **注意事项**：避免在该方法中引入任何的副作用（Effects）或订阅（Subscription）。对于这些使用场景，建议提前到构造函数中。

### render

**渲染函数**。

🔙 返回值：唯一的一定不能省略的函数，而且必须有返回值。返回 `null` 或 `false` 表示不渲染任何 DOM 元素。

当触发时，其应该检查 `this.props` 和 `this.state` 并返回以下类型之一：

- **React 元素**。通常是由 JSX 创建。该元素可能是一个原生 DOM 组件的表示，如 `<div />`，或者是一个你定义的合成组件。
- **数组和片段**。让你返回多个元素的片段（Fragment）。
- **字符串和数字**。这些将被渲染为 DOM 中的文本节点（Text Node）。
- **Protals**。由  [`ReactDOM.createPortal`](http://react.yubolun.com/docs/portals.html)  创建。
- **布尔值和`null`**。什么都不渲染（通常存在于   `return test && <Child />` 写法，其中  `test`  是布尔值。）

它是一个仅仅用于渲染的**纯函数**，返回值完全取决于 State 和 Props，不能在函数中任何修改 Props、State、请求数据等具有副作用的操作，不能读写 DOM 信息，也不能和浏览器进行交互（例如 `setTimeout`）。如果需要和浏览器交互，在 `componentDidMount()` 中或者其它生命周期方法完成相关事务。

此渲染函数并不做实际的渲染动作（渲染到 DOM 树），它返回的只是一个 JSX 的描述对象（及组件实例），何时进行真正的渲染是有 React 库决定的。而 React 肯定是要把所有组件返回的结果综合起来，才能知道如何产生真实的 DOM 树。也就是说，只有 React 库调用所有组件的渲染函数之后，才有可能完成 DOM 装载，这时候才会依次调用 `componentDidMount` 函数作为装载的收尾。

保持 `render()` 纯粹，可以使服务器端渲染更加切实可行，也使组件更容易被理解。

⚠️ 注意事项：

- 请勿在此函数中使用 `setState` 方法；
- 请勿在此函数中修改 Props、State 以及数据请求等具有副作用的操作。

### componentDidMount

**装载成功函数**。

⏱ **触发时机**：组件完全挂载到网页上后触发。

🎉 **适用场景**：发送网络请求；任何依赖于 DOM 的初始化操作；添加事件监听；如果使用了 Redux 之类的数据管理工具，也能触发 action 处理数据变化逻辑。

🔬**深入研究**：该函数不会在 `render` 函数调用完成之后立即触发，因为 `render` 函数仅仅是返回了 JSX 的对象，并没有立即挂载到 DOM 树上，而该生命周期函数是在**组件被渲染到 DOM 树（称为初始化渲染）**之后触发的。

⚠️ **注意事项**：该生命周期函数在进行服务器端渲染时不会触发（仅客户端有效）。

💡 **使用建议**：

- `componentDidMount` 通常用于**加载外部数据**（即发送网络请求），之所以在 `componentDidMount` 中而不是在构造函数中进行数据请求的原因在于：如果数据加载完毕后，即 Props 已经有值了，但是组件还没有渲染出来，会报错。但是这里有一些把数据拉取提前到 `constructor` 函数的思路：在 `contructor` 函数中，通过 Promise 来进行数据的请求，并且绑定到当前实例对象上，然后在 `componentDidMount` 中执行 Promise 把数据更新到 props 上。
- 在生命周期中的这个时间点，组件拥有一个 DOM 展现，你可以通过 `this.getDOMNode()` 来获取相应 DOM 节点。适用于**需要初始化 DOM 节点的操作**。
- 如果想和其它 JavaScript 框架集成，使用 `setTimeout` 或者 `setInterval` 来设置定时器，或者发送 AJAX 请求，可以在该方法中执行这些操作。适用于 **AJAX 请求**。
- 此钩子函数中允许使用 setState 改变组件内 State。

## 更新阶段 Updating

属性（Props）或状态（State）的改变会触发一次更新阶段，但是组件未必会重新渲染，这取决于 `shouldComponentUpdate`。

### UNSAFE_componentWillReceiveProps

> 🗑 此生命周期函数将在 React v17 正式废弃。

📜 **语法**：`UNSAFE_componentWillReceiveProps(nextProps)`

⏱ **触发时机**：当父组件的渲染函数被调用，在渲染函数中被渲染的子组件就会经历更新阶段，不管父组件传给子组件的 Props 有没有改变，都会触发该生命周期函数。当组件内部调用 `setState` 更新内部状态 State 时触发更新阶段不会触发该函数。

🎉 **适用场景**：适合用于父子组件之间的联动，适合父组件根据某个状态控制子组件的渲染或者销毁。通过对比 `this.props` 和 `nextProps` 来对本组件内的 State 进行变更，或执行某些方法来进行组件的重新渲染。

💡 **使用建议**：在该回调函数中，可以根据属性的变化，通过调用 `this.setState()` 来更新组件状态。通过参数 `nextProps` 获取新的 Props 值，而旧的属性可以通过 `this.props` 获取，基于状态变化前后的 Props 对比的结果去实现不同的行为，避免不必要的渲染。这里进行状态更新是安全的，并不会触发额外的 `render` 。

🔬**深入研究**：该生命周期函数需要提供条件跳出，因为更新内部状态 State 的方法是 `this.setState()` ，如果 `this.setState()` 的调用导致 `componentWillReceiveProps` 再调用，那将是一个死循环。

🌰 **使用示例**：

```jsx
componentWillReceiveProps(nextProps) {
    if (this.props.sharecard_show !== nextProps.sharecard_show){
        if (nextProps.sharecard_show){
            this.handleGetCard();
        }
    }
}
```

⚠️ 推荐使用 `static getDerivedStateFromProps()` 代替。

### shouldComponentUpdate

📜 **语法**：`shouldComponentUpdate(nextProps, nextState)`

⏱ **触发时机**：每次组件因为 State 和 Props 变化而更新时，在**重新渲染前**该生命周期函数都会触发，让 React 知道当前 State 或 Props 的改变是否影响组件的输出（渲染）。

🔙 **返回值**：根据逻辑判断返回 `true` 表示继续进行组件渲染，否则将停止组件渲染过程。默认返回 `true`，也就是说，只要组件触发了更新，组件就一定会更新。

🔬**深入研究**：在一个更新生命周期中，组件及其子组件将根据该方法返回的布尔值来决定是否继续这次更新过程（重新渲染）。这样你可以在必要的时候阻止组件的渲染生命周期（Render Lifecycle）方法，避免不必要的渲染。

默认情况下，该方法默认返回 `true`，表示需要重新渲染，在大部分情况下你应该依赖于默认行为。如果在 State 改变的时候为了避免细微的 Bug，或是如果总是把 State 当做不可变的，在 `render()` 中只从 Props 和 State 读取值，此时你可以覆盖该方法，实现新老 Props 和 State 的比对逻辑。

当该方法返回的布尔值 `false` 告知 React 无须重新渲染时，`render`、`UNSAFE_componentWillUpdate` 和 `componentDidUpdate` 等生命周期钩子函数都不会被触发。

💡 **使用建议**：

- 如果性能是个瓶颈，尤其是有几十个甚至上百个组件的时候，使用 `shouldComponentUpdate` 可以优化渲染效率，提升应用的性能；
- 使用 `React.PureComponent` 组件基类能自动实现一个 `shouldComponentUpdate` 生命周期钩子，可以默认为组件更新校验，但是只会对更新数据进行浅层对照；
- 在对 `this.props` 和 `nextProps` 以及 `this.state` 和 `nextState` 进行比较时需要注意引用类型的坑；
- 通常用于条件渲染，优化渲染的性能。

⚠️ **注意事项**：

- 此钩子函数在初始化渲染和使用了 `forceUpdate` 方法的情况下不会被触发，使用 `forceUpdate` 会强制更新

- 请勿在此函数中使用 `setState` 方法，会导致循环调用。

### UNSAFE_componentWillUpdate

> 🗑 此生命周期函数将在 React v17 正式废弃。

**预更新函数**。

📜 **语法**：`UNSAFE_componentWillUpdate(nextProps, nextState)`

⏱ **触发时机**：这个方法是一个更新生命周期中重新渲染执行之前的最后一个方法。你已经拥有了下一个属性和状态，他们可以在这个方法中任由你处置。你可以利用这个方法在渲染之前进行最后的准备。

🎉 **适用场景**：根据 State 的 变化设置变量；派发事件；开始动画。

⚠️ **注意事项**：

- 此钩子函数在初始化渲染的时候不会被触发；
- 请勿在此函数中使用 `setState` 方法，会导致循环调用。如果需要基于新的 Props 计算 State，建议使用 `componentWillRreceiveProps`。

### render

渲染函数。与上文所提及的 `render` 生命周期函数一致，用于输出 JSX 并经过 React 处理后渲染至浏览器。

### getSnapshotBeforeUpdate

**保存状态快照。**

📜 **语法**：`getSnapshotBeforeUpdate(prevProps, prevState)`

⏱ **触发时机**：该生命周期函数会在组件即将挂载时触发，它的触发在 `render` 渲染函数之后。由此可见，`render` 函数并没有完成挂载操作，而是进行构建抽象 UI（也就是 Virtual DOM）的工作。该生命周期函数执行完毕后就会立即触发 `componentDidUpdate` 生命周期钩子。

🎉 **适用场景**：该生命周期函数能让你捕获某些从 DOM 中才能获取的（可能会变更的）信息（例如，元素重新渲染后页面各种定位位置的变更等）。

作用：比如网页滚动位置，不需要它持久化，只需要在组件更新以后能够恢复原来的位置即可。

⚠️ **注意事项**：

- 该生命周期函数返回的值将作为第三个参数传递给 `componentDidUpdate`，我们可以利用这个通道保存一些不需要持久化的状态，用完即可舍弃。（这个生命周期不是经常需要的，但可以用于在恢复期间手动保存滚动位置的情况。）
- 该函数的出现是为了 React 17 的异步渲染而准备的

⚠️ 与 `componentDidUpdate` 一起，这个新的生命周期将覆盖旧版 `componentWillUpdate` 的所有用例。

```js
getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('#enter getSnapshotBeforeUpdate');
    return 'foo';
}

componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('#enter componentDidUpdate snapshot = ', snapshot);
}
```

### componentDidUpdate

**更新完成函数**。

📜 **语法**：`componentDidUpdate(nextProps, nextState, snapshot)`

⏱ **触发时机**：组件每次重新渲染后触发，相当于首次渲染（初始化）之后触发 `componentDidMount` ，

🎉 **适用场景**：操作 DOM；发送网络请求。

⚠️ **注意事项**：

- 将原先写在 componentWilUpdate 中的回调迁移至 componentDidUpdate，将以前放在 componentWillReceiveProps 中的异步网络请求放在 componentDidUpdate 中。
- 在该生命周期中使用 `setState` 时，必须加 if 条件判断，通过判断 prevProps、prevState 和 this.state 之间的数据变化，来判断是否执行相关的 State 变更逻辑，这使得尽管在 componentDidUpdate 中调用了 setState 进行再更新，但是直至条件不成立，就不会造成程序死循环。
- 此生命周期函数不会在初始化渲染的时候触发。

相比装载阶段的生命周期函数，更新阶段的生命周期函数使用的相对来说要少一些。常用的是 `getDerivedStateFromProps`、`shouldComponentUpdate`，前者经常用于根据新 Props 的数据去设置组件的 State，而后者则是常用于优化，避免不必要的渲染。

```jsx
componentDidUpdate(prevProps){
    if (this.props.id !== prevProps.id){
        this.fetchData(this.props.id);
    }
}
```

## 卸载阶段 Unmounting

### componentWillUnmount

**预卸载函数**。

⏱ **触发时机**：在组件卸载和销毁之前触发。可以利用这个生命周期方法去**执行任何清理任务**。

🎉 **适用场景**：用于注销事件监听器；取消网络请求；取消定时器；解绑 DOM 事件。

⚠️ **注意事项**：在该方法中调用 `setState` 不会触发 `render`，因为所有的更新队列，更新状态都被重置为 `null`。

## 捕捉错误 Error Handling

在渲染过程中发生错误时会被触发。

### static getDerivedStateFromError

📜 **语法**：`static getDervedStateFromError(error)`

⏱ **触发时机**：该生命周期函数会在子孙组件抛出错误时执行。

🔙 **返回值**：它接收抛出的错误作为参数并且需要返回值用于更新 State。

💡 **使用建议**：

- 该生命周期函数中可用于修改 State 以显示错误提醒的 UI，或者将错误信息发送到服务端进行 Log 用于后期分析；
- 在捕获到错误的瞬间，React 会在这次渲染周期中将这个组件渲染为 `null`，这就有可能导致他的父组件设置他上面的 `ref` 获得 `null` 而导致一些问题；

这个生命周期函数与 `getDerivedStateFromProps` 类似，唯一的区别是他只有在出现错误的时候才触发，他相对于 `componentDidCatch` 的优势是在当前的渲染周期中就可以修改 State，以在当前渲染就可以出现错误的 UI，而不需要一个 `null` 的中间态。

而这个方法的出现，也意味着以后出现错误的时候，修改 State 应该放在这里去做，而后续收集错误信息之类的放到 `componentDidCatch` 里面。

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStatteFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }
  render() {
    if (this.state.hasErro) {
      // You can render any custom fallback UI
      return <h1>Something went wwrong</h1>;
    }

    return this.props.children;
  }
}
```

### componentDidCatch

📜 **语法**：`componentDidCatch(error, info)`

- `error` - 抛出的错误对象
- `info` - 包含有关错误的信息的对象

⏱ **触发时机**：该生命周期函数会在子孙组件抛出错误时触发。

⚠️ **注意事项**：错误边界只能捕捉生命周期中的错误（`componentWillMount` / `render` 等方法在内）。无法捕捉异步、事件回调中的错误，要捕捉和覆盖所有场景依然需要配合 `window.onerror`、`Promise.catch`、`try/catch` 等方式。

错误边界（Error Boundary）是 React 组件，并不是损坏的组件树。错误边界捕捉发生在子组件树中任意地方的 JavaScript 错误，打印错误日志，并且显示回退的用户界面。错误边界捕捉渲染期间、在生命周期方法中和在它们之下整棵树的构造函数中的错误。

可以定制一个只有 `componentDidCatch` 生命周期函数的 `ErrorBoundary` 组件。当捕获错误，则显示错误提示，如果没有捕获到错误，则显示子组件。

将需要捕获错误的组件作为 `ErrorBoundary` 的子组件渲染，一旦子组件抛出错误，整个应用依然不会崩溃，而是被 `ErrorBoundary` 捕获。

```jsx
import React, { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false };

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
  }
}

export default ErrorBoundary;
```

```jsx
import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import MyWidget from './MyWidget';

const App = () => {
  return (
    <ErrorBoundary>
      <MyWidget />
    </ErrorBoundary>
  );
};

export default App;
```

---

**参考资料：**

- [📝 React v16.3 即将更改的生命周期](http://web.jobbole.com/94406/)
- [📝 React v16.3 版本新生命周期函数浅析及升级方案](https://juejin.im/post/5ae6cd96f265da0b9c106931)
- [📝 聊聊 React v16.3 的 UNSAFE 类生命周期](https://juejin.im/post/5b9b55695188255c5f53d9b8)
