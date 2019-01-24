## State

React 把用户界面当作简单状态机。通过与用户的交互，实现不同状态，然后渲染 UI，让用户界面和数据保持一致。只需要更新组件的 `state`，然后根据新 `state` 重新渲染用户界面（不需要操作 DOM）。React 来决定如何最高效地更新 DOM。

### 定义

组件中用到的一个变量是不是应该作为组件 `state`，可以通过下面的4条依据进行判断：

1. 这个变量是否是通过 `props` 从父组件中获取？如果是，那么它不是一个状态。
2. 这个变量是否在组件的整个生命周期中都保持不变？如果是，那么它不是一个状态。
3. 这个变量是否可以通过其他状态（State）或者属性（Props）计算得到？如果是，那么它不是一个状态。
4. 这个变量是否在组件的 `render()` 方法中使用？如果不是，那么它不是一个状态。

这种情况下，这个变量更适合定义为组件的一个普通属性，例如组件中用到的定时器，就应该直接定义为 `this.timer`，而不是 `this.state.timer`。

**请务必牢记，并不是组件中用到的所有变量都是组件的状态！**当存在多个组件共同依赖一个状态时，一般的做法是**状态上移**，将这个状态放到这几个组件的公共父组件中。

### 基本用法

```jsx
class Component extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            modalVisible: true
        }
    }
    render(){
        return(
        	<div>
            	<Modal modalVisible={this.state.modalVisible}
            </div>
        )
    }
}
```

### 使用方法

#### 不能直接修改 State

在实际开发中，直接修改 State 状态中的值，虽然事实上改变了组件的内部状态，但是却没有驱动组件进行重新渲染，既然组件没有重新渲染，用户界面中 `this.state` 值对应显示部分也就不会有变化。而 `this.setState()` 函数所处理的事务，首先是改变 `this.setState` 的值，然后驱动组件经历更新过程，这样用户界面上相应的 `this.state` 值才有相应的变化。

```js
// Wrong
this.state.title = 'React'
```

正确的修改方式是使用 `setState()`

```jsx
this.setState({title: 'React'})
```

#### State 的更新是异步的

调用 `setState()`，组件的 state 并不会立即改变，`setState` 只是把要修改的状态放入一个队列中，React 会优化真正的执行时机，并且 React 会出于性能原因，可能会将多次 `setState` 的状态修改合并成一次状态修改。所以不要依赖当前的 State，计算下个 State。当真正执行状态修改时，依赖的 `this.state` 并不能保证是最新的State，因为 React 会把多次 State 的修改合并成一次，这时，`this.state` 将还是这几次 State 修改前的 State。另外需要注意的事，同样不能依赖当前的 Props 计算下个状态，因为 Props 一般也是从父组件的 State 中获取，依然无法确定在组件状态更新时的值。

深入研究请点击：[setState](./setState.md)

#### State 的更新是一个浅合并的过程

当调用 `setState()` 修改组件状态时，只需要传入发生改变的 State，而不是组件完整的 State，因为组件 State的更新是一个**浅合并（Shallow Merge）**的过程。

例如，一个组件的状态为：

```js
this.state = {
  title : 'React',
  content : 'React is an wonderful JS library!'
}
```

当只需要修改状态 `title` 时，只需要将修改后的 `title` 传给 `setState`：

```jsx
this.setState({
    title: 'Reactjs'
})
```

React会合并新的 `title` 到原来的组件状态中，同时保留原有的状态 `content`，合并后的 State 为：

```jsx
{
  title : 'Reactjs',
  content : 'React is an wonderful JS library!'
}
```

### State 与 Props 的区别

除了 State，组件的 Props 也是和组件的 UI 有关的。他们之间的主要区别是：

- State 是可变的，是组件内部维护的一组用于反映组件 UI 变化的状态集合
- Props 对于使用它的组件来说，是只读的，要想修改 Props，只能通过该组件的父组件修改

在组件状态上移的场景中，父组件正是通过子组件的 Props，传递给子组件其所需要的状态。

### State 与 Immutable

React 官方建议把  State 当做是不可变对象，State 中包含的所有状态都应该是**不可变对象**，当 State 中的某个状态发生变化，我们应该重新创建这个状态对象，而不是直接修改原来的状态。State 根据状态类型可以分为三种。

#### 基本数据类型

Number、String、Boolean、Null、Undefined 这五种不可变类型：

由于其本身就是不可变的，如果要修改状态的话，直接赋新值即可

```js
this.setState({
    num: 1,
    string: 'hello',
    ready: true
})
```

#### 数组类型

JavaScript 中数组类型为可变类型。假如有一个数组类型的 State，需要新增一个数组元素，应使用数组的`concat` 方法或 ES6 的数组扩展语法。

```js
// 方法一：将state先赋值给另外的变量，然后使用concat创建新数组
let students = this.state.students
this.setState({
    students: students.concat(['xiaoming'])
})

// 方法二：使用prevState、concat创建新数组
this.setState(preState => {
    students: preState.books.concat(['xiaoming'])
})

// 方法三：ES6扩展语法
this.setState(preState => {
    students: [...preState.students, 'xiaoming']
})

```

- 从数组中截取部分作为新状态时，应使用 `slice()` 方法
- 当从数组中过滤部分元素后，作为新状态时，使用 `filter()` 方法。

不应该使用 `push()`、`pop()`、`shift()`、`unshift()`、`splice()` 等方法修改数组类型的状态，因为这些方法都是在原数组的基础上修改的。应当使用不会修改原数组而返回一个新数组的方法。例如 `concat()`、`slice()`、`filter()` 等。

#### 对象类型

对象也是可变类型，修改对象类型的 `state` 时，应该保证不会修改原来的 `state`。可以使用 ES6 的 `Object.assign` 方法或者对象扩展语法。

```js
// Obejct.assign()方法
this.setState(preState => {
    school: Obejct.assign({}, preState.school, {classNum: 10})
})

// 对象扩展语法
let school = this.state.school
this.setState({
    school: {
        ...school,
        {classNum: 10}
    }
})
```

#### 总结

总结一下，创建新的状态对象的关键是，避免使用会直接修改原对象的方法，而是使用可以返回一个新对象的方法。当然，也可以使用一些 Immutable 的 JavaScript 库，如 [Immutable.js](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2Ffacebook%2Fimmutable-js)，实现类似的效果。

那么，为什么 React 推荐组件的状态是不可变对象呢？一方面是因为不可变对象方便管理和调试，了解更多可 [参考这里](https://link.juejin.im/?target=http%3A%2F%2Fredux.js.org%2Fdocs%2Ffaq%2FImmutableData.html%23benefits-of-immutability)；另一方面是出于性能考虑，当对象组件状态都是不可变对象时，我们在组件的 `shouldComponentUpdate` 方法中，仅需要比较状态的引用就可以判断状态是否真的改变，从而避免不必要的 `render()` 调用。当我们使用React 提供的 `PureComponent` 时，更是要保证组件状态是不可变对象，否则在组件的 `shouldComponentUpdate` 方法中，状态比较就可能出现错误，因为 `PureComponent` 执行的是浅比较（比较对象的引用）。

---

**深入研究：**

- [说说 React 组件的 state](https://juejin.im/entry/5b3b7bbc5188251af53db90a)
- [深入理解 React 组件状态](https://juejin.im/entry/59522bdb6fb9a06b9a516113)