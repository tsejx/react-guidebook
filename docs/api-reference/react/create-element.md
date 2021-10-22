---
nav:
  title: API
  order: 4
group:
  title: React
  order: 1
title: React.createElement
order: 5
---

# React.createElement

`React.createElement` 根据指定的参数（包括标签类型、组件属性、子孙节点等）创建一个 React 元素。

## 基本用法

语法：

```jsx | pure
React.createElement(type, [props], [...children]);
```

参数说明：

- `type`：必传，HTML 的标签名称字符串或 React 组件类型（类组件或函数组件），例如 `'div'`、`'ul'`、`'li'`
- `props`：选填，表示 `props` 属性，例如 `'className'`
- `chuldren`：选填，子节点，例如要显示的文本内容

代码示例：

<code src="../../../example/createElement/index.tsx" />
