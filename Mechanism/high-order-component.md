# 高阶组件

高阶组件（High-Order Component）接受 React 组件作为输入，输出一个新的 React 组件。

- 高阶组件不是组件，是增强函数，可以输入一个元组件，输出一个新的增强组件
- 高阶组件的主要作用是代码复用，操作状态和参数

**实现高阶组件的方法：**

- **属性代理（props proxy）**。高阶组件通过被包裹的 React 组件来操作 Props。
- **反向继承（inheritance inversion）**。高阶组件继承于被包裹的 React 组件。

### 属性代理

**属性代理（Props Proxy）**：输出一个组件，它基于被包裹组件进行**功能增强**。

```jsx
import React from 'react';

const MyContainer = WrappedComponent =>
  class extends Component {
    render() {
      return <WrapperdComponent {...this.props} />;
    }
  };
```

这里的高阶组件中采用了匿名类通过 render 方法返回传入的 React 组件（WrappedComponent）。通过高阶组件传递 Props，这种方式即为属性代理。

这样组件就可以一层层地作为参数被调用，原始组件就具备了高阶组件对它的修饰。就这么简单，保持单个组件封装性的同时还保留了易用性。

#### 默认参数

**默认参数**：可以为组件包裹一层默认参数。

我们可以读取、增加、编辑或是移除从原组件（WrappedComponent）传进来的 Props，但需要小心删除与编辑重要的 Props。我们应该尽可能对高阶组件的 Props 作新的命名以防止混淆。

```jsx
import React, { Component } from 'react';

const MyContainer = WrappedComponent =>
  class extends Component {
    render() {
      const newProps = {
        name: nextName,
      };
      return <WrappedComponent {...this.props} {...newProps} />;
    }
  };
```

当调用高阶组件时，可以使用新的 props name 了。对于原组件来说，只要套用这个高阶组件，我们的新组件中就会多一个 name 的 props。

#### 通过 Refs 使用引用

在高阶组件中，我们可以接受 Refs 使用原组件（WrappedComponent）的引用。

```jsx
import React, { Component } from 'react';

const MyContainer = WrappedComponent =>
  class extends Component {
    proc(wrappedComponentInstance) {
      wrappedComponentInstantce.mdethod();
    }
    render() {
      const props = Object.assign({}, this.props, {
        ref: this.proc.bind(this),
      });
      return <WrappedComponent {...props} />;
    }
  };
```

当原组件（WrappedComponent）被渲染时，Refs 回调函数就会被执行，这样就会拿到一份原组件（WrappedComponent）实例的引用。这就可以方便地用于读取或增加实例的 Props，并调用实例的方法。

#### 抽象状态

我们可以通过原组件（WrappedComponent）提供的 Props 和回调函数抽象 State。

高阶组件可以将原组件抽象为展示型组件，分离内部状态。

```jsx
import React, { Component } from 'react';

const MyContainer = WrappedCompoenent =>
  class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        name: '',
      };
      this.onNameChange = this.onNameChange.bind(this);
    }
    onNameChange(event) {
      this.setState({
        name: event.target.value,
      });
    }
    render() {
      const newProps = {
        name: {
          value: this.state.name,
          onChange: this.onNameChange,
        },
      };
      return <WrappedCompoennt {...this.props} {...newProps} />;
    }
  };
```

```jsx
const nameInput = props => (<input name='name' {...props}) />)
export default MyContainer(nameInput);
```

在这个例子中，我们把 `input` 组件中对 name Prop 的 onChange 方法提取到高阶组件中，这样

就有效地抽象了同样的状态操作。

#### 包裹组件

此外，我们还可以使用其他元素来包裹原组件（WrappedComponent），这既可以是为了加样式，也可以是为了布局。

🌰 **示例：增加一层定义样式**

```jsx
import React, { Component } from 'react'

const MyContainer = (WrappedCompoennt) =>
     class extends Component {
         render() {
             return {
                 <div style={{display: 'block'}}>
                     <WrappedComponent {...this.props} />
                 </div>
             }
         }
     }
```

### 反向继承

**反向继承（Inheritance Inversion）**：输出一个组件，继承于被包裹组件。

🌰 **示例：**

```jsx
const MyContainer = WrappedCompoenent =>
  class extends WrappedComponent {
    render() {
      return super.render();
    }
  };
```

正如所见，高阶组件返回的组件继承于原组件 WrappedComponent。因为被动地继承了 WrappedComponent，所有的调用都会反向，这也是这种方法的由来。

这种方法与属性代理不太一样。它通过继承 WrappedComponent 来实现，方法可以通过 super 来顺序调用。因为依赖于继承的机制，HOC 的调用顺序和队列是一样的：

```js
didmount => HOC didmount => (HOCs didmount) => will unmount => HOC will unmount => (HOCs will unmount)
```

