---
nav:
  title: 基础
  order: 1
group:
  title: 核心架构
  order: 3
title: Fiber
order: 1
---

# Fiber

Fiber 架构思想

## 痛点

究其原因是浏览器是单线程，它将 GUI 描绘，时间器处理，事件处理，JavaScript 执行，远程资源加载统统放在一起。当做某件事，只有将它做完才能做下一件事。如果有足够的时间，浏览器是会对我们的代码进行编译优化（JIT）及进行热代码优化，一些 DOM 操作，内部也会对 Reflow 进行处理。 Reflow 是一个性能黑洞，很可能让页面的大多数元素进行重新布局。

浏览器的运作流程

> 渲染 -> tasks -> 渲染 -> tasks -> 渲染 -> tasks -> ...

## 原有架构

React 这个纯视图库可以分为三层架构。

- 虚拟 DOM 层：只负责描述结构与逻辑
- 内部组件层：负责组件的更新，ReactDOM.render、setState、forceUpdate 都是与它们打交道，能让你多次 setState，只执行一次真实的渲染，在适合的时机执行你的组件实例的生命周期钩子
- 底层渲染层：不同的显示介质有不同的渲染方法，比如说浏览器端，它使用元素节点、文本节点，在 Native 端，会调用 Object-C、Java 的 GUI，在 Canvas 中，有专门的 API 方法。

虚拟 DOM 由 JSX 转译过来，JSX 的入口函数是 React.createElement，可操作空间不大，第三大的底层 API 也非常稳定，因此我们只能改变第二层。

## 数据结构

React v16 将内部组件层改为 Fiber 这种数据结构，因此它的架构名也改叫 Fiber 架构。Fiber 节点拥有 return、child 和 sibling 三个属性，分别对应父节点。

核心思想是任务拆分和协同，主动把执行权交给主线程，使主线程有时间空档处理其他高优先级任务。

当遇到进程阻塞的问题时，**任务分割**、**异步调用**和**缓存策略**是三个显著的解决思路。

在 v16 之前，reconciliation 简单说就是一个自顶向下的递归算法，产出需要对当前 DOM 进行更新或替换的操作列表，一旦开始，会持续占用主线程，中断操作却不容易实现。当 JavaScript 长时间执行（如大量计算等），会阻塞样式计算、绘制等工作，出现页面脱帧现象。

## 核心流程

React 的核心流程可以分为两个部分：

- reconciliation（调和，调度算法，也可称为 render）：
  - 更新 state 与 props
  - 调用生命周期钩子
  - 生成 Virtual DOM
    - 这里应该称为 Fiber Tree 更为符合
  - 通过新旧 Virtual DOM 进行 diff 算法，获取 Virtual Change
  - 确定是否需要重新渲染
- commit：
  - 如需要，则操作 DOM 节点更新

**问题**：随着应用变得越来越庞大，整个更新渲染的过程开始变得吃力，大量的组件渲染会导致主进程长时间被占用，导致一些动画或高频操作出现卡顿和掉帧的情况。而关键点，便是**同步阻塞**。在之前的调度算法中，React 需要实例化每个类组件，生成一棵组件树，使用**同步递归**的方式进行遍历渲染，而这个过程最大的问题就是无法**暂停和恢复**。

**解决方法**：解决同步阻塞的方法，通常有两种：**异步**与**任务分割**。而 React Fiber 便是为了实现任务分割而诞生的。

**简述**：

- 在 React v16 将调度算法进行了重构，将之前的 stack reconciler 重构成新版的 Fiber Reconciler，变成了具有链表和指针的**单链表树遍历算法**。通过指针映射，每个单元都记录着遍历当下的上一步与下一步，从而使遍历变得可以被暂停和重启。
- 这里我理解为一种任务分割调度算法，主要是将原先同步更新渲染的任务分割成一个个独立的小任务单元，根据不同的优先级，将小任务分散到浏览器的空闲时间执行，充分利用主进程的事件循环机制。

Fiber 这里可以具象为一个数据结构：

```js
class Fiber {
  constructor(instance) {
    this.instance = instance;
    // 指向第一个 child 节点
    this.child = child;
    // 指向父节点
    this.return = parent;
    // 指向第一个兄弟节点
    this.sibling = previous;
  }
}
```

**链表树遍历算法**：通过节点保存与映射，便能够随时地进行停止和重启，这样便能达到实现任务分割的基本前提

1. 首先通过不断遍历子节点，到树末尾
2. 开始通过 sibling 遍历兄弟节点
3. return 返回父节点，继续执行 2
4. 直到 root 节点后，跳出遍历

