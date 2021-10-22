---
nav:
  title: API
  order: 4
group:
  title: React
  order: 1
title: React.forwardRef
order: 12
---

# React.forwardRef

> ✨ 适用于 React v16.3+ [官方文档：React.forwardRef](https://zh-hans.reactjs.org/docs/react-api.html#reactforwardref)

`React.forwardRef` 用于将父组件创建的 `ref` 引用关联到子组件中的任意元素上，也可以理解为子组件向父组件暴露 DOM 引用。

除此之外，因为 `ref` 是为了获取某个节点的实例，但是函数式组件是没有实例的，不存在 `this` 的，这种时候是拿不到函数式组件的 `ref` 的，而 `React.forwardRef` 也能解决这个问题。

应用场景：

- 获取深层次子孙组件的 DOM 元素
- 获取直接 `ref` 引用的子组件为非 class 声明的函数式组件
- 传递 `refs` 到高阶组件

## 基本用法

`React.forwardRef` 接受 **渲染函数** 作为参数。React 将使用 `props` 和 `ref` 作为参数来调用此函数。此函数应返回 React 节点。

类型声明：

```ts
export function forwardRef<Props, ElementType: React$ElementType>(
  render: (props: Props, ref: React$Ref<ElementType>) => React$Node,
) {
  // do something

  const elementType = {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render,
  };

  // do something

  return elementType;
}
```

说明：

- 必须作用于 **函数式组件**
- `ref` 必须依附于 DOM 节点，而非 React 元素

ForwardRef API 充当传递者角色，实际上是容器组件，能够辅助简化嵌套组件、Component 至 Element 间的 `ref` 传递，能有效避免 `this.ref.ref.ref` 的问题。向前传递，这就是叫 `forwardRef` 的原因。

### 转发 refs 到 DOM 组件

代码示例：

<code src="../../../example/forwardRef-dom/index.tsx" />

⚠️ **注意**：

- 只在使用 `React.forwardRef` 定义组件时，第二个参数 `ref` 才存在
- 函数组件和 class 组件均不接收 `ref` 参数，即 `props` 中不存在 `ref`，`ref` 必须独立于 `props`，否则会被 React 特殊处理掉

### 高阶组件中转发 refs

常在高阶组件中使用 `React.forwardRef`

<code src="../../../example/forwardRef-hoc/index.tsx" />
