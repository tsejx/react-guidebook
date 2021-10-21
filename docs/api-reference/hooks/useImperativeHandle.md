---
nav:
  title: API
  order: 4
group:
  title: Hooks API
  order: 2
title: useImperativeHandle
order: 8
---

# useImperativeHandle

`useImperativeHandle` 可以让你在使用 `ref` 时自定义暴露给父组件的实例值。在大多数情况下，应当避免使用 `ref` 这样的命令式代码。

## 基本用法

语法：

```js
useImperativeHandle(ref, createHandle, [deps]);
```

类型声明：

```ts
export function useImperativeHandle<T>(
  ref: {|current: T | null|} | ((inst: T | null) => mixed) | null | void,
  create: () => T,
  deps: Array<mixed> | void | null,
): void {
  const dispatcher = resolveDispatcher();
  return dispatcher.useImperativeHandle(ref, create, deps);
}
```

代码示例：

<code src="../../../example/useImperativeHandle/index.tsx" />
