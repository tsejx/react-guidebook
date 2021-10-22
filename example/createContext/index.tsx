/**
 * title: 基本用法
 * desc: 点击图标切换
 */
import React from 'react';

const Context = React.createContext({
  checked: true,
  onToggle: () => {},
});

class ContextProvider extends React.Component {
  // 注意书写顺序；handleToggle 作为箭头函数不能 bind 因此需要写在上面；如果不喜欢这样的顺序则可以书写普通函数放在下面但记得 bind
  handleSwitchToggle = () => {
    this.setState({ checked: !this.state.checked });
  };

  // 1. 重写 state
  state = {
    checked: true,
    onToggle: this.handleSwitchToggle,
  };

  render() {
    // 2. 通过 Provider 组件的 value 将 state 提供出去
    return <Context.Provider value={this.state}>{this.props.children}</Context.Provider>;
  }
}

const ContextConsumer = Context.Consumer;

class ChildComponent extends React.Component {
  render() {
    return (
      <ContextConsumer>
        {({ checked, onToggle }) => <div onClick={() => onToggle()}>{checked ? '✅' : '❌'}</div>}
      </ContextConsumer>
    );
  }
}

class ParentComponent extends React.Component {
  // 更新 state 不会执行
  componentDidUpdate() {
    console.log('ParentComponent did updated');
  }
  render() {
    return <ChildComponent></ChildComponent>;
  }
}

class WrapperComponent extends React.Component {
  // 更新 state 不会执行
  componentDidUpdate() {
    console.log('WrapperComponent did updated');
  }
  render() {
    return <ParentComponent></ParentComponent>;
  }
}

const App = () => {
  return (
    <ContextProvider>
      <WrapperComponent></WrapperComponent>
    </ContextProvider>
  );
};

export default () => <App />;
