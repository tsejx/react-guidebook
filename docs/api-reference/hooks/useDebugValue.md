---
nav:
  title: API
  order: 4
group:
  title: Hooks API
  order: 3
title: useDebugValue
order: 10
---

# useDebugValue

## 基本用法

语法：

```js
useDebugValue(value);
```

类型声明：

```ts
export function useDebugValue<T>(value: T, formatterFn: ?((value: T) => mixed)): void {
  if (__DEV__) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useDebugValue(value, formatterFn);
  }
}
```

说明：

- `useDebugValue` 可用于在 React 开发者工具中显示自定义 Hook 的标签。

代码示例：

```js
function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  // ...

  // 在开发者工具中的 Hook 旁边显示标签
  // e.g. “FriendStatus: Online”
  useDebugValue(isOnline ? 'Online' : 'Offline');

  return Online;
}
```

### 延迟格式化 debug 值

在某些情况下，格式化值的显示可能是一项开销很大的操作。除非需要检查 Hook，否则没有必要这么做。

因此，`useDebugValue` 接受一个格式化函数作为可选的第二个参数。该函数只有在 Hook 被检查时才会被调用。它接受 `debug` 值作为参数，并且会返回一个格式化的显示值。

例如，一个返回 Date 值的自定义 Hook 可以通过格式化函数来避免不必要的 `toDateString` 函数调用：

```js
useDebugValue(date, (date) => date.toDateString());
```
