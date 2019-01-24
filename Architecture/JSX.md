## JSX 语法

**JSX 的官方定义是类 XML 语法的 ECMAscript 扩展**，完美地利用了 JavaScript 自带的语法和特性，并使用大家熟悉的 HTML 语法来创建虚拟元素。由于 JSX 这种声明式语法实际是在构建一个抽象的视图层，本身没有定义任何语义，这种抽象不会被引擎或浏览器执行，需要通过不同适配器（编译器、处理器）适配（编译为标准的 ECMAScript）到各种显示终端。

React 引入 JSX 主要是为了方便 View 层组件化，承载了构建 HTML 结构化页面的职责。这一点与其他很多的 JavaScript 模板语言异曲同工，不过 React 将 JSX 映射为虚拟元素，并且通过创建与更新虚拟元素来管理整个 Virtual DOM 系统。

> 本质上来说，JSX 只是为 `React.createElement(component, props, ...children)` 提供的一种语法糖。

### 基本语法

🔍 React 和 HTML DOM属性的区别 [传送门](http://react.yubolun.com/docs/introducing-jsx.html)

在React中，所有的DOM特性和属性（包括事件处理函数）都是小驼峰命名法命名。比如说，与HTML中的`tabindex`属性对应的React实现命名则是`tabIndex`。`aria-*`和`data-*`属性是例外的，一律使用小写字母命名。

| 区别属性                       | 作用                 | 说明                                                         |
| ------------------------------ | -------------------- | ------------------------------------------------------------ |
| checked 属性                   | 表单控件属性         |                                                              |
| 类名属性 className             | CSS 类               |                                                              |
| dangerouslySetInnerHTML 函数   | 替换 innerHTML       | ⚠️ 危险属性                                                   |
| htmlFor                        | DOM 元素 for 属性    |                                                              |
| onChange 函数                  | 表单触发事件         |                                                              |
| selected 属性                  | 表单控件属性         |                                                              |
| style 属性                     | 行内样式             | 使用驼峰命名 浏览器兼容需特殊处理                            |
| suppressContentEditableWarning | contentEditable 属性 | 一般不要使用                                                 |
| value 属性                     | 表单控件属性         | `<input>` 和 `<textarea>` 支持 对受控控件非常有用（非受控使用 `defaultValue`） |

> 在 React 中使用 HTML 属性 [传送门](https://react.docschina.org/docs/dom-elements.html#%E6%89%80%E6%9C%89%E5%8F%97%E6%94%AF%E6%8C%81%E7%9A%84html%E5%B1%9E%E6%80%A7)
>
> 在 React 中使用 SVG 属性 [传送门](https://react.docschina.org/docs/dom-elements.html#%E6%89%80%E6%9C%89%E5%8F%97%E6%94%AF%E6%8C%81%E7%9A%84svg%E5%B1%9E%E6%80%A7)

#### XML 基本语法

📌 **使用守则：必须要在 JSX 声明的文件中引入React**

```jsx
import React from 'react'

<MyButton color="blue" shadow={2}>Click Me</MyButton>
```

上述代码会被编译成：

```js
React.createElement(
    MyButton,
    {color: 'blue', shadow: 2},
    'Click Me'
)
```

**⚠️ 注意事项：**

- React 必须引入
- 组件名应**首字母大写**
- 在运行时选择类型：通过表达式确定 React 元素类型需先赋值给大写开头的变量
- 定义标签时，**标签必须闭合**，自定义标签可以根据是否有子组件或文本来决定闭合方式
- 使用 JSX 声明组件时，最外层的组件根元素只允许使用**单一根元素**

#### 元素类型

* DOM 元素
* 组件元素

对应规则是 HTML 标签首字母是否为小写字母，其中小写首字母对应 DOM 元素，而组件元素自然对应大写首字母。

JSX 还可以通过命名空间的方式使用组件元素，以解决组件相同名称冲突的问题，或是对一组组件进行归类。

特殊标签：注释 和 DOCTYPE。

#### 元素属性

* class 属性 => className
* for 属性 => htmlFor

而组件元素的属性是完全自定义的属性，也可以理解为实现组件所需要的参数。 

**Boolean属性**

省略 Boolean 属性值会导致 JSX 认为 bool 值设为了 true。要传 false 时，必须使用属性表 达式。这常用于表单元素中，比如 disabled、required、checked 和 readOnly 等。 

```jsx
// bad
<Checkbox checked={true}/>

// better
<Checkbox checked/>
```

**自定义 HTML 属性**

如果在 JSX 中往 DOM 元素中传入自定义属性，React 是不会渲染的。

```jsx
<div d="xxx">content</div>
```

如果要使用 HTML 自定义属性，要使用 data- 前缀，这与 HTML 标准也是一致 。

```jsx
<div data-attr="xxx">content</div>
```

 然而，在自定义标签中任意的属性都是被支持的。

```jsx
<x-my-component custom-attr="foo" />
```

以 `aria-` 开头的网络无障碍属性同样可以正常使用。

```jsx
<div aria-hidden={true}></div>
```

#### JavaScript 属性表达式

属性值要使用表达式，只要用 `{}` 替换 `""` 即可。

#### HTML 转义

React 会将所有要显示到 DOM 的字符串转义，防止 XSS。所以，如果 JSX 中含有转义后的实体字符，比如 `&copy;`（©），则最后 DOM 中不会正确显示，因为 React 自动把 `&copy;` 中的特 殊字符转义了。 

有几种解决方案：

* 直接使用 UTF-8 字符 
* 使用对应字符的 Unicode 编码查询编码 
* 使用数组组装 `<div>{['cc ', <span>&copy;</span>, ' 2015']}</div>`
* 直接插入原始的 HTML  

此外，React 提供了 `dangerouslySetInnerHTML` 属性。正如其名，它的作用就是避免 React 转 义字符，在确定必要的情况下可以使用它。

```jsx
<div dangerouslySetInnerHTML={{__html: 'cc &copy; 2015'}} />
```

### 安全性

**避免XSS注入攻击**

最后需要提及的是，React 中 JSX 能够帮我们自动防护部分 XSS 攻击，譬如我们常见的需要将用户输入的内容再呈现出来：

```jsx
const title = response.potentiallyMaliciousInput;
// This is safe:
const element = <h1>{title}</h1>;
```

在标准的 HTML 中，如果我们不对用户输入作任何的过滤，那么当用户输入 `<script>alert(1)<script/>` 这样的可执行代码之后，就存在被 XSS 攻击的危险。而 React 在实际渲染之前会帮我们自动过滤掉嵌入在 JSX 中的危险代码，将所有的输入进行编码，保证其为纯字符串之后再进行渲染。不过这种安全过滤有时候也会对我们造成不便，譬如如果我们需要使用 `&copy;` 这样的实体字符时，React 会自动将其转移最后导致无法正确渲染，我们可以寻找如下几种解决方法：

- 直接使用 UTF-8 字符或者使用对应字符的 Unicode 编码
- 使用数组封装
- 直接插入原始的 HTML，React 为我们提供了 dangerouslySetInnerHTML 属性，其类似于 DOM 的 innerHTML 属性，允许我们声明强制插入 HTML 代码

```jsx
function createMarkup() {
  return {__html: 'First &middot; Second'};
}

function MyComponent() {
  return <div dangerouslySetInnerHTML={createMarkup()} />;
}
```

---

深入研究：

- [ React官方文档：JSX简介(英文版)](https://facebook.github.io/jsx/)

- [React官方文档：深入 JSX(英文版)](https://reactjs.org/docs/jsx-in-depth.html)