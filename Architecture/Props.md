## Props

React 组件从概念上看就像是函数，它可以接收任意的输入值。

特别地，`this.props.children` 是一个特别属性，其通常由 JSX 表达式中的子标签定义，而不是标签本身。

### 只读性

无论是使用函数或事类来声明一个组件，它决不能修改它自己的 `props`。

```js
function sum(a, b) {
    return a + b
}
```

类似上面的这种函数称为纯函数，它没有改变它自己的输入值，当传入的值相同时，总是会返回相同的结果。

与之相对的是非纯函数，它会改变它自身的输入值：

```js
function withdraw(account, amount) {
    account.total -= amount
}
```

React 是非常灵活的，但它也有一个严格的规则：

**所有的 React 组件必须像纯函数那样使用它们的 props。**

### 特殊值

| JSX       | HTML  |
| --------- | ----- |
| tabIndex  | index |
| className | class |
| htmlFor   | for   |

```jsx
const ElementProps = () => {
    <div tabIndex="0" className="divbg">
        JSX 属性 tabIndex、className
    </div>
}
```

### 驼峰写法

`props` 默认使用驼峰写法。

```jsx
// Wrong
<Foo UserName="Ben" phone_number={13800000000} />

// Correct
<Foo userName="Ben" phoneNumber={13800000000} />
```

### 可省略属性值

如果 `props` 的值为 `true` ，则可以直接省略。

```jsx
// Wrong
<Foo hidden={true}/>

// Correct
<Foo hidden />
```

### `key` 属性

当有多个相同标签名的同级元素组件时，需要对每个元素组件添加 `key` 属性：

```jsx
<ul>
    {
        NavRoutes.map((route, index) => {
            return (
                <li key={route.id}>
                    {route.title}	
            	</li>
            )
        })
    }
</ul>
```

### 表示子节点对象

`this.props.children` 表示当前组件嵌套的对象集合。

---

深入研究：

- [深入理解 Props](https://blog.csdn.net/u013451157/article/details/78728213)