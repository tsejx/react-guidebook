## Flux

> Flux：Application architecture for building user interfaces

![Flux](../../Screenshots/flux-diagram-white-background.png)

[Flux](https://facebook.github.io/flux/) 是一种架构思想，专门用于解决软件的结构问题。它跟 MVC 架构是一类东西，但是更加简单和清晰。

### 基本概念

Flux 将一个应用分成四个部分：

* Action（动作）：视图层发出的消息
* Dispatcher（派发器）：基于事件（Action）来调用 Store 中的相应函数
* Store（数据层）：存储和修改数据
* View（视图层）：将数据渲染到 VirtualDOM 中

Flux 的核心思想是**数据和逻辑永远单向流动**。

1. 用户访问 View
2. View 发出用户的 Action
3. Dispatcher 收到 Action，要求 Store 进行相应的更新
4. Store 更新后，发出一个 "change" 事件
5. View 收到 “change” 事件后，更新页面

#### Action 动作

改变和交互的第一步，当用户改变 App 的状态或者改变 View 时都需要触发 Action。

#### Dispatcher  派发器

事件调度中心，Action 和 Store 的连接中心，Flux 架构的中心枢纽，管理着 Flux 应用中的所有数据流。

本质上是 Store 的回调注册。每个 Store 注册它自己并提供一个回调函数。当 Dispatcher 响应 Action 时，通过已注册的回调函数，将 Action 提供的数据负载发送给应用中的所有 Store。

Flux 架构中的 Dispatcher 与许多其他架构的 Dispatcher 不同。不管这个 Action 是什么动作类型，该动作会被发送给所有注册过的 Store。这意味着 Store 不只是订阅某一些 Actions。它监听所有的 Action，并筛选出它所关心和不关心的。

#### Store 数据层

负责封装应用的业务逻辑跟数据的交互。

- 包含应用所有的数据
- 应用中唯一的数据发生变更的地方
- 没有赋值接口。所有数据变更都是由 Dispatcher 发送到 Store，新的数据随着 Store 触发的 “change” 事件传回 View。Store 对外只暴露 Getter，不允许提供 Setter。禁止在任何地方直接操作Store。

#### View 视图层

- ControllerView 可以理解成 MVC 模型中的 Controller，它一般由应用的顶层容器充当，负责从 Store 中获取数据并将数据传递到子组件中。简单的应用一般只有一个 ControllerView，复杂应用中也可以有多个。ControllerView 是应用中唯一可以操作 State 的地方（React 中表现为 `setState`）
- View（UI组件）UI Component 职责单一只允许调用 Action 触发事件，数据从由上层容器通过属性传递过来。

### 核心思想

在介绍 React 的时候，我们也提到它推崇的核心也是**单向数据流**，Flux 中单向数据流则是在整体架构上的延伸。在 Flux 应用中，数据从 action 到 dispatcher，再到 store，最终到 view 的路线是单向不可逆的，各个角色之间不会像前端 MVC 模式中那样存在交错的连线。

然而想要做到单向数据流，并不是一件容易的事情。好再 Flux 的 dispatcher 定义了严格的规则来限定我们对数据的修改操作。同时，store 中不能暴露 setter 的设定也强化了数据修改的纯洁性，保证了 store 的数据确定应用唯一的状态。

再使用 React 作为 Flux 的 view，虽然每次 view 的渲染都是重渲染，但并不会影响页面的性能，因为重渲染的是 Virtual DOM，并由 PureRender 保障从重渲染到局部渲染的转换。意味着完全不用关心渲染上的性能问题，增、删、改的渲染都和初始化渲染一样快。

### 架构特点

#### 稳定可预测

Flux 架构的单向数据流原则，提供了可预测的状态，避免了多数据流带来的混乱。但与此同时，Flux 架构会增加我们的代码量。所以，如果我们的程序足够简单，并且组件之间没有共享数据，那么使用 Flux 只会给你徒增烦恼。

#### 所有数据变更都发生在 Store 里

Flux 里 View 是不允许直接修改 Store 的，View 能做的只是触发 Action，然后 Action 通过 Dispatcher 调度最后才会流到 Store。所有数据的更改都发生在 Store 组件内部，Store 对外只提供 Get 接口，Set 行为都发生在内部。Store 里包含所有相关的数据及业务逻辑。所有 Store 相关数据处理逻辑都集中在一起，避免业务逻辑分散降低维护成本。

#### 数据的渲染自上而下

View 所有的数据来源只应该是从属性中传递过来的，View 的所有表现由上层控制视图（ControllerView）的状态决定。我们可以把 ControllerView 理解为容器组件，这个容器组件中包含若干细小的子组件，容器组件不同的状态对应不同的数据，子组件不能有自己的状态。也就是，数据由 Store 传递到 ControllerView中之后，ControllerView 通过 `setState` 将数据通过属性的方式自上而下传递给各个子 View。

#### 职责单一组件化

由于2、3两条原因，View 自身需要做的事情就变得很少了。业务逻辑被 Store 做了，状态变更被 ControllerView做了，View 自己需要做的只是根据交互触发不同的 Action，仅此而已。这样带来的好处就是，整个View 层变得很薄很纯粹，完全的只关注 UI 层的交互，各个 View 组件之前完全是松耦合的，大大提高了View 组件的复用性。

#### Dispatcher 是单例的

对单个应用而言 Dispatcher 是单例的，最主要的是 Dispatcher 是数据的分发中心，所有的数据都需要流经 Dispatcher，Dispatcher 管理不同 Action 于 Store 之间的关系。因为所有数据都必须在 Dispatcher 这里留下一笔，基于此我们可以做很多事情，各种 Debug 工具、动作回滚、日志记录甚至权限拦截之类的都是可以的。

---

**参考资料：**

* [Flux 架构简介](https://www.jdon.com/idea/flux.html)
* [阮一峰：Flux架构入门教程](http://www.ruanyifeng.com/blog/2016/01/flux.html)

