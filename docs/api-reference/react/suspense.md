---
nav:
  title: API
  order: 4
group:
  title: React
  order: 1
title: React.Suspense
order: 15
---

# React.Suspense

`React.Suspense` 是一种虚拟组件（类似于 Fragment，仅用作类型标识）。是组件在从缓存加载数据时暂停渲染的通用方法，解决了当渲染是 I/O 绑定时的问题。

## 基本用法

`<Suspense>` 是一个延迟函数所必须的组件，通常用来包裹住延迟加载组件。多个延迟加载的组件可被包在一个 `<Suspense>` 组件中。

代码示例：

```js
// This component is loaded dynamically
const OtherComponent = React.lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    // Displays <Spinner> until OtherComponent loads
    <React.Suspense fallback={<div>loading...</div>}>
      <div>
        <OtherComponent />
      </div>
    </React.Suspense>
  );
}
```

说明：

- 提供 `fallback` 属性，用来在组件的延迟加载过程中显式某些 React 元素
- 如果 `<Suspense>` 子孙组件还在加载中没返回的 `<Lazy>` 组件，就返回 `fallback` 指定的内容
- `<Suspense>` 组件可以放在（组件树中）Lazy 组件上方的任意位置，并且下方可以有多个 `<Lazy>` 组件

⚠️ **注意**：

- 没被 `<Suspense>` 包裹的 `<Lazy>` 组件会报错

## 参考资料

- [📝 React Suspense](http://www.ayqy.net/blog/react-suspense/)
- [📝 深度理解 Suspense](https://juejin.im/post/5c7d4a785188251b921f4e26)
- [📝 React：Suspense 的实现与探讨](https://zhuanlan.zhihu.com/p/34210780)
