---
nav:
  title: 架构
  order: 2
group:
  title: 内部组件层
  order: 2
title: Fiber
order: 1
---

# Fiber

Fiber 是一个基于优先级策略和帧间回调的循环任务调度算法的架构方案。


**问题**：随着应用变得越来越庞大，整个更新渲染的过程开始变得吃力，大量的组件渲染会导致主进程长时间被占用，导致一些动画或高频操作出现卡顿和掉帧的情况。而关键点，便是 **同步阻塞**。在之前的调度算法中，React 需要实例化每个类组件，生成一棵组件树，使用 **同步递归** 的方式进行遍历渲染，而这个过程最大的问题就是无法 **暂停和恢复**。

**解决方法**：当遇到进程同步阻塞的问题时，**任务分割**、**异步调用** 和 **缓存策略** 是三个显著的解决思路。而 React Fiber 便是为了实现任务分割而诞生的。

> 💡 Fiber 架构的核心思想就是 **任务拆分** 和 **协同**，主动把执行权交给主线程，使主线程有时间空档处理其他高优先级任务。

## 架构背景

究其原因是浏览器的渲染引擎是单线程，它将 GUI 描绘、时间器处理、事件处理、JavaScript 执行、远程资源加载统统放在一起。当做某件事，只有将它做完才能做下一件事。如果有足够的时间，浏览器是会对我们的代码进行编译优化（JIT）及进行热代码优化，一些 DOM 操作，内部也会对 Reflow（重绘）进行处理。 Reflow 是一个性能黑洞，很可能让页面的大多数元素进行重新布局。

### 浏览器中的帧

> 之前的问题主要的问题是任务一旦执行，就无法中断，JavaScript 引擎线程一直占用主线程，导致卡顿。

页面是一帧一帧绘制出来的，当美妙绘制的帧数（FPS）达到 60 时，页面是流畅的，小于这个值时，用户会感觉到卡顿。

1 秒 60 帧，所以每帧分到的时间是 `1000/60 ≈ 16 ms`。所以我们编写代码时力求不让一帧的工作量超过 16ms。

```jsx | inline
import React from 'react';
import img from '../../assets/life-of-a-frame.png';

export default () => <img alt="Life of a Frame" src={img} width={800} />;
```

浏览器一帧内的工作

通过上图可看到，一帧内需要完成如下六个步骤的任务：

- 处理用户的交互
- JavaScript 解析执行
- 帧开始，窗口尺寸变更、页面滚动等处理
- rAF（requestAnimationFrame）
- 布局

如果这六个步骤中，任意一个步骤所占用的时间过长，总时间超过 16ms 后，用户业务就能看到明显的卡顿。

而在上节提到的 **调和阶段** 花的时间过长，也就是 JavaScript 执行的时间过长，那么就有可能在用户有交互的时候，本来应该渲染下一帧，但是在当前一帧里还在执行 JavaScript，就导致用户交互不能马上得到反馈，从而产生卡顿感。

> Q：既然初衷是不希望 JavaScript 不受控制地长时间执行（想要手动调度），那么，为什么在 React 的使用中 JavaScript 长时间执行会影响交互响应、动画？
>
> A：因为在 React v16 之前，`reconciliation` 处理框架内部更新事务的算法简单说就是一个 **自顶向下的递归算法**，产出需要对当前 DOM 进行更新或替换的操作列表，一旦开始，会 **持续占用** 主线程，中断操作却不容易实现。当 JavaScript 长时间执行时（如大量计算等），就会出现如上文所说的阻塞样式计算、绘制等工作，出现页面脱帧现象。

### 解决方案

