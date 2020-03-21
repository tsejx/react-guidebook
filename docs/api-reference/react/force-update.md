---
nav:
  title: API
  order: 3
group:
  title: React
  order: 1
title: component.forceUpdate
order: 15
---

# component.forceUpdate

> Calling `forceUpdate()` will cause `render()` to be called on the component, skipping `shouldComponentUpdate()`. This will trigger the normal lifecycle methods for child components, including the `shouldComponentUpdate()` method of each child. React will still only update the DOM if the markup changes.

官方说的比较清楚，调用 `forceUpdate` 后当前组件会跳过 `shouldComponentUpdate` 这个钩子，尽管手动 `return false`，也一样会更新，但是需要注意的是，子组件的更新还是会受到 `shouldComponentUpdate` 控制。

调用 `forceUpdate()` 将会导致 `render()` 方法在相应的组件上被调用，并且子级组件也会调用自身的 `render()`，但是如果标记改变了，那么 React 仅会更新 DOM。

## 使用场景

- 视图更新来源于其他非 state 或 props 的数据
  - 例如：绑定在组件实例上的属性
  - 例如：直接修改 `this.state.xxx = xxx` 后调用 `forceUpdate()` 使得组件重新渲染（re-render）
- 某些在 state 或 props 中的变量层级太深，更新时候没有自动触发重渲染
  - 这种情况建议使用 immutable 来操作 state 或 redux 等 flux 架构管理 state

不过对于以上情况，官方文档并不推荐这样处理，正常情况下应该避免使用 `forceUpdate`，而是通过 state 或 props 去驱动更新视图。
