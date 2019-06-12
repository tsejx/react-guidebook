# React 特性

## 数据

### 数据驱动

在 React 中，一切皆数据。要想改变界面元素，或者更改 DOM 节点，只需要修改数据就好了。

> 切记：在 React 中不要操作 DOM 节点

### State

React 的数据，所有的数据都用 `state` 来管理。

分为组件 `state` 和全局 `state`。

### 单向数据流

数据只能从 State 流向 DOM，不能逆向更改。

## 程序

### 声明式编程

`命令式 => 声明式编程（函数式编程）`

纯函数：函数的输出不受外部环境影响，同时也不影响外部环境。例如：

```js
[1, 2, 3].map(index => index + 1);
```

非纯函数：输入相同，输出不同的函数。例如：

```js
Math.random();
```

函数的柯里化：将一个低阶函数转换为高阶函数的过程。例如：

```js
(arg1, arg2, arg3) => arg1 => arg2 => arg3;
```

### 组件化开发

把数据组织起来的表现形式。

```js
() => ('My Component');
```

### JSX 语法

在 JavaScript 中可以编辑 HTML 片段。

```
  () => <div>我也是一个组件</div>
```

### 客户端和服务端渲染

把代码拉取到客户端，再编译执行的方式就是客户端渲然。这种方式是无法支持 SEO 的，所有就有了服务端渲然，在服务端提前渲然成静态 HTML 页面。

第三方服务端渲然库：[next.js](https://nextjs.org/docs)

## 性能

每次数据更新后，重新计算 Virtual DOM，并和上一次生成的 Virtual DOM 做对比，对发生变化的部分做**批量更新**。React 也提供了直观的 **shouldComponentUpdate** 生命周期回调，来减少数据变化后不必要的 Virtual DOM 对比过程，以保证性能。 

### Virtual DOM 虚拟节点

将 DOM 抽象成一个 JavaScript 对象，例如：

```js
const element = {
  element: 'ul',
  props: { id: "ulist" },
  children: [
    { element: 'li', props: { id:"first" }, children: ['这是第一个List元素'] },
    { element: 'li', props: { id:"second" }, children: ['这是第二个List元素'] }
  ]
}
```

### Diff 算法

将虚拟 DOM 转化为真实 DOM 的算法。分为三级：Tree Diff、Component Diff、Element Diff。