任务分割，React 中的渲染更新可以分成两个阶段：

- reconciliation 阶段：vdom 的数据对比，是个适合拆分的阶段，比如对比一部分树后，先暂停执行个动画调用，待完成后再回来继续比对
- commit 阶段：将 change list 更新到 DOM 上，并不适合拆分，才能保持数据与 UI 的同步。否则可能由于阻塞 UI 更新，而导致数据更新和 UI 不一致的情况

分散执行：任务分割后，就可以把小任务单元分散到浏览器的空闲期间去排队执行，而实现的关键是两个新 API：requestIdleCallback 与 requestAnimationFrame

- 低优先级的任务交给 requestIdleCallback 处理，这是个浏览器提供的事件循环空闲期的回调函数，需要 pollyfill，而且拥有 deadline 参数，限制执行事件，以继续切分任务
- 高优先级的任务交给 requestAnimationFrame 处理

```js
// 类似于这样的方式
requestIdleCallback(deadline => {
  // 当有空闲时间时，我们执行一个组件渲染
  // 把任务塞到一个个碎片时间中去
  while ((deadline.timeRemaning() > 0 || deadline.didTimeout) && nextComponent) {
    nextComponent = performWork(nextComponent);
  }
});
```

优先级策略：文本框输入 > 本次调度结束需要完成的任务 > 动画过度 > 交互反馈 > 数据更新 > 不会显示但以防将来会显示的任务

React 17 全面开启 async rendering

因此 17 将会废弃多个生命周期钩子函数（will 系列）

原因是开启 async rendering，在 render 函数之前的所有函数，都有可能被执行多次

长期以来，原有的生命周期函数总是会诱惑开发者在 render 之前的生命周期函数做一些动作，现在这些动作还放在这些函数中的话，有可能会被调用多次，这肯定不是你想要的结果。

在 componentWillMount 执行网络请求，无论请求多快都无法赶上首次 render，而且 componentWillMount 在服务端渲染也会被调用，这样的 I/O 操作放在 componentDidMount 里更加合适。

在 Fiber 启用 async render 之后，更没有理由在 componentWillMount 里执行网络请求，因为 componentWillMount 可能会被调用多次，谁也不会希望无谓地多次调用多次网络请求吧。

## 总结

React Fiber 是对 React 来说是一次革命，解决了 React 项目严重依赖于手工优化的痛点，通过系统级别的时间调度，实现划时代的性能优化。鬼才般的 Fiber 结构，为异常边界提供了退路，也为限量更新提供了下一个起点。

React Fiber 最终提供的新功能主要是：

- 可切分，可中断任务
- 可重用各分阶段任务，且可以设置优先级
- 可以在父子组件任务间前进/后退切换任务
- render 方法可以返回多元素（即可以返回数组）
- 支持异常边界处理异常

---

**参考资料：**

- [React Fiber 初探](https://mp.weixin.qq.com/s/uDIknJ-WeUJnPR8S-HnTww)
- [React Fiber 架构](https://zhuanlan.zhihu.com/p/37095662)
- [深入 React Fiber 架构及源码](https://zhuanlan.zhihu.com/p/57346388?utm_source=wechat_session&utm_medium=social&utm_oi=58000878338048)
- [浅谈 React 16 框架架构 Fiber](https://mp.weixin.qq.com/s?__biz=MzU0OTExNzYwNg==&mid=2247484359&idx=1&sn=442d4a8c5027b58b3decfa3882b87a85&chksm=fbb5880eccc20118186380d943f0f58000e3e8946405f83e70bc43fe9f7323dee6725e1a47ab&token=1033099811&lang=zh_CN&rd2werd=1#wechat_redirect)
- [React Fiber 那些事：深入解析新的协调算法](https://juejin.im/post/5c052f95e51d4523d51c8300)
- [React 重要的一次重构：认识异步渲染架构 Fiber](https://juejin.im/post/5bed21546fb9a049e93c4bac)
- [React Fiber 在并发模式下的运行机制](https://zhuanlan.zhihu.com/p/54042084)
- [如何及为什么 React Fiber 使用链表遍历组件树](https://mp.weixin.qq.com/s/Zko4ih2F0-_861cDy1-1hw)
- React Fiber 源码分析
  - [第一篇](https://juejin.im/post/5c4edbede51d453aec64531c)
  - [第二篇：同步模式](https://juejin.im/post/5c501613f265da611e4e07a8)
  - [第三篇：异步状态](https://juejin.im/post/5c515e58e51d45593c376bb4)
  - [第四篇：归纳总结](https://juejin.im/post/5c529aba518825261f7386f6)
