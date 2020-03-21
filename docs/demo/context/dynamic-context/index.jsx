import React from 'react';

// ThemeContext
const themes = {
  light: {
    background: '#eeeeee',
    color: '#222222',
  },
  dark: {
    background: '#222222',
    color: '#eeeeee',
  },
};

// 创建 Context 对象
const ThemeContext = React.createContext(
  themes.dark // 默认值
);

// ThemedButton
class ThemedButton extends React.Component {
  render() {
    let props = this.props;
    // 外部创建的 Context 静态挂载了 contextType
    // 所以可以获取到对应的 Context 对象
    let theme = this.context;
    return (
      <button
        {...props}
        style={{
          marginTop: 16,
          outline: 'none',
          color: theme.color,
          backgroundColor: theme.background,
          cursor: 'pointer'
        }}
      >
        Submit
      </button>
    );
  }
}

// 将外部创建的 Context 对象挂载到 Class 上的 contextType 属性上
// 内部通过 this.context 可以消费
ThemedButton.contextType = ThemeContext;

// App.js
// 一个使用 ThemedButton 的中间组件
function Toolbar(props) {
  return <ThemedButton onClick={props.changeTheme}>Change Theme</ThemedButton>;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: themes.light,
    };

    this.toggleTheme = () => {
      this.setState(state => ({
        theme: state.theme === themes.dark ? themes.light : themes.dark,
      }));
    };
  }

  render() {
    // 在 ThemeProvider 內部的 ThemedButton 按钮组件使用 state 的 theme 值
    // 而外部的组件使用默认的 theme 值
    return (
      <ThemeContext.Provider value={this.state.theme}>
        <Toolbar changeTheme={this.toggleTheme} />
      </ThemeContext.Provider>
    );
  }
}

export default () => <App />;
