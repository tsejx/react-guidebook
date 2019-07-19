# Portals

> 🚧 施工中，未完成

有些元素需要被挂载在更高层级的位置。最典型的应用场景：当父组件具有 `overflow: hidden` 或者 `z-index` 的样式设置时，组件有可能被其他元素遮挡，这个时候你就可以考虑是否需要使用 Portal 使组件的挂载脱离父组件。

Portals 提供了一种很好的将子节点渲染到父组件以外的 DOM 节点的方式。

一般而言，组件在装载的时候会就近装载在该组件最近的父元素下，而现在你可以使用 Portal 将组件渲染到任意一个已存在的 DOM 元素下，这个 DOM 元素并不一定必须是组件的父组件。

这个 API 将部分内容分离式地 `render` 到指定 DOM 节点上。不同于使用 `ReactDOM.render` 新创建一个 DOM tree 的方式，对于要通过 `createPortal()` 分离出去的内容，期间的数据传递，生命周期，甚至事件冒泡，依然存在于原本的抽象组件树结构当中。

```jsx
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

例如以上代码， 通过 Portal 把里面的内容渲染到了一个独立的节点上。在实际的 DOM 结构中，img 已经脱离了 Creater 本身的 DOM 树存在于另一个独立节点。但当点击 img 时，仍然可以神奇的触发到 Creater 内的 div 上的 onclick 事件。这里实际依赖于 React 代理和重写了整套事件系统，让整个抽象组件树的逻辑得以保持同步。

🎉 主要应用场景：Modal、Message 等消息提示

### 事件冒泡

从上图可以看出来，弹窗的父组件应该是挂载在 `id` 为 `#app` 这个 DOM 下面的，通过 Portals，我们将 Modal 模态窗挂载在 `id` 为 `#portal_modal` 这个 DOM 下了。虽然最后的 Modal 组件没有挂载在整个应用所在的 `#app` 下，但是 Portal 创建的组件里面的事件依然会冒泡给它自身的父组件，父组件可以捕获到被挂载在 `#portal_modal` 节点下面的 Modal 的点击事件。

```jsx
class PortalsComponent extedns Component {
    constructor(props){
        super(props);
        this.state = { showModal: false, clickTime: 0 };
    }
    handleShow(){
        this.setState({ showModal: true })
    }
    handleHide(){
        this.setState({ showModal: false })
    }
    handleClick(){
        let { clickTime } = this.state;
        clickTime += 1;
        this.setSate({ clickTime });
    }
    render(){
        const protalModal = this.state.showModal ? (
        	<PortalModal>
            	<ModalContent hideModal={this.handleHide} />
            </PortalModal>
        ) : null;
        return (
          <div className={s.portalContainer} onClick={this.handleClick}>
            <div>该组件被点击了：{this.state.clickTime}次</div>
            <Button onClick={this.handleShow} type='primary'>点我弹出Modal</Button>
            {protalModal}
          </div>
        )
    }
}

export default PortalsComponent
```
