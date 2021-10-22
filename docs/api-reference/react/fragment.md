---
nav:
  title: API
  order: 4
group:
  title: React
  order: 1
title: React.Fragment
order: 2
---

# React.Fragment

`React.Fragment` 用作不可见的包裹标签。

返回多个元素或组件时候，Fragments 可以让你聚合一个子元素列表，并且不在 DOM 中增加额外节点。

## 基本用法

语法：

```jsx | pure
const App = () => {
  return (
    <React.Fragment>
      Some text.
      <h2>A heading</h2>
    </React.Fragment>
  );
};
```

## 标签属性

如果需要一个带 `key` 的片段，你可以直接使用 `<React.Fragment>` 。比较常见的使用场景是映射一个集合为一个片段数组。

代码示例：

<code src="../../../example/fragment/index.tsx" />

`key` 是唯一可以传递给 `React.Fragment` 的属性。在将来，可能增加额外的属性支持，比如事件处理。

## 短语法

你也可以在 React v16.2+ 版本中使用 `<></>` 代替。但是这种用法不能接受键值或属性。

代码示例：

```jsx | pure
const App = () => {
  return (
    <>
      <div>Hello</div>
      <div>world!</div>
    </>
  );
};
```

⚠️ **注意**：一些编译器可能不支持这种写法
