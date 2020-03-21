---
nav:
  title: 基础
  order: 1
group:
  title: 基础概念
  order: 1
title: JSX
order: 2
---

# JSX

**JSX 是类 XML 语法的 ECMAScript 扩展**，完美地利用了 JavaScript 自带的语法和特性，并使用大家熟悉的 HTML 语法来创建虚拟元素。

由于 JSX 这种声明式语法实际是在构建一个<b style="color: red">抽象的视图层</b>，本身没有定义任何语义，这种抽象不会被引擎或浏览器执行，需要通过不同适配器（编译器、处理器）适配（编译为标准的 ECMAScript）到各种显示终端。

React 引入 JSX 主要是为了 **方便 View 层组件化**，承载了构建 HTML 结构化页面的职责。这一点与其他很多的 JavaScript 模板语言异曲同工，不过 React 将 JSX 映射为虚拟元素，并且通过创建与更新虚拟元素来管理整个 Virtual DOM 系统。

📌 本质上来说，JSX 只是为 `React.createElement(component, props, ...children)` 提供的一种语法糖。

## 原理

每个 DOM 元素的结构都可以用 JavaScript 的对象来表示。你会发现一个 DOM 元素包含的信息其实只有三个：

- 标签名 `tagName`
- 属性 `props`
- 子元素 `children`

```html
<div class="box" id="content">
  <div class="title">Hello</div>
  <button>Click</button>
</div>
```

上述的 HTML 所有信息可以用合法的 JavaScript 对象来表示。

```js
{
    tag: 'div',
    attrs: { className: 'box', id: 'content' },
    children: [
        {
            tag: 'div',
            attrs: { className: 'title' },
            children: ['Hello']
        },
        {
            tag: 'button',
            attrs: null,
            children: ['Click']
        }
    ]
}
```

我们可以使用 JavaScript 对象来描述所有能用 HTML 表示的 UI 信息。但是用 JavaScript 写起来太长了，结构看起来又不清晰，用 HTML 的方式写起来就方便很多了。

于是 React 就把 JavaScript 的语法扩展了一下，让 JavaScript 语言能够支持这种直接在 JavaScript 代码里面编写类似 HTML 标签结构的语法，这样写起来就方便很多了。编译的过程会把类 HTML 的 JSX 结构转换成 JavaScript 的对象结构。

`React.createElement` 会构建一个 JavaScript 对象来描述你 HTML 结构的信息，包括标签名、属性、还有子元素等。

```jsx | inline
import React from 'react';
import src from '../../assets/JSX.png';

export default () => <img alt="JSX" src={src} width="520" />;
```

