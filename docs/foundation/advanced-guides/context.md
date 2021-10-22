---
nav:
  title: 基础
  order: 1
group:
  title: 进阶指引
  order: 2
title: Context
order: 7
---

# Context

Context 提供了一个无需为每层组件手动添加 `props`，就能在组件树间进行数据传递的方法。

在典型的 React 应用中，数据是通过 `props` 属性自上而下（由父及子）进行传递的，但这种做法对于某些类型的属性而言是极其繁琐的（例如：地区偏好、UI 主题），这些属性是应用程序中许多组件都需要。Context 提供了一种在组件之间共享此类值的方式，而不必显式地通过组件树的逐层传递 `props`。

## 应用场景

Context 主要应用场景在于很多不同层级的组件需要访问同样一些的数据。请谨慎使用，因为这会使得组件的复用性变差。

对于**全局、不常修改的数据共享**，就比较适合用 Context API 来实现。

- 当前认证的用户
- 主题方案
- 首选语言

除了业务场景外，很多 React 相关的功能库也是使用 Context API 实现：

- [React Redux](https://github.com/reduxjs/react-redux)：`<Provider>` 组件，通过 Context 提供一个全局态的 `store`
- [React Router](https://github.com/ReactTraining/react-router)：路由组件，通过 Context 管理路由状态
- [react-dnd](https://github.com/react-dnd/react-dnd)：拖拽组件，通过 Context 在组件中分发 DOM 的 drag 和 drop 事件

## 最佳实践

### 动态 Context

使用动态值（dynamic values）后更复杂的用法：

<code src="../../../example/context-dynamic/index" />

### 嵌套组件

从一个在组件树中嵌套很深的组件中更新 Context 是很有必要的。在这种场景下，你可以通过 context 传递一个函数，使得 `<Cosumer>` 组件更新 context：

<code src="../../../example/context-nested/index" />

### 消费多个 Context

为了确保 context 快速进行重渲染，React 需要使每一个 consumers 组件的 context 在组件树中称为一个单独的节点。

<code src="../../../example/context-multi-consumer/index" />

那么看了上面的例子，我们是否可以直接使用 Context API 来代替掉所有的数据传递，包括去掉 Redux 这些数据同步 library 了？其实并不合适。前面也有提到，Context API 应该用于需要全局共享数据的场景，并且数据最好是不用频繁更改的。因为作为上层存在的 Context，在数据变化时，容易导致所有涉及的 Consumer 重新 render。

## 注意事项

因为 context 会使用参考标识（reference identity）来决定何时进行渲染，这里可能会有一些陷阱，当 `<Provider>` 的父组件进行重渲染时，可能会在 `<Consumer>` 组件中触发意外的渲染。举个例子，当每次 `<Provider>` 重渲染时，以下的代码会重渲染所有下面的 `<Consumer>` 组件，因为 `value` 属性总是被赋值为新的对象。

```jsx | pure
class App extends React.Component {
  render() {
    return (
      <MyContext.Provider value={{ something: 'something' }}>
        <Toolbar />
      </MyContext.Provider>
    );
  }
}
```

为了防止这种情况，将 `value` 状态提升到父节点的 `state` 里：

```jsx | pure
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: { something: 'something' },
    };
  }
  render() {
    return (
      <Provider value={this.state.value}>
        <Toolbar />
      </Provider>
    );
  }
}
```

## 实现原理

`<Provider>` 组件源码的实现。

```jsx | pure
export function createProvider(storeKey = 'store', subKey) {
  const subscriptionKey = subKey || `${storeKey}Subscription`;

  class Provider extends Component {
    getChildContext() {
      return { [storeKey]: this[storeKey], [subscriptionKey]: null };
    }

    constructor(props, context) {
      super(props, context);
      this[storeKey] = props.store;
    }

    render() {
      return Children.only(this.props.children);
    }
  }

  // ......

  Provider.propTypes = {
    store: storeShape.isRequired,
    children: PropTypes.element.isRequired,
  };
  Provider.childContextTypes = {
    [storeKey]: storeShape.isRequired,
    [subscriptionKey]: subscriptionShape,
  };

  return Provider;
}

export default createProvider();
```

根组件用 `<Provider>` 组件包裹后，本质上就为 App 提供了一个全局的属性 store，相当于在整个 App 范围内，共享 store 属性。当然，`<Provider>` 组件也可以包裹在其他组件中，在组件级的全局范围内共享 s tore。

## 参考资料

- [📖 React 官方文档：Context](https://zh-hans.reactjs.org/docs/context.html)
- [📝 聊一聊我对 React Context 的理解以及应用](https://juejin.im/post/5a90e0545188257a63112977)
- [📝 QQ 音乐：React v16 新特性实践](https://juejin.im/post/5b2236016fb9a00e9c47cb6b)
