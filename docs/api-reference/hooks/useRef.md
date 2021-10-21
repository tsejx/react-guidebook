---
nav:
  title: API
  order: 4
group:
  title: Hooks API
  order: 2
title: useRef
order: 7
---

# useRef

## 基本用法

语法：

```js
const refContainer = useRef(initialValue);
```

类型声明：

```ts
export function useRef<T>(initialValue: T): {|current: T|} {
  const dispatcher = resolveDispatcher();
  return dispatcher.useRef(initialValue);
}
```

说明：

- `useRef` 返回一个可变的 `ref` 对象，其 `<ref>.current` 属性被初始化为传入的参数（`initialValue`）。返回的 `ref` 对象在组件的整个生命周期内保持不变。

<code src="../../../example/useRef/index.tsx" />

本质上，`useRef` 就像是可以在其 `.current` 属性中保存一个可变值的“盒子”。

你应该熟悉 `ref` 这一种访问 DOM 的主要方式。如果你将 `ref` 对象以 `<div ref={myRef} />` 形式传入组件，则无论该节点如何改变，React 都会将 `ref` 对象的 `.current` 属性设置为相应的 DOM 节点。

然而，`useRef()` 比 `ref` 属性更有用。它可以很方便地保存任何可变值，其类似于在 `class` 中使用实例字段的方式。

这是因为它创建的是一个普通 Javascript 对象。而 `useRef()` 和自建一个 `{current: ...}` 对象的唯一区别是，`useRef` 会在每次渲染时返回同一个 `ref` 对象。

请记住，当 `ref` 对象内容发生变化时，`useRef` 并不会通知你。变更 `.current` 属性 <strong style="color:red">不会</strong> 引发组件重新渲染。如果想要在 React 绑定或解绑 DOM 节点的 `ref` 时运行某些代码，则需要使用回调 `ref` 来实现。
