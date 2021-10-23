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

`Refs` 在计算机中称为弹性文件系统（英语：Resilient File System，简称 ReFS）。

React 的核心思想是每次对于变更 `props` 或 `state`，触发新旧 Virtual DOM 进行 diff（协调算法），对比出变化的地方，然后通过 `render` 重新渲染界面。而 Refs 为我们提供了一种绕过状态更新和重新渲染时访问元素的方法，这在某些用例中很有用，但不应该作为 `props` 和 `state` 的替代方法。

在项目开发中，如果我们可以使用声明式或提升 `state` 所在的组件层级（状态提升）的方法来更新组件，最好不要使用 refs。

## 创建方式

- 传入字符串，使用时通过 `this.refs` 传入的字符串的格式获取对应的元素
- 传入对象，对象是通过 `React.createRef()` 方式创建出来，使用时获取到创建的对象中存在 `current` 属性就是对应的元素
- 传入函数，该函数会在 DOM 被挂载时进行回调，这个函数会传入一个元素对象，可以自己保存，使用时，直接拿到之前保存的元素对象即可
- 传入 Hook，Hook 通过 `useRef()` 方式创建，使用时通过生成 Hook 对象的 `current` 属性就是对应的元素

### 字符串形式

> 🗑 已过时并可能会在未来的版本中被移除

```js
class App extends React.Component {
  constructor(props) {
    super(props);
    this.divRef = React.createRef();
  }
  render() {
    return <div ref="divRef"></div>;
  }
}
```

访问当前节点的方式如下：

```js
this.refs.myref.innerHTML = 'hello';
```

### 对象形式

`ref` 通过 `React.createRef()` 创建，然后将 `ref` 属性添加到 React 元素中。

代码示例：

<code src="../../../example/ref-object/index.tsx" />

### 函数形式

当 `ref` 传入为一个函数的时候，在渲染过程中，回调函数参数会传入一个元素对象，然后通过过实例将对象进行保存。

代码示例：

<code src="../../../example/ref-function/index.tsx" />

### Hook 形式

通过 [useRef](../../api-api-reference/hooks/useRef) 创建一个 ref，整体使用方式与 `React.createRef` 一致。'

代码示例：

<code src="../../../example/ref-hook/index.tsx" />

说明：

- 上述三种情况都是 `ref` 属性用于原生 HTML 元素上
- 如果 `ref` 设置的组件为一个类组件的时候，`ref` 对象接收到的是组件的挂载实例。
- 需要注意的是，不能在函数组件上使用 `ref` 属性，因为他们并没有实例。

## 应用场景

- **管理焦点（如文本选择）或处理表单数据**：`refs` 将管理文本框当前焦点选中，或文本框其它属性。

在大多数情况下，我们推荐使用受控组件来处理表单数据。在一个受控组件中，表单数据是由 React 组件来管理，每个状态更新都编写数据处理函数。另一种替代方案是使用非受控组件，这时表单数据将交由 DOM 节点来处理。要编写一个非受控组件，就需要使用 Refs 来从 DOM 节点中获取表单数据。

```jsx | pure
class Form extends React.Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
  }

  handleSubmit = (e) => {
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

## 注意事项

- React 将会在组件挂载时将 DOM 元素分配给 `current` 属性，并且为防止内存泄漏，在组件被卸载时，将 `current` 属性重置为 `null`
- `ref` 将会在 `componentDidMount` 和 `componentDidUpdate` 生命中器钩子前被更新
- `React.findDOMNode` 和 `refs` 都无法用于无状态组件中。因为，无状态组件挂载时只是方法调用，并没有创建实例。
- 对于 React 组件来讲，`refs` 会指向一个组件类实例，所以可以调用该类定义的任何方法。如果需要访问该组件的真实 DOM，可以用 `ReactDOM.findDOMNode` 来找到 DOM 节点，但并不推荐这样做，因为这大部分情况下都打破了封装性，而且通常都能用更清晰的方法在 React 中构建代码。

## 参考资料

- [📝 React ref 的前世今生](https://juejin.im/post/5b59287af265da0f601317e3)
- [📝 React16 新特征总览](https://zhuanlan.zhihu.com/p/34604934)
