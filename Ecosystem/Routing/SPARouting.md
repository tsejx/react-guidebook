## SPA 路由机制

浏览器实现方案：

* 利用 URL 的 hash(#)
* 利用 H5 新增方法 History interface

### 锚点

在 HTML5 还没有流行开来时，一般 SPA 都采用 URL 的 `hash(#)` 作为锚点，获取到 # 之后的值，并监听其改变，再进行渲染对应的子页面。当改变锚点时，页面的主体部分会切换内容，但是整个页面不会被重新刷新。

**例如：**

路径 `http://localhost:8080/#/mrsingsing` 那么利用 `location.hash` 输出的内容就是 `#/mrsingsing`

location 对象的详细介绍 => [传送门](https://github.com/tsejx/JavaScript-Guidebook/blob/master/browser-object-model/the-location-object/the-location-object-properties.md)

根据获取到的信息，window 对象中有一个事件是专门监听 hash 的变化，那就是 `hashChange`。

```js
window.addEventListener('hashChange', (e) => {
    e.preventDefault()
    console.log(location.hash)
})
```

**载入不同的页面**

* 寻找节点内容并改变
* import 一个 JS 文件，文件内部 export 模版字符串
* 利用 AJAX 加载对应的 HTMl 模版

#### import

定义一个 JS 文件

```js
// app.js
const str = `
	<div>
		Hello world!
	</div>
`
export default str
```

在主文件通过 import 引入

```html
<body>
  <h1 id="id"></h1>
  <a href="#/id1">id1</a>
  <a href="#/id2">id2</a>
  <a href="#/id3">id3</a>
</body>
<script type='module'>
	import app from './app.js'
    document.querySelector('#app').innerHTMl = app
    window.addEventListener('hashChange', (e) => {
        e.preventDefault()
        document.querySelector('#id').innerHTMl = location.hash
    })
</script>
```

#### AJAX

本篇文章是详解路由机制，`AJAX` 就直接采用 `JQuery` 这个轮子。

定义一个 `HTML` 文件，名为 `demo2.html`，在里面写入一些内容（由于主页面已经有`head`，`body`等根标签，此文件只需写入需要替换的标签）：

```html
<div>
  我是AJAX加载进来的HTML文件
</div>
```

```html
<body>
  <h1 id="id"></h1>
  <a href="#/id1">id1</a>
  <a href="#/id2">id2</a>
  <a href="#/id3">id3</a>
</body>
<script src="https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"></script>
<script type="module">
  // import demo1 from './demo1.js'
  // document.querySelector('#id').innerHTML = demo1
  $.ajax({
    url: './demo2.html',
    success: (res) => {
      document.querySelector('#id').innerHTML = res
    }
  })
  window.addEventListener('hashchange', e => {
    e.preventDefault()
    document.querySelector('#id').innerHTML = location.hash
  })
</script>
```

可见，利用 `AJAX` 加载进来的文件也已经生效。

既然加载不同页面的内容都已经生效，那么只需要包装一下我们的监听，利用观察者模式封装路由的变化：

```html
<body>
  <h1 id="id">我是空白页</h1>
  <a href="#/id1">id1</a>
  <a href="#/id2">id2</a>
  <a href="#/id3">id3</a>
</body>
<script type="module">
  import demo1 from './demo1.js'
  // 创建一个 newRouter 类
  class newRouter {
    // 初始化路由信息
    constructor() {
      this.routes = {};
      this.currentUrl = '';
    }
    // 传入 URL 以及 根据 URL 对应的回调函数
    route(path, callback = () => {}) {
      this.routes[path] = callback;
    }
    // 切割 hash，渲染页面
    refresh() {
      this.currentUrl = location.hash.slice(1) || '/';
      this.routes[this.currentUrl] && this.routes[this.currentUrl]();
    }
    // 初始化
    init() {
      window.addEventListener('load', this.refresh.bind(this), false);
      window.addEventListener('hashchange', this.refresh.bind(this), false);
    }
  }
  // new 一个 Router 实例
  window.Router = new newRouter();
  // 路由实例初始化
  window.Router.init();

  // 获取关键节点
  var content = document.querySelector('#id');

  Router.route('/id1', () => {
    content.innerHTML = 'id1'
  });
  Router.route('/id2', () => {
    content.innerHTML = demo1
  });
  Router.route('/id3', () => {
    $.ajax({
      url: './demo2.html',
      success: (res) => {
        content.innerHTML = res
      }
    })
  });
</script>
```

### HTML5 History API

上面使用的 `hash` 法实现路由固然不错，但是问题就是实在太丑，如果在微信或者其他不显示 `URL` 的 `APP` 中使用，倒也无所谓，但是如果在一般的浏览器中使用就会遇到问题了。

#### 往返缓存

默认情况下，浏览器会缓存当前会话页面，这样当下一个页面点击后退按钮，或前一个页面点击前进按钮，浏览器便会从缓存中提取并加载此页面，这个特性被称为“往返缓存”。

PS：此缓存会保留页面数据、DOM和 JS 状态，实际上是将整个页面完好无缺地保留。

#### history.state

浏览器支持度: `IE10+`

返回当前历史记录的 `state`

#### pushState

往历史记录栈中添加记录：`pushState(state, title, url)`

浏览器支持度: `IE10+`

| 参数  | 说明                                                         |
| ----- | ------------------------------------------------------------ |
| state | 一个 JS 对象（不大于640kB），主要用于在 `popstate` 事件中作为参数被获取。如果不需要这个对象，此处可以填 `null` |
| title | 新页面的标题，部分浏览器（比如 Firefox）忽略此参数，因此一般为 `null` |
| url   | 新历史记录的地址，**可为页面地址，也可为一个锚点值**，新 `url` 必须与当前 `url` 处于同一个域，否则将抛出异常，此参数若没有特别标注，会被设为当前文档 `url` |

⚠️ 除此之外，仍有几点需要注意：

- 将 `url` 设为锚点值时不会触发 `hashchange`
- 根据**同源策略**，如果设置不同域名地址，会报错，这样做的目的是：防止用户以为它们是同一个网站，若没有此限制，将很容易进行 `XSS` 、 `CSRF` 等攻击方式

#### replaceState

改变当前的历史激励：`replaceState(state, title, url)`

浏览器支持度: `IE10+`

- 参数含义同 `pushstate`
- 改变当前的历史记录而不是添加新的记录
- 同样不会触发 `popstate`

#### popstate

定义：每当同一个文档的浏览历史（即 `history` 对象）出现变化时，就会触发 `popstate` 事件。

⚠️ 注意：若仅仅调用 `pushState` 方法或 `replaceState` 方法 ，并不会触发该事件，只有用户点击浏览器**倒退**按钮和**前进**按钮，或者使用 `JavaScript` 调用 `back` 、 `forward` 、 `go` 方法时才会触发。另外，该事件只针对同一个文档，如果浏览历史的切换，导致加载不同的文档，该事件也不会触发。

🌰 例子：

```js
window.onpopstate= (event) => {
   //当前历史记录的state对象
　　console.log(event.state)
}
```

### 总结归纳

一般场景下，`hash` 和 `history` 都可以，除非你更在意颜值，`#` 符号夹杂在 `URL` 里看起来确实有些不太美丽。
另外，根据 [Mozilla Develop Network](https://developer.mozilla.org/zh-CN/docs/Web) 的介绍，调用 `history.pushState()` 相比于直接修改 `hash`，存在以下优势：

- `pushState()` 设置的新 `URL` 可以是与当前 `URL` 同源的任意 `URL`；而 `hash` 只可修改 `#` 后面的部分，因此只能设置与当前 `URL` 同文档的 `URL`
- `pushState()` 设置的新 `URL` 可以与当前 `URL` 一模一样，这样也会把记录添加到栈中；而 `hash` 设置的新值必须与原来不一样才会触发动作将记录添加到栈中
- `pushState()` 通过 `stateObject` 参数可以添加任意类型的数据到记录中；而 `hash` 只可添加短字符串；
- `pushState()` 可额外设置 `title` 属性供后续使用。

这么一看 `history` 模式充满了 happy，感觉完全可以替代 `hash` 模式，但其实 `history` 也不是样样都好，虽然在浏览器里游刃有余，但真要通过 `URL` 向后端发起 `HTTP` 请求时，两者的差异就来了。尤其在用户手动输入 `URL` 后回车，或者刷新（重启）浏览器的时候。

- `hash` 模式下，仅 `hash` 符号之前的内容会被包含在请求中，如 `http://www.qqq.com`，因此对于后端来说，即使没有做到对路由的全覆盖，也不会返回 `404` 错误。
- `history` 模式下，前端的 `URL` **必须**和实际向后端发起请求的 `URL` 一致，如 `http://www.qqq.com/book/id`。如果后端缺少对 `/book/id` 的路由处理，将返回 `404` 错误。`Vue-Router` 官网里如此描述：“不过这种模式要玩好，还需要后台配置支持……所以呢，你要在服务端增加一个覆盖所有情况的候选资源：如果 `URL` 匹配不到任何静态资源，则应该返回同一个 `index.html` 页面，这个页面就是你 `app` 依赖的页面。”
- 需在后端（`Apache` 或 `Nginx`）进行简单的路由配置，同时搭配前端路由的 `404` 页面支持。

