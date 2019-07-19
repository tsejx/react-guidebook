# React.createRef

**`React.createRef`用于创建关联 React 元素的 `ref` 引用。**

🌰 **示例：**

```jsx
class MyComponent extends React.Component {
    constructor(props) {
        super(props)
        this.inputRef = React.createRef()
    }
    render() {
        return <input type="text" ref={this.inputRef}>
    }
    componentDidMount() {
        this.inputRef.current.focus()
    }
}
```

📌 真实的 DOM 是通过 `ref.current` 属性来引用的。

