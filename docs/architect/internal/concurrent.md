---
nav:
  title: 架构
  order: 2
group:
  title: 内部组件层
  order: 2
title: Concurrent
order: 11
---

# Concurrent

截至目前 React 的 Concurrent（同时）调度模式依然处在实验阶段（期待中），还未正式发布，但官网已有相关简单介绍的文档，相信不久之后就会发布（参考 Hooks）。

> 16.13.1

## 同步调度模式

React 目前只有一种调度模式：**同步模式**。只有等 Concurrent 调度模式正式发布，才能使用第两种模式。

没有案例的讲解是没有灵魂的。我们先来看一个此处和后续讲优先级都将用到的案例：

假设有一个按钮和有 8000 个包含同样数字的文本标签，点击按钮后数字会加 2。（使用 8000 个文本标签是为了加长 React 单次更新任务的计算时间，以便直观观察 React 如何执行多任务）

## 时间切片

最早是从 Lin Clark 分享的经典 Fiber 演讲中了解到的时间切片。时间切片指的是一种将多个粒度小的任务放入一个个时间切片中执行的一种方法。

**时间切片的作用**

在刚执行完一个时间切片准备执行下一个时间切片前，React 能够：

- 判断是否有用户界面交互事件和其他需要执行的代码，比如点击事件，有的话则执行该事件
- 判断是否有优先级更高的任务需要执行，如果有，则中断当前任务，执行更高的优先级任务。也就是利用时间前片来实现高优先级任务插队。

即时间切片有两个作用：

1. 在执行任务过程中，不阻塞用户与页面交互，立即响应交互事件和需要执行的代码
2. 实现高优先级插队

## 源码实现时间切片

首先在这里引入当前 React 版本中的一段注释说明：

> // Scheduler periodically yields in case there is other work on the main
> // thread, like user events. By default, it yields multiple times per frame.
> // It does not attempt to align with frame boundaries, since most tasks don't
> // need to be frame aligned; for those that do, use requestAnimationFrame.
> let yieldInterval = 5;

注释对象是声明 `yieldInterval` 变量的表达式，值为 5，即 5 毫秒。其实这就是 React 目前的单位时间切片长度。

注释中说一个帧中会有多个时间切片（显而易见，一帧~=16.67ms，包含 3 个时间切片还多），切片时间不会与帧对齐，如果要与帧对齐，则使用 `requestAnimationFrame`。

从 2019 年 2 月 27 号开始，React 调度模块移除了之前的 requestIdleCallback 腻子脚本相关代码。

<!-- ![]() -->

所以在一些之前的调度相关文章中，会提到 React 如何使用 `requestAnimationFrame` 实现 `requestIdleCallback` **腻子脚本**，以及计算帧的边界时间等。因为当时的调度源码的确使用了这些来实现时间切片。不过现在的调度模块代码已精简许多，并且用新的方式实现了时间切片。

了解时间切片实现方法前需掌握的知识点：

- `Message Channel`：浏览器提供的一种数据通信接口，可用来实现订阅发布。其特点是其两个端口属性支持双向通信和异步发布事件（`port.postMessage(...)`）。

```js
const channel = new MessageChannel();
const port1 = channel.port1;
const port2 = channel.port2;

port1.onmessage = e => {
  console.log(e.data);
};
port2.postMessage('from port2');
console.log('after port2 postMessage');

port2.onmessage = e => {
  console.log(e.data);
};
port1.postMessage('from port1');
console.log('after port1 postMessage');

// 控制台输出:
// after port2 postMessage
// after port1 postMessage
// from port2
// from port1
```

- `Fiber`: Fiber 是一个的节点对象，React 使用链表的形式将所有 Fiber 节点连接，形成链表树，即虚拟 DOM 树。

当有更新出现，React 会生成一个工作中的 Fiber 树，并对工作中 Fiber 树上每一个 Fiber 节点进行计算和 diff，完成计算工作（React 称之为渲染步骤）之后，再更新 DOM（提交步骤）。

下面让我们来看 React 究竟如何实现时间切片。

