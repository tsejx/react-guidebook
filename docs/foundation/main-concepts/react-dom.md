---
nav:
  title: 基础
  order: 1
group:
  title: 基础概念
  order: 1
title: 组件挂载器
order: 7
---

# 组件挂载器

React 的声明式渲染机制把复杂的 DOM 操作抽象为简单的 State 和 Props 的操作，因此避免了很多直接的 DOM 操作。不过，仍然有一些 DOM 操作是 React 无法避免或者正在努力避免的。

## 官方文档

- [ReactDOM](https://reactjs.org/docs/react-dom.html)
- [ReactDOMServer](https://reactjs.org/docs/react-dom-server.html)
- [DOM Elements](https://reactjs.org/docs/dom-elements.html)

## ReactDOM API

* `ReactDOM.render(element, container [, callback])` 顶层组件用于将 VirtualDOM 渲染到浏览器的 DOM 中
* `ReactDOM.findDOMNode(component)` 获取当前组件的 DOM 元素节点引用
* `ReactDOM.unmountComponentAtNode(container)` 从 DOM 树中卸载已装载的 React 组件并清空事件监听和状态。
* hydrate
* `ReactDOM.createPortal(child, container)`

## render

* 控制你传进来的容器节点里的内容。第一次被调用时，内部所有已经存在的 DOM 元素都会被替换掉。之后的调用会使用 React 的 DOM 比较算法进行高效的更新。
* 不会修改容器节点（只修改容器的子项）。你可以在不覆盖已有子节点的情况下添加一个组件到已有的 DOM 节点中去。
* 目前会返回一个引用，指向 ReactComponent 的根实例。但是这个返回值是历史遗留，应该避免使用。因为未来版本的 React 可能会在某些情况下进行异步渲染。如果你真的需要一个指向 ReactComponent 的根实例的引用，推荐的方法是天假一个 `callback` 到根元素上。







