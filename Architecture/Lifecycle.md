## Lifecycle 生命周期函数

生命周期函数是在组件的不同阶段可执行自定义功能的钩子。

- **Mounting**
  - [**`constructor()`**](#constructor)
  - [**`static getDerivedStateFromProps()`**](#static-getderivedstatefrompropsnextprops-prevstate)
  - ⚠️ [`UNSAFE_componentWillMount()`](#unsafe_componentwillmount)
  - [**`render()`**](#render)
  - [**`componentDidMount()`**](#componentdidmount)
- **Updating**
  - [**`static getDerivedStateFromProps()`**](#unsafe_componentwillreceivepropsnextprops)
  - [`shouldComponentUpdate()`](#shouldcomponentupdatenextprops-nextstate)
  - **`render()`**
  - [`getSnapshotBeforeUpdate()`](#getsnapshotbeforeupdate)
  - [**`componentDidUpdate()`**](#componentdidupdate)
- **Unmounting**
  - [**`componentWillUnmount()`**](#componentwillunmount)
- **Error Handling**
  - [`static getDerivedStateFromError()`](#static-getderivedstatefromerrorerror)
  - [`componentDidCatch()`](#componentdidcatcherror-info)

状态组件主要通过3个生命周期阶段来管理，分别是 `MOUNTING`，`RECEIVE_PROPS` 和 `UNMOUNTING`。

1. 其中 `will` 前缀的函数是进入状态之前的触发，比如 `componentWillReceiveProps`，此方法中改变 State 不会二次渲染而是进行 State 合并，并且只有在 `componentDidUpdate` 后才能获取更新后的 `this.state`。如果想获取组件默认的 Props，并且赋值给 State ，就可以在这里修改，达到 UI 上的效果。
2. `did` 的前缀表示进入状态之后触发，比如 `componentDidMount`，组件一般初始化都会在这里进行数据请求。

### 装载阶段 Mounting

装载阶段执行的函数会在组件实例被创建和插入DOM中时被触发，这个过程主要实现组件**状态的初始化**。

#### constructor

**构造函数**。

⏱ **触发时机**：在组件初始化的时候触发一次。

一个组件需要构造函数的目的：

- 设置初始化状态：因为组件的生命周期中任何函数都可能要访问 State，那么整个周期中第一个被调用的构造函数便是初始化 State 最理想的地方；
- 绑定成员函数上下文引用
  - 因为在 ES6 语法下，类的每个成员函数在执行时的 `this` 并不是和类实例自动绑定的；
  - 而在构造函数中 `this` 就是当前组件实例，所以，为了方便将来调用，往往在构造函数中将这个实例的特定函数绑定 `this` 为当前类实例；
  - 建议定义函数方法时直接使用箭头函数，就无须在构造函数中进行函数的 `bind` 操作。

在 ES6 中，在构造函数中通过 `this.state` 赋值完成状态初始化；通过给类属性（注意是类属性，而不是类实例对象的属性）`defaultProps` 赋值指定的 Props 初始值。

React 规定 `constructor` 有三个参数，分别是 `props`、`context` 和 `updater`。

* `props` 是属性，它是不可变的
* `context` 是全局上下文。
* `updater` 是包含一些更新方法的对象，`this.setState` 最终调用的是 `this.updater.enqueueSetState`；`this.forceUpdate` 最终调用的是 `this.updater.enqueueForceUpdate` 方法，所以这些 API 更多是 React 调用使用，暴露出来以备开发者不时之需。

```js
class Sample extends React.Component {
    constructor(props, context, updater){
        super(props);
        this.state = {
           foo: 'InitailValue' 
        }
    }
}

Sample.defaultProps = {
    bar: 'InitialValue'
}
```

#### static getDerivedStateFromProps(nextProps, prevState)

⏱ **触发时机**：组件化实例化后（VirtualDOM 之后，实际 DOM 挂载之前）和接受新 Props 时都会触发该生命周期函数。

🔙 **返回值**：该生命周期函数必须有返回值，它需要返回一个对象来更新 State，或者返回 `null` 来表明新 Props 不需要更新任何 State。

🆕 **新特性**：与 `componentDidUpdate` 一起，这个新的生命周期应该覆盖传统 `componentWillReceiveProps` 的所有用例。

⚠️ **注意事项**：

* 如果父组件导致了组件的重新渲染，即使属性没有更新，这一方法也会被触发;
* 如果你只想处理 Props 的前后变化，你需要将上一个 Props 值存到 State 里作为镜像；

- 调用 `this.setState()` 通常不会触发 `getDerivedStateFromProps()`；
- 该生命周期函数是一个静态函数，所以函数体内无法访问 `this`；
- 在组件装载和更新阶段都会被调用。

🎉 **适用场景**：表单获取默认值

❓ **为什么该生命周期钩子要设计成静态方法呢？**

这样开发者就访问不到 `this` 也就是实例，也就不能在里面调用实例方法或者 `setState` 了。

```jsx
import React, { Component } from 'react';

class App extends Component {
    render(){
        return (
          <div>React</div>
        )
    }
}
```

这个生命周期钩子的使命是根据父组件传来的  Props 按需更新自己的 State，这种 State 叫做衍生 State。返回的对象就是要增量更新的 State。

它被设计成静态方法的目的是保持该方法的纯粹，它就是用来定义衍生 State的，除此之外不应该在里面执行任何操作。

这个生命周期钩子也经历了一些波折，原本它是被设计成 `初始化`、`父组件更新` 和 `接收到props` 才会触发，现在只要渲染就会触发，也就是 `初始化` 和 `更新阶段` 都会触发。

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

#### UNSAFE_componentWillMount

**预装载函数**。

⏱ **触发时机**：在构造函数和装载组件（将 DOM 树渲染到浏览器中）之间调用。装载组件后将执行 `render` 渲染函数。因此在此生命周期钩子函数里使用 `setState` 同步设置组件内部状态 State 将不会触发重新渲染。

⚠️ **注意事项**：避免在该方法中引入任何的副作用（Effects）或订阅（Subscription）。对于这些使用场景，建议提前到构造函数中。

🗑 此生命周期函数将在 React v17 正式废弃。

#### render

**渲染函数**。

🔙 返回值：唯一的一定不能省略的函数，而且必须有返回值，返回 null 或 false 表示不渲染任何 DOM 元素。

当被调用时，其应该检查 `this.props` 和 `this.state` 并返回以下类型之一：

- **React元素**。通常是由 JSX 创建。该元素可能是一个原生DOM组件的表示，如`<div />`，或者是一个你定义的合成组件。
- **数组和片段**。让你返回多个元素的片段（Fragment）。
- **字符串和数字**。这些将被渲染为 DOM 中的 text node。
- **Protals**。由 [`ReactDOM.createPortal`](http://react.yubolun.com/docs/portals.html) 创建。
- **布尔值和 `null`**。什么都不渲染（通常存在于  `return test && <Child />` 写法，其中 `test` 是布尔值。）

它是一个仅仅用于渲染的**纯函数**，返回值完全取决于 State 和 Props，不能在函数中任何修改 Props、State、请求数据等具有副作用的操作，不能读写 DOM 信息，也不能和浏览器进行交互（例如 `setTimeout`）。如果需要和浏览器交互，在 `componentDidMount()` 中或者其它生命周期方法完成相关事务。

此渲染函数并不做实际的渲染动作（渲染到 DOM 树），它返回的只是一个 JSX 的描述对象（及组件实例），何时进行真正的渲染是有 React 库决定的。而 React 肯定是要把所有组件返回的结果综合起来，才能知道如何产生真实的 DOM 树。也就是说，只有 React 库调用所有组件的渲染函数之后，才有可能完成 DOM 装载，这时候才会依次调用 `componentDidMount` 函数作为装载的收尾。

保持 `render()` 纯粹，可以使服务器端渲染更加切实可行，也使组件更容易被理解。

⚠️ 注意事项：

* 请勿在此函数中使用 `setState` 方法；
* 请勿在此函数中修改 Props、State 以及数据请求等具有副作用的操作。

#### componentDidMount

**装载成功函数**。

⏱ **触发时机**：组件完全挂载到网页上后触发。

🎉 **适用场景**：发送网络请求；任何依赖于 DOM 的初始化操作；添加事件监听。

🔬**深入研究**：该函数不会在 `render` 函数调用完成之后立即调用，因为 `render` 函数仅仅是返回了 JSX 的对象，并没有立即挂载到 DOM 树上，而该生命周期函数是在**组件被渲染到 DOM 树（称为初始化渲染）**之后被调用的。

⚠️ **注意事项**：该生命周期函数在进行服务器端渲染时不会被调用（仅客户端有效）。

💡 **使用建议**：

* `componentDidMount` 通常用于加载外部数据（即发送网络请求），之所以在 `componentDidMount` 中而不是在构造函数中进行数据请求的原因在于：如果数据加载完毕后，即 Props 已经有值了，但是组件还没有渲染出来，会报错。但是这里有一些把数据拉取提前到 `constructor` 函数的思路：在 `contructor` 函数中，通过 Promise 来进行数据的请求，并且绑定到当前实例对象上，然后在 `componentDidMount` 中执行 Promise 把数据更新到 props 上。
* 在生命周期中的这个时间点，组件拥有一个 DOM 展现，你可以通过 `this.getDOMNode()` 来获取相应 DOM 节点。适用于**需要初始化 DOM 节点的操作**。
* 如果想和其它 JavaScript 框架集成，使用 `setTimeout` 或者 `setInterval` 来设置定时器，或者发送 AJAX 请求，可以在该方法中执行这些操作。适用于 **AJAX 请求**。

### 更新阶段 Updating

属性（Props）或状态（State）的改变会触发一次更新阶段，但是组件未必会重新渲染，这取决于 `shouldComponentUpdate`。

#### UNSAFE_componentWillReceiveProps(nextProps)

⏱ **触发时机**：当父组件的渲染函数被调用，在渲染函数中被渲染的子组件就会经历更新阶段，不管父组件传给子组件的 Props 有没有改变，都会触发该生命周期函数。当组件内部调用 `setState` 更新内部状态 State 时触发更新阶段不会调用该函数。

🎉 **适用场景**：更新 State 的值（例如：重置状态等）

💡 **使用建议**：在该回调函数中，可以根据属性的变化，通过调用 `this.setState()` 来更新组件状态。通过参数 `nextProps` 获取新的 Props 值，而旧的属性可以通过 `this.props` 获取，基于状态变化前后的 Props 对比的结果去实现不同的行为，避免不必要的渲染。这里调用更新状态是安全的，并不会触发额外的 `render` 调用。

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

🗑 此生命周期函数将在React v17正式废弃。

⚠️ 推荐使用 `static getDerivedStateFromProps()` 代替。

#### shouldComponentUpdate(nextProps, nextState)

⏱ **触发时机**：每次组件因为 State 和 Props 变化而更新时，在**重新渲染前**该生命周期函数都会调用，让 React 知道当前 State 或 Props 的改变是否影响组件的输出（渲染）。

🔙 **返回值**：根据逻辑判断返回 `true` 表示继续进行组件渲染，否则将停止组件渲染过程。

🔬**深入研究**：在一个更新生命周期中，组件及其子组件将根据该方法返回的布尔值来决定是否继续这次更新过程（重新渲染）。这样你可以在必要的时候阻止组件的渲染生命周期（Render Lifecycle）方法，避免不必要的渲染。

默认情况下，该方法默认返回 `true`，表示需要重新渲染，在大部分情况下你应该依赖于默认行为。如果在 State 改变的时候为了避免细微的 Bug，或是如果总是把 State 当做不可变的，在 `render()` 中只从 Props 和 State 读取值，此时你可以覆盖该方法，实现新老 Props 和 State 的比对逻辑。

当该方法返回的布尔值 `false` 告知 React 无须重新渲染时，`render`、`UNSAFE_componentWillUpdate` 和 `componentDidUpdate` 等生命周期钩子函数都不会被调用。

💡 **使用建议**：

* 如果性能是个瓶颈，尤其是有几十个甚至上百个组件的时候，使用 `shouldComponentUpdate` 可以优化渲染效率，提升应用的性能；
* 使用 React.PureComponent 可以默认为组件更新校验，但是只会对更新数据进行浅层对照；
* 通常用于条件渲染，优化渲染的性能。

⚠️ **注意事项**：

* 此钩子函数在初始化渲染和使用了 forceUpdate 方法的情况下不会被调用

* 请勿在此函数中使用 setState 方法，会导致循环调用。

#### UNSAFE_componentWillUpdate(nextProps, nextState)

**预更新函数**。

⏱ **触发时机**：这个方法是一个更新生命周期中重新渲染执行之前的最后一个方法。你已经拥有了下一个属性和状态，他们可以在这个方法中任由你处置。你可以利用这个方法在渲染之前进行最后的准备。

🎉 **适用场景**：根据 State 的 变化设置变量；派发事件；开始动画。

⚠️ **注意事项**：

* 此钩子函数在初始化渲染的时候不会被调用；
* 请勿在此函数中使用 `setState` 方法，会导致循环调用。如果需要基于新的 Props 计算 State，建议使用 `componentWillRreceiveProps`。 

🗑 此生命周期函数将在React v17正式废弃。

#### render

渲染函数。与上文所提及的 `render` 生命周期函数一致，用于输出 JSX 并经过 React 处理后渲染至浏览器。

#### getSnapshotBeforeUpdate()

⏱ **触发时机**：生命周期渲染函数执行后，并在准备输出写入 DOM 前被调用，

该生命周期函数能让你捕获某些从 DOM 中才能获取的（可能会变更的）信息（例如，元素重新渲染后页面各种定位位置的变更等）。

此生命周期返回的任何值将作为第三个参数传递给 `componentDidUpdate`。 （这个生命周期不是经常需要的，但可以用于在恢复期间手动保存滚动位置的情况。）

⚠️ 与`componentDidUpdate`一起，这个新的生命周期将覆盖旧版 `componentWillUpdate` 的所有用例。

```js
getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('#enter getSnapshotBeforeUpdate');
    return 'foo';
}

componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('#enter componentDidUpdate snapshot = ', snapshot);
}
```

#### componentDidUpdate()

**更新完成函数**。

⏱ **触发时机**：当组件重新渲染后调用，相当于首次渲染（初始化）之后调用 `componentDidMount` ，

🎉 **适用场景**：操作 DOM；发送网络请求。

⚠️ 注意事项：在该生命周期中使用 `setState` 时，必须加条件，否则将进入死循环。

🚫 此方法不会在初始化渲染的时候调用。

相比装载阶段的生命周期函数，更新阶段的生命周期函数使用的相对来说要少一些。常用的是 `getDerivedStateFromProps`、`componentShouldUpdate`，前者经常用于根据新 Props 的数据去设置组件的 State，而后者则是常用于优化，避免不必要的渲染。

```jsx
componentDidUpdate(prevProps){
    if (this.props.id !== prevProps.id){
        this.fetchData(this.props.id);
    }
}
```

### 卸载阶段 Unmounting

#### componentWillUnmount()

**预卸载函数**。

⏱ **触发时机**：在组件卸载和销毁之前调用。可以利用这个生命周期方法去**执行任何清理任务**。

🎉 **适用场景**：用于删除事件监听；取消网络请求；取消定时器；解绑 DOM 事件。

⚠️ **注意事项**：在该方法中调用 `setState` 不会触发 `render`，因为所有的更新队列，更新状态都被重置为 `null`。

### 捕捉错误 Error Handling

在渲染过程中发生错误时会被调用。

#### static getDerivedStateFromError(error)

这个生命周期钩子函数会在子孙组件跑出错误时执行。它接收抛出的错误作为参数并且需要返回值用于更新 State。

```jsx
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }
    static getDerivedStatteFromError(){
        // Update state so the next render will show the fallback UI
        return { hasError: true }
    }
    render(){
        if (this.state.hasErro) {
            // You can render any custom fallback UI
            return <h1>Something went wwrong</h1>
        }
        
        return this.props.children
    }
}
```

#### componentDidCatch(error, info)

这个生命周期会在子孙组件抛出错误时调用。它接受两个参数：

* `error` - 抛出的错误对象
* `info` - 包含有关错误的信息的对象

错误边界是React组件，并不是损坏的组件树。错误边界捕捉发生在子组件树中任意地方的JavaScript错误，打印错误日志，并且显示回退的用户界面。错误边界捕捉渲染期间、在生命周期方法中和在它们之下整棵树的构造函数中的错误。

---

**参考资料：**

- [React v16.3即将更改的生命周期](http://web.jobbole.com/94406/)
- [React v16.3 版本新生命周期函数浅析及升级方案](https://juejin.im/post/5ae6cd96f265da0b9c106931)
- [聊聊 React v16.3 的 UNSAFE 类生命周期](https://juejin.im/post/5b9b55695188255c5f53d9b8)