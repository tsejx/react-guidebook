# Refs

> 🚧 施工中，未完成

Refs 用于访问在渲染周期函数中创建的 DOM 节点或 React 元素。

🎉 **常用场景**：管理焦点、文本选择、媒体回放；触发必要动画；整合第三方 DOM 库。

⚠️ **注意事项**：避免对任何可以声明式解决的问题使用 Refs！

change ref

set ref

delete ref

- 当两个虚拟 DOM 的 ref 不同时，就会触发 change ref，这会在 did.xx 之前
- set ref 也在 did.xx 之后，当一个组件被移除，他的虚拟 DOM 恰好有 ref
- 那么它在 willUnmount 之前 getDerivedStateFromProps 与 componentDidCatch 钩子不齐同，漏了 三大 willXXX 钩子与 getXXX 一直共存着的

推出**createRef**与**forwardRef** (抄自 angular2), 这是解决 refs 对象的原罪。React 会产生元素节点，但如果获得元素节点的引用是一个难题，于是推出了`string ref`与`function ref`。string ref 有重大缺点，一个 div 需要知道是哪个组件 render 了自己，于是内部就有一个叫 currentOwner 的全局对象，每当组件实例化后，就把实例放到这上面，当下面的 div, span 在执行`React.createElement(div/span, props, ...children)`时， currentOwner 会神不知鬼不觉到混进内部，作为 ReactElement 的第 6 个参数\_owner。React.createElement 只是 ReactElement 的外壳，一个加工厂，ReactElement 的返回值才是我们熟悉的虚拟 DOM 。但 currentOwner.current 会改来改去，并且针对一些恶心情况做了许多补丁。随着 React 以后会考虑 WebWorker 方式进行更新，这全局的东西肯定是障碍。于是有了 createRef，返回一个`object ref`，直接能拿到引用，它能早于组件诞生，方便用户操作。forwardRef 是用来指定 object ref 的活动范围。当然这东西与 HOC 也有关，这个有机会也再分享详述。总之，ref 与 context 一样，从组件中解耦出来。

https://zhuanlan.zhihu.com/p/34604934

### this.refs

> 🗑 该 API 在未来版本将被废弃

在 React v16.3 之前，ref 通过字符串或者回调函数的形式进行获取。

在 DOM 元素上传入值为字符串的 ref 属性，开发者就可以获得该 DOM 元素的引用，可以通过 `this.refs` 对象获取对应的 DOM 元素引用。

既然是获取 DOM 元素的引用，那可定要等组件挂载完成才能操作。

目前 React 已经不推荐这种写法。主要原因是耗费性能，因为 UI 需要经历多次更新，而字符串引用无法自动跟踪 DOM 的变化，React 要做额外的处理。

```jsx
import React from 'react';

class App extends React.Component {
  componentDidMount() {
    this.refs.textInput.focus();
  }
  render() {
    return <input type="text" ref="textInput" />;
  }
}

export default App;
```

### callback

React 还支持用一个回调接收 DOM 元素的引用。

但是记住，回调不可以写成 `el => this.refs.textInput = el`，因为 `this.refs` 是不可以直接进行写操作的。

```jsx
import React, { Component } from 'react';

class App extends Component {
  componentDidMount() {
    this.textInput.focus();
  }

  render() {
    return <input type="text" ref={ref => (this.textInput = ref)} />;
  }
}

export default App;
```

父组件可以通过 Props 给子组件传递 `ref` 的回调函数获取子组件某个 DOM 元素的引用。

一旦子组件挂载完毕，就会执行 `ref` 回调，父组件就得到该子组件某个 DOM 元素的引用。

```jsx
import React, { Component } from 'react';
import Search from './Search';

class App extends Component {
  getInputRef(ref) {
    this.node = ref;
  }
  render() {
    return <Search ref={this.getInputRef} />;
  }
}

export default App;
```

```jsx
import React from 'react';

const Search = props => <input type="text" ref={props.getInputRef} />;

export default Search;
```

