---
nav:
  title: 基础
  order: 1
group:
  title: 进阶指引
  order: 2
title: Refs
order: 6
---

# Refs

React 的核心思想是每次对于变更 `props` 或 `state`，触发新旧 Virtual DOM 进行 diff（协调算法），对比出变化的地方，然后通过 render 重新渲染界面。

而 Refs 为我们提供了一种绕过状态更新和重新渲染时访问元素的方法，这在某些用例中很有用，但不应该作为 `props` 和 `state` 的替代方法。

在项目开发中，如果我们可以使用声明式或提升 `state` 所在的组件层级（状态提升）的方法来更新组件，最好不要使用 refs。

## 使用场景

- **管理焦点（如文本选择）或处理表单数据**：`refs` 将管理文本框当前焦点选中，或文本框其它属性。

在大多数情况下，我们推荐使用受控组件来处理表单数据。在一个受控组件中，表单数据是由 React 组件来管理，每个状态更新都编写数据处理函数。另一种替代方案是使用非受控组件，这时表单数据将交由 DOM 节点来处理。要编写一个非受控组件，就需要使用 Refs 来从 DOM 节点中获取表单数据。

```jsx | pure
class Form extends React.Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
  }

  handleSubmit = e => {
    console.log('A name was submitted: ' + this.input.current.value);
    e.preventDefault();
  };

  render() {
    return (
      <form onSbumit={this.handleSubmit}>
        <label>
          Name:
          <input type="text" ref={this.input} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
```

因为非受控组件将真实数据储存在 DOM 节点中，所以再使用非受控组件时，有时候反而更容易同时集成 React 和非 React 代码。如果你不介意代码美观性，并且希望快速编写代码，使用非受控组件往往可以减少你的代码量。非欧泽，你应该使用受控组件。

- **媒体播放**：基于 Reac 的音乐或视频播放器可以利用 Refs 来管理其当前状态（播放/咱 ing）。或管理播放进度等。这些更新不需要进行状态管理。

- **触发强制动画**：如果要在元素上触发过强制动画时，可以使用 Refs 来执行此操作

- **集成第三方 DOM 库**

## 实用价值

推出 [createRef](../../api-reference/react/create-ref) 与 [forwardRef](../../api-reference/react/forward-ref), 这是解决 `refs` 对象的原罪。React 会产生元素节点，但如果获得元素节点的引用是一个难题，于是推出了 `string ref` 与 `function ref`。`string ref` 有重大缺点，一个 `div` 需要知道是哪个组件 `render` 了自己，于是内部就有一个叫 `currentOwner` 的全局对象，每当组件实例化后，就把实例放到这上面，当下面的 `div`, `span` 在执行 `React.createElement(div/span, props, ...children)` 时，`currentOwner` 会神不知鬼不觉到混进内部，作为 ReactElement 的第 6 个参数`owner`。React.createElement 只是 `ReactElement` 的外壳，一个加工厂，ReactElement 的返回值才是我们熟悉的虚拟 DOM 。但 `currentOwner.current` 会改来改去，并且针对一些恶心情况做了许多补丁。随着 React 以后会考虑 `WebWorker` 方式进行更新，这全局的东西肯定是障碍。于是有了 `createRef`，返回一个 `object ref`，直接能拿到引用，它能早于组件诞生，方便用户操作。`forwardRef` 是用来指定 `object ref` 的活动范围。当然这东西与 HOC 也有关，这个有机会也再分享详述。总之，`ref` 与 `context` 一样，从组件中解耦出来。

## 注意事项

Refs 用于访问在渲染周期函数中创建的 DOM 节点或 React 元素。

⚠️ **注意事项**：避免对任何可以声明式解决的问题使用 Refs！

- 当两个虚拟 DOM 的 `ref` 不同时，就会触发 `change ref`，这会在 `did.xx` 之前
- `set ref` 也在 `did.xx` 之后，当一个组件被移除，他的虚拟 DOM 恰好有 `ref`
- 那么它在 `willUnmount` 之前 `getDerivedStateFromProps` 与 `componentDidCatch` 钩子不齐同，漏了 三大 `willXXX` 钩子与 `getXXX` 一直共存着的

为防止内存泄漏，当写在一个组件的时候，组件里所有的 `ref` 就会变为 `null`。

值得注意的是，`React.findDOMNode` 和 `refs` 都无法用于无状态组件中。因为，无状态组件挂载时只是方法调用，并没有创建实例。

对于 React 组件来讲，`refs` 会指向一个组件类实例，所以可以调用该类定义的任何方法。如果需要访问该组件的真实 DOM，可以用 `ReactDOM.findDOMNode` 来找到 DOM 节点，但并不推荐这样做，因为这大部分情况下都打破了封装性，而且通常都能用更清晰的方法在 React 中构建代码。

## 原理机制

React 将会在组件挂载时将 DOM 元素分配给 `current` 属性，并且在组件被卸载时，将 `current` 属性重置为 `null`。`ref` 将会在 `componentDidMount` 和 `componentDidUpdate` 生命中器钩子前被更新。

---

**参考资料：**

- [📝 React ref 的前世今生](https://juejin.im/post/5b59287af265da0f601317e3)
- [📝 React16 新特征总览](https://zhuanlan.zhihu.com/p/34604934)
