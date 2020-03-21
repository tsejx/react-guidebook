# Hooks

- 基础 Hook
  - useState
  - useEffect
  - useContext
- 额外的 Hook
  - useReducer
  - useCallback
  - useMemo
  - useRef
  - useImperativeHandle
  - useLayoutEffect
  - useDebugValue


> 🚧 施工中，未完成

- Hooks
- EffectHooks

## Hooks

```js
import { useState } from 'react';

function Example() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>You clicked {count}</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

```js
function ExampleWithManyStates() {
  const [age, setAge] = useState(42);
  const [fruit, setFruit] = useState('banana');
  const [todos, setTodos] = useState([{ text: 'Learn Hooks' }]);
}
```

`useState` 接收的初始值没有规定必须是 `string/number/boolean` 这种简单数据类型，它完全可以接收对象或者数组作为参数。

唯一需要注意的点是，之前我们的 `this.setState` 做的是合并状态后返回一个新状态，而 `useState` 是直接替老状态后返回新状态。

插拔式的功能注入

- 直接运用再函数当中，而非 `class`
- 每个 Hook 都是相互独立的，不同组件调用同一个 Hook 也能保证各自状态的独立性

保证多个 `useState` 相互独立

格局 `useState` 出现顺序

```js
// The first render
// 将age初始化为42
useState(42);
// 将fruit初始化为banana
useState('banana');
useState([{ text: 'Learn Hooks' }]);

// The second render
// 读取状态变量age的值(这时候传的参数42直接被忽略)
useState(42);
useState('banana');
// 读取到的却是状态变量fruit的值，导致报错
useState([{ text: 'Learn Hooks' }]);
```

鉴于此，React 规定我们必须把 Hook 写在函数的最外层，不能写在 `if..else` 等条件语句当中，来确保 Hook 的执行顺序一致。

### Effect Hooks

副作用，比如发起 Ajax 请求获取数据，添加监听的注册和取消注册，手动修改 DOM 等等。我们之前把这些副作用的函数写在生命周期函数钩子里，比如 `componentDidMount`、`componentDidUpdate` 和 `componentWillUnmount`。而现在的 `useEffect` 就相当与这些声明周期函数钩子的集合体。

React 首次渲染和之后的每次渲染都会调用一遍传给 `useEffect` 的函数。而之前我们要用两个生命周期函数来分别表示首次渲染（`componentDidMount`），和之后的更新导致的重新渲染（`componentDidUpdate`）。

`useEffect` 中定义的副作用函数的执行不会阻碍浏览器更新视图，也就是说这些函数是异步执行的，而之前的 `componentDidMount` 或 `componentDidUpdate` 中的代码则是同步执行的。这种安排对大多数副作用来说都是合理的，但有的情况除外，比如我们有时候需要先根据 DOM 计算出某个元素的尺寸再重新渲染，这时候我们希望这次重新渲染是同步发生的，也就是说它会在浏览器真的去绘制这个页面前发生。

### 解绑副作用

传给 `useEffect` 的副作用函数返回一个新的函数即可。这个新的函数会在组建下一次重新渲染之后执行。这种模式在一些 Pubsub 模式的实现中很常见。

```js
import { useState, useEffect } from 'react';

function FriendState(props) {
  const [isOnline, setIsOnline] = useState(null);

  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    // 一定注意顺序：告知React下次ReRender组件之后，同时是下次调用ChatAPI.subscribeToFriendStatus之前执行cleanup
    return function cleanup() {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });

  if (isOnline === null) {
    return 'Loading...';
  }

  return isOnline ? 'Online' : 'Offline';
}
```

这种解绑模式与 `componentWillUnmount` 存在差异。

`componentWillUnmount` 只会在组件被销毁前执行一次而已，而 `useEffect` 里的函数，每次组件渲染后都会执行一遍，包括副作用函数返回的这个清理函数也会重新执行一遍。

**为什么要让副作用函数每次组件更新都执行一次**

---

**参考资料：**

- [30 分钟精通 React Hooks](https://juejin.im/post/5be3ea136fb9a049f9121014)
- [React Hook 的初步研究](https://github.com/lhyt/issue/issues/35)
- [深入 React Hook 系统的原理](https://juejin.im/post/5c99a75af265da60ef635898)
- [How React Works](https://juejin.im/post/5b9a45fc5188255c402af11f)
- [精读《怎么用 React Hooks 造轮子》](https://juejin.im/post/5bf20ce6e51d454a324dd0e6)
- [中高级前端大厂面试秘籍](https://juejin.im/post/5c92f499f265da612647b754)


React Hooks：From Redux to Hooks
https://zhuanlan.zhihu.com/p/83552786