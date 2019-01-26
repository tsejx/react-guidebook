## React.cloneElement 元素克隆

```
ReactElement cloneElement(
  ReactElement element,
  [object props],
  [children ...]
)
```

该方法会从已有的 `ReactElement` 中复制，并返回一个新的 `ReactElement` 对象。

| 参数       | 说明                                           | 类型         |
| ---------- | ---------------------------------------------- | ------------ |
| `element`  | React 元素                                     | ReactElement |
| `props`    | 可选参数，表示对象的属性                       | any          |
| `children` | 第三个参数及其后的参数都会被认为是元素的子元素 | any          |

**返回值：**返回一个 ReactElement 对象（React 元素）

🌰 示例，已有如下元素：

```js
React.createElement('div');
```

使用 `cloneElement()` 复制这个元素，并最终生前面示例中的HTML。

```js
var div = React.createElement('div');

ReactDOM.render(
  React.cloneElement(div, {className:'myClass'},  
    React.createElement('h2', null, 'itbilu.com'),
    React.createElement('hr')
  ),
  document.getElementById('example')
);
```

> 比较多用在 ES5 的语法环境中。