在反向继承方法中，高阶组件可以使用原组件 WrappedComponent 引用，这意味着它可以使用原组件 WrappedComponent 的 State 、 Props 、生命周期和 `render` 方法。但它不能保证完整的子组件树被解析。

#### 渲染劫持

渲染劫持指的就是高阶组件可以控制原组件 WrappedComponent 的渲染过程，并渲染各种各样的结果。我们可以在这个过程中在任何 React 元素输出的结果中读取、增加、修改、删除 Props，或读取或修改 React 元素树，或条件显示元素树，又或是用样式控制包裹元素树。

正如之前说到的，反向继承不能保证完整的子组件树被解析，这意味着将限制渲染劫持功能。 渲染劫持的经验法则是我们可以操控原组件 WrappedComponent 的元素树，并输出正确的结果。但如果元素树中包括了函数类型的 React 组件，就不能操作组件的子组件。

##### 条件渲染

**条件渲染**：根据条件，渲染不同的组件。

🌰 **示例：条件渲染**

```jsx
const MyContainer = WrappedComponent =>
  class extends WrappedComponent {
    render() {
      if (this.props.loggedIn) {
        return super.render();
      } else {
        return null;
      }
    }
  };
```

##### 修改渲染

**修改渲染**：可以直接修改被包裹组件渲染出的 React 元素树。

🌰 **示例：修改渲染**

```jsx
const MyContainer = WrappedComponent =>
  class extends WrappedComponent {
    render() {
      const elementsTree = super.render();
      let newProps = {};
      if (elementsTree && elementsTree.type === 'input') {
        newProps = { value: 'may the force be with you' };
      }
      const props = Object.assign({}, elementsTree.props, newProps);
      const newElementsTree = React.cloneElement(elementsTree, props, elementsTree.props.children);
      return newElementsTree;
    }
  };
```

#### 操作状态

高阶组件可以读取、修改或删除原组件 WrappedComponent 实例中的 State，如果需要的话，也可以增加 State。但这样做，可能会使原组件 WrappedComponent 内部状态变得难以追踪，不易维护。大部分的高阶组件都应该限制读取或增加 State，尤其是后者，可以通过重新命名 State，以防止混淆。

```jsx
const MyContainer = WrappedComponent =>
  class extends WrappedComponent {
    render() {
      return (
        <div>
          <h2>HOC Debugger Component</h2>
          <p>Props</p>
          <pre>{JSON.stringify(this.props, null, 2)}</pre>
          <p>State</p>
          <pre>{JSON.stringify(this.state, null, 2)}</pre>
          {super.render()}
        </div>
      );
    }
  };
```

### 应用场景

#### 权限控制

**权限控制**：通过抽象逻辑，统一对页面进行权限判断，按不同的条件进行页面渲染。

```jsx
const auth = (WrappedComponent) => {
    return class extends React.Component {
        constructor(props){
            super(props);
            this.state = {
                isAdmin: false
            }
        }
        async componentWillMount(){
            const currentRole = await getCurrentUserRole();
            this.setState({
                isAdmin: currentRole === 'Admin';
            })
        }
        render(){
            if(this.state.isAdmint){
                return <WrapperdComponent {...this.props} />
            } else {
                return (<div>您没有权限查看该页面，请联系管理员！</div>)
            }
        }
    }
}
```

#### 性能监控

**性能监控**：包裹组件的生命周期，进行统一埋点。

```jsx
const performance = WrappedComponent => {
  return class extends WrappedComponent {
    constructor(props) {
      super(props);
      this.start = Date.now();
      this.end = 0;
    }
    componentDidMount() {
      super.componentDidMount && super.componentDidMount();
      this.end = Date.now();
      console.log(`${WrappedComponent.name} 组件渲染时间为 ${this.end - this.state} ms`);
    }
    render() {
      return super.render();
    }
  };
};
```

### 注意事项

- **纯函数**：增强函数应为纯函数，避免侵入修改元组件；
- **避免用法污染**：理想状态下，应透传元组件的无关参数与事件，尽量保证用法不变；
- **命名空间**：为 HOC 增加特异的组件名称，这样能便于开发调试和查找问题；
- **引用传递**：如果需要传递元组件的 refs 引用，可以使用 `React.forwardRef`；
- **静态方法**：元组件上的静态方法并无法被自动传出，会导致业务层无法调用，因此需要通过函数导出或者静态方法赋值两种方法解决；
- **重新渲染**：由于增强函数每次调用是返回一个新组件，因此如果在 Render 中使用增强函数，就会导致每次都重新渲染整个 HOC，而且之前的状态会丢失；

---

**参考资料：**

- [中高级前端大厂面试秘籍](https://juejin.im/post/5c92f499f265da612647b754)
