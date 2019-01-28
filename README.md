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

#### 架构

- React 框架
- JSX 语法
- React 数据流
  - 属性 Props
  - 状态 State
- React 生命周期
- ReactDOM 组件挂载器

#### 运行机制

- 事件系统
- 组件间抽象
  - Mixin
  - 高阶组件
- Refs

#### 底层原理

- Virtual DOM 模型
- setState 机制
  - 异步更新
  - 循环调用风险
  - 调用栈
- diff 算法
- React Patch 方法

#### 生态

- Flux
- Redux 状态管理库（Redux 框架集成应用）
  - 前端为何需要状态管理库
  - 深入理解 Store、Action、Reducer
  - 在 React 中使用 Reducer
  - 理解异步 Action、Redux 中间件
  - 如何组织 Action 和 Reducer
  - 理解不可变数据（Immutability）
- 路由管理
  - SPA 路由实现
  - React Router
- UI 组件库（AntDesign、MaterialUI、SemanticUI）
- 测试工具
  - 类型检测 PropTypes
  - 测试框架 Jest
- 调试工具

