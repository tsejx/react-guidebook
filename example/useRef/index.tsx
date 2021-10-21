/**
 * title: 基本用法
 * desc: 命令式地访问子组件
 */

import React, { useRef } from 'react';
import './index.less';

function App() {
  const inputRef = useRef(null);

  const onButtonClick = () => {
    // `current` 指向已挂载到 DOM 上的文本输入元素
    inputRef.current.focus();
  };

  return (
    <>
      <input ref={inputRef} type="text" />
      <button style={{ marginLeft: 8 }} onClick={onButtonClick}>Focus the input</button>
    </>
  );
}

export default () => <App />;
