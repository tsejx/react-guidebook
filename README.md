## React Guidebook

本项目档致力于深入研究 React 框架原理，而非单纯列出 API 和抽象概念。大部分内容来源于网络，具体出处已在相对应的文章底部标注，内容主要是对 React 官方文档的整理、归纳、补充以及扩展，以及部分源码的剖析等。若您抱着学习 React 框架的目的研读此项目，英文条件好的同学建议先熟读 [React 官方文档](https://reactjs.org/) ，因为官方文档是入门，乃至进阶 React 的最好的学习资料。英文水平欠佳的同学可以研读 [中文版 React 文档](https://doc.react-china.org/)。

### 标识

* ✨ 新特性 New Feature
* ⚠️ 注意事项 Notification
* 📌 重点标记 Emphasis
* 🛠 解决方案 Methodology
* 🔍 拓展阅读 Expansion
* 🌐 相关阅读 Related
* 🌰 标准示例 Example

### 目录

#### 基础架构

- [框架概述](Architecture/react.md)
- [框架语法](Architecture/jsx.md)
- **数据流**
  - [不可变属性 Props](Architecture/props.md)
  - [可变状态 State](Architecture/state.md)
- [React 生命周期](Architecture/lifecycle.md)
- [React 组件](#Architecture/component.md)
- [ReactDOM 组件挂载器](Architecture/react-dom.md)

#### 运行机制

- 事件系统
- [Refs](Mechanism/Refs.md)
- [高阶组件](Mechanism/high-order-component.md)
- Render Props
- Hooks
- [setState](Mechanism/set-state.md)
  - 循环调用风险
  - 调用栈
- [Context](Mecharnism/context.md)
- Portals

#### 底层实现

- [Virtual DOM](BaseLayer/VirtualDOM.md)
- [diff 算法](BaseLayer/Diff.md)
- React Patch 方法
- Fiber
- Recon Commit
- Transaction 事务

#### 框架生态

- Redux
  - [Flux](Ecosystem/Redux/Flux)
  - [Redux](Ecosysten/Redux/Redux.md)
  - React-Redux
  - 前端为何需要状态管理库
  - 理解不可变数据（Immutability）
- Routing
  - [SPA 路由实现](Ecosystem/Routing/SPARouting.md)
  - [React Router](Ecosystem/Routing/ReactRouter.md)
- 测试工具
  - 类型检测 PropTypes
  - 测试框架 Jest
- 调试工具
- UI 组件库
  - AntDesign
  - MaterialUI
  - SemanticUI

#### React 顶层 API

* Components
  * [React.memo](ReactTopLevelAPI/Components/Memo.md)
  * [React.PureComponent](ReactTopLevelAPI/Components/PureComponent.md)
* Fragments
  * [React.Fragment](ReactTopLevelAPI/Fragments/Fragments.md)
* Refs
  * [React.createRef](ReactTopLevelAPI/Refs/CreateRef.md)
  * [React.forwardRef](ReactTopLevelAPI/Refs/ForwardRef.md)
* Suspense
  * React.lazy
  * React.Suspense
* TransformingElements
  * React.cloneElement
  * React.isValidaElement
  * React.children

