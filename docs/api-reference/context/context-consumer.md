---
nav:
  title: API
  order: 4
group:
  title: Context API
  order: 2
title: ReactContext.Consumer
order: 3
---

# ReactContext.Consumer

### 基本用法

代码示例：

```jsx | pure
<MyContext.Consumer>
  {(value) => {
    /* do something */
  }}
</MyContext.Consumer>
```

这里，React 组件也可以订阅到 context 变更。这能让你在函数式组件中完成订阅 `context`。

这需要函数作为子元素（function as a child）这种做法。这个函数接收当前的 `context` 值，返回一个 React 节点。传递给函数的 `value` 值等同于往上组件树离这个 `context` 最近的 `Provider` 提供的 `value` 值。如果没有对应的 `Provider`，`value` 参数等同于传递给 `createContext()` 的 `defaultValue`。
