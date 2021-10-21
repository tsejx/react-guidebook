---
nav:
  title: API
  order: 4
group:
  title: Hooks API
  order: 2
title: useContext
order: 3
---

# useContext

## 基本用法

语法：

```js
const value = useContext(MyContext);
```

类型声明：

```ts
type ReactProviderType<T> = {
  $$typeof: Symbol | number,
  _context: ReactContext<T>,
  ...
};

type ReactContext<T> = {
  $$typeof: Symbol | number,
  Consumer: ReactContext<T>,
  Provider: ReactProviderType<T>,
  _currentValue: T,
  _currentValue2: T,
  _threadCount: number,
  // DEV only
  _currentRenderer?: Object | null,
  _currentRenderer2?: Object | null,
  // This value may be added by application code
  // to improve DEV tooling display names
  displayName?: string,
  ...
};

export function useContext<T>(Context: ReactContext<T>): T {
  const dispatcher = resolveDispatcher();
  // do something
  return dispatcher.useContext(Context);
}
```

<code src="../../../example/useContext/index.tsx" />

说明：

- 接收一个 `context` 对象（`React.createContext` 的返回值）并返回该 `context` 的当前值。
- 当前的 `context` 值由上层组件中距离当前组件最近的 `<ContextInstance.Provider>` 的 `value` 决定。
- 当组件上层最近的 `<ContextInstance.Provider>` 更新时，该 Hook 会触发重渲染，并使用最新传递给 `ContextInstance.<Provider>` 的 `value` 值。即使祖先使用 `React.memo` 或 `shouldComponentUpdate`，也会在组件本身使用 `useContext` 时重新渲染

别忘记 `useContext` 的参数必须是 `context` 对象本身：

```js
const ContextInstance = React.createContext(/* values */);
// 正确
useContext(ContextInstance);

// 错误
useContext(ContextInstance.Consumer);
useContext(ContextInstance.Provider);
```

调用了 `useContext` 的组件总会在 `context` 值变化时重新渲染。如果重渲染组件的开销较大，你可以通过使用 `memoization` 来优化。

> ⚠️ **提示：**
>
> 如果你接触 Hook 前已经对 [Context API](../react/create-context) 比较熟悉，那应该可以理解，`useContext(ContextInstance)` 相当于 Class 组件中的 `static contextType = ContextInstance` 或者 `<ContextInstance.Consumer>`。
>
> `useContext(ContextInstance)` 只是让你能够读取 `context` 的值以及订阅 `context` 的变化。你仍然需要在上层组件树中使用 `<ContextInstance.Provider>` 来为下层组件提供 `context`。
