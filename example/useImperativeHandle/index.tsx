/**
 * title: 基本用法
 * desc: 父组件调用子组件中 <code>useImperativeHandle</code> 定义的 <code>focus</code> 和 <code>blur</code> 方法
 */

import React, { useRef, useImperativeHandle } from 'react';

function FancyInput(props, ref) {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    },
    blur: () => {
      inputRef.current.blur();
    }
  }));

  return <input ref={inputRef} />;
}

const FancyInputWrapped = React.forwardRef(FancyInput);

const App = () => {

  const inputRef = useRef(null)

  const handleFocus = () => {
    inputRef.current.focus();
  }

  const handleBlur = () => {
    inputRef.current.blur();
  }

  return (
    <div>
      <FancyInputWrapped ref={inputRef} />
      <button style={{ marginLeft: 8 }} onClick={handleFocus}>FOCUS</button>
      <button style={{ marginLeft: 8 }} onClick={handleBlur}>BLUR</button>
    </div>
  )
};

export default () => <App />