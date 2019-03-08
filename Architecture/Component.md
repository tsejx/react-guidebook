## React 组件

React 组件的封装思路就是面向对象思想。

规范标准组件准则：

* **基本的封装性。**尽管说 JavaScript 没有真正面向对象的方法，但我们还是可以通过实例化 的方法来制造对象。 
* **简单的生命周期呈现。**最明显的两个方法 constructor 和destroy，代表了组件的挂载和卸载过程。但除此之外，其他过程（如更新时的生命周期）并没有体现。 
* **明确的数据流动。**这里的数据指的是调用组件的参数。一旦确定参数的值，就会解析传 进来的参数，根据参数的不同作出不同的响应，从而得到渲染结果。 

### Web Component

四个组成部分：

* HTML Templates 定义模版
* Custom Elements 定义组件展示形式
* Shadow DOM 定义组件的作用域范围、可以囊括样式
* HTML Imports 提出新的引入方式

### React 组件的构建

React 组件基本由三个部分组成：属性（Props）、状态（State）和生命周期方法。

**React 组件类型：**

- 无状态组件
- 有状态组件
- 容器组件
- 高阶组件
- RenderCallback组件

#### 无状态组件

无状态组件（Stateless Component）是最基础的组件形式，由于没有状态的影响所以就是纯静态展示的作用。一般来说，各种 UI 库里也是最开始会开发的组件类别。如按钮、标签、输入框等。它的基本组成结构就是属性（props）加上一个渲染函数（render）。由于不涉及到状态的更新，所以这种组件的复用性也最强。

 ```jsx
const PureComponent = (props) => (
    <div>Hello world！</div>
)
 ```

无状态组件的写法十分简单，比起使用传统的组件定义方式，我通常就直接使用 ES6 语法中提供的箭头函数来声明这种组件形式。当然，如果碰到稍微复杂点的，可能还会带有生命周期的 Hook 函数。这时候就需要用到 `Class Component` 的写法了。

#### 有状态组件

在无状态组件的基础上，如果组件内部包含状态（state）且状态随着事件或者外部的消息而发生改变的时候，这就构成了有状态组件（Stateful Component）。有状态组件通常会带有生命周期（Lifecycle），用以在不同的时刻触发状态的更新。这种组件也是通常在写业务逻辑中最经常使用到的，根据不同的业务场景组件的状态数量以及生命周期机制也不尽相同。

```jsx
class StatefulComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            //定义状态
        }
    }

    componentWillMount() {
        //do something
    }

    componentDidMount() {
        //do something
    }
    ... //其他生命周期

    render() {
        return (
            //render
        );
    }
}
```

#### 容器组件

在具体的项目实践中，我们通常的前端数据都是通过 Ajax 请求获取的，而且获取的后端数据也需要进一步的做处理。为了使组件的职责更加单一，引入了容器组件（Container Component）的概念。我们将数据获取以及处理的逻辑放在容器组件中，使得组件的耦合性进一步地降低。

 ```jsx
class UserListContainer extends React.Component {
  getInitialState() {
    return {
      users: []
    }
  }

  componentDidMount() {
    var _this = this;
    axios.get('/path/to/user-api').then(function(response) {
      _this.setState({users: response.data});
    });
  }

  render() {
    return (
        <UserList users={this.state.users} />
    )
  }
}
 ```

如上面这个容器组件，就是负责获取用户数据，然后以 `props` 的形式传递给 `UserList` 组件来渲染。容器组件也不会在页面中渲染出具体的 DOM 节点，因此，它通常就充当数据源的角色。目前很多常用的框架，也都采用这种组件形式。如：React Redux 的 `connect()`，Relay 的 `createContainer()`，Flux Utils 的 `Container.create()` 等。

#### 高阶组件

其实对于一般的中小项目来说，你只需要用到以上的这三种组件方式就可以很好地构造出所需的应用了。但是当面对复杂的需求的时候，我们往往可以利用高阶组件（Higher-Order Component）编写出可重用性更强的组件。那么什么是高阶组件呢？其实它和高阶函数的概念类似，就是一个会返回组件的组件。或者更确切地说，它其实是一个会返回组件的函数。就像这样：

```jsx
const HigherOrderComponent = (WrappedComponent) => {
  return class WrapperComponent extends Component {
    render() {
      //do something with WrappedComponent
    }
  }
}
```

作为一个高阶组件，可以在原有组件的基础上，对其增加新的功能和行为。我们一般希望编写的组件尽量纯净或者说其中的业务逻辑尽量单一。但是如果各种组件间又需要增加新功能，如打印日志，获取数据和校验数据等和展示无关的逻辑的时候，这些公共的代码就会被重复写很多遍。因此，我们可以抽象出一个高阶组件，用以给基础的组件增加这些功能，类似于插件的效果。

 一个比较常见的例子是表单的校验。

```jsx
//检验规则，表格组件
const FormValidator = (WrappedComponent, validator, trigger) => {

   getTrigger(trigger, validator) {
      var originTrigger = this.props[trigger];
      return function(event) {
          //触发验证机制,更新状态
          // do something ...
          originTrigger(event);
      }
  }

  var newProps = {
    ...this.props,
    [trigger]:   this.getTrigger(trigger, validator) //触发时机,重新绑定原有触发机制
  };

  return <WrappedComponent  {...newProps} />
}
```

值得提一句，同样是给组件增加新功能的方法，相比于使用 mixins 这种方式高阶组件则更加简洁和职责更加单一。你如果使用过多个 mixins 的时候，状态污染就十分容易发生，以及你很难从组件的定义上看出隐含在 mixins 中的逻辑。而高阶组件的处理方式则更加容易维护。

另一方面，ES7 中新的语法 `Decorator` 也可以用来实现和上面写法一样的效果。 

 ```jsx
function LogDecorator(msg) {
  return (WrappedComponent) => {
    return class LogHoc extends Component {
      render() {
        // do something with this component
        console.log(msg);
        <WrappedComponent {...this.props} />
      }
    }
  }
}

@LogDecorator('hello world')
class HelloComponent extends Component {

  render() {
    //...
  }
}
 ```

#### RenderCallback 函数

还有一种组件模式是在组件中使用渲染回调的方式，将组件中的渲染逻辑委托给其子组件。

```jsx
import { Component } from "react";

class RenderCallbackCmp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      msg: "hello"
    };
  }

  render() {
    return this.props.children(this.state.msg);
  }
}

const ParentComponent = () =>
  (<RenderCallbackCmp>
    {msg =>
      //use the msg
      <div>
        {msg}
      </div>}
  </RenderCallbackCmp>);
```

父组件获取了内部的渲染逻辑，因此在需要控制渲染机制时可以使用这种组件形式。

### 总结

以上这些组件编写模式基本上可以覆盖目前工作中所需要的模式。在写一些复杂的框架组件的时候，仔细设计和研究组件间的解耦和组合方式，能够使后续的项目可维护性大大增强。

---

深入研究：

- [React中的五种组件形式](https://juejin.im/post/596d65d66fb9a06bae1e19e2)