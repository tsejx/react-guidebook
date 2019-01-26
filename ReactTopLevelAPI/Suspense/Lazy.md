## React.lazy

`React.lazy()` 把条件渲染细节挪到了框架层，允许把动态引入的组件当普通组件用，优雅地消除了这种侵入性。

```js
const SomeComponent = React.lazy(() => import('./SomeComponent'))
```

> ⚠️ 使用 `React.lazy` 动态加载需要确保 Promises 兼容性。IE11以下需要 polyfill 兼容。

`React.lazy` 源码传送门：

* [ReactLazy.js](https://github.com/facebook/react/blob/master/packages/react/src/ReactLazy.js)
* [ReactLazyComponent.js](https://github.com/facebook/react/blob/master/packages/shared/ReactLazyComponent.js)

