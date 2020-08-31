---
nav:
  title: 基础
  order: 1
group:
  title: 进阶指引
  order: 2
title: 事件机制
order: 3
---

# 事件机制

React 基于 Virtual DOM 实现了一个 SyntheticEvent（合成事件）层，我们所定义的事件处理器会接收到一个 SyntheticEvent 对象的实例。所有事件都会自动绑定到最外层上。如果需要访问原生事件对象，可以使用 `nativeEvent` 属性。

> React 根据 [W3C 规范](https://www.w3.org/TR/DOM-Level-3-Events/) 来定义这些合成事件，所以不必担心跨浏览器的兼容性问题

## 绑定方式

- 驼峰形式书写事件属性名
- `props` 值为函数的指针而非字符串

## 实现机制

在 React 底层，主要对合成事件做了两件事：**事件委派** 和 **自动绑定**。

### 事件委派

React 事件代理机制。

它并不会把事件处理函数直接绑定到真实的节点上，而是把所有事件绑定到 **结构的最外层**，使用一个统一的 **事件监听器**，这个事件监听器上维持了一个映射来保存所有组件内部的事件监听和处理函数。当组件挂载或卸载时，只是在这个统一的事件监听器上插入或删除一些对象；当事件发生时，首先被这个统一的事件监听器处理，然后在映射里找到真正的事件处理函数并调用。这样做简化了事件处理和回收机制，效率也有很大提升。

### 自动绑定

在 React 组件中，每个方法的上下文都会指向该组件的实例，即自动绑定 `this` 为当前组件。 而且 React 还会对这种引用进行缓存，以达到 CPU 和内存的最优化。在使用 ES6 Class 或者纯函数时，这种自动绑定就不复存在了，我们需要手动实现 `this` 的绑定。

#### bind 方法

这个方法可以帮助我们绑定事件处理器内的 `this` ，并可以向事件处理器中传递参数 。

```jsx | pure
import React, { Component } from 'react';

class App extends Component {
  handleClick(e, arg) {
    console.log(e, arg);
  }
  render() {
    return <button onClick={this.handleClick.bind(this, 'test')}>Test</button>;
  }
}
```

**双冒号语法**

stage0 草案中提供了一个便捷的方案——双冒号语法。

```jsx | pure
import React, { Component } from 'react';

class App extends Component {
  handleClick(e, arg) {
    console.log(e, arg);
  }
  render() {
    return <button onClick={::this.handleClick}>Test</button>;
  }
}
```

#### 构造器内声明

在组件的构造器内完成了 `this` 的绑定，这种绑定方式的好处在于仅需要进行一次绑定，而不需要每次调用事件监听器时去执行绑定操作。

```jsx | pure
import React, { Component } from 'react';

class App extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e, arg) {
    console.log(e, arg);
  }
  render() {
    return <button onClick={this.handleClick}>Test</button>;
  }
}
```

#### 箭头函数

箭头函数不仅是函数的“语法糖”，它还自动绑定了定义此函数作用域的 `this`， 因此我们不需要再对它使用 `bind`方法。

```jsx | pure
import React, { Component } from 'react';

class App extends Component {
  // 属性初始化器语法 public class fields syntax
  handleClick = e => {
    console.log(e);
  };
  render() {
    return <button onClick={this.handleClick}>Test</button>;
  }
}
```

不推荐下列这种写法，每次重新渲染会重新声明新的函数，对于子组件为 `PureComponent` 达不到预期效果。

```js
import React, { Component } from 'react';

class App extends Component {
  handleClick(e) {
    console.log(e);
  }
  render() {
    return <button onClick={() => this.handleClick()}>Test</button>;
  }
}
```

## 原生事件

通过生命周期函数 `componentDidMount` 可在组件装载成功并在浏览器拥有真实 DOM 后调用，以此来完成原生事件的绑定。

```js
import React from 'react';

class NativeEventDemo extends React.Component {
  constructor(props) {
    super(props);

    this.buttonRef = React.createRef();
  }
  componentDidMount() {
    this.buttonRef.addEventListener('click', e => {
      this.handleClick(e);
    });
  }
  componentWillUnmount() {
    this.buttonRef.removeEventListener('click');
  }
  handleClick(e) {
    console.log(e);
  }
  render() {
    return <button ref={this.buttonRef}>Test</button>;
  }
}
```

得注意的是，在 React 中使用 DOM 原生事件时，一定要在组件卸载时手动移除，否则很可能出现内存泄漏的问题。而使用合成事件系统时则不需要，因为 React 内部已经帮你妥善地处理了。

## 合成事件与原生事件混用

```jsx | pure
import React, { Component } from 'react';

class QrCode extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleClickQr = this.handleClickQr.bind(this);

    this.state = {
      active: false,
    };
  }
  componentDidMount() {
    document.body.addEvenetListener('click', e => {
      this.setState({
        active: false,
      });
    });
    document.querySelector('.code').addEventListener('clicl', e => {
      e.stopPropagation();
    });
  }
  componentWillUnmount() {
    document.body.removeEventListener('click');
    document.querySelector('.code').removeEventListener('click');
  }
  handleClick() {
    this.setState({
      active: !this.state.active,
    });
  }
  handleClickQr(e) {
    e.stopPropagation();
  }
  render() {
    return (
      <div className="qr-wrapper">
        <button className="qr" onClick={this.handleClick}>
          二维码
        </button>
        <div
          className="code"
          style={{ display: this.state.active ? 'block' : 'none' }}
          onClick={this.handleClickQr}
        >
          <img src="qr.jpg" alt="qr" />
        </div>
      </div>
    );
  }
}
```

⚠️ **注意**：

- 避免在 React 中混用合成事件和原生 DOM 事件。
- 另外，用 `reactEvent.nativeEvent. stopPropagation()` 来阻止冒泡是不行的。阻止 React 事件冒泡的行为只能用于 React 合成事件系统中，且没办法阻止原生事件的冒泡。反之，在原生事件中的阻止冒泡行为，却可以阻止 React 合成事件的传播。

实际上，React 的合成事件系统只是原生 DOM 事件系统的一个子集。它仅仅实现了 DOM Level 3 的事件接口，并且统一了浏览器间的兼容问题。有些事件 React 并没有实现，或者受某些限制没办法去实现，比如 `window` 的 `resize` 事件。

## 对比合成事件与原生事件

从四个维度对比 React 合成事件与 JavaScript 原生事件。

### 事件传播与阻止事件传播

浏览器原生 DOM 事件的传播可以分为 3 个阶段：

- 事件捕获阶段
- 目标对象本身的事件处理程序调用
- 事件冒泡阶段

事件捕获会优先调用结构树最外层的元素上绑定的事件监听器，然后依次向内调用，一直调用到目标元素上的事件监听器为止。可以在将 `e.addEventListener()` 的第三个参数设置为 true 时，为元素 e 注册捕获事件处理程序，并且在事件传播的第一个阶段调用。 此外，事件捕获并不是一个通用的技术，在低于 IE9 版本的浏览器中无法使用。而事件冒泡则与事件捕获的表现相反，它会从目标元素向外传播事件，由内而外直到最外层。

可以看出，事件捕获在程序开发中的意义并不大，更致命的是它的兼容性问题。所以，React 的合成事件则并没有实现事件捕获，**仅仅支持了事件冒泡机制**。这种 API 设计方式统一而简洁， 符合「二八原则」。

阻止原生事件传播需要使用 `e.preventDefault()`，不过对于不支持该方法的浏览器（IE9 以 下），只能使用 `e.cancelBubble = true` 来阻止。而在 React 合成事件中，只需要使用 `e.preventDefault()` 即可。

### 事件类型

React 合成事件的事件类型是 JavaScript 原生事件类型的一个子集。

### 事件绑定方式

受到 DOM 标准的影响，绑定浏览器原生事件的方式也有很多种。

- 直接在 DOM 元素中绑定：`<button onclick="alert(1);">Test</button>`
- 为元素事件属性赋值方式：`el.onclick = e => { console.log(e) }`
- 事件监听函数实现绑定：`el.addEventListener('click', () => {}, false)`

React 合成事件的绑定方式：

```js
<button onClick={this.handleClick}>Test</button>
```

### 事件对象

原生 DOM 事件对象在 W3C 标准和 IE 标准下存在着差异。在低版本的 IE 浏览器中，只能使用 `window.event` 来获取事件对象。

而在 React 合成事件系统中，不存在这种兼容性问题，在事件处理函数中可以得到一个合成事件对象。

## 阻止合成事件冒泡

- 阻止合成事件间的冒泡：`e.stopPropagation()`
- 阻止合成事件与最外层 `document` 上的事件间的冒泡：`e.nativeEvent.stopImmediatePropagation()`
- 阻止合成事件与除最外层 `document` 上的原生事件上的冒泡，需要通过 `e.target` 判断

```jsx | pure
componentDidMount() {
    document.body.addEventListener('click', e => {
        if (e.target && e.target.matches('div.code')) {
            return
        }
        this.setState({ active: false })
    })
}
```

---

**参考资料：**

- [源码看 React 事件机制](https://segmentfault.com/a/1190000011413181)
- [React 事件机制](https://www.jianshu.com/p/c01756e520c7)
