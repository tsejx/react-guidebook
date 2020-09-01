---
nav:
  title: 生态
  order: 3
group:
  title: 数据流
  order: 3
title: React Redux
order: 3
---

# React Redux

`react-redux` 时 Redux 官方提供的 React 绑定库。

需要将 React 和 Redux 搭配使用，就需要 React 组件可以根据 Redux 中存储的状态（Store）更新视图（View）。并且可以改变状态（Store）。

其实 `react-redux` 主要就完成了两件事：

- 通过将 Store 传入根组件的 Context 中，使子节点可以获取到 State
- 通过 `Store.subscribe` 订阅 Store 的变化，更新组件

> 另外还有对于性能的优化，减少不必要的渲染。

## 架构背景

### 函数分解

随着项目越大，如果将所有状态的 `reducer` 全部写在一个函数中，将会 **难以维护**；

可以将 `reducer` 进行拆分，也就是 **函数分解**，最终再使用`combineReducers()`进行重构合并；

### 异步行动

由于 Reducer 是一个严格的纯函数，因此无法在 Reducer 中进行数据的请求，需要先获取数据，再`dispatch(Action)` 即可。

需要通过中间件实现异步行动：

- [redex-thunk](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2Freduxjs%2Fredux-thunk)
- [redux-saga](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2Fredux-saga%2Fredux-saga)
- [redux-observable](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2Fredux-observable%2Fredux-observable)

### 视图层绑定

视图层绑定引入了几个概念：

- `<Provider>` 组件：这个组件需要包裹在整个组件树的最外层。这个组件让根组件的所有子孙组件能够轻松的使用 `connect()` 方法绑定 store
- `connect()`：这是 `react-redux` 提供的一个方法。如果一个组件想要响应状态的变化，就把自己作为参数传给 `connect()` 的结果，`connect()` 方法会处理与 Store 绑定的细节，并通过 `selector` 确定该绑定 Store 中哪一部分的数据
- `selector`：这是你自己编写的一个函数。这个函数声明了你的组件需要整个 Store 中哪一部分数据作为自己的 Props
- `dispatch`：每当你想要改变应用中的状态时，你就要 `dispatch` 一个 `action`，这也是唯一改变状态的方法

## 组成部分

- `Provider`：接收从 Redux 而来的 Store，以供子组件使用
- `Connect`：高阶组件，当组件需要获取或者想要改变 Store 的时候使用
  - `mapStateToProps`：获取 Store 数据，通过 Props 注入关联组件
  - `mapDispatchToProps`：当组件调用时使用 `dispatch` 触发对应的 Action
  - `mergeProps`：可以在其中对 `mapStateToProps`、`mapDispatchToProps` 的结果进一步处理
  - `options`：其余配置项

### Provider

> API 原型 `<Provider store>`

使组件层级中的 `connect()` 方法能够获得 Redux Store（将 Store 传递给 App 框架）。通常情况下我们需要将根组件嵌套在标签中才能使用 `connect()` 方法。

```jsx | pure
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import { App } from './App'
import createStore from './createReduxStore'

const store = createStore()

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

### Connect

> API 原型：`connect([mapStoreToProps], [mapDispatchToProps], [mergeProps], [options])`

- `mapStoreToProps`：相当于一个过滤器函数，将 Store 中的某些或全部状态，以 Props 的形式传入将被包裹的子组件中
- `mapDispatchToProps`：自定义以 Props 传递到包裹子组件中的函数，可以使用函数传入的 `dispatch` 和 `ownProps` 参数
- `mergeProps`：用于自定义 `ownProps`、`stateProps` 和 `dispatchprops` 的合并组合顺序及方法等

```jsx | pure
import * as actionCreators from './actionCreators'

function mapStateToProps(state) {
  return {
    todos: state.todos
  }
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, ownProps, {
    todos: stateProps.todos[ownProps.userId],
    addTodo: text => dispatchProps.addTodo(ownProps.userId, text)
  })
}

export default connect(
  mapStateToProps,
  actionCreators,
  mergeProps
)(TodoApp)
```

连接 React 组件与 Redux store，连接操作会返回一个新的与 Redux store 连接的组件类，并且连接操作不会改变原来的组件类。

`react-redux` 提供了 `connect` 函数，`connect` 是一个高阶函数，首先传入 `mapStateToProps` 和 `mapDispatchToProps`，然后返回一个生产 `Component` 的函数（`wrapWithConnect`），然后再将真正的 `Component` 作为参数传入 `wrapWithComponent`（MyComponent），这样就生产出一个经过包裹的 Connect 组件。

例如：

```jsx | pure
export default connect(mapStateToProps)(HomePage)
```

---

**参考资料：**

- [📖 ReactRedux Documentation](https://react-redux.js.org/)
- [📝 ReactRedux 的使用方法](https://www.ruanyifeng.com/blog/2016/09/redux_tutorial_part_three_react-redux.html)
- [React Redux 源码分析](http://xzfyu.com/2018/07/08/react/react%E7%9B%B8%E5%85%B3/react-redux%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90/)
- [带着问题看 React-Redux 源码](https://zhuanlan.zhihu.com/p/80655889)
