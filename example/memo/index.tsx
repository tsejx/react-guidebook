/**
 * title: 基本用法
 * desc: 值为奇数时不重渲染，否则重渲染
 */
import React from 'react';

const SubComponent = (props) => <>Current value is {props.value}.</>;

// 创建 memo 组件
const Memo = React.memo(SubComponent, (prevProps, nextProps) => {
  // 当 value 值为奇数时不重渲染，否则重渲染
  return nextProps.value % 2 === 1;
});

class App extends React.Component<{}, { value: number }> {
  constructor(props) {
    super(props);

    this.state = {
      value: 0,
    };
  }
  handleInputChange = (e) => {
    this.setState({ value: +e.target.value });
  }
  render() {
    const { value } = this.state;
    return (
      <div>
        <input value={value} type="number" onChange={this.handleInputChange} />
        <br />
        <Memo value={value} />
      </div>
    );
  }
}

export default () => <App />;
