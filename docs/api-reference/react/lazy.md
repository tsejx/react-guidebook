---
nav:
  title: API
  order: 4
group:
  title: React
  order: 1
title: React.lazy
order: 14
---

# React.lazy

> ✨ 适用于 React v16.6+

`React.lazy()` 允许你定义一个动态加载的组件。这有助于缩减 bundle 的体积，并延迟加载在初次渲染时未用到的组件。该方法把条件渲染细节挪到了框架层，允许把动态引入的组件当普通组件用，优雅地消除了这种侵入性。

## 基本用法

请注意，渲染 `lazy` 组件依赖该组件渲染树上层的 [`<React.Suspense>`](./suspense) 组件。这是指定加载指示器（loading indicator）的方式。

类型声明：

```ts
interface Thenable<+R> {
  then<U>(
    onFulfill: (value: R) => void | Thenable<U> | U,
    onReject: (error: mixed) => void | Thenable<U> | U,
  ): void | Thenable<U>;
}

type UninitializedPayload<T> = {
  _status: -1,
  _result: () => Thenable<{default: T, ...}>,
};

type PendingPayload = {
  _status: 0,
  _result: Wakeable,
};

type ResolvedPayload<T> = {
  _status: 1,
  _result: {default: T},
};

type RejectedPayload = {
  _status: 2,
  _result: mixed,
};

type Payload<T> =
  | UninitializedPayload<T>
  | PendingPayload
  | ResolvedPayload<T>
  | RejectedPayload;

type LazyComponent<T, P> = {
  $$typeof: Symbol | number,
  _payload: P,
  _init: (payload: P) => T,
};

export function lazy<T>(
  ctor: () => Thenable<{default: T, ...}>,
): LazyComponent<T, Payload<T>> {
  const payload: Payload<T> = {
    // We use these fields to store the result.
    _status: Uninitialized,
    _result: ctor,
  };

  const lazyType: LazyComponent<T, Payload<T>> = {
    $$typeof: REACT_LAZY_TYPE,
    _payload: payload,
    _init: lazyInitializer,
  };

  // do something

  return lazyType;
}
```

代码示例：

<code src="../../../example/lazy/index.tsx" />

如代码所示，将静态引用组件的代码替换为调用 `React.lazy`，在 `React.lazy` 传入一个 <strong style="color:red">匿名函数</strong> 作为参数，在函数中动态引入 `LazyComponent` 组件。这样在我们渲染这个组件前，浏览器将不会下载 `LazyComponent.bundle.js` 文件和它的依赖。其中，`import` 内的 `webpackChunkName` 为我们定义的 `bundle` 文件名。

当 React 要渲染组件时，组件依赖的代码还没下载好，就会先加载 `<Suspense>` 的 `fallback` 渲染的组件元素。

动态加载的 `LazyComponent` 组件会被单独打包到一个 bundle 里面，然而，在首屏加载的时候，该 bundle 已经加载到我们的页面中，这也许并不是我们想要的，我们想要的是当我们需要的时候再加载。接下来我们就控制一下，当我们需要的时候，再加载该文件。

⚠️ **注意**：

- 使用 `React.lazy` 动态加载需要确保 Promise 兼容性。IE11 及以下版本的浏览器中需要通过 polyfill 兼容
- `React.lazy` 和 `Suspense` 在服务端渲染中尚不可用。如果想再服务端渲染的应用中使用代码分割，请绕行 [react-loadable](https://github.com/thejameskyle/react-loadable)

## 参考资料

- [ReactLazy.js](https://github.com/facebook/react/blob/master/packages/react/src/ReactLazy.js)
- [ReactLazyComponent.js](https://github.com/facebook/react/blob/master/packages/shared/ReactLazyComponent.js)
- [基于 React.Suspense 和 React.lazy 的前端性能优化](https://mp.weixin.qq.com/s/uh4UOlGsInYqOKVTYnJySQ)
