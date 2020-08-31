---
nav:
  title: API
  order: 4
group:
  title: React
  order: 1
title: React.createRef
order: 9
---

# React.createRef

CreateRef API 的作用是创建一个 `ref` 对象。先把 `createRef` 的执行结果返回给一个实例属性，然后通过该实例属性获得 DOM 元素的引用。

🌰 **示例：**

```jsx | pure
import React from 'react';

class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    // 创建 ref 存储 inputRef DOM 元素
    this.inputRef = React.createRef();
  }
  componentDidMount() {
    // 注意：通过 current 取得 DOM 节点
    // 直接使用原生 API 使 input 输入框获得焦点
    this.inputRef.current.focus();
  }
  render() {
    // 把 <input> ref 关联到构造器中创建的 inputRef 上
    return <input type="text" ref={this.inputRef} />;
  }
}
```

使用 `React.createRef()` 给组件创建了 Refs 对象。在上面的示例中，`ref` 被命名 `inputRef`，然后将其附加到 `<input>` DOM 元素。

其中 `inputRef` 的属性 `current` 指的是当前附加到 `ref` 的元素，并广泛用于访问和修改我们的附加元素。事实上，如果我们通过登录控制台进一步扩展我们的示例，我们将看到该 `current` 属性确实是唯一可用的属性：

```jsx | pure
componentDidMount = () => {
  // inputRef 仅仅有一个 current 属性
  console.log(this.inputRef);
  // inputRef.current
  console.log(this.inputRef.current);
  // component 渲染完成后，使 input 输入框获得焦点
  this.inputRef.current.focus();
};
```

在 `componentDidMount` 生命周期阶段，`this.inputRef.current` 将按预期分配给 `<>` 元素；`componentDidMount` 通常是使用 Refs 处理一些初始设置的安全位置。

- `createRef` 初始化动作要在组件挂载之前，如果是挂载之后初始化，则无法得到 DOM 元素的引用
- 真正的 DOM 元素引用在 `current` 属性上

## 原理分析

📌 出于不可描述的原因，如果你想获取一个子组件的 `ref` 引用，那么子组件必须是 Class 组件。

因为你获取的实际上是子组件的 **实例**，而函数式组件是没有实例的。

所有获取 `ref` 引用的方式，如果想要获取子组件而不是 DOM 元素，子组件都不能是函数式组件。

```js
import React, { Component, createRef } from 'react';
import Child from './Child';

class App extends Component {
  childRef = createRef();

  render() {
    return <Child ref={this.childRef} />;
  }
}

export default App;
```

## 源码解析

```tsx | pure
import type { RefObject } from 'shared/ReactTypes';

export function createRef(): RefObject {
  const refObject = {
    current: null,
  };
  if (__DEV__) {
    // 封闭对象，阻止添加新属性并将所有现有 property 标记为不可配置，当前属性值只要可写就可以改变
    Object.seal(refObject);
  }
  return refObject;
}
```

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

**区别**

`useRef` 比 `ref` 属性更有用。`useRef` Hook 不仅可以用于 DOM refs，`useRef` 创建的 `ref` 对象是一个 `current` 属性可变且可以容纳任意值的通用容器，类似于一个 class 的实例属性。

```jsx | pure
function Timer() {
  const interval = useRef();

  useEffect(() => {
    const id = setInterval(() => {})

    intervaRef.current = id;

    return () => {
      clearInterval(intervaRef.current);
    }
  })
}
```

这是因为它创建的是一个普通 Javascript 对象。而 `useRef()` 和自建一个 `{current: ...}` 对象的唯一区别是，useRef 会在每次渲染时返回同一个 `ref` 对象。

请记住，当 `ref` 对象内容发生变化时，useRef 并不会通知你。变更 .current 属性不会引发组件重新渲染。如果想要在 React 绑定或解绑 DOM 节点的 `ref` 时运行某些代码，则需要使用回调 `ref` 来实现。