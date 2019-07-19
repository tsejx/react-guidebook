# React.memo

✨ React v16.6.0 新增 memo 新特性 [🇨🇳 中文文档](https://reactjs.org/docs/react-api.html#reactmemo)

Class Component 可以通过继承类 `PureComponent` 或者实现 `shouldComponentUpdate` 来主动判断组件是否需要重新渲染，以此来提高性能，但是 Functional Component 到目前为止没有类似的功能。

这种方式依然是一种对象的浅比较，有复杂对象时无法重新渲染。

## 使用指南

```jsx
function MyComponent(props) {
  /* render using props*/
}

function areEqual(prevProps, nextProps) {
  /*
  return true if passing nextProps to render would return
  the same result as passing prevProps to render,
  otherwise return false
  */
}

export default React.memo(MyComponent, areEqual);
```

类似于 PureComponent 的高阶组件，外部包裹一层 memo，就能让普通函数式组件拥有 PureComponent 的性能优势。

---

**参考资料：**

- [React 优化 记忆性技术 使用闭包提升你的 React 性能](https://segmentfault.com/a/1190000015301672)
- [React 16.6 新 API](http://www.ayqy.net/blog/react-16-6%E6%96%B0api/)
