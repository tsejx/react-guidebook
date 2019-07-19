# Render Props

> 🚧 施工中，未完成

> The term “render prop” refers to a simple technique for sharing code between React components using a prop whose value is a function.

渲染属性（Render Props）指一种在 React 组件之间使用一个值为函数的 Props 在 React 组件间共享代码的简单技术。

本质上只是将一个方法传递给组件，而一般会给组件传递的内容都是传递的值，例如：Object、Array、String、Number、Boolean 等。而有些情况下，可能需要在组件间传递共用方法来实现代码的复用，不过这种情况下传递的就是一个纯粹的方法，比如父组件传递一个 function 给子组件，然后子组件去触发，实现代码的复用或事件的冒泡。

而 render prop 则是传递一个渲染逻辑给子组件，带有 render prop 的组件，并不是自己的实现的渲染逻辑，而是通过 props 传递实现的渲染逻辑，而这个渲染逻辑是由 render props 方法完成的。

```jsx
<DataProvider render={data => <h1>Hello {data.target}</h1>} />
```

使用 render props 的库包括 [React Router](https://reacttraining.com/react-router/web/api/Route/Route-render-methods) 和 [Downshift](https://github.com/paypal/downshift)

### 交叉关注点

Render Props 是一个组件用来了解要渲染什么内容的函数 Prop。这一技术使得共享代码间变得相当便利。

关于 Render Props 一个有趣的事情是你可以使用一个带有 Render Props 的常规组件来实现大量的高阶组件（HOC）。

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

// 与 HOC 不同，我们可以使用具有 render prop 的普通组件来共享代码
class Mouse extends React.Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
  };

  state = { x: 0, y: 0 };

  handleMouseMove = event => {
    this.setState({
      x: event.clientX,
      y: event.clientY,
    });
  };

  render() {
    return (
      <div style={{ height: '100%' }} onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    );
  }
}

const App = React.createClass({
  render() {
    return (
      <div style={{ height: '100%' }}>
        <Mouse
          render={({ x, y }) => (
            // render prop 给了我们所需要的 state 来渲染我们想要的
            <h1>
              The mouse position is ({x}, {y})
            </h1>
          )}
        />
      </div>
    );
  },
});

ReactDOM.render(<App />, document.getElementById('app'));
```

这里需要明确的概念是，`<Mouse>` 组件实际上是调用了它的 `render` 方法来将它的 State 暴露给 `<App>` 组件。因此，`<App>` 可以随便按自己的想法使用这个 State。

该技术规避了所有 mixin 和 HOC 会面对的问题：

- **ES6 Class**：不成问题，我们可以在 ES6 class 创建的组件中使用 Render Props。
- **不够直接**：我们不必再担心 State 或者 Props 来自哪里。我们可以看到通过 Render Prop 的参数列表看到有哪些 State 或者 Props 可供使用。
- **命名冲突**：现在不会有任何的自动属性名称合并，因此，命名冲突将无可乘之机。

---

**参考资料：**

- [[译] 使用 Render Props 吧！](https://juejin.im/post/5a3087746fb9a0450c4963a5)
