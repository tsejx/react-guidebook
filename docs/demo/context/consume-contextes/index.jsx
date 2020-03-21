/**
 * title: 消费多个 Context
 * desc: 如果两个或者更多的 context 值经常被一起使用，那你可能要考虑一下另外创建你自己的渲染组件，以提供这些值
 */

import React from 'react';

// Theme context，默认 theme 是 light 值
const ThemeContext = React.createContext('light');

// 用户登录 Context
const UserContext = React.createContext({ name: 'Guest' });

function Profile(props) {
  return (
    <div>
      <div>Theme: {props.theme}</div>
      <div>Profile: {props.user.name === 'Guest' ? 'Guest' : 'Signed'}</div>
    </div>
  );
}

// 一个组件可能会消费多个 context
function Content() {
  return (
    <ThemeContext.Consumer>
      {theme => (
        <UserContext.Consumer>{user => <Profile user={user} theme={theme} />}</UserContext.Consumer>
      )}
    </ThemeContext.Consumer>
  );
}

function Layout() {
  return (
    <div>
      <Content />
    </div>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: 'light',
      signedInUser: { name: 'Guest' },
    };
  }
  render() {
    const { signedInUser, theme } = this.state;

    // 提供初始 context 值的 App 组件
    return (
      <ThemeContext.Provider value={theme}>
        <UserContext.Provider value={signedInUser}>
          <Layout />
        </UserContext.Provider>
      </ThemeContext.Provider>
    );
  }
}

export default App;
