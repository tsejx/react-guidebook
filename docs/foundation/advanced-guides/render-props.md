---
nav:
  title: 基础
  order: 1
group:
  title: 进阶指引
  order: 2
title: 渲染属性
order: 5
---

# 渲染属性

官方文档：[Render Props](https://reactjs.org/docs/render-props.html#gatsby-focus-wrapper)

**渲染属性**（Render Props）指一种在 React 组件之间使用一个值为函数的 `props` 在 React 组件间共享代码的简单技术。

本质上只是将一个方法作为 `props` 传递给子组件，而一般会给子组件传递的内容都是传递的值，例如：Object、Array、String、Number、Boolean 等。而有些情况下，可能需要在组件间传递 <strong style="color:red">共用方法</strong> 来实现代码的复用，不过这种情况下传递的就是一个 **纯粹的方法**，比如父组件传递一个 `function` 给子组件，然后子组件去触发，实现代码的复用或事件的冒泡。

而 Render Props 则是传递一个 **渲染逻辑** 给子组件，带有 Render Props 的组件，并不是自己的实现的渲染逻辑，而是通过 `props` 传递实现的渲染逻辑，而这个渲染逻辑是由 render props 方法完成的。

### 基本用法

使用方法：

```jsx | pure
<DataProvider render={(data) => <h1>Hello {data.target}</h1>} />
```

代码示例：

<code src="../../../example/render-props/index" />

这里需要明确的概念是，`<Mouse>` 组件实际上是调用了它的 `props.render` 方法来将它的 `state` 暴露给 `<App>` 组件。因此，`<App>` 可以随便按自己的想法使用这个 `state`。

该技术规避了所有 `mixin` 和 HOC 会面对的问题：

- **状态组件**：不成问题，我们可以在类组件中使用 Render Props。
- **不够直接**：我们不必再担心 `state` 或者 `props` 来自哪里。我们可以看到通过 Render Props 的参数列表看到有哪些 `state` 或者 `props` 可供使用。
- **命名冲突**：现在不会有任何的自动属性名称合并，因此，命名冲突将无可乘之机。

## 参考资料

- [📝 [译] 使用 Render Props 吧！](https://juejin.im/post/5a3087746fb9a0450c4963a5)
