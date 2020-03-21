---
nav:
  title: 基础
  order: 1
group:
  title: 基础概念
  order: 1
title: 特性
order: 1
---

# 特性

React 的三大特性：

- `数据驱动 -> 单向数据流`
- `函数式编程 = 组件化 + JSX`
- `虚拟 DOM -> 跨平台`

## 数据

### 数据驱动

在 React 中，一切皆数据。要想改变界面元素，或者更改 DOM 节点，只需修改数据即可。

⚠️ **切记**：在 React 中不要轻易操作 DOM 节点

### State

React 的数据，所有的数据都用 `state` 来管理。

分为组件 `state` 和全局 `state`。

### 单向数据流

数据只能从 State 流向 DOM，不能逆向更改。

## 程序

### 声明式编程

`命令式 -> 声明式编程（函数式编程）`

**纯函数**：函数的输出不受外部环境影响，同时也不影响外部环境。

🌰 **示例：**

```js
[1, 2, 3].map(index => index + 1);
```

**非纯函数**：输入相同，输出不同的函数。

🌰 **示例：**

```js
Math.random();
```

**函数的柯里化**：将一个低阶函数转换为高阶函数的过程。

🌰 **示例：**

```js
(arg1, arg2, arg3) => arg1 => arg2 => arg3;
```

### 组件化开发

把数据组织起来的表现形式。

```js
() => 'My Component';
```

### JSX 语法

在 JavaScript 中可以编辑 HTML 片段。

```js
() => <div>我也是一个组件</div>;
```

### 服务端渲染

把代码拉取到客户端，再编译执行的方式就是客户端渲染。这种方式是无法支持 SEO 的，所有就有了服务端渲染，在服务端提前渲染成静态 HTML 页面。

第三方服务端渲染库：[Next.js](https://nextjs.org/docs)

## 性能

每次数据更新后，重新计算 Virtual DOM，并和上一次生成的 Virtual DOM 做对比，对发生变化的部分做**批量更新**。React 也提供了直观的 `shouldComponentUpdate` 生命周期回调函数，来减少数据变化后不必要的 Virtual DOM 对比过程，以保证性能。

### 虚拟节点

虚拟 DOM 顾名思义不是真实的 DOM，它不需要浏览器的 DOM API 支持。虚拟 DOM 是在 DOM 的基础上建立一个抽象层，其实质是一个 JavaScript 对象，当数据和状态发生了变化，都会被自动高效的同步到虚拟 DOM 中，**最后再将仅变化的部分同步到真实 DOM 中**。

将 DOM 抽象成一个 JavaScript 对象：

```js
const element = {
  element: 'ul',
  props: { id: 'ulist' },
  children: [
    { element: 'li', props: { id: 'first' }, children: ['这是第一个List元素'] },
    { element: 'li', props: { id: 'second' }, children: ['这是第二个List元素'] },
  ],
};
```

### 差异化算法

将虚拟 DOM 转化为真实 DOM 的算法。分为三级：Tree Diff、Component Diff、Element Diff。

详细算法过程，参考：[差异化算法](../core/diffing-algorithm)