首先 React 会默认有许多微小任务，即所有的工作中 Fiber 节点。

在执行调度工作循环和计算工作循环时，执行每一个工作中 Fiber。但是，有一个条件是每隔 5 毫秒，会跳出工作循环，运行一次**异步的 `MessageChannel` 的 `port.postMessage(...)` 方法，检查是否存在事件响应、更高优先级任务或其他代码需要执行**，如果有则执行，如果没有则重新创建工作循环，执行剩下的工作中 Fiber。

但是，为什么性能图上显示的切片不是精确的 5 毫秒？

因为一个时间切片中有多个工作中 Fiber 执行，每执行完一个工作中 Fiber，都会检查开始计时时间至当前时间的间隔是否已超过或等于 5 毫秒，如果是则跳出工作循环，但算上检查的最后一个工作中 Fiber 本身执行也有一段时间，所以最终一个时间切片时间一定大于或等于 5 毫秒。

时间切片和其他模块的实现原理对应源码位于本文倒数第二章节 **源码实探**。

将描述和实际源码分开，是为了方便阅读。先用大白话把原理实现流程讲出来，不放难懂的源码，最后再贴出对应源码。

## 如何调度一个人物

讲完时间切片，就可以了解 React 如何真正的调度一个任务了。

<!-- ![]() -->

requestIdleCallback(callback, { timeout: number })是浏览器提供的一种可以让回调函数执行在每帧（上图 2 个 vsync 之间即为 1 帧）末尾的空闲阶段的方法，配置 timeout 后，若多帧持续没有空闲时间,超过 timeout 时长后，该回调函数将立即被执行。

现在的 React 调度模块虽没有使用 requestIdleCallback,但充分吸收了 requestIdleCallback 的理念。其 unstable_scheduleCallback(priorityLevel, callback, { timeout: number })就是类似的实现，不过是针对不同优先级封装的一种调度任务的方法。

在讲调度流程前先简单介绍调度中用到的相关参数：

当前 Fiber 树的 root：拥有属性“回调函数”

React 中的调度模块的任务：拥有属性 “优先级，回调函数，过期时间”

过期时间标记：源码中 expirationTime 有两种类型，一种是标记类型：一个极大值，大小与时长成反比，可以用来作优先级标记，值越大，优先级越高，比如：1073741551；另一种是从网页加载开始计时的具体过期时间：比如 8000 毫秒）。具体内容详见后面的 expirationTime 章节

DOM 调度配置：因为 react 同时支持 web 端 dom 和移动端 native 两种，核心算法一致，但有些内容是两端独有的，所以有的模块有专门的 DOM 配置和 Native 配置。我们这里将用到调度模块的 DOM 配置

requestHostCallback：DOM 调度配置中使用 Message Channel 异步执行回调函数的方法

接下来看 React 如何调度一个任务。

### 初始化

1 . 当出现新的更新，React 会运行一个确保 root 被安排任务的函数。

2 . 当 root 的回调函数为空值且新的更新对应的过期时间标记是异步类型，根据当前时间和过期时间标记推断出优先级和计算出 timeout，然后根据优先级、timeout， 结合执行工作的回调函数，新建一个任务（这里就是 scheduleCallback），将该任务放入任务队列中，调用 DOM 调度配置文件中的 requestHostCallback,回调函数为调度中心的清空任务方法。

### 运行任务

1 . requestHostCallback 调用 MessageChannel 中的异步函数：port.postMessage(...)，从而异步执行之前另一个端口 port1 订阅的方法，在该方法中，执行 requestHostCallback 的回调函数，即调度中心的清空任务方法。

2 . 清空任务方法中，会执行调度中心的工作循环，循环执行任务队列中的任务。

有趣的是，工作循环并不是执行完一次任务中的回调函数就继续执行下一个任务的回调函数，而是执行完一个任务中的回调函数后，检测其是否返回函数。若返回，则将其作为任务新的回调函数，继续进行工作循环；若未返回，则执行下一个任务的回调函数。

并且工作循环中也在检查 5 毫秒时间切片是否到期，到期则重新调 port.postMessage(...)。

