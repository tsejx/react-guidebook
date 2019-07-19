# React Guidebook

本项目档致力于深究 React 框架实现原理，试图阐明关于 React 的 WHY（为什么要这样实现）以及 HOW（怎么实现），而 WHAT（这是什么）和另一个意义上的 HOW（怎么去使用这个）将不会大幅度讲解。

## 目录

### 基本概念

- [React](concept/react.md)
- [JSX](concept/jsx.md)
- [Props](concept/props.md)
- [State](concept/state.md)
- [生命周期](concept/lifecycle.md)
- [组件化](concept/component.md)
- [组件挂载器](concept/react-dom.md)

### 核心架构

- [Fiber](core/fiber.md)
- [Virtual DOM](core/virtual-dom.md)
- [差异化算法](core/diffing-algorithm.md)
- React Patch
- Recon Commit
- Transaction

### 运行机制

- [setState](mechanism/set-state.md)
- [渲染策略](mechanism/render.md)
- [Refs](mechanism/refs.md)
- [Portals](mechanism/portals.md)
- [Context](mechanism/context.md)
- [Render Props](mechanism/render-props.md)
- [高阶组件](mechanism/high-order-component.md)
- [事件处理](mechanism/handling-events.md)
- [合成事件](mechanism/synthetic-event.md)
- [Hooks](mechanism/hooks.md)

### 功能扩展

- Components
  - [React.memo](feature/memo.md)
  - [React.PureComponent](feature/pure-component.md)
- Fragments
  - [React.Fragment](feature/fragment.md)
- Refs
  - [React.createRef](feature/create-ref.md)
  - [React.forwardRef](feature/forward-ref.md)
- Suspense
  - [React.lazy](feature/lazy.md)
  - [React.Suspense](feature/suspense.md)
- TransformingElements
  - [React.cloneElement](feature/clone-element.md)
  - [React.isValidElement](feature/is-valid-element.md)
  - [React.children](feature/children.md)

### 框架生态

- 路由管理
  - [单页应用路由实现原理](ecosystem/routing/spa-routing.md)
  - [React Router](ecosystem/routing/react-router.md)
- 数据管理
  - [Flux](ecosystem/redux/flux.md)
  - [Redux](ecosystem/redux/redux.md)
  - [React Redux](ecosystem/redux/react-redux.md)
  - [Redux Saga](ecosystem/redux/redux-saga.md)
  - [Redux Thunk](ecosystem/redux/redux-thunk.md)
  - Immutable
- 类型检测
  - [PropTypes](ecosystem/type/prop-types.md)
- 调试工具
  - 测试框架 Jest
  - React DevTool

## 参考资料

- [React 官方文档](https://reactjs.org/)
