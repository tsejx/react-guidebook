---
nav:
  title: API
  order: 3
group:
  title: React
  order: 1
title: React.lazy
order: 11
---

# React.lazy

> ✨ 适用于 React v16.6+

`React.lazy()`允许你定义一个动态加载的组件。这有助于缩减 bundle 的体积，并延迟加载在初次渲染时未用到的组件。

`React.lazy()` 把条件渲染细节挪到了框架层，允许把动态引入的组件当普通组件用，优雅地消除了这种侵入性。

## 使用方法

请注意，渲染 `lazy` 组件依赖该组件渲染树上层的 [`<React.Suspense>`](./suspense) 组件。这是指定加载指示器（loading indicator）的方式。

```js
import React, { Suspense, lazy } from 'react';

// 像常规组件一样动态引入组件，使用 React 文档中的 React.lazy 函数语法
const OtherComponent = lazy(() => import('./OtherComponent'));

function MyComponent() {
  // OtherComponent 未加载完，就必须显示一些提示等待的 fallback 内容，比如一个加载指示器
  return (
    <Suspense fallback={<div>Lodaing</div>}>
      <OtherComponent />
    </Suspense>
  );
}
```

如代码所示，将静态引用组件的代码替换为调用 `React.lazy`，在 `React.lazy` 传入一个匿名函数作为参数，在函数中动态引入 `lazyComponent` 组件。这样在我们渲染这个组件前，浏览器将不会下载 `lazyComponent.bundle.js` 文件和它的依赖。其中，`import` 内的 webpackChunkName 为我们定义的 bundle 文件名。

当 React 要渲染组件时，组件依赖的代码还没下载好，就会先加载 `<Suspense>` 的 `fallback` 渲染的组件元素。

动态加载的 `lazyComponent` 组件会被单独打包到一个 bundle 里面，然而，在首屏加载的时候，该 bundle 已经加载到我们的页面中，这也许并不是我们想要的，我们想要的是当我们需要的时候再加载。接下来我们就控制一下，当我们需要的时候，再加载该文件。

### 通过变量控制加载

原本我选择的五个懒加载组件均属于弹层性质的组件，因此必然会设置一个 state 来控制该组件的显示与隐藏，因此我们将代码改为：

```jsx | pure
class MyComponent extends React.Component {

  render() {
  return (
    <div>
      {this.state.showLazyComponent && (
        <Suspense fallback={<div>Lodaing</div>}>
          <OtherComponent />
        </Suspense>
      )}
    <div>
  );
  }
}
```

在首屏加载时，并未加载我们的懒加载组件 LazyComponent 所对应的 bundle 包。等到我们点击需要该组件显示时，页面才去加载该脚本文件。这便达到了我们代码分离并懒加载的目的。

当懒加载组件多时，我们便可一定程度上减少首屏加载文件的大小，提高首屏的渲染速度。

## 注意事项

- 使用 `React.lazy` 动态加载需要确保 Promise 兼容性。IE11 及以下版本的浏览器中需要通过 polyfill 兼容
- `React.lazy` 和 `Suspense` 在服务端渲染中尚不可用。如果想再服务端渲染的应用中使用代码分割，请绕行 [react-loadable](https://github.com/thejameskyle/react-loadable#readme) 和 [lodable-components]()

---

**参考资料：**

- [ReactLazy.js](https://github.com/facebook/react/blob/master/packages/react/src/ReactLazy.js)
- [ReactLazyComponent.js](https://github.com/facebook/react/blob/master/packages/shared/ReactLazyComponent.js)
- [基于 React.Suspense 和 React.lazy 的前端性能优化](https://mp.weixin.qq.com/s/uh4UOlGsInYqOKVTYnJySQ)
