/**
 * title: 条件渲染
 * desc: 在高阶组件内部进行条件判断
 */
import React, { useState } from 'react';

class ChildComponent extends React.Component {
  render() {
    return <div>{this.props.name}</div>;
  }
}

const HighOrderComponent = (WrappedComponent) => {
  return class extends WrappedComponent {
    render() {
      if (this.props.loggedIn) {
        return super.render();
      } else {
        return null;
      }
    }
  };
};

const Content = HighOrderComponent(ChildComponent);

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <>
      <button onClick={() => setLoggedIn((prev) => !prev)}>TOGGLE</button>
      <br />
      <Content loggedIn={loggedIn} name="Hello world!" />
    </>
  );
};

export default () => <App />;
