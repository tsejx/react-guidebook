---
nav:
  title: 生态
  order: 3
group:
  title: 路由
  order: 1
title: 单页应用路由机制
order: 1
---

# 单页应用路由机制

单页面应用路由机制的实现方案：

- 利用 URL 的 Hash（`#`）
- 利用 HTML5 新增方法 History API

## Hash 路由

在  HTML5  还没有流行时，一般  SPA 都采用  URL  的 `hash(#)`  作为锚点，获取到 `#` 之后的值，并监听其改变，再进行渲染对应的子页面。当改变锚点时，页面的主体部分会切换内容，但是整个页面不会被重新刷新。

🌰 **标准示例：**

```js
// url => http://localhost:8080/#/mrsingsing

console.log(location.hash);
// '#/mrsingsing'
```

> 了解更多关于 [Location 对象](https://tsejx.github.io/javascript-guidebook/browser-object-model/window/location)

根据获取到的信息，通过 Window 对象下用于监听 `window.location.hash` 变化的方法 `onhashchange` 触发相关事件程序。

```js
window.addEventListener('hashChange', (e) => {
  e.preventDefault();
  console.log(location.hash);
});
```

载入不同页面的方式：

- 寻找 DOM 节点并改变视图
- 加载（`import`）脚本文件，文件内部导出（`export`）模版字符串
- 利用 AJAX 加载对应的 HTML 模版

### 加载脚本

定义一个 JavaScript 脚本文件。

```js
// app.js
const str = `
	<div>
		Hello world!
	</div>
`;
export default str;
```

在主文件通过 import 导入。

```html
<body>
  <h1 id="app">Initial View!</h1>
</body>
<script type="module">
  import app from './app.js';
  // 替换挂载节点的内部 HTML
  document.querySelector('#app').innerHTMl = app;
  // 监听 hash 发生改变时，变更挂载节点的内部 HTML
  window.addEventListener('hashChange', (e) => {
    e.preventDefault();
    document.querySelector('#app').innerHTMl = location.hash;
  });
</script>
```

在首次进入页面的时候，如果 URL 上已经带有 Hash，那么也会触发一次 `onhashchange` 事件，这保证了一开始的 Hash 就能被识别。

使用的 Hash 实现路由机制固然不错，但是问题是实在太丑，如果在微信或者其他不显示 URL  的 Mobile APP  中使用，倒也无所谓，但是如果在一般的浏览器中使用就会遇到问题了。

## History 路由

### 往返缓存

默认情况下，浏览器会缓存当前会话页面，这样当下一个页面点击后退按钮，或前一个页面点击前进按钮，浏览器便会从缓存中提取并加载此页面，这个特性被称为 <b style="color:red">往返缓存</b>。

> 往返缓存会保留页面数据、DOM 和 JavaScript 状态，实际上是将整个页面完好无缺地保留。

### 实现原理

早期 History 对象，提供了一些用于页面跳转的方法。

```js
// 前进两页
history.go(2);
// 后退一页
history.go(-1);
// 前进一页
history.forward();
// 后退一页
history.back();
```

在 HTML5 中，浏览器 History 对象新增几个操作浏览历史状态栈的 API。

```js
// 添加新的状态到浏览历史状态栈，但是不会发起请求
histoy.pushState();

// 用新的状态替换当前浏览历史状态栈，还可以对浏览器记录进行修改
history.replaceState();

// 返回当前状态对象
history.state;

// 历史状态栈发生变更时触发
history.popstate;
```

> 具体实现方式和 API 参数参阅 [History 对象的方法](https://tsejx.github.io/javascript-guidebook/browser-object-model/window/history)

通过 `history.pushState` 或者 `history.replaceState`也能实现改变 URL 的同时，不会刷新页面。所以 History 也具备实现路由控制的能力。然而，Hash 的改变会触发 `onhashchange` 事件，History 的改变并不会触发任何事件。

尽管无法监听 History 的改变事件，但是我们可以罗列可能改变 History 的途径，然后在这些途径逐一拦截，手动实现对 History 的监听。

对于一个 Web 应用来说，URL 改变只能由以下三种途径引起：

1. 点击浏览器的前进或后退按钮

2. 点击 `<a>` 链接标签

3. 在 JavaScript 代码中直接修改路由

第 2、3 种情况可视为同类型场景，因为 `<a>` 标签的默认事件可以被禁止，进而使用 JavaScript 相关方法。关键是第一种，HTML5 规范中新增一个 `onpopstate` 事件，通过它便可以监听到前进或后退按钮的点击。

需要特别注意的是：调用 `history.pushState` 和 `history.replaceState` 并不会触发 `onpopstate` 事件。

## 总结归纳

一般场景下，Hash 路由和 History 路由都可以，除非你更在意颜值，`#` 符号夹杂在 `URL` 里看起来确实有些不太美观。

两种实现方式的对比：

| History 路由                 | Hash 路由                               |
| :--------------------------- | :-------------------------------------- |
| 可设置同源 URL 的任意路径    | 只可设置同源 URL 的 `#` 后面部分        |
| URL 相同也会添加记录到栈中   | 只有 Hash 值变化才会触发 `onhashchange` |
| 可以添加任意类型数据到记录中 | 只可添加短字符                          |
| 可额外设置 `title` 属性      |                                         |

尽管从上述对比中 History 路由比 Hash 路由优越不少，但是当通过 URL 向后端发起 HTTP 请求时，两者的差异就来了。尤其在用户手动输入 URL 后回车，或者刷新（重启）浏览器的时候。

Hash 路由模式下，仅 Hash 符号（`#`）之前内容会被包含在请求中，因此对于后端来说，即使没有做到对路由的全覆盖，也不会返回 404 错误。

History 路由模式下，前端 URL 必须和实际向后端发起请求的 URL 一致。若后端缺少对路径部分的路由处理，将返回 404 错误。
