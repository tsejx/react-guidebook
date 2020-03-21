---
nav:
  title: API
  order: 3
group:
  title: React
  order: 1
title: React.memo
order: 2
---

# React.memo

> ✨ React v16.6.0 新增 memo 新特性 [官方文档](https://reactjs.org/docs/react-api.html#reactmemo)

Class Component 可以通过继承类 `PureComponent` 或者实现 `shouldComponentUpdate` 来主动判断组件是否需要重新渲染，以此来提高性能，但是 Functional Component 到目前为止没有类似的功能。

这种方式依然是一种对象的浅比较，有复杂对象时无法重新渲染。

## 使用指南

```jsx | pure
function MyComponent(props) {
  /* 使用 props 渲染 */
}

// 比较函数
function areEqual(prevProps, nextProps) {
  /*
  如果把 nextProps 传入 render 方法的返回结果与
  将 prevProps 传入 render 方法的返回结果一致则返回 true，
  否则返回 false

  返回 true，复用最近一次渲染
  返回 false，重新渲染
  */
}

export default React.memo(MyComponent, areEqual);
```

🌰 **示例：**

```jsx | pure
const SubComponent = props => <>My name is {props.name}.</>;

// 创建 memo 组件
const Memo = React.memo(SubComponent, (prevProps, nextProps) => {
  // 当 name 相同时不重渲染，否则重渲染
  return prevProps.name === nextProps.name;
});

// 在页面上渲染
const App = (
  <div>
    <Memo />
  </div>
);
```

`React.memo` 接收两个参数，一个是组件，一个是函数。这个函数就是定义组件是否需要重渲染的钩子，该函数传入两个参数，第一个参数为上次渲染的 `props`，第二参数为本次渲染的 `props`。

---

**参考资料：**

- [React 优化 记忆性技术 使用闭包提升你的 React 性能](https://segmentfault.com/a/1190000015301672)
- [React 16.6 新 API](http://www.ayqy.net/blog/react-16-6%E6%96%B0api/)
- [React 源码漂流之 PureComponent](https://juejin.im/post/5d498504e51d4561d044cc76)
