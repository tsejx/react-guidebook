/**
 * title: 默认参数
 * desc: <code>name</code> 作为高阶组件内部定义的属性传递给包装组件
 */
import React from 'react';

class ChildComponent extends React.Component {
  render() {
    return <div>{this.props.name}</div>;
  }
}

const HighOrderComponent = (WrappedComponent) => {
  return class extends React.Component {
    render() {
      const defaultProps = {
        name: 'Hello world!',
      };
      return <WrappedComponent {...defaultProps} {...this.props} />;
    }
  };
};

const App = HighOrderComponent(ChildComponent);

export default () => <App />;
