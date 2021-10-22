---
nav:
  title: API
  order: 4
group:
  title: React
  order: 1
title: React.createRef
order: 11
---

# React.createRef

CreateRef API 的作用是创建一个 `ref` 对象。先把 `createRef` 的执行结果返回给一个实例属性，然后通过该实例属性获得 DOM 元素的引用。

## 基本用法

类型声明：

```ts
export type RefObject = {|
  current: any,
|};

export function createRef(): RefObject {
  const refObject = {
    current: null,
  };
  if (__DEV__) {
    Object.seal(refObject);
  }
  return refObject;
}
```

代码示例：

<code src="../../../example/createRef/index.tsx" />

使用 `React.createRef()` 给组件创建了 Refs 对象。在上面的示例中，`ref` 被命名 `inputRef`，然后将其附加到 `<input>` DOM 元素。

其中 `inputRef` 的属性 `current` 指的是当前附加到 `ref` 的元素，并广泛用于访问和修改我们的附加元素。事实上，如果我们通过登录控制台进一步扩展我们的示例，我们将看到该 `current` 属性确实是唯一可用的属性：

- `createRef` 初始化动作要在组件挂载之前，如果是挂载之后初始化，则无法得到 DOM 元素的引用
- 真正的 DOM 元素引用在 `.current` 属性上

## 与 useRef 对比

`useRef` 返回一个可变的 `ref` 对象，其 `.current` 属性被初始化为传入的值。返回的 `ref` 对象在组件的整个生命周期内保持不变。

```jsx | pure
function Hello() {
  const textRef = useRef(null);

  const onButtonClick = () => {
    textRef.current.focus();
  };

  return (
    <>
      <input ref={textRef} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}
```

`useRef` 比 `ref` 属性更有用。`useRef` 不仅可以用于 DOM Refs，`useRef` 创建的 `ref` 对象是一个 `current` 属性可变且可以容纳任意值的通用容器，类似于一个 class 的实例属性。

```jsx | pure
function useIntervalTimer(fn) {
  const intervaRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => fn());

    intervaRef.current = id;

    return () => {
      clearInterval(intervaRef.current);
    };
  }, []);
}
```

这是因为它创建的是一个普通 Javascript 对象。而 `useRef()` 和自建一个 `{ current: ... }` 对象的唯一区别是，`useRef` 会在每次渲染时返回 <strong style="color:red">同一个</strong> `ref` 对象。

请记住，当 `ref` 对象内容发生变化时，`useRef` 并不会通知你。变更 `.current` 属性不会引发组件重新渲染。如果想要在 React 绑定或解绑 DOM 节点的 `ref` 时运行某些代码，则需要使用回调 `ref` 来实现。
