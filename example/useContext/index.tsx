/**
 * title: 基本用法
 * desc: 查看代码了解实现方式
 */

import React, { useState, useContext } from 'react';
import './index.less'

const themes = {
  light: {
    foreground: '#000000',
    background: '#eeeeee',
  },
  dark: {
    foreground: '#ffffff',
    background: '#222222',
  },
};

const ThemeContext = React.createContext(themes.light);

function App() {
  const [theme, setTheme] = useState(themes.light)

  const toggle = () => {
    setTheme((prevTheme) => prevTheme === themes.light ? themes.dark : themes.light)
  }

  return (
    <ThemeContext.Provider value={theme}>
      <Toolbar />
      <button onClick={toggle}>TOGGLE</button>
    </ThemeContext.Provider>
  );
}

function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return (
    <button style={{ background: theme.background, color: theme.foreground }}>
      I am styled by theme context!
    </button>
  );
}

export default () => <App />