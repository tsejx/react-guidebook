---
nav:
  title: 架构
  order: 2
group:
  title: Hooks
  order: 1
title: 源码分析
order: 2
---

# 源码分析

从源码剖析 `useState` 的执行过程。

示例代码：

```jsx | pure
import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Star');

  // 调用三次setCount便于查看更新队列的情况
  const countPlusThree = () => {
    setCount(count + 1);
    setCount(count + 2);
    setCount(count + 3);
  };
  return (
    <div className="App">
      <p>
        {name} Has Clicked <strong>{count}</strong> Times
      </p>
      <button onClick={countPlusThree}>Click *3</button>
    </div>
  );
}
```

代码非常简单，点击 `button` 使 `count+3`，`count` 的值会显示在屏幕上。

## 前置知识

### 函数组件和类组件

> 本节参考：[How Are Function Components Different from Classes?](https://overreacted.io/how-are-function-components-different-from-classes/)

本节主要概念：

- 函数组件和类组件的区别
- React 如何区分这两种组件

我们来看一个简单的 `Greeting` 组件，它支持定义成类和函数两种性质。在使用它时，不用关心他是如何定义的。

```jsx | pure
// 是类还是函数 —— 无所谓
<Greeting /> // <p>Hello</p>
```

如果 `Greeting` 是一个函数，React 需要调用它：

```jsx | pure
// Greeting.js
function Greeting() {
  return <p>Hello</p>;
}

// React 内部
const result = Greeting(props); // <p>Hello</p>
```

但如果 `Greeting` 是一个类，React 需要先将其实例化，再调用刚才生成实例的 `render` 方法：

```jsx | pure
// Greeting.js
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}

// React 内部
const instance = new Greeting(props); // Greeting {}
const result = instance.render(); // <p>Hello</p>
```

React 通过以下方式来判断组件的类型：

```js
// React 内部
class Component {}
Component.prototype.isReactComponent = {};

// 检查方式
class Greeting extends React.Component {}
console.log(Greeting.prototype.isReactComponent); // {}
```

### React Fiber

> 本节参考：[A cartoon intro to fiber](https://www.youtube.com/watch?v=ZCuYPiUIONs&list=PLb0IAmt7-GS3fZ46IGFirdqKTIxlws7e0&index=5)

本节主要概念（了解即可）：

- React 现在的渲染都是由 Fiber 来调度
- Fiber 调度过程中的两个阶段（以 Render 为界）

**Fiber**（可译为丝）比线程还细的控制粒度，是 React16 中的新特性，旨在对渲染过程做更精细的调整。

产生原因：

1. Fiber 之前的 `reconciler`（被称为 Stack reconciler）自顶向下的递归 `mount/update`，无法中断（持续占用主线程），这样主线程上的布局、动画等周期性任务以及交互响应就无法立即得到处理，影响体验
2. 渲染过程中没有优先级可言

React Fiber 的方式：

把一个耗时长的任务分成很多小片，每一个小片的运行时间很短，虽然总时间依然很长，但是在每个小片执行完之后，都给其他任务一个执行的机会，这样唯一的线程就不会被独占，其他任务依然有运行的机会。

React Fiber 把更新过程碎片化，执行过程如下面的图所示，每执行完一段更新过程，就把控制权交还给 React 负责任务协调的模块，看看有没有其他紧急任务要做，如果没有就继续去更新，如果有紧急任务，那就去做紧急任务。
维护每一个分片的数据结构，就是 Fiber。

有了分片之后，更新过程的调用栈如下图所示，中间每一个波谷代表深入某个分片的执行过程，每个波峰就是一个分片执行结束交还控制权的时机。让线程处理别的事情

```jsx | inline
import React from 'react';
import img from '../../assets/fiber-example.png';

export default () => <img alt="Fiber示意图" src={img} width={540} />;
```

Fiber 的调度过程分为以下两个阶段：

`render/reconciliation` 阶段 — 里面的所有生命周期函数都可能被执行多次，所以尽量保证状态不变

- `componentWillMount`
- `componentWillReceiveProps`
- `shouldComponentUpdate`
- `componentWillUpdate`

`Commit` 阶段 — 不能被打断，只会执行一次

- `componentDidMount`
- `componentDidUpdate`
- `compoenntWillunmount`

Fiber 的增量更新需要更多的上下文信息，之前的 VirtualDOM Tree 显然难以满足，所以扩展出了 Fiber Tree（即 Fiber 上下文的 VirtualDOM Tree），更新过程就是根据输入数据以及现有的 Fiber Tree 构造出新的 Fiber Tree（`workInProgress tree`）。

与 Fiber 有关的所有代码位于 [packages/react-reconciler](https://github.com/facebook/react/tree/v16.8.6/packages/react-reconciler) 中，一个 Fiber 节点的详细定义如下：

```js
function FiberNode(tag: WorkTag, pendingProps: mixed, key: null | string, mode: TypeOfMode) {
  // Instance
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  // Fiber
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;
  this.ref = null;
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;

  // 重点
  this.memoizedState = null;

  this.contextDependencies = null;
  this.mode = mode;

  // Effects
  /** 细节略 **/
}
```

我们只关注一下 `this.memoizedState`。

这个 `key` 用来存储在上次渲染过程中最终获得的节点的 `state`，每次 `render` 之前，React 会计算出当前组件最新的 `state` 然后赋值给组件，再执行 `render`。类组件和使用 `useState` 的函数组件均适用。

记住上面这句话，后面还会经常提到 `memoizedState`。

> 有关 Fiber 每个 key 的具体含义可以参见 [源码的注释](https://github.com/facebook/react/blob/487f4bf2ee7c86176637544c5473328f96ca0ba2/packages/react-reconciler/src/ReactFiber.js#L84-L218)

### React 渲染器与 setState

> 本节参考： [How Does setState Know What to Do?](https://overreacted.io/how-does-setstate-know-what-to-do/)

本节主要概念：

- React 渲染器是什么
- setState 为什么能够触发更新

由于 React 体系的复杂性以及目标平台的多样性。`react` 包只暴露一些定义组件的 API。绝大多数 React 的实现都存在于 渲染器（renderers）中。

`react-dom`、`react-dom/server`、 `react-native`、 `react-test-renderer`、 `react-art` 都是常见的渲染器

这就是为什么不管目标平台是什么，`react` 包都是可用的。从 `react` 包中导出的一切，比如 `React.Component`、`React.createElement`、 `React.Children` 和 `Hooks` 都是独立于目标平台的。无论运行 `React DOM`，还是 `React DOM Server`,或是 `React Native`，组件都可以使用同样的方式导入和使用。

所以当我们想使用新特性时，`react` 和 `react-dom` 都需要被更新。

> 例如，当 React 16.3 添加了 Context API，`React.createContext()` API 会被 React 包暴露出来。
>
> 但是 `React.createContext()` 其实并没有实现 `context`。因为在 `React DOM` 和 `React DOM Server` 中同样一个 API 应当有不同的实现。所以 `createContext()` 只返回了一些普通对象：
> **所以，如果你将 `react` 升级到了 16.3+，但是不更新 `react-dom`，那么你就使用了一个尚不知道 `Provider` 和 `Consumer` 类型的渲染器。**这就是为什么老版本的 `react-dom` 会报错说这些类型是无效的。

这就是 `setState` 尽管定义在 React 包中，调用时却能够更新 DOM 的原因。它读取由 `React DOM` 设置的 `this.updater`，让 `React DOM` 安排并处理更新。

```js
Component.setState = function (partialState, callback) {
  // setState 所做的一切就是委托渲染器创建这个组件的实例
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};
```

各个渲染器中的 `updater` 触发不同平台的更新渲染

```js
// React DOM 内部
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMUpdater;

// React DOM Server 内部
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMServerUpdater;

// React Native 内部
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactNativeUpdater;
```

至于 `updater` 的具体实现，就不是这里重点要讨论的内容了，下面让我们正式进入本文的主题：React Hooks。

## 了解 useState

### 引入和触发更新

本节主要概念：

- `useState` 是如何被引入以及调用的
- `useState` 为什么能触发组件更新

所有的 Hooks 在 React.js 中被引入，挂载在 React 对象中

```js
// React.js
import {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useDebugValue,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from './ReactHooks';
```

我们进入 ReactHooks.js 来看看，发现 `useState` 的实现竟然异常简单，只有短短两行

```js
// ReactHooks.js
export function useState<S>(initialState: (() => S) | S) {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}
```

看来重点都在这个 `dispatcher` 上，`dispatcher` 通过 `resolveDispatcher()` 来获取，这个函数同样也很简单，只是将 `ReactCurrentDispatcher.current` 的值赋给了 `dispatcher`。

```js
// ReactHooks.js
function resolveDispatcher() {
  const dispatcher = ReactCurrentDispatcher.current;
  return dispatcher;
}
```

所以 `useState(xxx)` 等价于 `ReactCurrentDispatcher.current.useState(xxx)`。

看到这里，我们回顾一下第一章第三小节所讲的 React 渲染器与 `setState`，是不是发现有点似曾相识。

与 `updater` 是 `setState` 能够触发更新的核心类似，`ReactCurrentDispatcher.current.useState` 是 `useState` 能够触发更新的关键原因，这个方法的实现并不在`react` 包内。下面我们就来分析一个具体更新的例子。

### 示例分析

以全文开头给出的代码为例。

我们从 Fiber 调度的开始：`ReactFiberBeginwork` 来谈起

之前已经说过，React 有能力区分不同的组件，所以它会给不同的组件类型打上不同的 `tag`， 详见 [shared/ReactWorkTags.js](https://github.com/facebook/react/blob/v16.8.6/packages/shared/ReactWorkTags.js)。

所以在 `beginWork` 的函数中，就可以根据 `workInProgess`（就是个 `Fiber` 节点）上的 `tag` 值来走不同的方法来加载或者更新组件。

```js
// ReactFiberBeginWork.js
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderExpirationTime: ExpirationTime,
): Fiber | null {
  /** 省略与本文无关的部分 **/

  // 根据不同的组件类型走不同的方法
  switch (workInProgress.tag) {
    // 不确定组件
    case IndeterminateComponent: {
      const elementType = workInProgress.elementType;
      // 加载初始组件
      return mountIndeterminateComponent(
        current,
        workInProgress,
        elementType,
        renderExpirationTime,
      );
    }

    // 函数组件
    case FunctionComponent: {
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps);
      // 更新函数组件
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderExpirationTime,
      );
    }

    // 类组件
    case ClassComponent {
      /** 细节略 **/
  	}
  }
}
```

下面我们来找出 `useState` 发挥作用的地方。

#### 第一次加载

`mount` 过程执行 `mountIndeterminateComponent` 时，会执行到 `renderWithHooks` 这个函数

```js
function mountIndeterminateComponent(
  _current,
  workInProgress,
  Component,
  renderExpirationTime,
) {

 /** 省略准备阶段代码 **/

  // value 就是渲染出来的 APP 组件
  let value;

  value = renderWithHooks(
    null,
    workInProgress,
    Component,
    props,
    context,
    renderExpirationTime,
  );
  /** 省略无关代码 **/
  }
  workInProgress.tag = FunctionComponent;
  reconcileChildren(null, workInProgress, value, renderExpirationTime);
  return workInProgress.child;
}
```

执行前：`nextChildren = value`

```jsx | inline
import React from 'react';
import img from '../../assets/fiber-first-mount-1.png';

export default () => <img alt="执行前1" src={img} width={640} />;
```

执行后：`value = 组件的虚拟 DOM 表示`

```jsx | inline
import React from 'react';
import img from '../../assets/fiber-first-mount-2.png';

export default () => <img alt="执行后1" src={img} width={640} />;
```

至于这个 `value` 是如何被渲染成真实的 DOM 节点，我们并不关心，`state` 值我们已经通过 `renderWithHooks` 取到并渲染。

#### 更新重渲染

点击一下按钮：此时 `count` 从 0 变为 3。

更新过程执行的是 `updateFunctionComponent` 函数，同样会执行到 `renderWithHooks` 这个函数，我们来看一下这个函数执行前后发生的变化：

**执行前：**`nextChildren = undefined`

```jsx | inline
import React from 'react';
import img from '../../assets/fiber-update-1.png';

export default () => <img alt="执行前2" src={img} width={640} />;
```

**执行后：** `nextChildren = 更新后的组件的虚拟 DOM 表示`

```jsx | inline
import React from 'react';
import img from '../../assets/fiber-update-2.png';

export default () => <img alt="执行后2" src={img} width={640} />;
```

同样的，至于这个 `nextChildren` 是如何被渲染成真实的 DOM 节点，我们并不关心，最新的 `state` 值我们已经通过 `renderWithHooks` 取到并渲染。

所以，`renderWithHooks` 函数就是处理各种 `hooks` 逻辑的核心部分。

## 核心步骤分析

[ReactFiberHooks.js](https://github.com/facebook/react/blob/v16.8.6/packages/react-reconciler/src/ReactFiberHooks.js) 包含着各种关于 Hooks 逻辑的处理，本章中的代码均来自该文件。

### Hook 对象

在之前的章节有介绍过，Fiber 中的 `memorizedStated` 用来存储 `state`。

在类组件中 `state` 是一整个对象，可以和 `memoizedState` 一一对应。但是在 Hooks 中，React 并不知道我们调用了几次 `useState`，所以 React 通过将一个 Hook 对象挂载在 `memorizedStated` 上来保存函数组件的 `state`。

Hook 对象的结构如下：

```js
// ReactFiberHooks.js
export type Hook = {
  memoizedState: any,

  baseState: any,
  baseUpdate: Update<any, any> | null,
  queue: UpdateQueue<any, any> | null,

  next: Hook | null,
};
```

重点关注 `memoizedState` 和 `next`。

`memoizedState` 是用来记录当前 `useState` 应该返回的结果的。

- `queue`：缓存队列，存储多次更新行为
- `next`：指向下一次 `useState` 对应的 Hook 对象。

结合示例代码来看：

```jsx | pure
import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Star');

  // 调用三次setCount便于查看更新队列的情况
  const countPlusThree = () => {
    setCount(count + 1);
    setCount(count + 2);
    setCount(count + 3);
  };
  return (
    <div className="App">
      <p>
        {name} Has Clicked <strong>{count}</strong> Times
      </p>
      <button onClick={countPlusThree}>Click *3</button>
    </div>
  );
}
```

第一次点击按钮触发更新时，`memoizedState` 的结构如下

```jsx | inline
import React from 'react';
import img from '../../assets/memoized-state-1.png';

export default () => <img alt="第一次触发更新的memoizedState" src={img} width={520} />;
```

只是符合之前对 Hook 对象结构的分析，只是 `queue` 中的结构貌似有点奇怪，我们将在第三章第 2 节中进行分析。

### renderWithHooks

`renderWithHooks` 的运行过程如下：

```js
// ReactFiberHooks.js
export function renderWithHooks(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  props: any,
  refOrContext: any,
  nextRenderExpirationTime: ExpirationTime
): any {
  renderExpirationTime = nextRenderExpirationTime;
  currentlyRenderingFiber = workInProgress;

  // 如果 current 的值为空，说明还没有 hook 对象被挂载
  // 而根据 hook 对象结构可知，current.memoizedState 指向下一个 current
  nextCurrentHook = current !== null ? current.memoizedState : null;

  // 用 nextCurrentHook 的值来区分 mount 和 update，设置不同的 dispatcher
  ReactCurrentDispatcher.current =
    nextCurrentHook === null
      ? // 初始化时
        HooksDispatcherOnMount
      : // 更新时
        HooksDispatcherOnUpdate;

  // 此时已经有了新的 dispatcher,在调用 Component 时就可以拿到新的对象
  let children = Component(props, refOrContext);

  // 重置
  ReactCurrentDispatcher.current = ContextOnlyDispatcher;

  const renderedWork: Fiber = (currentlyRenderingFiber: any);

  // 更新 memoizedState 和 updateQueue
  renderedWork.memoizedState = firstWorkInProgressHook;
  renderedWork.updateQueue = (componentUpdateQueue: any);

  /** 省略与本文无关的部分代码，便于理解 **/
}
```

#### 初始化时

**核心：** 创建一个新的 hook，初始化 `state`， 并绑定触发器。

初始化阶段 `ReactCurrentDispatcher.current` 会指向 `HooksDispatcherOnMount` 对象

```js
// ReactFiberHooks.js

const HooksDispatcherOnMount: Dispatcher = {
/** 省略其它Hooks **/
  useState: mountState,
};

// 所以调用 useState(0) 返回的就是 HooksDispatcherOnMount.useState(0)，也就是 mountState(0)
function mountState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  // 访问 Hook 链表的下一个节点，获取到新的 Hook 对象
  const hook = mountWorkInProgressHook();

  // 如果入参是 function 则会调用，但是不提供参数
  if (typeof initialState === 'function') {
    initialState = initialState();
  }

  // 进行 state 的初始化工作
  hook.memoizedState = hook.baseState = initialState;

  // 进行 queue 的初始化工作
  const queue = (hook.queue = {
    last: null,
    dispatch: null,
    eagerReducer: basicStateReducer, // useState 使用基础 reducer
    eagerState: (initialState: any),
  });

	// 返回触发器
  const dispatch: Dispatch<BasicStateAction<S>,>
    = (queue.dispatch = (dispatchAction.bind(
      null,
      // 绑定当前 fiber 节点和 queue
      ((currentlyRenderingFiber: any): Fiber),
      queue,
  ));

  // 返回初始 state 和触发器
  return [hook.memoizedState, dispatch];
}

// 对于 useState 触发的 update action 来说（假设 useState 里面都传的变量），basicStateReducer 就是直接返回 action 的值
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
  return typeof action === 'function' ? action(state) : action;
}
```

重点讲一下返回的这个更新函数 `dispatchAction`。

```js
function dispatchAction<S, A>(fiber: Fiber, queue: UpdateQueue<S, A>, action: A) {
  /** 省略 Fiber 调度相关代码 **/

  // 创建新的新的 update, action 就是我们 setCount 里面的值 (count+1, count+2, count+3…)
  const update: Update<S, A> = {
    expirationTime,
    action,
    eagerReducer: null,
    eagerState: null,
    next: null,
  };

  // 重点：构建 queue
  // queue.last 是最近的一次更新，然后 last.next 开始是每一次的 action
  const last = queue.last;
  if (last === null) {
    // 只有一个 update, 自己指自己-形成环
    update.next = update;
  } else {
    const first = last.next;
    if (first !== null) {
      update.next = first;
    }
    last.next = update;
  }
  queue.last = update;

  /** 省略特殊情况相关代码 **/

  // 创建一个更新任务
  scheduleWork(fiber, expirationTime);
}
```

在 `dispatchAction` 中维护了一份 `queue` 的数据结构。

`queue` 是一个有环链表，规则：

- `queue.last` 指向最近一次更新
- `last.next` 指向第一次更新
- 后面就依次类推，最终倒数第二次更新指向 `last`，形成一个环。

所以每次插入新 `update` 时，就需要将原来的 `first` 指向 `queue.last.next`。再将 `update` 指向 `queue.next`，最后将 `queue.last` 指向 `update`。

下面结合示例代码来画图说明一下：

前面给出了第一次点击按钮更新时，`memorizedState` 中的 `queue` 值。

```jsx | inline
import React from 'react';
import img from '../../assets/memorized-state-queue.png';

export default () => <img alt="第一次触发更新的queue值" src={img} width={520} />;
```

其构建过程如下图所示：

```jsx | inline
import React from 'react';
import img from '../../assets/memorized-state-build.png';

export default () => <img alt="memorizedState构建过程" src={img} width={520} />;
```

即保证 `queue.last` 始终为最新的 `action`, 而 `queue.last.next` 始终为 `action: 1`

#### 更新时

**核心：**获取该 Hook 对象中的 `queue`，内部存有本次更新的一系列数据，进行更新

更新阶段 `ReactCurrentDispatcher.current` 会指向 `HooksDispatcherOnUpdate` 对象

```js
// ReactFiberHooks.js

// 所以调用 useState(0) 返回的就是 HooksDispatcherOnUpdate.useState(0)，也就是 updateReducer(basicStateReducer, 0)

const HooksDispatcherOnUpdate: Dispatcher = {
  /** 省略其它Hooks **/
   useState: updateState,
}

function updateState(initialState) {
  return updateReducer(basicStateReducer, initialState);
}

// 可以看到 updateReducer 的过程与传的 initalState 已经无关了，所以初始值只在第一次被使用

// 为了方便阅读，删去了一些无关代码
// 查看完整代码：https://github.com/facebook/react/blob/487f4bf2ee7c86176637544c5473328f96ca0ba2/packages/react-reconciler/src/ReactFiberHooks.js#L606
function updateReducer(reducer, initialArg, init) {
// 获取初始化时的 hook
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;

  // 开始渲染更新
  if (numberOfReRenders > 0) {
    const dispatch = queue.dispatch;
    if (renderPhaseUpdates !== null) {
      // 获取 Hook 对象上的 queue，内部存有本次更新的一系列数据
      const firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
      if (firstRenderPhaseUpdate !== undefined) {
        renderPhaseUpdates.delete(queue);
        let newState = hook.memoizedState;
        let update = firstRenderPhaseUpdate;
        // 获取更新后的 state
        do {
          const action = update.action;
          // 此时的 reducer 是 basicStateReducer，直接返回 action 的值
          newState = reducer(newState, action);
          update = update.next;
        } while (update !== null);
        // 对 更新 hook.memoized
        hook.memoizedState = newState;
        // 返回新的 state，及更新 hook 的 dispatch 方法
        return [newState, dispatch];
      }
    }
  }

// 对于 useState 触发的 update action 来说（假设 useState 里面都传的变量），basicStateReducer 就是直接返回 action 的值
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
  return typeof action === 'function' ? action(state) : action;
```

#### 总结

单个 Hooks 的更新行为全都挂在 `Hooks.queue` 下，所以能够管理好 `queue` 的核心就在于

- 初始化 queue - `mountState`
- 维护 queue - `dispatchAction`
- 更新 queue - `updateReducer`

结合示例代码：

- 当我们第一次调用 `[count, setCount] = useState(0)` 时，创建一个 `queue`
- 每一次调用 `setCount(x)`，就 `dispach` 一个内容为 `x` 的 `action`（`action` 的表现为：将 `count` 设为 `x`），`action` 存储在 `queue` 中，以前面讲述的有环链表规则来维护
- 这些 `action` 最终在 `updateReducer` 中被调用，更新到 `memorizedState` 上，使我们能够获取到最新的 `state` 值

## 总结

### 使用原则

官方文档对于使用 hooks 有以下两点要求：

- 只在 React 函数中使用 Hooks
- 只在自定义 Hooks 中使用 Hooks

### 为什么不能在循环/条件语句中执行

以 `useState` 为例：

和类组件存储 state 不同，React 并不知道我们调用了几次 `useState`，对 `hooks` 的存储是按顺序的（参见 Hook 结构），一个 `hook` 对象的 `next` 指向下一个 `hooks`。所以当我们建立示例代码中的对应关系后，`Hook` 的结构如下：

```js
// hook1: const [count, setCount] = useState(0) — 拿到state1
{
  memorizedState: 0;
  next: {
    // hook2: const [name, setName] = useState('Star') - 拿到state2
    memorizedState: 'Star';
    next: {
      null;
    }
  }
}

// hook1 => Fiber.memoizedState
// state1 === hook1.memoizedState
// hook1.next => hook2
// state2 === hook2.memoizedState
```

所以如果把 `hook1` 放到一个 `if` 语句中，当这个没有执行时，`hook2` 拿到的 `state` 其实是上一次 `hook1` 执行后的 `state`（而不是上一次 `hook2` 执行后的）。这样显然会发生错误。

> 关于这块内容如果想了解更多可以看一下 [这篇文章](https://medium.com/the-guild/under-the-hood-of-reacts-hooks-system-eb59638c9dba)

### 为什么只能在函数组件中使用 hooks

只有函数组件的更新才会触发 `renderWithHooks` 函数，处理 Hooks 相关逻辑。

还是以 `setState` 为例，类组件和函数组件重新渲染的逻辑不同 ：

- **类组件：** 用 `setState` 触发 `updater`，重新执行组件中的 `render` 方法
- **函数组件：** 用 `useState` 返回的 `setter` 函数来 `dispatch` 一个 `update action`，触发更新（`dispatchAction` 最后的 `scheduleWork`），用 `updateReducer` 处理更新逻辑，返回最新的 `state` 值（与 Redux 比较像）

### useState 整体运作流程总结

说了这么多，最后再简要总结下 `useState` 的执行流程。

- **初始化：** 构建 `dispatcher` 函数和初始值。
- **更新时：**
  1. 调用 `dispatcher` 函数，按序插入 `update`（其实就是一个 `action`）
  2. 收集 `update`，调度一次 React 的更新
  3. 在更新的过程中将 `ReactCurrentDispatcher.current` 指向负责更新的 `Dispatcher`
  4. 执行到函数组件 `App()` 时，`useState` 会被重新执行，在 `resolve dispatcher` 的阶段拿到了负责更新的 `dispatcher`。
  5. `useState` 会拿到 Hook 对象，`Hook.queue` 中存储了更新队列，依次进行更新后，即可拿到最新的 `state`
  6. 函数组件 `App()` 执行后返回的 `nextChild` 中的 `count` 值已经是最新的了。`FiberNode` 中的 `memorizedState` 也被设置为最新的 `state`
  7. Fiber 渲染出真实 DOM，更新结束。

---

**参考资料：**

- [📝 从源码剖析 useState 的执行过程](https://juejin.im/post/6844903833764642830)
- [📝 React Hooks 源码解析：useState](https://juejin.im/post/6844903990958784526)
