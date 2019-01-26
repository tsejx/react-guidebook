## Class Properties

### defaultProps

`defaultProps` 可以被定义为组件类的一个属性，用以为类设置默认的属性。这对于未定义（undefined）的属性来说有用，而对于设为空（null）的属性并没用。

例如：

```jsx
class CustomBottom extends React.Component {
    // ...
}
CustomButtom.defaultProps = {
    color: 'blue'
}
```

若未设置 `props.color`，其将被设置为 `blue`：

```jsx
render(){
    return <CustomButtom />	// props.color will be set to blue
}
```

若 `props.color` 设为 `null`，则其值则为 `null`：

```jsx
render(){
    return <CustomButtom color={null}/>	// props.color will remain null
}
```

### displayName

`displayName` 被用在调试信息中。JSX会自动设置该值；查看[深入JSX](http://react.yubolun.com/docs/jsx-in-depth.html)。