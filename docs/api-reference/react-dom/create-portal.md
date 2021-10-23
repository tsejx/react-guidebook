---
nav:
  title: API
  order: 4
group:
  title: ReactDOM
  order: 4
title: ReactDOM.createPortal
order: 5
---

# ReactDOM.createPortal

## 基本用法

语法：

```jsx | pure
ReactDOM.createPortal(child, container);
```

参数：

- `child`：
- `container`：

类型声明：

```ts
type ReactEmpty = null | void | boolean;

type ReactNodeList = ReactEmpty | React$Node;

type ReactPortal = {
  $$typeof: Symbol | number,
  key: null | string,
  containerInfo: any,
  children: ReactNodeList,
  // TODO: figure out the API for cross-renderer implementation.
  implementation: any,
  ...
};

export function createPortal(
  children: ReactNodeList,
  containerInfo: any,
  implementation: any,
  key: ?string = null
): ReactPortal {
  // do something
  return {
    // This tag allow us to uniquely identify this as a React Portal
    $$typeof: REACT_PORTAL_TYPE,
    key: key == null ? null : '' + key,
    children,
    containerInfo,
    implementation,
  };
}
```

代码示例：

```ts
import React from 'react';
import ReactDOM from 'react-dom';

class Overlay extends React.Component {
  private overlayContainer = document.createElement('div');

  constructor(props) {
    super(props);
    // Create container DOM element and append to DOM.
    document.body.appendChild(this.overlayContainer);
  }

  componentWillUnmount() {
    document.body.removeChild(this.overlayContainer);
  }

  render() {
    return ReactDOM.createPortal(
      <div style={overlay}>
        <div style={overlayContent}>{this.props.children}</div>
      </div>,
      this.overlayContainer
    );
  }
}

class App extends React.Component<{}, { showOverlay: boolean }> {
  state = {
    showOverlay: false,
  };

  toggleOverlay = () => {
    this.setState((prevState) => ({ showOverlay: !prevState.showOverlay }));
  };

  render() {
    return (
      <div>
        {this.state.showOverlay && (
          <Overlay>
            <div>
              Overlay Content <button onClick={this.toggleOverlay}>Close</button>
            </div>
          </Overlay>
        )}
        <button onClick={this.toggleOverlay}>Open Overlay</button>
      </div>
    );
  }
}

export default () => <App />;
```

[Codesandbox: createPortal demo](https://codesandbox.io/s/6yx5o1qpz?file=/src/overlayStyles.js)
