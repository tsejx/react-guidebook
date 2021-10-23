/**
 * title: 包裹组件
 * desc: 在传入组件外层增加 DOM 结构或增加样式属性用于布局
 */
import React from 'react';

class ChildComponent extends React.Component {
  render() {
    return <div>{this.props.name}</div>;
  }
}

const HighOrderComponent = (WrappedCompoennt) => {
  return class extends React.Component {
    render() {
      return (
        <div style={{ display: 'inline-block', background: 'skyblue' }}>
          <WrappedCompoennt {...this.props} />
        </div>
      );
    }
  };
};

const App = HighOrderComponent(ChildComponent);

export default () => <App name="Hello world!" />;
