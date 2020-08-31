---
nav:
  title: API
  order: 4
group:
  title: React
  order: 1
title: React.children
order: 7
---

# React.Children

`React.Children` 提供了处理 `this.props.children` 这个不透明数据结构的工具。

## map

`React.Children.map` 用于对 `this.props.children` 的每个子级进行遍历。

📖 **语法**

```js
React.Children.map(children, function[(child, index)])
```

- 如果 `children` 是一个内嵌的**对象**或者**数组**，它将被遍历：不会传入容器对象到参数 `fn` 中。
- 如果 `children` 参数是 `null` 或者 `undefined` ，那么返回 `null` 或者 `undefined` 而不是一个空对象。

`this.props.children` 的值有三种可能：

- 如果当前组件没有子节点，它就是 `undefined`
- 如果有一个子节点，数据类型是 object
- 如果有多个子节点，数据类型就是 array

> 如果 `children` 是 `<Fragment>` 标签

## forEach

**语法**

```js
React.Children.forEach(children, function[(child, index)])
```

类似于 `React.Children.map` 但是不返回数组。

## count

`React.Children.count` 用于计算 `this.props.children` 中含有的节点数目。

由于 `this.props.children`  可以是任何类型的，因此检查一个组件有多少个 `children` 是非常困难的。

如果通过 `this.props.children.length` 判断字符串或函数时程序便会中断。

📖 **语法**

```js
React.Children.count(children);
```

🌰 **示例**

```js
class ChildrenCounter extends React.Component {
  render() {
    return;
  }
}
```

## only

`React.Children.only` 限制 `this.props.children` 只能为单个 React 组件，否则将抛出错误。

📖 **语法**

```js
React.Children.only(children);
```

## toArray

`React.Children.toArray` 可将 `this.props.children` 转换为数组。

📖 **语法**

```js
React.Children.toArray(children);
```

🌰 **示例**

```js
class Sort extends React.Component {
  render() {
    const children = React.Children.toArray(this.props.children);
    return <p>{children.sort().join(' ')}</p>;
  }
}
```

```js
<Sort>
  {/* We use expression containers to make sure our strings */}
  {/* are passed as three children, not as one string */}
  {'bananas'}
  {'oranges'}
  {'apples'}
</Sort>
```

上例会渲染为三个排好序的字符串。

## 开发技巧

### 改变 Children 属性

即便通过以前方法可以在子组件内部获得 `this.props.children` 以及其每个成员，但是要在子组件中改造 `this.props.children`（例如添加 Props 属性等）则需要使用辅助方法 `React.cloneElement` 。

`React.cloneElement` 会克隆一个 React 元素，第一个参数为将要克隆的 React 元素，第二个参数则为想要为该克隆元素添加的属性。

```js
renderChildren(){
    return React.Children.map(this.props.children, (child, index) => {
        return React.cloneElement(child, {
            name: this.props.name,
            number: this.state.number,
            onChange: this.onChange,
        })
    })
}
```
