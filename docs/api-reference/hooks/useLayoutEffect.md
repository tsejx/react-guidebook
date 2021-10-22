---
nav:
  title: API
  order: 4
group:
  title: Hooks API
  order: 3
title: useLayoutEffect
order: 9
---

# useLayoutEffect

## 基本用法

语法：

```js
useLayoutEffect(create, deps);
```

类型声明：

```ts
export function useLayoutEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null
): void {
  const dispatcher = resolveDispatcher();
  return dispatcher.useLayoutEffect(create, deps);
}
```

`useLayoutEffect` 相比 `useEffect`，通过同步执行状态更新可解决一些特性场景下的页面闪烁问题。

<code src="../../../example/useLayoutEffect/index.tsx" />

说明：

- 其函数签名与 `useEffect` 相同，但它会在所有的 DOM 变更之后同步调用 `effect`。可以使用它来读取 DOM 布局并同步触发重渲染。在浏览器执行绘制之前，`useLayoutEffect` 内部的更新计划将被同步刷新。
- 尽可能使用标准的 `useEffect` 以避免阻塞视觉更新。

> ⚠️ **注意：**
>
> 如果你正在将代码从 class 组件迁移到使用 Hook 的函数组件，则需要注意 `useLayoutEffect` 与 `componentDidMount`、`componentDidUpdate` 的调用阶段是一样的。但是，我们推荐你一开始先用 `useEffect`，只有当它出问题的时候再尝试使用 `useLayoutEffect`。
>
> 如果你使用服务端渲染，请记住，无论 `useLayoutEffect` 还是 `useEffect` 都无法在 Javascript 代码加载完成之前执行。这就是为什么在服务端渲染组件中引入 `useLayoutEffect` 代码时会触发 React 告警。解决这个问题，需要将代码逻辑移至 `useEffect` 中（如果首次渲染不需要这段逻辑的情况下），或是将该组件延迟到客户端渲染完成后再显示（如果直到 `useLayoutEffect` 执行之前 HTML 都显示错乱的情况下）。
>
> 若要从服务端渲染的 HTML 中排除依赖布局 `effect` 的组件，可以通过使用 `showChild && <Child />` 进行条件渲染，并使用 `useEffect(() => { setShowChild(true); }, [])` 延迟展示组件。这样，在客户端渲染完成之前，UI 就不会像之前那样显示错乱了。
