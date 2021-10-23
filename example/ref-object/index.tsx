/**
 * title: 对象形式
 * desc: 打开调试台查看打印结果
 */

import React from 'react';

class App extends React.Component {
  private divRef = React.createRef();

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log('Object Ref:', this.divRef.current);
  }

  render() {
    return <div ref={this.divRef}>Object Ref</div>;
  }
}

export default () => <App />;
