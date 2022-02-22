---
nav:
  title: API
  order: 4
group:
  title: Hooks API
  order: 3
title: useEffect
order: 2
---

# useEffect

官方文档：[使用 Effect Hook](https://reactjs.bootcss.com/docs/hooks-effect.html)

Effect Hook 可以让你在函数组件中执行副作用操作。

## 基本用法

语法：

```js
useEffect(create, deps);
```

类型声明：

```ts
export function useEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null
): void {
  const dispatcher = resolveDispatcher();
  return dispatcher.useEffect(create, deps);
}
```

说明：

- 参数：该 Hook 接收一个包含命令式、且可能有副作用代码的**函数**。
- 参数 `create` 函数返回值：入参函数可以不返回任何值，或返回用于组件卸载时需要清除副作用订阅或监听的逻辑函数（详细查阅 [清除函数](#清除函数)）
- 执行时机：使用 `useEffect` 完成副作用操作。赋值给 `useEffect` 的函数会在 **组件渲染到屏幕之后** 执行

⚠️ **注意**：

- 默认情况下，`effect` 将在每轮渲染结束后执行，但你可以选择让它 **在只有某些值改变的时候** 才执行。
- 在函数组件主体内（这里指在 React 渲染阶段）改变 DOM、添加订阅、设置定时器、记录日志以及执行其他包含副作用的操作都是不被允许的，因为这可能会产生莫名其妙的 BUG 并破坏 UI 的一致性。

### 清除函数

通常，组件卸载时需要执行清除 `effect` 创建的诸如订阅或计时器等逻辑。要实现这一点，`useEffect` 函数需返回一个 **清除函数**。

以下就是一个创建订阅的例子：

```js
useEffect(() => {
  const subscription = props.source.subscribe();

  return () => {
    // 清除订阅
    subscription.unsubscribe();
  };
}, []);
```

⚠️ **注意**：

- 为 **防止内存泄漏**，清除函数会在 **组件卸载前** 执行；
- 另外，如果组件多次渲染（通常如此），则在 **执行下一个 effect 之前，上一个 effect 就已被清除**。

在上述代码示例中，意味着组件的每次更新都会创建新的订阅。若想避免每次更新都触发 effect 的执行，请参阅下一小节 [执行时机](#执行时机)。

### 执行时机

与 `componentDidMount`、`componentDidUpdate` 不同的是，在浏览器完成布局与绘制之后，传给 `useEffect` 的函数会 **延迟调用**。这使得它适用于许多常见的副作用场景，比如设置订阅和事件处理等情况，因此 **不应在函数中执行阻塞浏览器更新屏幕** 的操作。

然而，并非所有 effect 都可以被延迟执行。例如，在浏览器执行下一次绘制前，用户可见的 DOM 变更就必须同步执行，这样用户才不会感觉到视觉上的不一致。（概念上类似于被动监听事件和主动监听事件的区别）React 为此提供了一个额外的 `useLayoutEffect` Hook 来处理这类 effect。它和 `useEffect` 的结构相同，区别只是 **调用时机** 不同。

虽然 `useEffect` 会在浏览器绘制后延迟执行，但会保证在任何新的渲染前执行。React 将在组件更新前刷新上一轮渲染的 effect。

### 条件执行

默认情况下，effect 会在每轮组件渲染完成后执行。这样的话，一旦 effect 的依赖发生变化，它就会被重新创建。

然而，在某些场景下这么做可能会矫枉过正。比如，在上一章节的订阅示例中，我们不需要在每次组件更新时都创建新的订阅，而是仅需要在 `prop.source` 改变时重新创建。

要实现这一点，可以给 `useEffect` 传递第二个参数，它是 effect 所依赖的值数组。更新后的示例如下：

```js
useEffect(() => {
  const subscription = props.source.subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [props.source]);
```

此时，只有当 `props.source` 改变后才会重新创建订阅。

> ⚠️ **注意：**
>
> 如果你要使用此优化方式，请确保数组中包含了所有外部作用域中会随时间变化并且在 `effect` 中使用的变量，否则你的代码会引用到先前渲染中的旧变量。参阅文档，了解更多关于 [如何处理函数](https://zh-hans.reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies) 以及 [数组频繁变化时的措施](https://zh-hans.reactjs.org/docs/hooks-faq.html#what-can-i-do-if-my-effect-dependencies-change-too-often) 内容。
>
> 如果想执行只运行一次的 effect（仅在组件挂载和卸载时执行），可以传递一个空数组（`[]`）作为第二个参数。这就相当于告诉 React 你的 effect 不依赖于 `props` 或 `state` 中的任何值，所以它永远都不需要重复执行。这并不属于特殊情况 —— 它依然遵循依赖数组的工作方式。
>
> 如果你传入了一个空数组（`[]`），effect 内部的 `props` 和 `state` 就会一直拥有其初始值。尽管传入 `[]` 作为第二个参数更接近大家更熟悉的 `componentDidMount` 和 `componentWillUnmount` 思维模式，但我们有更好的方式来避免过于频繁的重复调用 effect。除此之外，请记得 React 会等待浏览器完成画面渲染之后才会延迟调用 `useEffect`，因此会使得额外操作很方便。
>
> 我们推荐启用 `eslint-plugin-react-hooks` 中的 `exhaustive-deps` 规则。此规则会在添加错误依赖时发出警告并给出修复建议。

依赖项数组不会作为参数传给 effect 函数。虽然从概念上来说它表现为：所有 effect 函数中引用的值都应该出现在依赖项数组中。未来编译器会更加智能，届时自动创建数组将成为可能。

## 最佳实践

- 变化量创建在 `state` 中
- 通过某种方式（例如点击）控制变化量改变
- 因为在 `state` 中，因此变化量改变，DOM 渲染
- DOM 渲染完成，副作用逻辑执行

## 参考资料

- [📝 useEffect 完全指南](https://overreacted.io/zh-hans/a-complete-guide-to-useeffect/)
- [📝 精度《useEffect 完全指南》](https://juejin.im/post/5c9827745188250ff85afe50)
