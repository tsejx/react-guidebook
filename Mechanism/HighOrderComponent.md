## 高阶组件

高阶组件（high-order component）接受 React 组件作为输入，输出一个新的 React 组件。

用通俗的语言解释就是，当 React 组件被包裹时（wrapped），高阶组件会返回一个增强 （enhanced）的 React 组件。可以想象，高阶组件让我们的代码更具有复用性、逻辑性与抽象特性。它可以对 render 方法作劫持，也可以控制 Props 与 State。

**实现高阶组件的方法：**

* **属性代理（props proxy）**。高阶组件通过被包裹的 React 组件来操作 Props。
* **反向继承（inheritance inversion）**。高阶组件继承于被包裹的 React 组件。

### 属性代理

🌰 **示例：**

```jsx
import React from 'react'

const MyContainer = (WrappedComponent) => 
    class extends Component {
        render() {
            return <WrapperdComponent {...this.props}/>
        } 
    }
```

这里的高阶组件中采用了匿名类通过 render 方法返回传入的 React 组件（WrappedComponent）。通过高阶组件传递 Props，这种方式即为属性代理。

这样组件就可以一层层地作为参数被调用，原始组件就具备了高阶组件对它的修饰。就这么简单，保持单个组件封装性的同时还保留了易用性。

#### 控制 Props

我们可以读取、增加、编辑或是移除从 原组件（WrappedComponent）传进来的 Props，但需要小心删除与编辑重要的 Props。我们应该尽可能对高阶组件的 Props 作新的命名以防止混淆。

```jsx
import React, { Component } from 'react'

const MyContainer = (WrappedComponent) =>
    class extends Component {
        render() {
             const newProps = {
                 text: nextText
             }
             return <WrappedComponent {...this.props} {...newProps}/>
        }
     }
```

当调用高阶组件时，可以使用新的 Props（text）了。对于原组件来说，只要套用这个高阶组件，我们的新组件中就会多一个 text 的 Prop。

#### 通过 Refs 使用引用

在高阶组件中，我们可以接受 Refs 使用原组件（WrappedComponent）的引用。 

```jsx
import React, { Component } from 'react'

const MyContainer = (WrappedComponent) =>
    class extends Component {
        proc(wrappedComponentInstance){
            wrappedComponentInstantce.mdethod()
        }
        render() {
            const props = Object.assign({}, this.props, {
                ref: this.proc.bind(this)
            })
            return <WrappedComponent {...props}/>
        }
    }
```

当原组件（WrappedComponent）被渲染时，Refs 回调函数就会被执行，这样就会拿到一份原组件（WrappedComponent）实例的引用。这就可以方便地用于读取或增加实例的 Props，并调用实例的方法。

#### 抽象 State

我们可以通过原组件（WrappedComponent）提供的 Props 和回调函数抽象 State。 

高阶组件可以将原组件抽象为展示型组件，分离内部状态。 

```jsx
import React, { Component } from 'react'

const MyContainer = (WrappedCompoenent) => 
    class extends Component {
        constructor(props) {
            super(props)
            this.state = {
                name: ''
            }
            this.onNameChange = this.onNameChange.bind(this)
        }
        onNameChange(event) {
            this.setState({
                name: event.target.value
            })
        }
        render() {
            const newProps = {
                 name: {
                     value: this.state.name,
                     onChange: this.onNameChange
                 },
            }
            return <WrappedCompoennt {...this.props} {...newProps} />
        }
    }
```

在这个例子中，我们把 `input` 组件中对 name Prop 的 onChange 方法提取到高阶组件中，这样

就有效地抽象了同样的 State 操作。

#### 使用其他元素包裹原组件

此外，我们还可以使用其他元素来包裹原组件（WrappedComponent），这既可以是为了加样式，也可 以是为了布局。

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

另一种构建高阶组件的方法称为反向继承，从字面意思上看，它一定与继承特性相关。 

🌰 **示例：**

```jsx
const MyContainer = (WrappedCompoenent) => 
    class extends WrappedComponent {
        render() {
            return super.render()
        }
    }
```

正如所见，高阶组件返回的组件继承于原组件（WrappedComponent）。因为被动地继承了 WrappedComponent，所有的调用都会反向，这也是这种方法的由来。 

这种方法与属性代理不太一样。它通过继承 WrappedComponent 来实现，方法可以通过 super 来顺序调用。因为依赖于继承的机制，HOC 的调用顺序和队列是一样的：

```
didmount => HOC didmount => (HOCs didmount) => will unmount => HOC will unmount => (HOCs will unmount)
```

在反向继承方法中，高阶组件可以使用原组件（WrappedComponent）引用，这意味着它可以使用原组件（WrappedComponent）的 State 、 Props 、生命周期和 `render` 方法。但它不能保证完整的子组件树被解析。

#### 渲染劫持

渲染劫持指的就是高阶组件可以控制原组件（WrappedComponent）的渲染过程，并渲染各种各样的结果。我们可以在这个过程中在任何 React 元素输出的结果中读取、增加、修改、删除 Props，或读取或修改 React 元素树，或条件显示元素树，又或是用样式控制包裹元素树。 

正如之前说到的，反向继承不能保证完整的子组件树被解析，这意味着将限制渲染劫持功能。 渲染劫持的经验法则是我们可以操控原组件（WrappedComponent）的元素树，并输出正确的结果。但如果元素树中包括了函数类型的 React 组件，就不能操作组件的子组件。 

🌰 **示例：条件渲染**

```jsx
const MyContainer = (WrappedComponent) => 
    class extends WrappedComponent {
        render() {
            if (this.props.loggedIn) {
                return super.render();
            } else {
                return null; 
            }
        } 
    }
```

🌰 **示例：修改渲染**

```jsx
const MyContainer = (WrappedComponent) => 
    class extends WrappedComponent {
        render() {
            const elementsTree = super.render();
            let newProps = {};
            if (elementsTree && elementsTree.type === 'input') { 
                newProps = {value: 'may the force be with you'};
            }
            const props = Object.assign({}, elementsTree.props, newProps);
            const newElementsTree = React.cloneElement(elementsTree, props, elementsTree.props.children); 
            return newElementsTree;
        }
    }
```

#### 控制 State

高阶组件可以读取、修改或删除原组件（WrappedComponent）实例中的 State，如果需要的话，也可以增加 State。但这样做，可能会让原组件（WrappedComponent）内部状态变得一团糟。大部分的高阶组件都应该限制读取或增加 State，尤其是后者，可以通过重新命名 State，以防止混淆。 

```jsx
const MyContainer = (WrappedComponent) => 
    class extends WrappedComponent {
        render() {
            return (
                <div>
                    <h2>HOC Debugger Component</h2>
                    <p>Props</p><pre>{JSON.stringify(this.props, null, 2)}</pre>
                    <p>State</p><pre>{JSON.stringify(this.state, null, 2)}</pre>
                    {super.render()}
                </div>
            )
        }
    }
```