3 . 任务的回调函数是一个执行同时模式下 root 工作的方法。执行该方法时将循环执行工作中 fiber，同样使用 5 毫秒左右的时间切片进行计算和 diff，5 毫秒时间切片过期后就会返回其自身。

### 完成任务

1 . 在执行完所有工作中 fiber 后，React 进入提交步骤，更新 DOM。

2 . 任务的回调函数返回空值，调度工作循环因此（运行任务步骤中第二点：若任务的回调函数执行后返回为空，则执行下一个任务）完成此任务，并将此任务从任务队列中删除。

## 如何实现优先级

目前有 6 种优先级（从高到低排序）：

| 优先级类型                          | 使用场景                                                     |
| ----------------------------------- | ------------------------------------------------------------ |
| 立即执行 ImmediatePriority          | React 内部使用：过期任务立即同步执行；用户自定义使用         |
| 用户与页面交互 UserBlockingPriority | React 内部使用：用户交互事件生成此优先级任务；用户自定义使用 |
| 普通 NormalPriority                 | React 内部使用：默认优先级；用户自定义使用                   |
| 低 LowPriority                      | 用户自定义使用                                               |
| 空闲 IdlePriority                   | 用户自定义使用                                               |
| 无 NoPriority                       | React 内部使用：初始化和重置 Root；用户自定义使用            |

表格中列出了优先级类型和使用场景。React 内部用到了除低优先级和空闲优先级以外的优先级。理论上，用户可以自定义使用所有优先级，使用方法:

```js
React.unstable_scheduleCallback(priorityLevel, callback, { timeout: <number> })
```

不同优先级的作用就是让高优先级任务优先于低优先级任务执行，并且由于时间切片的特性（每 5 毫秒执行一次异步的 `port.postMessage(...)`，在执行相应回调函数前会执行检测到的需要执行的代码）高优先级任务的加入可以中断正在运行的低优先级任务，先执行完高优先级任务，再重新执行被中断的低优先级任务。

高优先级插队也是同时调度模式的核心功能之一。

### 高优先级插队

接下来，使用类似同步模式代码的插队案例。

渲染内容：

```js
<div>
  <button ref={this.buttonRef} onClick={this.handleButtonClick}>
    增加2
  </button>
  <div>
    {Array.from(new Array(8000)).map((v, index) => (
      <span key={index}>{this.state.count}</span>
    ))}
  </div>
</div>
```

添加按钮点击事件：

```js
handleButtonClick = () => {
  this.setState(prevState => ({ count: prevState.count + 2 }));
};
```

并在 componentDidMount 中添加如下代码（不同之处，第二次 setTimeout 的时间由 500 改为 600）：

```js
const button = this.buttonRef.current;
setTimeout(() => this.setState({ count: 1 }), 500);
setTimeout(() => button.click(), 600);
```

ReactDOM 初始化组件（不同之处，使用 React.createRoot 开启 Concurrent 模式）：

```js
ReactDOM.createRoot(document.getElementById('container')).render(<ConcurrentSchedulingExample />);
```

为什么第二次 setTimeout 的时间由 500 改为 600？

因为是为了展示高优先级插队。第二次 setTimeout 使用的用户交互优先级更新，晚 100 毫秒，可保证第一次 setTimeout 对应的普通更新正在执行中，还没有完成，这个时候最能体现插队效果。

运行案例后，页面默认显示 8000 个 0，然后 0 变为 2（而不是变为 1），再变为 3。

通过 DOM 内容的变化已经可以看出：第二次 setTimeout 执行的按钮点击事件对应的更新插了第一次 setTimeout 对应更新的队。

### 如何实现高优先级插队

1 . 延用上面的高优先级插队案例，从触发高优先级点击事件（准备插队）开始。

触发点击事件后，React 会运行内部的合成事件相关代码，然后执行一个执行优先级的方法，优先级参数为“用户交互 UserBlockingPriority”，接着进行 setState 操作。

setState 的关联方法新建一个更新，计算当前的过期时间标记，然后开始安排工作。

