---
nav:
  title: Hooks
  order: 5
group:
  title: 基础 Hook
  order: 2
title: useContext
order: 3
---

# useContext

## 基本用法

```js
const value = useContext(MyContext);
```

接收一个 `context` 对象（`React.createContext` 的返回值）并返回该 `context` 的当前值。当前的 `context` 值由上层组件中距离当前组件最近的 `<MyContext.Provider>` 的 `value prop` 决定。

当组件上层最近的 `<MyContext.Provider>` 更新时，该 Hook 会触发重渲染，并使用最新传递给 `MyContext provider` 的 `context value` 值。即使祖先使用 `React.memo` 或 `shouldComponentUpdate`，也会在组件本身使用 `useContext` 时重新渲染。

别忘记 `useContext` 的参数必须是 `context` 对象本身：

- **正确：**`useContext(MyContext)`
- **错误：**`useContext(MyContext.Consumer)`
- **错误：**`useContext(MyContext.Provider)`

调用了 `useContext` 的组件总会在 `context` 值变化时重新渲染。如果重渲染组件的开销较大，你可以通过使用 `memoization` 来优化。

> ⚠️ **提示：**
>
> 如果你接触 Hook 前已经对 context API 比较熟悉，那应该可以理解，`useContext(MyContext)` 相当于 class 组件中的 `static contextType = MyContext` 或者 `<MyContext.Consumer>`。
>
> `useContext(MyContext)` 只是让你能够读取 `context` 的值以及订阅 `context` 的变化。你仍然需要在上层组件树中使用 `<MyContext.Provider>` 来为下层组件提供 `context`。


```jsx | pure
const themes = {
  light: {
    foreground: "#000000",
    background: "#eeeeee"
  },
  dark: {
    foreground: "#ffffff",
    background: "#222222"
  }
};

const ThemeContext = React.createContext(themes.light);

function App() {
  return (
    <ThemeContext.Provider value={themes.dark}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return (
    <button style={{ background: theme.background, color: theme.foreground }}>
      I am styled by theme context!
    </button>
  );
}
```