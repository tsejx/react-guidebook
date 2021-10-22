---
nav:
  title: API
  order: 4
group:
  title: React
  order: 1
title: React.memo
order: 13
---

# React.memo

> ✨ React v16.6+ 新增 memo 新特性 [官方文档](https://reactjs.org/docs/react-api.html#reactmemo)

类组件可以通过继承类 `PureComponent` 或者实现 `shouldComponentUpdate` 来主动判断组件是否需要重新渲染，以此来提高性能，但是函数组件到目前为止没有类似的功能。

## 基本用法

类型声明：

```ts
export function memo<Props>(
  type: React$ElementType,
  compare?: (oldProps: Props, newProps: Props) => boolean
) {
  // do something
  const elementType = {
    $$typeof: REACT_MEMO_TYPE,
    type,
    compare: compare === undefined ? null : compare,
  };
  // do something
  return elementType;
}
```

代码示例：

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

<br/>

<code src="../../../example/memo/index.tsx" />

说明：

- `React.memo` 接收两个参数，一个是组件，一个是（比较）函数
  - **组件**：组件必须是函数式组件
  - **函数**：这个函数就是定义组件是否需要重渲染的钩子，该函数传入两个参数，第一个参数为上次渲染的 `props`，第二参数为本次渲染的 `props`
- 函数返回值为 `true` 时复用最近一次渲染，否则 `false` 重新渲染

⚠️ **注意**：

- 如果不通过比较函数进行比较，那么依然是一种对象的浅比较，有复杂对象时无法重新渲染

## 参考资料

- [React 优化 记忆性技术 使用闭包提升你的 React 性能](https://segmentfault.com/a/1190000015301672)
- [React 16.6 新 API](http://www.ayqy.net/blog/react-16-6%E6%96%B0api/)
- [React 源码漂流之 PureComponent](https://juejin.im/post/5d498504e51d4561d044cc76)