2 . 在安排工作方法中，运行确保 root 被安排任务的方法。因为现在的优先级更高且过期时间标记不同，调度中心取消对之前低优先级任务的安排，并将之前低优先级任务的回调置空，确保它之后不会被执行（调度中心工作循环根据当前的任务的回调函数是否为空决定是否继续执行该任务）。

然后调度中心根据高优先级更新对应的优先级、过期时间标记、timeout 等创建新的任务。

3 . 执行高优先级任务，当执行到开始计算工作中类 Fiber（class ConcurrentSchedulingExample），执行更新队列方法时，React 将循环遍历工作中类 fiber 的更新环状链表。

当循环到之前低优先级任务对应更新时，因为低优先级过期时间标记小于当前渲染过期时间标记，故将该低优先级过期时间标记设为工作中类 fiber 的过期时间标记（其他情况会将工作中类 fiber 的过期时间标记设为 0）。此处是之后恢复低优先级的关键所在。

4 . 在完成优先级任务过程的提交渲染 DOM 步骤中，渲染 DOM 后，会将 root 的 callbackNode（其名字容易误导其功能，其实就是调度任务，用 callbackTask 或许更合适）设为空值。

在接下来执行确保 root 被安排任务的方法中，因为下一次过期时间标记不为空（根本原因就是上面第二点提到工作中类 fiber 的过期时间标记被设置为低优先级过期时间标记）且 root 的 callbackNode 为空值，所以创建新的任务，即重新创建一个新的低优先级任务。并将任务放入任务列表中。

5 . 重新执行低优先级任务。此处需要注意是重新执行而不是从之前中断的地方继续执行。毕竟 React 计算过程中只有当前 fiber 树和工作中 fiber 树，执行高优先级时，工作中 fiber 树已经被更新，所以恢复低优先级任务一定是重新完整执行一遍。

## 过期时间 ExpirationTime

作为贯穿整个调度流程的参数，过期时间 ExpirationTime 的重要性不言而喻。

但在调试过程中，发现 expirationTime 却不止一种类型。它的值有时是 1073741121，有时又是 6500，两个值显示对应不同类型。为什么会出现这种情况？

> 事实上，当前 Reac 正在重写 ExpirationTime 的功能，如果后续看到这篇文章发现跟源码差别较大，欢迎阅读我之后写的解读新 ExpirationTime 功能的文章（立个 FLAG 先，主要后面 expirationTime 一块变化应该不小，值得研究）。

### ExpirationTime 的变化过程

以上方优先级插队为例，观察 expirationTime 值及其相关值的变化。

- 更新低优先级

在设置更新时，会根据当前优先级和当前时间标记生成对应过期时间标记。

而此后，在确保和安排任务时，会将过期时间标记转换为实际过期时间。

表格的第二第三过程转了一圈，最后还是回到第一次计算的过期时间（因为 js 同步执行少量代码过程中，performance.now()的变化几乎可以忽略）。

- 中断低优先级更新，更新高优先级

执行高优先级时，低优先级被中断。而能够让低优先级被恢复的核心逻辑就是最后一个过程（执行更新队列）中对 `updateExpirationTime`（低优先级更新的过期时间标记）和 `renderExpirationTime`（高优先级更新的过期时间标记）的判断。

因为低优先级过期时间标记小于高优先级过期时间标记，即低优先级过期时间大于高优先级过期时间（过期时间标记与过期时间成反比，下面会讲到），表明低优先级更新已经被插队，需要重新执行。所以低优先级更新过期时间标记设为工作中类 fiber 的过期时间标记。

- 重新更新低优先级

## 过期时间的两种类型

通过观察 expirationTime 值的变化过程，可知在设置更新时，计算的 expiraionTime 为一种标记形式，而到安排任务的时候，任务的 expirationTime 已变为实际过期时间。

`expirationTime` 的 2 种类型:

1. 时间标记：一个极大值，如 1073741121
2. 过期时间：从网页加载开始计时的实际过期时间，单位为毫秒

### 过期时间标记

React 成员 Andrew Clark 在"Make ExpirationTime an opaque type "中提到了 expirationTime 作为标记的计算方法和作用：

