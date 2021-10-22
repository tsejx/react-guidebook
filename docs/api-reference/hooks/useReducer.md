---
nav:
  title: API
  order: 4
group:
  title: Hooks API
  order: 3
title: useReducer
order: 4
---

# useReducer

## 基本用法

语法：

```js
const [state, dispatch] = useReducer(reducer, initialArg, init);
```

类型声明：

```ts
type Dispatch<A> = A => void;

export function useReducer<S, I, A>(
  reducer: (S, A) => S,
  initialArg: I,
  init?: I => S,
): [S, Dispatch<A>] {
  const dispatcher = resolveDispatcher();
  return dispatcher.useReducer(reducer, initialArg, init);
}
```

<br />

<code src="../../../example/useReducer/index.tsx" />

说明：

- 接收一个形如 `(state, action) => newState` 的 `reducer`，并返回当前的 `state` 以及与其配套的 `dispatch` 方法；
- 在某些场景下，`useReducer` 会比 `useState` 更适用，例如 `state` **逻辑较复杂且包含多个子值**，或者 **下一个 `state` 依赖于之前的 `state`** 等；
- 并且，使用 `useReducer` 还能给那些会触发深更新的组件做性能优化，因为你可以向子组件传递 `dispatch` 而不是回调函数。

⚠️ **注意**：

- React 会确保 `dispatch` 函数的标识是稳定的，并且不会在组件重新渲染时改变。这就是为什么可以安全地从 `useEffect` 或 `useCallback` 的依赖列表中省略 `dispatch`。

### 惰性初始化

你可以选择惰性地创建初始 `state`。为此，需要将 `init` 函数作为 `useReducer` 的第三个参数传入，这样初始 `state` 将被设置为 `init(initialArg)`。

这么做可以将用于计算 `state` 的逻辑提取到 `reducer` 外部，这也为将来对重置 `state` 的 `action` 做处理提供了便利：

<code src="../../../example/useReducer-lazy-initialize/index.tsx" />

### 跳过 dispatch

如果 Reducer Hook 的返回值与当前 `state` 相同，React 将跳过子组件的渲染及副作用的执行。（React 使用 `Object.is` 比较算法 来比较 `state`）

需要注意的是，React 可能仍需要在跳过渲染前再次渲染该组件。不过由于 React 不会对组件树的 **深层节点** 进行不必要的渲染，所以大可不必担心。如果你在渲染期间执行了高开销的计算，则可以使用 [useMemo](./useMemo) 来进行优化。
