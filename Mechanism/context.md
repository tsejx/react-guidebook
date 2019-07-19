# Context

> 🚧 施工中，未完成

使用 Context API 可以更方便地在组件中传递和共享某些全局数据，这是为了解决以往组件间共享公共数据需要通过多余的 Props 进行层层传递的问题（Props Drilling）。

## 适用场景

Context 主要应用场景在于很多不同层级的组件需要访问同样一些的数据。请谨慎使用，因为这会使得组件的复用性变差。

对于**全局、不常修改的数据共享**，就比较适合用 Context API 来实现。

- 当前认证的用户
- 主题方案
- 首选语言

除了业务场景外，很多 React 相关的功能库也是使用 Context API 实现：

- React Redux：`<Provider>` 组件，通过 Context 提供一个全局态的 `store`
- React Router：路由组件，通过 Context 管理路由状态
- react-dnd：拖拽组件，通过 Context 在组件中分发 DOM 的 drag 和 drop 事件

## 使用方法

首先第一步，类似 store，我们可以先创建一个 Context，并加入默认值。

然后在组件树顶层通过 Context 的 Provider 向组件树提供 Context 的访问。这里可以通过传入 value 修改 Context 中的数据，当 value 变化的时候，涉及的 Consumer 内整个内容将重新 render。

```jsx
// 首先，通过 React.createContext 创建 Context，并加入默认值
const LangContext = React.createContext({
  title: 'Hello world!',
});

class App extends React.Component {
  render() {
    return (
      // 使用 Provider 来将创建的 Context 传递给子组件树
      // 无论层级多深，任何组件都能读到这个值
      <LangContext.Provider value={this.state.lang}>
        <Head />
      </LangContext.Provider>
    );
  }
}
```

在需要使用数据的地方，直接用 Context.Consumer 包裹，里面可以传入一个 render 函数，执行时从中取得 Context 的数据。

```jsx
const HeadTitle = props => {
  return <LangContext.Consumer>{lang => <Text>{lang.title}</Text>}</LangContext.Consumer>;
};
```

之后的中间组件也不再需要层层传递了，少了很多 Props，减少了中间漏传导致出错，代码也更加清爽。

```jsx
// 中间组件
const Head = () => {
  return (
    <div>
      <HeadTitle />
    </div>
  );
};
```

更多更复杂使用示例参考[官方文档](https://zh-hans.reactjs.org/docs/context.html)，包括：

- 动态 Context
- 在嵌套组件中更新 Context
- 使用多个 Context

那么看了上面的例子，我们是否可以直接使用 Context API 来代替掉所有的数据传递，包括去掉 Redux 这些数据同步 library 了？其实并不合适。前面也有提到，Context API 应该用于需要全局共享数据的场景，并且数据最好是不用频繁更改的。因为作为上层存在的 Context，在数据变化时，容易导致所有涉及的 Consumer 重新 render。

## 实现原理

`<Provider>` 组件源码的实现。

```js
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

---

**参考资料：**

- [📖 React 官方文档：Context](https://zh-hans.reactjs.org/docs/context.html)
- [📝 聊一聊我对 React Context 的理解以及应用](https://juejin.im/post/5a90e0545188257a63112977)
- [📝 QQ 音乐：React v16 新特性实践](https://juejin.im/post/5b2236016fb9a00e9c47cb6b)
