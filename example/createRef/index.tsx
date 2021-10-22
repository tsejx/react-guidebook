/**
 * title: 基本用法
 * desc:
 */
import React from 'react';

class App extends React.Component {
  // 创建 ref 存储 inputRef DOM 元素
  private inputRef = React.createRef<HTMLInputElement>();

  constructor(props) {
    super(props);
  }
  handleFocus = () => {
    // 注意：通过 current 取得 DOM 节点
    // 直接使用原生 API 使 input 输入框获得焦点
    const { current } = this.inputRef;
    current.focus();
  }
  handleBlur = () => {
    const { current } = this.inputRef;
    current.blur();
  }
  render() {
    return (
      <div>
        {/* 把 <input> ref 关联到构造器中创建的 inputRef 上 */}
        <input type="text" ref={this.inputRef} />
        <button style={{ marginLeft: 8 }} onClick={this.handleFocus}>
          FOCUS
        </button>
        <button style={{ marginLeft: 8 }} onClick={this.handleBlur}>
          BLUR
        </button>
      </div>
    );
  }
}

export default () => <App />;
