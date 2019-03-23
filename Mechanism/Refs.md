## Refs

Refs 提供了一种方式，用于访问在 render 方法中创建的 DOM 节点或 React 元素。

### 使用场景

* 管理焦点、文本选择、媒体回放
* 触发必要动画
* 整合第三方 DOM 库

> ⚠️ 避免对任何可以声明式解决的问题使用 Refs！

### 创建方法

1. 字符串（未来会被移除）
2. 回调函数
3. `React.createRef()` （React v16.3+ 支持）

### 访问方法

通过 Refs 引用的 `current` 属性访问关联节点。

```js
const node = this.myRef.current
```

访问的值会因关联的节点的类型不同而不同：

* 关联 HTML 元素，在构造器中通过 `React.createRef()` 函数创建的 `ref` 接收底层 DOM 元素作为它的 `current` 属性
* 关联自定义 Class 类组件，`ref` 引用接收已挂载的组件实例作为它的 `current` 
* ⚠️ **关联函数式组件是不被允许的，因为函数式组件没有实例。**但是你可以在函数式组件中使用 `ref` 属性。

### 原理机制

React 将会在组件挂载时将 DOM 元素分配给 `current` 属性，并且在组件被卸载时，将 `current` 属性重置为 `null`。`ref` 将会在 `componentDidMount` 和 `componentDidUpdate` 生命中器钩子前被更新。

为防止内存泄漏，当写在一个组件的时候，组件里所有的 Refs 就会变为 `null`。