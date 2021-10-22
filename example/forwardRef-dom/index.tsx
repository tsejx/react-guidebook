/**
 * title: 转发 refs 到 DOM 组件
 * desc: 父组件可获取子组件 DOM 节点 <code>ref</code>，并对其进行操作
 */
import React from 'react';

const FancyInput = React.forwardRef((props, ref) => (
  <input {...props} ref={ref} className="Button" />
));

class App extends React.Component {
  private ref = React.createRef<HTMLInputElement>()

  constructor(props) {
    super(props);
  }
  handleFocus = () => {
    const { current } = this.ref;
    current.focus();
  }
  handleBlur = () => {
    const { current } = this.ref;
    current.blur();
  }
  render() {
    return (
      <div>
        <FancyInput ref={this.ref}></FancyInput>
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
