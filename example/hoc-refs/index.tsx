/**
 * title: 高阶组件中转发 refs
 * desc: 通过 <code>forwardRef</code> 能将组件 <code>ref</code> 向父组件暴露
 */
import React from 'react';

const FocusInput = React.forwardRef((props, ref) => <input type="text" ref={ref} />);

function enhance(WrappedComponent) {
  class Enhance extends React.Component {
    render() {
      const { forwardedRef, ...restProps } = this.props;
      // 将定义的 prop 属性 forwardRef 定义为 ref
      return <WrappedComponent ref={forwardedRef} {...restProps} />;
    }
  }

  // 注意 React.forwardRef 回调的第二个参数 ref
  // 我们可以将其作为常规 prop 属性传递给 Enhance，例如 forwardedRef
  // 然后它就可以被挂载到被 Enhance 包裹的子组件上
  return React.forwardRef((props, ref) => <Enhance {...props} forwardedRef={ref} />);
}

// EnhancedChildComponet 会渲染一个高阶组件 enhance(FocusInput)
const EnhancedChildComponet = enhance(FocusInput);

// 我们导入的 EnahcnedComponent 组件是高阶组件（HOC）Enhance
// 通过 React.forward 将 ref 将指向了 Enhance 内部的 FocusInput 组件
// 这意味着我们可以直接调用 ref.current.focus() 方法
class App extends React.Component {
  private ref = React.createRef<HTMLInputElement>();

  constructor(props) {
    super(props);
  }
  handleFocus = () => {
    const { current } = this.ref;
    current.focus();
  };
  handleBlur = () => {
    const { current } = this.ref;
    current.blur();
  };
  render() {
    return (
      <>
        <EnhancedChildComponet ref={this.ref} />
        <button style={{ marginLeft: 8 }} onClick={this.handleFocus}>
          FOCUS
        </button>
        <button style={{ marginLeft: 8 }} onClick={this.handleBlur}>
          BLUR
        </button>
      </>
    );
  }
}

export default () => <App />;
