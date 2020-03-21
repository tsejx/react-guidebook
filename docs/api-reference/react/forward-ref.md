---
nav:
  title: API
  order: 3
group:
  title: React
  order: 1
title: React.forwardRef
order: 10
---

# React.forwardRef

> ✨ 适用于 React v16.3+

`React.forwardRef` 用于将父组件创建的 `ref` 引用关联到子组件中的任意元素上。也可以理解为子组件向父组件暴露 DOM 引用。

除此之外，因为 `ref` 是为了获取某个节点的实例，但是函数式组件是没有实例的，不存在 `this` 的，这种时候是拿不到函数式组件的 `ref` 的，而 `React.forwardRef` 也能解决这个问题。

## 适用场景

- 获取深层次子孙组件的 DOM 元素
- 获取直接 ref 引用的子组件为非 class 声明的函数式组件
- 传递 `Refs` 到高阶组件

⚠️ 注意与 `React.createRef` 的对比

## 使用方法

`React.forwardRef` 接受 **渲染函数** 作为参数。React 将使用 `props` 和 `ref` 作为参数来调用此函数。此函数应返回 React 节点。

🌰 **示例：**

```jsx | pure
const FancyButton = React.forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
));

// 现在你可以直接获取 DOM 按钮的 ref 了
const ref = React.createRef();

export default <FancyButton ref={ref}>Click me!</FancyButton>;
```

**实现过程：**

1. 通过 `React.createRef()` 创建 `ref` 变量，然后在 子组件（`FancyButton`）属性中通过 `ref={ref}` 的方式把这个 `ref` 和组件关联起来。
2. 目前为止，如果子组件（`FancyButton`）是一个通过 Class 或者函数声明的组件，那么就到此为止，我们可以说 `ref` 变量的 `current` 属性持有对子组件（`FancyButton`）实例的引用。
3. 但是，子组件（`FancyButton`）经过了 `React.fowardRef()` 的处理，这个 API 接受两个参数，第二个参数就是 `ref`，然后把 `ref` 绑定在 DOM 元素上（button），这样 `ref.current` 的引用就是 DOM 元素（button）。

**注意事项：**

- 只在使用 `React.forwardRef` 定义组件时，第二个参数 `ref` 才存在
- 在项目中组件库中尽量不要使用 `React.forwardRef`，因为它可能会导致子组件被破坏性更改
- 函数组件和 class 组件均不接收 `ref` 参数，即 `props` 中不存在 `ref`，`ref` 必须独立 `props` 出来，否则会被 React 特殊处理掉

## 使用说明

ForwardRef API 充当传递者角色，实际上是容器组件，能够辅助简化嵌套组件、Component 至 Element 间的 `ref` 传递，能有效避免 `this.ref.ref.ref` 的问题。向前传递，这就是叫 `forwardRef` 的原因。

需要注意的是，使用 `forwardRef` 时，该组件必须是函数式组件。原因可能是 React 不想破坏 Class 组件的参考体系。

> 🖍 与之前提及的获取组件 `ref` 不能使用函数式组件的区别在哪？

两者有着本质区别，这里获取的依然是 DOM 元素，只不过 **跨级** 了。

- `React.createRef`：绑定子组件容器（最外层 DOM 元素）

```jsx | pure
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

- `React.forwardRef`：父组件创建绑定子孙组件 DOM 元素

```js
import React, { forwardRef } from 'react';

const Search = forwardRef((props, ref) => <input type="text" ref={ref} />);

export default Search;
```

事实上，一旦被 `forwardRef` 包裹的子组件接收到了 `ref` 参数，它可以继续将 `ref` 往下传递。

之后 `ref` 就变成了一个普通的 `props`，直到它被挂载到某个 DOM 元素的 `ref` 属性上。

其实 `ref` 回调也是可以 **跨多级** 传递的，原理同上。

```jsx | pure
import React, { Component, createRef } from 'react';

class Input extends Component {
  render() {
    return <input type="text" ref={this.props.inputRef} />;
  }
}

const Search = forwardRef((props, ref) => <Input inputRef={ref} />);

class App extends Component {
  textInput = createRef();

  render() {
    return <Search ref={this.textInput} />;
  }
}

export default App;
```

## 高频用法

常在高阶组件中使用 `React.forwardRef`

```jsx | pure
function enhance(WrappedComponent) {
  class Enhance extends React.Component {
    render() {
      const { forwardRef, ...restProps } = this.props;
      // 将定义的 prop 属性 forwardRef 定义为 ref
      return <WrappedComponent ref={forwardedRef} {...restProps} />;
    }
  }
  // 注意 React.forwardRef 回调的第二个参数 ref
  // 我们可以将其作为常规 prop 属性传递给 Enhance，例如 forwardedRef
  // 然后它就可以被挂载到被 Enhance 包裹的子组件上
  return React.forwardRef((props, ref) => <Enhance {...props} forwardedRef={ref} />);
}

// 子组件
class MyComponent extends React.Component {
  render(){
    return (
      <input type='text' />
    )
  }
}

// EnhancedComponent 会渲染一个高阶组件 enhance(MyComponent)
const EnhancedComponent = enhance(MyComponent);

const ref = React.createRef();

// 我们导入的 EnahcnedComponent 组件是高阶组件（HOC）Enhance
// 通过 React.forward 将 ref 将指向了 Enhance 内部的 MyComponent 组件
// 这意味着我们可以直接调用 ref.current.focus() 方法
<EnhancedComponent label="Click Me" handleClick={handleClick} ref={ref} />;
```

## 源码解读

```js
export default function forwardRef<Props, ElementType: React$ElementType>(
  render: (props: Props, ref: React$Ref<ElementType>) => React$Node
) {
  if (__DEV__) {
    if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
      warningWithoutStack(
        false,
        'forwardRef requires a render function but received a `memo` ' +
          'component. Instead of forwardRef(memo(...)), use ' +
          'memo(forwardRef(...)).'
      );
    } else if (typeof render !== 'function') {
      warningWithoutStack(
        false,
        'forwardRef requires a render function but was given %s.',
        render === null ? 'null' : typeof render
      );
    } else {
      warningWithoutStack(
        // Do not warn for 0 arguments because it could be due to usage of the 'arguments' object
        render.length === 0 || render.length === 2,
        'forwardRef render functions accept exactly two parameters: props and ref. %s',
        render.length === 1
          ? 'Did you forget to use the ref parameter?'
          : 'Any additional parameter will be undefined.'
      );
    }

    if (render != null) {
      warningWithoutStack(
        render.defaultProps == null && render.propTypes == null,
        'forwardRef render functions do not support propTypes or defaultProps. ' +
          'Did you accidentally pass a React component?'
      );
    }
  }

  /**
   * REACT_FORWARD_REF_TYPE 并不是 React.forwardRef 创建的实例的 $$typeof
   * React.forwardRef 返回的是一个对象，而 ref 是通过实例的参数形式传递进去的，
   * 实际上，React.forwardRef 返回的是一个 ReactElement，它的 $$typeof 也就是 REACT_ELEMENT_TYPE
   * 而 返回的对象 是作为 ReactElement 的 type 存在
   */
  return {
    // 返回一个对象
    $$typeof: REACT_FORWARD_REF_TYPE, // 并不是 React.forwardRef 创建的实例的 $$typeof
    render, // 函数组件
  };
}
```
