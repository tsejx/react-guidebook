/**
 * title: 基本用法
 * desc:
 */

import React from 'react';

interface MouseState {
  x: number;
  y: number;
}

interface MouseProps {
  render: (MouseState) => JSX.Element
}

// 与 HOC 不同，我们可以使用具有 render prop 的普通组件来共享代码
class Mouse extends React.Component<MouseProps> {
  state = { x: 0, y: 0 };

  handleMouseMove = (event) => {
    this.setState({
      x: event.clientX,
      y: event.clientY,
    });
  };

  render() {
    return (
      <div style={{ height: '100%' }} onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    );
  }
}

const App = () => {
  return (
    <div style={{ height: '100%' }}>
      <Mouse
        render={({ x, y }) => (
          <h1>
            The mouse position is ({x}, {y})
          </h1>
        )}
      />
    </div>
  );
};

export default () => <App />;
