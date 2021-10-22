---
nav:
  title: API
  order: 4
group:
  title: React
  order: 1
title: React.cloneElement
order: 6
---

# React.cloneElement

`React.cloneElement` 方法根据指定参数（包括 React 元素、元素属性、子孙节点等）克隆拷贝新的 React 元素。

## 基本用法

该方法会从已有的 `ReactElement` 中复制，并返回一个新的 `ReactElement` 对象。

语法：

```jsx | pure
const cloneElement = React.cloneElement(element, props, children);
```

参数说明：

- `element`：React 元素
- `props`：可选，表示组件的属性
- `children`：第三个参数及其后的参数都会被认为是元素的子元素

使用 `cloneElement()` 复制这个元素，并最终生前面示例中的 HTML。

<code src="../../../example/cloneElement/index.tsx" />
