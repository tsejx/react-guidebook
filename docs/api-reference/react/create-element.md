---
nav:
  title: API
  order: 3
group:
  title: React
  order: 1
title: React.createElement
order: 3
---

# React.createElement

`React.createElement` 根据指定的参数（包括标签类型、组件属性、子孙节点等）创建一个 React 元素

```jsx | pure
React.createElement(type, [props], [...children]);
```

**参数**

- `type`：必传，HTML 的标签名称字符串或 React 组件类型（class 组件或函数组件），例如 `"div"`、`"ul"`、`"li"`
- `props`：选填，表示 `props` 属性，例如 `"className"`
- `chuldren`：选填，子节点，例如要显示的文本内容

## 使用方法

```jsx | pure
const one = React.createElement('li', null, 'one');

const two = React.createElement('li', null, 'two');

// 第三个参数可以分开也可以写成数组
const content = React.createElement('ul', { className: 'list' }, one, two);

ReactDOM.render(content, document.getElementById('app'));
```

我们使用 JSX 进行开发 React 应用的时候，其实它最终
