---
nav:
  title: API
  order: 4
group:
  title: Hooks API
  order: 3
title: useMemo
order: 6
---

# useMemo

## 基本用法

语法：

```js
const memoizedValue = useMemo(compute, dependencies);
```

类型声明：

```ts
export function useMemo<T>(create: () => T, deps: Array<mixed> | void | null): T {
  const dispatcher = resolveDispatcher();
  return dispatcher.useMemo(create, deps);
}
```

代码示例：

```js
const memoizedResult = useMemo(() => {
  return expensiveFunction(propA, propB);
}, [propA, propB]);
```

说明：

- 把 **创建** 函数和依赖项数组作为参数传入 `useMemo`，它仅会在某个依赖项改变时才重新计算 `memoized` 值。这种优化有助于避免在每次渲染时都进行高开销的计算。
- 记住，传入 `useMemo` 的函数会在渲染期间执行。请不要在这个函数内部执行与渲染无关的操作，诸如副作用这类的操作属于 `useEffect` 的适用范畴，而不是 `useMemo`。

代码示例：

<code src="../../../example/useMemo/index.tsx" />

⚠️ **注意**：

- 如果没有提供依赖项数组，`useMemo` 在每次渲染时都会计算新的值。

你可以把 `useMemo` 作为性能优化的手段，但不要把它当成语义上的保证。将来，React 可能会选择 **遗忘** 以前的一些 `memoized` 值，并在下次渲染时重新计算它们，比如为离屏组件释放内存。先编写在没有 `useMemo` 的情况下也可以执行的代码，之后再在你的代码中添加 `useMemo`，以达到优化性能的目的。
