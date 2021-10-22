---
nav:
  title: API
  order: 4
group:
  title: Context API
  order: 2
title: ReactContext.Provider
order: 2
---

# ReactContext.Provider

### 基本用法

代码示例：

```jsx | pure
const contextValue = React.createContext(initialValue);

<MyContext.Provider value={contextValue}>
```

每个 `Context` 对象都挂载了一个 `<Provider>` 组件，它允许消费组件订阅 `context` 的变化。

- `Provider` 接收一个 `value` 属性，传递给消费组件。一个 `Provider` 可以和多个消费组件由对应关系。多个 Provider 也可以嵌套使用，**里层的会覆盖外层的数据**。
- 当 `Provider` 的 `value` 值发生变化时，它内部的所有消费组件都会重新渲染。`<Provider>` 及其内部 `<Consumer>` 组件都不受制于 `shouldComponentUpdate` 函数，因此当 `<Consumer>` 组件在其祖先组件退出更新的情况下也能更新。

通过新旧值监测来确定变化，使用了与 `Object.is` 相同的算法。