🔍 [React 和 HTML DOM 属性的区别](http://react.yubolun.com/docs/introducing-jsx.html)

## 语法原则

📌 **使用守则**：必须要在 JSX 声明的文件中引入 React

```jsx | pure
import React from 'react';

const myButton = (
  <MyButton color="blue" shadow={2}>
    Click Me
  </MyButton>
);
```

上述代码会被编译成：

```jsx | pure
React.createElement(
  MyButton,
  {
    color: 'blue',
    shadow: 2,
  },
  'Click Me'
);
```

**⚠️ 注意事项：**

- React 为必须引入的模块
- 组件名应 **首字母大写**
- 在运行时选择类型：通过表达式确定 React 元素类型需先赋值给大写开头的变量
- 定义标签时，**标签必须闭合**，自定义标签可以根据是否有子组件或文本来决定闭合方式
- 使用 JSX 声明组件时，最外层的组件根元素只允许使用**单一根元素**（参考：[React.Fragment](../../api/fragment)）

## 元素类型

对应规则是 HTML 标签首字母是否为小写字母，其中小写首字母对应 DOM 元素，而 React 组件元素自然对应大写首字母。

JSX 还可以通过命名空间的方式使用 React 组件元素，以解决组件相同名称冲突的问题，或是对一组组件进行归类。

```jsx | pure
// DOM 元素
<div>Hello World!</div>;

// React 组件元素
<Foo>Hello World!</Foo>;

// 注释
{
  /* Hello World! */
}
```

特殊标签：注释和 DOCTYPE。

## 元素属性

组件元素的属性是完全自定义的属性，也可以理解为实现组件所需要的参数。

在 React 中，所有的 DOM 特性和属性（包括事件处理函数）都是 **小驼峰命名法** 命名。

### 布尔属性

省略 Boolean 属性值会导致 JSX 认为布尔值设为了 `true`。要传 `false` 时，必须使用属性表达式。这常用于表单元素中，比如 `disabled`、`required`、`checked` 和 `readOnly` 等。

```jsx | pure
// BAD
<Checkbox checked={true}/>

// BETTER
<Checkbox checked/>
```

### 特殊属性

**checked**

- 受控组件：`checked`
- 非受控组件：`defaultChecked`

```jsx | pure
// 已选中
<input type='checkbox' checked />

// 未选中
<input type='checkbox' />
```

**className**

为常规 DOM 节点和 SVG 元素指定 CSS 类。

```jsx | pure
<div className="foo" />
```

**dangerouslySetInnerHTML**

用于替换浏览器 DOM 中 `innerHTML` 接口的一个函数。由于容易把用户信息暴露给跨站脚本攻击，因此使用该函数是非常危险的。

```jsx | pure
<div dangerouslySetInnerHTML={{ __html: '&#10003' }} />
```

**htmlFor**

由于 `for` 在 JavaScript 中是保留字，React 元素使用 `htmlFor` 代替。

```jsx | pure
<form>
  <label htmlFor="male" />
  <input type="radio" name="sex" id="male" />
</form>
```

更详细的元素属性介绍：

- [在 React 中使用 HTML 属性](https://react.docschina.org/docs/dom-elements.html#%E6%89%80%E6%9C%89%E5%8F%97%E6%94%AF%E6%8C%81%E7%9A%84html%E5%B1%9E%E6%80%A7)
- [在 React 中使用 SVG 属性](https://react.docschina.org/docs/dom-elements.html#%E6%89%80%E6%9C%89%E5%8F%97%E6%94%AF%E6%8C%81%E7%9A%84svg%E5%B1%9E%E6%80%A7)

### 自定义属性

虽然 React 组件元素的属性采取小驼峰命名法命名，但是 `aria-*` 和 `data-*` 属性是例外的，一律使用小写字母命名。

如果在 JSX 中往 DOM 元素中传入自定义属性，React 是不会渲染的（因为 React 无法识别）。

```jsx | pure
<div d="xxx">content</div>
```

📌 如果要使用 HTML 自定义属性，要使用 `data-` 前缀，这与 HTML 标准也是一致 。

```jsx | pure
<div data-attr="xxx">content</div>
```

然而，在自定义标签中任意的属性都是被支持的。

```xml
<x-my-component custom-attr="foo" />
```

📌 以 `aria-` 开头的网络无障碍属性同样可以正常使用。

```jsx | pure
<div aria-hidden={true} />
```

### 属性表达式

属性值要使用表达式，只要用 `{}`（花括号）替换 `""`（双引号）即可。

```jsx | pure
render(){

   const containerCls = 'container';

   return (
       <div className={containerCls}>
           <div onClick={this.onStateChange}></div>
       </div>
   )
}

```

### 字符串转义

React 会将所有要显示到 DOM 的字符串转义，防止 XSS。所以，如果 JSX 中含有转义后的实体字符，比如 `&copy;`（©），则最后 DOM 中不会正确显示，因为 React 自动把 `&copy;` 中的特殊字符转义了。

有几种解决方案：

- 直接使用 UTF-8 字符
- 使用对应字符的 Unicode 编码查询编码
- 使用数组组装 `<div>{['cc ', <span>&copy;</span>, ' 2015']}</div>`
- 直接插入原始的 HTML

此外，React 提供了 `dangerouslySetInnerHTML` 属性。正如其名，它的作用就是避免 React 转义字符，在确定必要的情况下可以使用它。

```jsx | pure
<div dangerouslySetInnerHTML={{ __html: 'cc &copy; 2015' }} />
```

## 安全性

**避免 XSS 注入攻击**

最后需要提及的是，React 中 JSX 能够帮我们自动防护部分 XSS 攻击，譬如我们常见的需要将用户输入的内容再呈现出来：

```jsx | pure
const title = response.potentiallyMaliciousInput;
// This is safe:
const element = <h1>{title}</h1>;
```

在标准的 HTML 中，如果我们不对用户输入作任何的过滤，那么当用户输入 `<script>alert(1)<script/>` 这样的可执行代码之后，就存在被 XSS 攻击的危险。而 React 在实际渲染之前会帮我们自动过滤掉嵌入在 JSX 中的危险代码，将所有的输入进行编码，保证其为纯字符串之后再进行渲染。不过这种安全过滤有时候也会对我们造成不便，譬如如果我们需要使用 `&copy;` 这样的实体字符时，React 会自动将其转移最后导致无法正确渲染，上面提及的字符串转义就起到作用了。

```jsx | pure
function createMarkup() {
  return { __html: 'First &middot; Second' };
}

function MyComponent() {
  return <div dangerouslySetInnerHTML={createMarkup()} />;
}
```

---

**参考资料：**

- [React 官方文档：JSX 简介(英文版)](https://facebook.github.io/jsx/)
- [React 官方文档：深入 JSX(英文版)](https://reactjs.org/docs/jsx-in-depth.html)