> In the old reconciler, expiration times are computed by applying an offset to the current system time. This has the effect of increasing the priority of updates as time progresses.

他说 ExpirationTime 是通过给当前系统时间添加一个偏移量来计算，这样的作用是随着时间运行能够提升更新的优先级。

而源码中，expirationTime 的确是根据一个最大整数值偏移量来计算：

`MAGIC_NUMBER_OFFSET - ceiling(MAGIC_NUMBER_OFFSET - currentTime + expirationInMs / UNIT_SIZE, bucketSizeMs / UNIT_SIZE)`

其中：

- `MAGIC_NUMBER_OFFSET`：是一个极大常量：`1073741 821`
- `UNIT_SIZE` 也是常量 `10`，用来将毫秒值除以 10，比如 1000 毫秒转为 `1000/10=100`，便于展示时间标记
- `ceiling(num, unit)` 的作用是根据单位长度进行特殊向上取整（对基础值也向上取整，比如 `1.1` 特殊向上取整后为 `2`，而 `1` 特殊向上取整后也为 `2`，可以理解为 `Math.floor(num+1)`）

```js
function ceiling(num, unit) {
  return (((num / unit) | 0) + 1) * unit;
}
```

`num | 0` 的作用类似 `Math.floor(num)`，向下取整，并且加 1 可以放入括号，所以代码可转换为：

```js
function ceiling(num, unit) {
  return Math.floor(num / unit + 1) * unit;
}
```

比如，若单位 unit 为 10,若数值 num 为:

- 10，则返回 20
- 11，也返回 20

为什么要 React 要使用特殊向上取整方法？

因为这样可以实现 **更新节流**：在单位时间（比如 100 毫秒）内，保证多个同等优先级更新计算出的 `expirationTime` 相同，只执行第一个更新对应的任务（但计算更新时会用到所有更新）。

在确保 root 被安排好任务的函数中，会判断新的更新 `expirationTime` 和正在执行的更新 `expirationTime` 是否相同，以及它们的优先级是否相同，若相同，则直接 `return`。从而不会执行第一个更新之后更新对应的任务。

但这并不是说之后的更新都不会执行。由于第一个更新对应任务的执行是异步的（`post.postMessage`），在第一个更新执行更新队列时，其他更新早已被加入更新队列，所以能确保计所有更新参与计算。

- `MAGIC_NUMBER_OFFSET - currentTime` 的值为 `performance.now() / 10`
- `expirationInMs` 表示不同优先级对应的过期时长:
  - 普通/低优先级：5 秒
  - 高优先级（用户交互优先级）：生产环境下为 150 毫秒，开发环境下为 500 毫秒
  - 立即优先级、空闲优先级不通过上面的公式计算，它们的过期时间标记值分别为 1 和 2,一个表示立即过期，另一个表示永不过期。
- bucketSizeMs: 即 `ceiling(num, unit)` 中的 `unit`，作为特殊向上取整的单位长度。高优先级为 100 毫秒，普通/低优先级为 250 毫秒。

为了便于理解，不考虑更新节流，则：

```
过期时间标记值 = 极大数值 - ( 当前时间 + 优先级对应过期时长 ) / 10
```

而 `当前时间 + 优先级对应过期时长` 就是实际过期时间，所以：

```
过期时间标记值 = 极大数值 - 过期时间 / 10
```

### 过期时间


## 源码实探

写到此处，不知不觉已经过了好几天。对于源码展现这一块，也有了不同的打算。之前计划纯用流程图展现。但因为涉及关键代码量大，流程图不是很适用。所以这次直接用流程叙述+相关源码，直观的实现原理对应源码。














**参考资料：**

- [彻底搞懂 React 源码调度原理（Concurrent 模式）](https://mp.weixin.qq.com/s/pFfpv0-KGmGqtKkm6UZKeg) 未看完

[React Concurrent 模式抢先预览上篇：Suspense the world](https://juejin.im/post/5db65d87518825648f2ef899)
[精读《Shceduling in React》](https://juejin.im/post/5cb3d81e6fb9a068af37a564)
