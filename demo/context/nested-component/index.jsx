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

// 确保传递给 createContext 的默认值数据结构是调用的组件（consumers）所能匹配的！
const ThemeContext = React.createContext({
  theme: themes.dark,
  toggleTheme: () => {},
});

function ThemeTogglerButton() {
  // Theme Toggler 按钮不仅仅只获取 theme 值，它也从 context 中获取到一个 toggleTheme 函数
  return (
    <ThemeContext.Consumer>
      {({ theme, toggleTheme }) => (
        <button
          onClick={toggleTheme}
          style={{
            outline: 'none',
            color: theme.color,
            backgroundColor: theme.background,
            cursor: 'pointer',
          }}
        >
          Toggle Theme
        </button>
      )}
    </ThemeContext.Consumer>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.toggleTheme = () => {
      this.setState(state => ({
        theme: state.theme === themes.dark ? themes.light : themes.dark,
      }));
    };

    // State 也包含了更新函数，因此它会被传递进 context provider。
    this.state = {
      theme: themes.light,
      toggleTheme: this.toggleTheme,
    };
  }
  render() {
    // 整个 state 都被传递进 provider
    return (
      <ThemeContext.Provider value={this.state}>
        <Content />
      </ThemeContext.Provider>
    );
  }
}

function Content() {
  return (
    <div>
      <ThemeTogglerButton />
    </div>
  );
}

export default () => <App />;
