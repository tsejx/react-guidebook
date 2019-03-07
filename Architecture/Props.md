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

### 默认值

一般设置 React 组件的 Props 默认值有两种方式。

**方法一：React 组件类中声明 defaultProps 作为静态属性。，该方法只有在浏览器编译之后才会生效**

如果使用编译库 Babel 设置为 ES6 的转码方式将会抛出错，因为定义静态属性不属于 ES6，而在 ES7的草案中。ES6 的 Class 中只有静态方法，没有静态属性。

```jsx
class Foo extends React.Component {
    // ...
    static defaultProps = {
        bar: 'Hello world!'
    }
}
```

**方法二：通过赋值特定的 defaultProps 属性为 Props 定义默认值：**

由于是用 ES6 Class 语法创建组件，其内部只允许定义方法，而不能定义属性，Class 的属性只能定义在 Class 之外。所以 `defaultProps` 要写在组件外部。

```jsx
class Foo extends React.Component {
    // ...
}

Foo.defaultProps = {
    bar: 'Hello world!'
}
```

**解决方案：**

**将 Babel 设置为 ES7 的转码方式**

```bash
// Install babel
npm install babel-core babel-loader --save-dev

// For ES6/ES2015 support
npm install babel-preset-es2015 --save-dev

// If you want to use JSX
npm install babel-preset-react --save-dev

// If you want to use experimental ES7 features
npm install babel-preset-stage-0 --save-dev
```

在项目根目录配置 `.babelrc` 文件。

```json
{
  "presets": ["es2015", "stage-0"],
  "plugins": ["transform-runtime"]
}
```

如果使用 Webpack 的话，如下配置。

```js
loaders:[
    {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        loader: 'babel-loader' ,
        query:{
            presets:['es2015','stage-0','react'],
            plugins:['transform-runtime']
        },
    }
]
```

加入 `stage-0` 后就能尝试 ES7 语法了，`static` 也能在 `Class` 内部定义属性。

---

深入研究：

- [深入理解 Props](https://blog.csdn.net/u013451157/article/details/78728213)