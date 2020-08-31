---
nav:
  title: Hooks
  order: 5
group:
  title: 额外的 Hook
  order: 3
title: useCallback
order: 2
---

# useCallback

## 基本用法

```js
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b)
  },
  [a, b]
);
```

返回一个 `memoized` 回调函数。

把 **内联回调函数** 及 **依赖项数组** 作为参数传入 `useCallback`，它将返回该回调函数的 `memoized` 版本，该 **回调函数仅在某个依赖项改变时才会更新**。当你把回调函数传递给经过优化的并使用 **引用相等性** 去避免非必要渲染（例如 `shouldComponentUpdate`）的子组件时，它将非常有用。

`useCallback(fn, deps)` 相当于 `useMemo(() => fn, deps)`。

> ⚠️ **注意：**
>
> 依赖项数组不会作为参数传给回调函数。虽然从概念上来说它表现为：所有回调函数中引用的值都应该出现在依赖项数组中。未来编译器会更加智能，届时自动创建数组将成为可能。
>
> 我们推荐启用 `eslint-plugin-react-hooks` 中的 `exhaustive-deps` 规则。此规则会在添加错误依赖时发出警告并给出修复建议。