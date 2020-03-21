---
nav:
  title: 基础
  order: 1
group:
  title: 基础概念
  order: 1
title: Props
order: 4
---

# Props

Props 的主要作用是让使用该组件的父组件可以传入参数来配置该组件。它是外部传进来的配置参数，组件内部无法控制也无法修改。除非外部组件主动传入新的 Props，否则组件的 Props 永远保持不变。

## 语法原则

你只需要像写 HTML 标签的属性一样，把它写上去，它就传到了子组件的 `this.props` 里面。

不过有几个需要注意的地方：

- 特殊属性 `ref`、`key` 和 `children` 为 React 保留，具有特殊用途，并不会传给子组件
- 如果只给属性不给值，React 会默认解析成布尔值 `true`
- 除了字符串，其他值都要用花括号包裹
- 如果你把属性给了标签而不是子组件，React 并不会解析
- 属性名驼峰写法
- 特殊值

```jsx | pure
import React, { Component, createRef } from 'react';
import Child from './Child';

class App extends Component {
  isPopular = false;
  refNode = createRef();

  render() {
    return [
      // 特殊属性 key 和 ref 为保留属性
      // 如果只给属性不给值，React 会默认解析成布尔值 `true`
      <Child key="react" ref={this.refNode} isPopular />,
      // 除了字符串，其他值都要用花括号包裹
      <Child key="vue" url="https://github.com/vuejs/vue" star={96500} />,
      <Child key="angular" owner="google" isPopular={this.isPopular} />,
      // 属性名驼峰写法
      <input type="text" tabIndex={-1} />,
    ];
  }
}

export default App;
```

## 不可变属性

无论是使用函数或事类来声明一个组件，它都不能修改它自己的 Props。

```js
function sum(a, b) {
  return a + b;
}
```

类似上面的这种函数称为 **纯函数**。

纯函数具有几个特点：

- 给定相同的输入，总是会返回相同的输出
- 过程没有副作用
- 不依赖外部状态

React 是非常灵活的，但它也有一个严格的规则：**所有的 React 组件必须像纯函数那样使用它们的 props。**

如果 Props 渲染过程中可以被修改，那么就会导致这个组件显示形态和行为变得不可预测，这样会可能会给组件使用者带来困惑。

但这并不意味着 Props 决定的显示形态不能被修改。组件的使用者可以主动地通过重新渲染的方式把新的 Props 传入组件当中名，这样这个组件中由 Props 决定的显示形态也会得到相应的改变。

## 默认值

Props 的默认值 `defaultProps` 定义在类上。

目前 React 推崇使用 ES6 Class 语法创建组件，因此其内部只允许定义方法，而不能定义属性，Class 的属性只能定义在 Class 之外。

```js
class Foo extends React.Component {
  render() {
    return <div>{this.props.bar}</div>;
  }
}

Foo.defaultProps = {
  bar: 'Hello world!',
};
```

---

**参考资料：**

- [📝 深入理解 Props](https://blog.csdn.net/u013451157/article/details/78728213)
