/**
 * title: 回调形式
 * desc: 打开调试台查看打印结果
 */

import React from 'react';

class App extends React.Component {
  private divRef = React.createRef();
  constructor(props) {
    super(props);
  }
  setDivRef = (element) => {
    this.divRef = element;
    console.log('Callback Ref:', this.divRef);
  };
  render() {
    return <div ref={this.setDivRef}>Callback Ref</div>;
  }
}

export default () => <App />;
