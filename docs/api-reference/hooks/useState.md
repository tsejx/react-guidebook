---
nav:
  title: API
  order: 4
group:
  title: Hooks API
  order: 3
title: useState
order: 1
---

# useState

官方文档：[使用 State Hook](https://zh-hans.reactjs.org/docs/hooks-state.html)

## 基本用法

语法：

```js
const [state, setState] = useState(initialState);
```

类型声明：

```ts
type BasicStateAction<S> = (S => S) | S;
type Dispatch<A> = A => void;

export function useState<S>(
  initialValue: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}
```

<br />

<code src="../../../example/useState/index.tsx" />

说明：

- 在 **初始渲染** 期间，返回的状态（`state`）与传入的第一个参数（`initialState`）值相同。
- `setState` 函数用于更新 `state`。它接收一个新的 `state` 值并将组件的一次重新渲染加入队列。
- 在后续的重新渲染中，`useState` 返回的第一个值将始终是更新后最新的 `state`。

⚠️ **注意**：

- React 会确保 `setState` 函数的标识是稳定的，并且不会在组件重新渲染时发生变化。这就是为什么可以安全地从 `useEffect` 或 `useCallback` 的依赖列表中省略 `setState`。
- Hook 在 Class 组件内部是不起作用的，但你可以使用它们来取代 Class 组件

### 函数式更新

如果想基于先前的 `state` 进行 `setState` 变更数据，可以将更新函数传给 `setState`，该函数的第一个参数就是先前的 `state`，返回值就是变更后的 `state`。

代码示例：

<code src="../../../example/useState-functional-update/index.tsx" />

如果你的更新函数返回值与当前 `state` 完全相同，则随后的重渲染会被完全跳过。

⚠️ **注意：**

与 `class` 组件中的 `setState` 方法不同，`useState` 不会自动合并更新对象。你可以用函数式的 `setState` 结合扩展运算符或 `Object.assign`来达到合并更新对象的效果。

```js
setState((prevState) => {
  // 也可以使用 Object.assign
  return {
    ...prevState,
    ...updateValues,
  };
});
```

[useReducer](./useReducer) 是另一种可选方案，它更适合用于管理包含多个 property 的 `state` 对象。

### 惰性初始值

说明：

- `initialState` 初始化参数只会在组件的初始渲染中起作用，后续渲染时会被忽略
- 如果初始 `state` 需要通过复杂计算获得，则可以传入一个函数，在函数中计算并返回初始的 `state`，此函数只在初始渲染时被调用：

```js
const [state, setState] = useState(() => {
  const initialState = someExpensiveComputation(props);
  return initialState;
});
```

### 跳过更新

调用更新函数 `setState` 并传入当前的 `state` 时，React 将跳过子组件的渲染及 `effect` 的执行。（React 使用 `Object.is` 比较算法来比较 `state`）

需要注意的是，React 可能仍需要在跳过渲染前渲染该组件。不过由于 React 不会对组件树的 **深层节点** 进行不必要的渲染，所以大可不必担心。如果你在渲染期间执行了高开销的计算，则可以使用 [useMemo](./useMemo) 来进行优化。

## 最佳实践

### 闭包缓存

`param` 这个变量对于 DOM 而言没有影响，此时将他定义为一个异步变量并不明智。好的方式是将其定义为一个同步变量。

利用闭包，我们只要在这个模块中定义个变量，并且在函数组件中访问，那么闭包就有了。

```tsx | pure
export default function AsyncDemo() {
  const [param] = useState<Param>({});
  const [dataList, setDataList] = useState<ListItem[]>([]);

  function fetchDataList() {
    listApi(param).then((res) => {
      setDataList(res.data);
    });
  }

  function searchByName(name: string) {
    // 直接修改状态
    param.name = name;
    fetchDataList();
  }

  return [
    <div>data list</div>,
    <button onClick={() => searchByName('John')}>search by name</button>,
  ];
}
```

## 参考资料

- [📝 ReactHooks 源码解析之 useState 及为什么 useState 要按顺序执行](https://juejin.im/post/6844904152712085512)
- [📝 阅读源码后，来讲讲 React Hooks 是怎么实现的](https://juejin.im/post/6844903704437456909)
