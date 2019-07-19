# React.forwardRef

✨ 适用于 React v16.3+

`React.forwardRef` 用于将父组件创建的 `ref` 引用关联到子组件中的任意元素上。

也可以理解为子组件向父组件暴露 DOM 引用。

## 使用场景

* 传递 `Refs` 到 DOM 组件
* 传递 `Refs` 到高阶组件

## 使用方法

通过一个示例说明 `React.forwardRef()` 的使用方法。

🌰 **示例：**

```jsx
const FancyButton = React.forwardRef((props, ref) => (
	<button ref={ref} className="FancyButton">
    	{props.children}
    </button>
))

// You can now get a ref directly to the DOM button
const ref = React.createRef()
<FancyButton ref={ref}>Click me!</FancyButton>
```

1. 通过 `React.createRef()` 创建 `ref` 变量，然后在 子组件（FancyButton）属性中通过 `ref={ref}` 的方式把这个 `ref` 和组件关联起来。
2. 目前为止，如果子组件（FancyButton）是一个通过 class 或者函数声明的组件，那么就到此为止，我们可以说 `ref` 变量的 `current` 属性持有对子组件（FancyButton）实例的引用。
3. 但是，子组件（FancyButton）经过了 `React.fowardRef()` 的处理，这个 API 接受两个参数，第二个参数就是 `ref`，然后把 `ref` 绑定在 DOM 元素上（button），这样 `ref.current` 的引用就是 DOM 元素（button）。