把渲染更新过程拆分成多个子任务，每次只做一小部分，做完看是否还有生育时间，如果有继续下个任务；如果没有，挂起当前任务，将时间控制权交给主线程，等主线程不忙的时候再继续执行。这种策略叫做 [Cooperative Scheduling（合作式调度）](https://www.w3.org/TR/requestidlecallback/)，操作系统常用任务调度策略之一。

> **补充知识**
>
> 操作系统常用任务调度策略：先来先服务（FCFS）调度算法、短作业（进程）有限调度算法（SJ/PF）、最高优先权优先调度算法（FPF）、高响应比优先调度算法（HRN）、时间片轮转法（RR）、多级队列反馈法。

合作式调度主要就是用来分配任务的，当有更新任务来的时候，不会马上去做 Diff 操作，而是先把当前的更新送入一个 **Update Queue** 中，然后交给 **Scheduler** 去处理，Scheduler 会根据当前主线程的使用情况去处理这次 Update。为了实现这种特性，使用 `requestIdleCallback` API。对于不支持这个 API 的浏览器，React 会加上 pollyfill。

在上面我们已经直到浏览器是一帧一帧执行的，在两个执行帧之间，主线程通常会有一小段空闲时间，`requestIdleCallback` 可以在这个 **空闲期（Idle Period）调用空闲期回调（Idle Callback）**，执行一些任务。

```jsx | inline
import React from 'react';
import img from '../../assets/idle-period-time.png';

export default () => <img alt="Idle Period" src={img} width={800} />;
```

- 低优先级任务由 `requestIdleCallback` 处理
- 高优先级任务，如动画相关的就由 `reuqestAnimationFrame` 处理
- `requestIdleCallback` 可以在多个空闲期调用空闲期回调，执行任务
- `requestIdleCallback` 方法提供 deadline，即任务执行限制时间，以切分任务，避免长时间执行，阻塞 UI 渲染而导致掉帧

这个方案看似确实不错，但是怎么实现可能会遇到几个问题：

- 如何拆分成子任务？
- 一个子任务多大合适？
- 怎么判断是否还有剩余时间？
- 有剩余时间怎么去调度应该执行哪个任务？
- 没有剩余时间之前的任务怎么办？

接下来整个 Fiber 架构就是来解决这些问题的。

## 原有架构

在开始介绍 Fiber 架构前，我们先对 React16 之前的架构有个大概的了解。

React 这个纯视图库可以分为三层架构：

- **虚拟 DOM 层**：负责描述结构与逻辑
- **内部组件层**：负责组件的更新，`ReactDOM.render`、`setState`、`forceUpdate` 都是与它们打交道，能让你多次 `setState`，只执行一次真实的渲染，在适当的时机执行组件实例内生命周期钩子
- **底层渲染层**：不同的显示介质有不同的渲染方法，比如说浏览器端，它使用元素节点、文本节点，在 Native 端，会调用 Object-C 和 Java 的 GUI，在 Canvas 中，又有专门的 API 方法

由于虚拟 DOM 由 JSX 转译过来，JSX 的入口函数是 `React.createElement`，可操作空间不大，第三大的底层 API 也非常稳定，因此对于 React 团队来说可优化空间较大的架构层只能是第二层。

## 核心流程

### 工作单元

为了解决之前提到解决方案遇到的问题，提出了以下几个目标：

- 暂停工作，稍后再回来。
- 为不同类型的工作分配优先权。
- 重用以前完成的工作。
- 如果不再需要，则中止工作。

为了做到这些，我们首先需要一种方法将任务分解为单元。从某种意义上说，这就是 Fiber，Fiber 代表一种 **工作单元**。

但是仅仅是分解为单元也无法做到中断任务，因为函数调用栈就是这样，每个函数为一个工作任务（work），每个工作任务（work）被称为 **堆栈帧**，它会一直工作，直到堆栈为空，无法中断。

所以我们需要一种 **增量渲染** 的调度，那么就需要重新实现一个堆栈帧的调度，这个堆栈帧可以按照自己的调度算法执行他们。另外由于这些堆栈是可以自己控制的，所以可以加入 **并发** 或者 **错误边界** 等功能。

因此 Fiber 就是重新实现的堆栈帧，而非使用 JavaScript 引擎的栈，本质上 Fiber 也可以理解为是一个 **虚拟的堆栈帧**，将可中断的任务拆分成多个子任务，通过按照优先级来自由调度子任务，分段更新，从而将之前的 **同步渲染** 改为 **异步渲染**。

所以我们可以说 Fiber 是一种数据结构（堆栈帧），也可以说是一种解决可中断的调用任务的一种解决方案，它的特性就是 **时间分片（time slicing）** 和 **暂停（supense）**。

如果了解 **协程** 的可能会觉得 Fiber 的这种解决方案，跟协程有点像（区别还是很大的），是可以中断的，可以控制执行顺序。在 JavaScript 里的 `generator` 其实就是一种协程的使用方式，不过颗粒度更小，可以控制函数里面的代码调用的顺序，也可以中断。

### 工作流程

> Fiber 是如何工作的？

1. `ReactDOM.render()` 和 `setState` 的时候开始创建更新
2. 将创建的更新加入任务队列，等待调度
3. 在 `requestIdleCallback` 空闲时执行任务
4. 从根节点开始遍历 Fiber Node，并且构建 WorkInProgress Tree
5. 生成 EffectList
6. 根据 EffectList 更新 DOM

下面是一个详细的执行过程图：

```jsx | inline
import React from 'react';
import img from '../../assets/fiber-workflow.png';

export default () => <img alt="React Fiber Workflow" src={img} width={800} />;
```

1. 第一部分从 `ReactDOM.render` 方法开始，把接收的 React Element 转换为 Fiber 节点，并为其设置优先级，创建 Update，加入到更新队列，这部分主要是做一些初始数据的准备。
2. 第二部分主要是三个函数：`scheduleWork`、`requestWork`、`performWork`，即安排工作、申请工作、正式工作三部曲，React16 新增的异步调用的功能则在这部分实现，这部分就是 **Schedule 阶段**，前面介绍的 Cooperative Scheduling 就是在这个阶段，只有在这个解决获取到可执行的时间片，第三部分才会继续执行。
3. 第三部分是个大循环，遍历所有的 Fiber 节点，通过 Diff 算法计算所有更新工作，产出 EffectList 给到 Commit 阶段使用，这部分的核心就是 `beginWork` 函数，这部分基本就是 **FIber Reconciler**，包括 **reconciliation** 和 **commit** 阶段。

### Fiber Tree

React 运行时存在三种实例（结合上文提到的 React 三层架构理解）：

```
Element - 描述 UI 结构内容（type、props）
--------
Instances - React 维护的 VirtualDOM Tree Node
--------
DOM - 真实 DOM 节点
```

React 在首次渲染（执行 `ReactDOM.render`）时，会通过 `React.createElement` 创建一颗 Element 树，可以称之为 **Virtual DOM Tree**，由于要记录上下文信息，加入了 Fiber，每一个 Element 会对应一个 Fiber Node，将 Fiber Node 链接起来的结构成为 Fiber Tree。它反映了用于渲染 UI 的应用程序的状态。这棵树通常被称为 **current 树（当前树，记录当前页面的结构状态）**。

在后续的更新过程中（`setState`），每次重新渲染都会重新创建 Element, 但是 Fiber 不会，Fiber 只会使用对应的 Element 中的数据来更新自己必要的属性。这个过程在 Fiber 出现之前的 `reconciler`（称为 Stack Reconciler）是采取自顶向下递归比较来实现的，所以 <span style="color: red;font-weight: bold;">无法中断这个递归比较的过程</span>（持续占用主线程），这样主线程上的布局、动画等周期性任务以及交互响应就无法立即得到处理，影响用户体验。

> ⚠️ **注意：**Fiber 之前的 `reconciler` 被称为 Stack Reconciler，就是因为这些调度上下文信息是由系统栈来保存的。虽然之前一次性做完，强调栈没什么意义，起个名字只是为了便于区分 Fiber Reconciler。

Fiber 解决这个问题的 **思路** 是把渲染/更新过程（递归 `diff`）拆分为一系列小任务，每次检查树上的一小部分，完成后检查是否还有时间继续下个任务，有的话继续，没有的话自己挂起，主线程不忙的时候再继续。

增量更新需要更多的上下文信息，之前的 VirtualDOM Tree 显然难以满足，所以扩展出了 Fiber Tree，更新过程就是根据输入数据以及现有的 Fiber Tree 构造出新的临时的 Fiber Tree（WorkInProgress tree）。

因此，Instances 层新增了这些实例：

```
React Elements
    描述 UI 长什么样子（type、props）
--------
Fiber
    Fiber Tree 与 VirtualDOM Tree 类似，用于描述增量更新所需的上下文信息
--------
WorkInProgress
    workInProgress Tree 是 Reconcile 过程中从 Fiber Tree 简历的当前进度快照，用于断电恢复
--------
Effect
    每个 workInProgress Tree 节点上都有一个 Effect List
    用于存放 diff 结果
    当前节点更新完毕后会向上 merge Effect List（Queue 收集 diff 结果）
--------
DOM
    真实 DOM 节点
```

> ⚠️ **注意：**放在虚线上的两层（WorkInProgress 和 Effect）都是临时的结构，仅在更新时有用，日常不持续维护。`Effect` 指的就是 `side effect`，包括将要做的 `DOM Change`。

Fiber Tree 上各节点的主要结构（每个节点称为 FiberNode）如下：

```js
type Fiber {
  // 标识 React 元素的类型，常见的有 FunctionComponent、ClassCOmponent、Fragment、ContextConsumer
  tag: WorkTag,
  // ReactElement.type，也就是调用 createElement 的第一个参数
  elementType: any,
  // 异步组件 resolve 之后返回的内容，一般是 function 或 class
  type: any,

  /* 当前 Fibeer 的状态 */

  // 不同类型的实例都会记录在 stateNode 上
  // 比如 DOM 组件对应 DOM 节点实例
  // ClassComponent 对应 Class 实例
  // FunctionComponent 没有实例，所以 StateNode 值为 null
  // state 更新了或 props 更新了均会更新到 stateNode 上
  stateNode: any,

  // 指向它在 Fiber 节点树中的 `parent`，用于处理完这个节点之后向上返回
  // 表示当前节点处理完毕后，应该向谁提交自己的成果（effect list）
  return: Fiber | null,
  // 指向自己的第一个子节点
  child: Fiber | null,
  // 指向自己的第一个兄弟节点，兄弟节点的 return 指向同一个父节点
  sibling: Fiber | null,

  // ref 属性
  ref: null | (((handle: mixed) => void) & {_stringRef: ?string}) | RefObject,

  // 更新相关
  // 新的变动带来的新的 Props，即 nextProps
  pendingProps: any,
  // 上次渲染完成之后的 Props，即 props
  memoizedProps: any,
  // 该 Fiber 对应的组件产生的 Update 会存放在这个队列里
  updateQueue: mixed,
  // 上次渲染的时候的 State，即 state
  // 新的 state 由 updateQueue 计算得出，并覆盖 memoizedState
  memoizedState: any,
  // 一个列表，存在该 Fiber 依赖的 contexts、events
  dependencies: Dependencies | null,

  // mode 有 conCurrentMode 和 strictMode
  // 用于描述当前 Fiber 和其他子树的 Bitfield
  // 共存的模式表示这个子树是否默认是异步渲染的
  // Fiber 刚被创建时，会继承父 Fiber
  // 其他标识也可以在创建的时候被设置，但是创建之后不该被修改，特别是它的子 Fiber 创建之前
  mode: TypeOfMode,

  /* 以下是副作用，副作用是标记组件哪些需要更新的工具、标记组件需要执行哪些生命周期的工具 */

  // Effect 类型
  effectTag: SideEffectTag,
  // Effect 指针，指向下个 Effect
  nextEffect: Fiber | null,
  // Effect List 单向链表中的第一个 Effect
  firstEffect: Fiber | null,
  // Effect List 单向链表中的最后一个 Effect
  lastEffect: Fiber | null,

  // 达标任务在未来哪个时间点，应该被完成
  // 不包括该 Fiber 的子树产生的任务
  expirationTime: ExpirationTime,
  //快速确定子树中是否有 update
  //如果子节点有update的话，就记录应该更新的时间
  childExpirationTime: ExpirationTime,

  // 在 Fiber 树更新的过程中，每个 Fiber 都会有一个跟其对应的 Fiber
  // 我们称它为 `current <==> workInProgress`
  // 在渲染完成之后它们会交换位置
  alternate: Fiber | null;
}
```

每一个 Fiber Node 节点与 Virtual Dom 一一对应，所有 Fiber Node 连接起来形成 Fiber Tree, 是个**单链表树结构**，如下图所示：

```jsx | inline
import React from 'react';
import img from '../../assets/fiber-tree-sample.jpeg';

export default () => <img alt="Fiber Tree Sample" src={img} width={640} /> ;
```

Fiber Tree 通过节点保存与映射，便能够随时地进行停止和重启，这样便能达到实现 **任务分割** 的基本前提。

在 React v16 将调度算法进行了重构，将之前的 Stack Reconciler 重构成新版的 Fiber Reconciler，变成了具有链表和指针的 **单链表树遍历算法**。通过指针映射，每个单元都记录着遍历当下的上一步与下一步，从而使遍历变得可以被暂停和重启。

当 `render` 的时候有了这么一条单链表，当调用 `setState` 的时候又是如何 Diff 得到 change list 的呢？

### WorInProgress Tree

通过 `setState` 触发 React 内部的更新任务后，采用的是 **双缓冲技术（double buffering）** 从 Fiber Tree 中获取 DOM Change List，就像 Redux 里的 `nextListeners` 一样，在 Fiber 架构中则是以 Fiber Tree 为主，WorkInProgress Tree（反映的是刷新到屏幕的未来状态） 为辅。

双缓冲具体指的是 WorkInProgress Tree 构造完毕，得到的就是新的 Fiber Tree，然后把 `current` 树的指针指向 WorkInProgress Tree，然后丢掉旧的 Fiber Tree 即可。

这样做的好处：

- 能够复用内部对象（Fiber Node）
- 节省内存分配、GC（垃圾回收）的时间开销
- 就算运行中有错误，也不会影响 View 上的错误（错误边界）

每个 FiberNode 上都有个 `alternate` 属性，也指向一个 Fiber Node，创建 WorkInProgress Tree 节点时优先取 `alternate`，没有的话就创建一个：

```js
export function createWorkInProgress(
  current: Fiber,
  pendingProps: any,
  expirationTime: ExpirationTime,
): Fiber {
  let workInProgress = current.alternate;
  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key, current.mode,);
    ...
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.effectTag = NoEffect;
    workInProgress.nextEffect = null;
    workInProgress.firstEffect = null;
    workInProgress.lastEffect = null;
    ...
  }
  ...
  return workInProgress;
}

```

以上代码为简化之后的，可以发现，`current` 与 `workInProgress` 互相持有引用。

创建 WorkInProgress Tree 的过程也是一个 Diff 过程，Diff 完成之后会生成一个 Effect List，这个 Effect List 就是最终 Commit 阶段用于处理副作用的阶段。

```jsx | inline
import React from 'react';
import img from '../../assets/fiber-work-in-progress.png';

export default () => <img alt="Fiber WorkInProgress Tree" src={img} width={540} /> ;
```

### Effect List

Effect List 可以理解为是一个存储 `effectTag` 副作用列表容器。它是由 Fiber 节点和指针 `nextEffect` 构成的单链表结构，这其中还包括第一个节点 `firstEffect`，和最后一个节点 `lastEffect`。如下图所示：

```jsx | inline
import React from 'react';
import img from '../../assets/fiber-effect-list.png';

export default () => <img alt="Fiber Effect List" src={img} width={640} /> ;
```

React 采用深度优先搜索算法，在 `render` 阶段遍历 Fiber 树时，把每一个有副作用的 Fiber 筛选出来，最后构建生成一个只带副作用的 Effect List 链表。

在 Commit 阶段，React 拿到 Effect List 数据后，通过遍历 Effect List，并根据每一个 Effect 节点的 `effectTag` 类型，从而对相应的 DOM 树执行更改。

更多 Fffect List 构建演示流程，可以点击查看动画 [Effect List —— 又一个 Fiber 链表的构建过程](https://www.bilibili.com/video/av48384879/)。

### Fiber Reconciler

在第二部分，进行 Schedule 完，获取到时间片之后，就开始进行 `reconcile`。

Fiber Reconciler 是 React 里的调和器，这也是任务调度完成之后，如何去执行每个任务，如何去更新每个节点的过程，对应上面的第三个部分。

Fiber Reconciler 的核心流程可以分为两个阶段（phrase）：

- **Reconciliation**（调和，调度算法也可称为 `render`）
  - 更新 `state` 与 `props`
  - 调用生命周期钩子
  - 生成 Virtual DOM
    - 这里应该称为 Fiber Tree 更为恰当
  - 通过新旧 Virtual DOM 进行 diff 算法，获取 Virtual Change
  - 确定是否需要重新渲染
  - 整个过程就是通过构造 WorkInProgress Tree 得出 DOM Change
- **Commit**
  - 如需要，则操作 DOM 节点更新

### Reconciler - reconciliation 阶段

以 Fiber Tree 为蓝本，把每个 FiberNode 作为一个工作单元，**自顶向下逐节点构造** WorkInProgress Tree（构建中的新 Fiber Tree）。

具体过程如下（以组件节点为例）：

1. 如果当前节点不需要更新，直接把子节点 `clone` 过来，跳到 5；要更新的话打个 `tag`
2. 更新当前（要更新）节点的各种状态（`props`、`state`、`context`等）
3. 调用 `shouldComponentUpdate`，判断为 `false` 的话，跳到 5
4. 调用 `render` 获得新的子节点，并为子节点创建 Fiber Node（创建过程会尽量复用现有 Fiber Node，子节点增删也发生在这里）
5. 如果没有产生 `child fiber`，该工作单元结束，把 `effect list` 归并到 `return`，并把当前节点的 `sibling` 作为下一个工作单元；否则把 `child` 作为下一个工作单元
6. 如果没有剩余可用时间了，等到下一次主线程空闲时才开始下一个工作单元；否则，立即开始做
7. 如果没有下一个工作单元了（回到了 WorkInProgress Tree 的根节点），第 1 阶段结束，进入 `pendingCommit` 状态

在 Reconciliation 阶段的每个工作循环（也就是上述步骤中的 1-6）中，每次处理一个 Fiber，处理完可以中断/挂起整个工作循环。通过每个节点更新结束时向上归并 **Effect List** 来收集任务结果，Reconciliation 结束后，WorkInProgress Tree 根节点的 Effect List 里记录了包括 DOM Change 在内的所有 **Side Effect**。

这个阶段会执行以下的生命周期钩子：

- `[UNSAFE_]componentWillMount`（弃用）
- `[UNSAFE_]componentWillReceiveProps`（弃用）
- `getDerivedStateFromProps`
- `shouldComponentUpdate`
- `[UNSAFE_]componentWillUpdate`（弃用）
- `render`

> ⚠️ **注意：**由于第 1 阶段的生命周期函数可能会被多次调用，默认以 `low` 优先级（后面介绍的六种优先级之一）执行，被高优先级任务打断的话，稍后重新执行。

构建 WorkInProgress Tree 的过程就是 diff 的过程，也就是 VirtualDOM 的数据对比，是个适合拆分的阶段，对比一部分 VirtualDOM Tree 后，通过 `requestIdleCallback` 来调度执行每组任务，每完成一个任务后回来看看有没有更高优先级的任务需要执行，有的话则立即执行，每完成一组任务，把时间控制权交还给主线程，直到下次 `requestIdleCallback` 回调再继续构建 WorkInProgress Tree。

**分散执行**：任务分割后，就可以把小任务单元分散到浏览器的空闲期间去 **排队执行**，而实现的关键是两个新 API：`requestIdleCallback` 与 `requestAnimationFrame`。

- 低优先级的任务交给 `requestIdleCallback` 处理，这是个浏览器提供的事件循环空闲期的回调函数，需要 `pollyfill`，而且拥有 `deadline` 参数，限制执行事件，以继续切分任务
- 高优先级的任务交给 `requestAnimationFrame` 处理

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

> 由于 `reconciliation` 阶段是可中断的，一旦中断之后恢复的时候又会重新执行，所以很可能 `reconciliation` 阶段的生命周期方法会被多次调用，所以在 `reconciliation` 阶段的生命周期的方法是不稳定的，我想这也是 React 为什么要废弃 `componentWillMount` 和 `componentWillReceiveProps` 方法而改为静态方法 `getDerivedStateFromProps` 的原因吧。

### requestIdleCallback

`requestIdleCallback` 的具体用法如下：

```js
window.requestIdleCallback(callback[, options])
// 示例
let handle = window.requestIdleCallback((deadline) => {
    // didTimeout 是否超时
    // timeRemaining 剩余可用时间
    const {didTimeout, timeRemaining} = deadline;

    console.log(`是否已超时：${didTimeout}`);
    console.log(`剩余可用可用时间：${timeRemaining.call(deadline)}ms`);

    // do some stuff
    const now = +new Date,
          timespent = 10;
    while (+new Date < now + timespent);
    console.log(`花了${timespent}ms搞事情`);
    console.log(`可用时间剩余${timeRemaining.call(deadline)}ms`);
  },{
    timeout: 1000
  }
);
// Output：
// 是否已超时：false
// 剩余可用可用时间：49.535000000000004ms
// 花了10ms搞事情
// 可用时间剩余38.64ms
```

⚠️ **注意：**`requestIdleCallback` 调度只是希望做到流畅体验，并不能绝对保证什么，例如：

```js
// do some stuff
const now = +new Date,
      timespent = 300;

while (+new Date < now + timespent);
```

如果搞事情（对应 React 中的生命周期函数等时间上不受 React 控制的东西）就花了 300ms，什么机制也保证不了流畅。

> ⚠️ **注意：**一般剩余可用时间也就 10-50ms，可调度空间不算很宽裕。
>
> 早期的 React 版本在实现上使用的是 `requestIdleCallback` API，但使用 `requestIdleCallback` 实际上有一些限制，执行频次不足，以致于无法实现流畅的 UI 渲染，扩展性差。因此 React 团队放弃了 `requestIdleCallback` 用法，实现了自定义的版本。比如，在发布 v16.10 版本中，推出实验性的 Scheduler，尝试使用 `postMessage` 来代替 `requestAnimationFrame`。更多了解可以查看 React 源码 packages/scheduler 部分。

### Reconciler - commit 阶段

Commit 阶段可以理解为就是将 Diff 的结果反映到真实 DOM 的过程。

在 Commit 阶段，首先会在 `commitRoot` 里会根据 `effect` 的 `effectTag`，具体 `effectTag` 见 [源码](https://github.com/facebook/react/blob/504576306461a5ff339dc99691842f0f35a8bf4c/packages/shared/ReactSideEffectTags.js)，进行对应的插入、更新、删除操作，根据 `tag` 不同，调用不同的更新方法。

Commit 阶段会执行如下生命周期方法：

- `getSnapshotBeforeUpdate`
- `componentDidMount`
- `componentDidUpdate`
- `componentWillUnmount`

注意，Commit 阶段真的是一气呵成（同步执行，无法暂停），这个阶段的实际工作量是比较大的，所以尽量不要在后三个生命周期函数里处理复杂的逻辑计算。

> 处理 Effect List 三部曲：更新 DOM 树、调用组件生命周期函数以及更新 `ref` 等内部状态
>
> 注意区别 `reconciler`、`reconcile` 和 `reconciliation`：
> - `reconciler`：调和器（名词），可以说是 React 工作的一个模块，协调模块
> - `reconcile`：调和器调和的动作（动词）
> - `reconciliation`：只是 `reconcile` 过程的第一阶段

### 优先级策略

每个工作单元运行时有六种优先级：

- `no work`：没有工作任务在 Pending
- `synchronous`（1）：与之前的 Stack Reconciler 操作一样，同步执行
- `task`（2）：在 `nextTick` 之前执行
- `animation`（3）：在下一帧之前执行
- `high`（4）：需要很快完成的互动才能感觉到响应
- `low`（5）：稍微延迟（100-200ms）执行也没有关系，数据获取或更新存储的结果
- `offscreen`（6）：不会被看到，但要做好工作以防它变得可见

`synchronous` 首屏（首次渲染）用，要求尽量快，不管会不会阻塞 UI 线程；`animation` 通过 `requestAnimationFrame` 来调度，这样在下一帧就能立即开始动画过程；后三个都是由 `requestIdleCallback` 回调执行的；`offscreen` 指的是当前隐藏的、屏幕外的（看不见的）元素。

高优先级的比如键盘输入（希望立即得到反馈），低优先级的比如网络请求，让评论显示出来等等。另外，紧急的事允许插队。

这样的优先级机制存在两个问题：

- 生命周期函数怎么执行（可能被频频中断）：触发顺序、次数没有保证了
- `starvation`（低优先级饿死）：如果高优先级任务很多，那么低优先级任务根本没有机会执行（就饿死了）

**简明的优先级策略**：`文本框输入 > 本次调度结束需要完成的任务 > 动画过渡 > 交互反馈 > 数据更新 > 不会显示但以防将来会显示的任务`

> ⚠️ **注意：**React 17 全面开启 `async rendering`。因此 17 将会废弃多个生命周期钩子函数（`will` 系列），原因是开启 `async rendering`，在 `render` 函数之前的所有函数，都有可能被执行多次。
>
> 长期以来，原有的生命周期函数总是会诱惑开发者在 `render` 之前的生命周期函数做一些动作，现在这些动作还放在这些函数中的话，有可能会被调用多次，这肯定不是你想要的结果。在 `componentWillMount` 执行网络请求，无论请求多快都无法赶上首次 `render`，而且 `componentWillMount` 在服务端渲染也会被调用，这样的 I/O 操作放在 `componentDidMount` 里更加合适。
>
> 在 Fiber 启用 `async rendering` 之后，更没有理由在 `componentWillMount` 里执行网络请求，因为 `componentWillMount` 可能会被调用多次，谁也不会希望无谓地多次调用多次网络请求吧。

## 源码简析

从 15 到 16，源码结构发生了很大变化：

- 再也看不到 `mountComponent/updateComponent()` 了，被拆分重组成了（`beginWork`、`completeWork`、`commitWork`）
- `ReactDOMComponent` 也被去掉了，在 Fiber 体系下 DOM 节点抽象用 `ReactDOMFiberComponent` 表示，组件用 `ReactFiberClassComponent` 表示，之前是 `ReactCompositeComponent`

Fiber 体系的核心机制是负责任务调度的 `ReactFiberScheduler`，相当于之前的 `ReactReconciler`。

VirtualDOM Tree 变成 Fiber T ree了，以前是自上而下的简单树结构，现在是基于单链表的树结构，维护的节点关系更多一些。

```jsx | inline
import React from 'react';
import img from '../../assets/fiber-tree.png';

export default () => <img alt="Fiber Tree" src={img} width={540} /> ;
```

## 总结

React Fiber 是对 React 来说是一次革命，解决了 React 项目 **严重依赖于手工优化** 的痛点，通过系统级别的时间调度，实现划时代的性能优化。鬼才般的 Fiber 结构，为异常边界提供了退路，也为限量更新提供了下一个起点。

React Fiber 最终提供的关键特性主要是：

- 增量渲染（把渲染任务拆分成块，均匀分布到多帧）
- 更新时能够暂停、终止、复用渲染任务
- 给不同类型的更新赋予优先级
- 并发方面新的基础能力

增量渲染用来解决掉帧的问题，渲染任务拆分之后，每次只做一小段，做完一段就把时间控制权交还给主线程，而不像之前长时间占用。这种策略叫做 `cooperative scheduling`（合作式调度），操作系统的 3 种任务调度策略之一（Firefox 还对真实 DOM 应用了这项技术）。

另外，React 自身的 `killer feature` 是  Virtual DOM，两个原因：

- Coding UI 变简单了（不用关心浏览器应该怎么做，而是把下一刻的 UI 描述给 React 听）
- 既然 DOM 能 Virtued，别的（硬件、VR、Native APP）也能

---

**参考资料：**

- **优先推荐**
  - [📝 Deep In React 之浅谈 React Fiber 架构](https://segmentfault.com/a/1190000019592928)
  - [📝 浅谈 React 16 框架架构 Fiber（2018-08-29 推荐）](https://mp.weixin.qq.com/s?__biz=MzU0OTExNzYwNg==&mid=2247484359&idx=1&sn=442d4a8c5027b58b3decfa3882b87a85&chksm=fbb5880eccc20118186380d943f0f58000e3e8946405f83e70bc43fe9f7323dee6725e1a47ab&token=1033099811&lang=zh_CN&rd2werd=1#wechat_redirect)
  - [📝 React Fiber 那些事：深入解析新的协调算法（2018-12-03 推荐）](https://juejin.im/post/5c052f95e51d4523d51c8300)
  - [📝 React Fiber 源码解析（2020-08-11 推荐）](https://juejin.im/post/6859528127010471949)
  - [📝 这可能是最通俗的 React Fiber 打开方式（2019-10-22 推荐）](https://juejin.im/post/6844903975112671239)
- **优质好文**
  - [📝 React Fiber 初探（2017-12-02）](https://juejin.im/post/6844903518357159949)
  - [📝 完全理解 React Fiber（2018-01-06）](http://www.ayqy.net/blog/dive-into-react-fiber/)
  - [📝 React Fiber 初探（2018-06-19）](https://mp.weixin.qq.com/s/uDIknJ-WeUJnPR8S-HnTww)
  - [📝 React Fiber 架构（2018-05-21）](https://zhuanlan.zhihu.com/p/37095662)
  - [📝 React16 源码之 React Fiber 架构](https://juejin.im/post/6844903655401848846)
  - [📝 React 重要的一次重构：认识异步渲染架构 Fiber（2018-11-15）](https://juejin.im/post/5bed21546fb9a049e93c4bac)
  - [📝 React Fiber 在并发模式下的运行机制（2019-01-05）](https://zhuanlan.zhihu.com/p/54042084)
  - [📝 如何及为什么 React Fiber 使用链表遍历组件树（2019-01-07）](https://mp.weixin.qq.com/s/Zko4ih2F0-_861cDy1-1hw)
  - [📝 深入 React Fiber 架构及源码（2019-03-09）](https://zhuanlan.zhihu.com/p/57346388)
  - [📝 React Fiber 的优先级调度机制与事件系统](https://zhuanlan.zhihu.com/p/95443185)
- **React Fiber 源码分析系列**
  - [第一篇](https://juejin.im/post/5c4edbede51d453aec64531c)
  - [第二篇：同步模式](https://juejin.im/post/5c501613f265da611e4e07a8)
  - [第三篇：异步状态](https://juejin.im/post/5c515e58e51d45593c376bb4)
  - [第四篇：归纳总结](https://juejin.im/post/5c529aba518825261f7386f6)