### CreateRef

CreateRef API 的作用是创建一个 ref 对象。先把 `createRef` 的执行结果返回给一个实例属性，然后通过该实例属性获得 DOM 元素的引用。

❓ **与之前提及的两种创建方式的区别是什么？**

使用 String 的方式比较局限，不方便于多组件间的传递或动态获取。而使用 Callback 方法是之前比较推荐的方法。但是写起来略显麻烦，而且 Update 过程中有发生清除可能会有多次调用（Callback 收到 `null`）。

💡 **注意事项**：

- `createRef` 初始化动作要在组件挂载之前，如果是挂载之后初始化，则无法得到 DOM 元素的引用
- 真正的 DOM 元素引用在 `current` 属性上

```jsx
import React, { Component, createRef } from 'react';

class App extends Component {
  textInput = createRef();

  componentDidMount() {
    this.textInput.current.focus();
  }

  render() {
    return <input type="text" ref={this.textInput} />;
  }
}

export default App;
```

出于不可描述的原因，如果你想获取一个子组件的 ref 引用，那么子组件必须是 Class 组件。

因为你获取的实际上是子组件的实例，而函数式组件是没有实例的。

所有获取 ref 引用的方式，如果想要获取子组件而不是 DOM 元素，子组件都不能是函数式组件。

```jsx
import React, { Component, createRef } from 'react';
import Child from './Child';

class App extends Component {
  childRef = createRef();

  render() {
    return <Child ref={this.childRef} />;
  }
}

export default App;
```

### ForwardRef

ForwardRef API 充当传递者角色，实际上是容器组件，能够辅助简化嵌套组件、Component 至 Element 间的 `ref` 传递，能有效避免 `this.ref.ref.ref` 的问题。向前传递，这就是叫 `forwardRef` 的原因。

需要注意的是，使用 `forwardRef` 时，该组件必须是函数式组件。原因可能是 React 不想破坏 Class 组件的参考体系。

❓ **与之前提及的获取组件 `ref` 不能使用函数式组件的区别在哪？**

两者有着本质区别，这里获取的依然是 DOM 元素，只不过跨级了。

```jsx
import React, { Component } from 'react';
import Search from './Search';

class App extends Component {
  textInput = createRef();

  componentDidMount() {
    this.textInput.current.focus();
  }
  render() {
    return <Search ref={this.textInput} />;
  }
}

export default App;
```

```jsx
import React, { forwardRef } from 'react';

const Search = forwardRef((props, ref) => <input type="text" ref={ref} />);

export default Search;
```

事实上，一旦被 `forwardRef` 包裹的子组件接收到了 ref 参数，它可以继续将 ref 往下传递。

之后 ref 就变成了一个普通的 Props，直到它被挂载到某个 DOM 元素的 ref 属性上。

其实 ref 回调也是可以跨多级传递的，原理同上。

```jsx
import React, { Component, createRef } from 'react';
import Search from './Search';

class App extends Component {
  textInput = createRef();

  render() {
    return <Search ref={this.textInput} />;
  }
}

export default App;
```

```jsx
import React from 'react';
import Input from './Input';

const Search = forwardRef((props, ref) => <Input inputRef={ref} />);

export default Search;
```

```jsx
import React, { Component } from 'react';

class Input extends Component {
  render() {
    return <input type="text" ref={this.props.inputRef} />;
  }
}

export default Input;
```

### 原理机制

React 将会在组件挂载时将 DOM 元素分配给 `current` 属性，并且在组件被卸载时，将 `current` 属性重置为 `null`。`ref` 将会在 `componentDidMount` 和 `componentDidUpdate` 生命中器钩子前被更新。

为防止内存泄漏，当写在一个组件的时候，组件里所有的 Refs 就会变为 `null`。

---

**参考资料：**

- [React ref 的前世今生](https://juejin.im/post/5b59287af265da0f601317e3)
