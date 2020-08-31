---
nav:
  title: Hooks
  order: 5
group:
  title: 额外的 Hook
  order: 3
title: useImperativeHandle
order: 5
---

# useImperativeHandle

## 基本用法

```js
useImperativeHandle(ref, createHandle, [deps])
```

`useImperativeHandle` 可以让你在使用 `ref` 时自定义暴露给父组件的实例值。在大多数情况下，应当避免使用 `ref` 这样的命令式代码。`useImperativeHandle` 应当与 `forwardRef` 一起使用：

```jsx | pure
function FancyInput(props, ref) {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));

  return <input ref={inputRef} ... />
}

FancyInput = forwardRef(FancyInput)
```

在本例中，渲染 `<FancyInput ref={inputRef} />` 的父组件可以调用 `inputRef.current.focus()`。