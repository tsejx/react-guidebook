## Props

Props 的主要作用是让使用该组件的父组件可以传入参数来配置该组件。它是外部传进来的配置参数，组件内部无法控制也无法修改。除非外部组件主动传入新的 Props，否则组件的 Props 永远保持不变。

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

⚠️ 如果 Props 渲染过程中可以被修改，那么就会导致这个组件显示形态和行为变得不可预测，这样会可能会给组件使用者带来困惑。

但这并不意味着 Props 决定的显示形态不能被修改。组件的使用者可以主动地通过重新渲染的方式把新的 Props 传入组件当中名，这样这个组件中由 Props 决定的显示形态也会得到相应的改变。

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