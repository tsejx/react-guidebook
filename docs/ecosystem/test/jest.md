---
nav:
  title: 生态
  order: 3
group:
  title: 测试
  order: 5
title: Jest
order: 3
---

# Jest

Jest 是由 Facebook 开源的 React 单元测试框架，内部 DOM 操作基于 JSDOM，语法和断言基于 Jasmine 框架。

**特点：**

- 自动找到测试
- 自动 mock 模拟依赖包，达到单元测试的目的
- 并不需要真实 DOM 环境执行，而是 JSDOM 模拟的 DOM
- 多进程并行执行测试

当使用 Jest 来测试 React 组件时，还要引入 `react-addons-test-utils` 插件，用于模拟浏览器事件 和对 DOM 进行校验。

它提供的常用方法如下：

- `Simulate.{eventName} (DOMElement element, [object eventData])`：模拟触发事件。
- `renderIntoDocument(ReactElement instance)`：渲染 React 组件到文档中，这里的文档节点由 JSDOM 提供。
- `findRenderDOMComponentWithClass(ReactComponent tree, string className)`：从渲染的 DOM 树中查找含有 class 的节点。
- `findRenderDOMComponentWithTag(ReactComponent tree, function componentClass)`：从渲染的 DOM 树中找到指定组件的节点。
