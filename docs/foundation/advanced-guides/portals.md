---
nav:
  title: 基础
  order: 1
group:
  title: 进阶指引
  order: 2
title: Portals
order: 8
---

# Portals

Portals 提供了一种很好的将子节点渲染到父组件以外的 DOM 节点的方式。

```jsx | pure
ReactDOM.createPortal(child, container)
```

有些元素需要被挂载在更高层级的位置。最典型的应用场景：当父组件具有 `overflow: hidden` 或者 `z-index` 的样式设置时，组件有可能被其他元素遮挡，这个时候你就可以考虑是否需要使用 Portal 使组件的挂载 **脱离父组件**。

一般而言，组件在装载的时候会就近装载在该组件最近的父元素下，而现在你可以使用 Portal 将组件渲染到任意一个 **已存在** 的 DOM 元素下，这个 DOM 元素并不一定必须是组件的父组件。

这个 API 将部分内容分离式地 `render` 到指定 DOM 节点上。不同于使用 `ReactDOM.render` 新创建一个 DOM 树的方式，对于要通过 `createPortal()` 分离出去的内容，期间的数据传递、生命周期，甚至事件冒泡，依然存在于原本的抽象组件树结构当中。

```jsx | pure
class Creater extends Component {
  render() {
    return (
      <div onClick={() => alert('Clicked!')}>
        <Portal>
          <img src={myImg} />
        </Portal>
      </div>
    );
  }
}

class Portal extends Component {
  render() {
    const node = getDOMNode();
    return createPortal(this.props.children, node);
  }
}
```

例如以上代码， 通过 Portal 把里面的内容渲染到了一个独立的节点上。在实际的 DOM 结构中，`<img>` 已经脱离了 `Creater` 本身的 DOM 树存在于另一个独立节点。但当点击 `<img>` 时，仍然可以神奇的触发到 `Creater` 内的 `div` 上的 `onclick` 事件。这里实际依赖于 React 代理和重写了整套事件系统，让整个抽象组件树的逻辑得以保持同步。

🎉 **主要应用场景**：Modal、Message 等消息提示

## 使用场景

### 模态窗

```jsx | pure
const appRoot = document.getElementById('app');

class Modal extends React.Component {
  constructor(props){
    super(props);

    const doc = window.document;
    this.ele = document.createElement('div');
    // 在 Modal 的所有子元素被挂载后，
    // 这个 portal 元素会被嵌入到 DOM 树中，
    // 这意味着子元素将被挂载到一个分离的 DOM 节点中。
    // 如果要求子组件在挂载时可以立刻接入 DOM 树，
    // 例如衡量一个 DOM 节点，
    // 或者在后代节点中使用 ‘autoFocus’，
    // 则需添加 state 到 Modal 中，
    // 仅当 Modal 被插入 DOM 树中才能渲染子元素。
    doc.body.appendChild(this.ele);
  }
  componentWillUnmount() {
    window.document.body.removeChild(this.ele);
  }
  render() {
    return ReactDOM.createPortal(
      this.props.children,
      this.ele,
    );
  }
}

class Parent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    }
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    // 当子元素里的按钮被点击时，
    // 这个将会被触发更新父元素的 state，
    // 即使这个按钮在 DOM 中不是直接关联的后代
    this.setState(state => ({
      count: state.counr + 1
    }))
  }
  render() {
    return (
      <div onClick={this.handleClick}>
        <p>Number of clicks: {this.state.count}</p>
        <p>
          Open up the browser DevTools
          to observe that the button
          is not a child of the div
          with the onClick handler.
        </p>
        <Modal>
          <Child />
        </Modal>
      </div>
    )
  }
}

function Child() {
  // 这个按钮的点击事件会冒泡到父元素
  // 因为这里没有定义 'onClick' 属性
  return (
    <div className="modal">
      <button>Click</button>
    </div>
  );
}

ReactDOM.render(<Parent />, appRoot);
```

在父组件里捕获一个来自 `portal` 冒泡上来的事件，使之能够在开发时具有不完全依赖于 `portal` 的更为灵活的抽象。例如，如果你在渲染一个 `<Modal />` 组件，无论其是否采用 `portal` 实现，父组件都能够捕获其事件。

