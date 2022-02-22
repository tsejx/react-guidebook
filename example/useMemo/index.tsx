/**
 * title: 基本用法
 * desc: 点击按钮切换主题色的时候，没有使用 <code>useMemo</code> 的变量由于需要重新计算，明显不如使用 <code>useMemo</code> 的重新渲染饿快
 */
import React, { useState, useMemo } from 'react';

function slowFunction(num) {
  console.log('Calling Slow Function');
  for (let i = 0; i <= 1000000000; i++) {}
  return num * 2;
}

const SlowComponent = () => {
  const [value, setValue] = useState(0);
  const [dark, setDark] = useState(false);

  // Bard
  const doubleNumber = slowFunction(value);

  const themeStyles = {
    color: dark ? 'red' : 'black',
  };

  return (
    <>
      <h3>Slow Component</h3>
      <input type="number" value={value} onChange={(e) => setValue(parseInt(e.target.value))} />
      <button onClick={() => setDark((prevDark) => !prevDark)}>Change Theme</button>
      <div style={themeStyles}>{doubleNumber}</div>
    </>
  );
};

const MemoComponent = () => {
  const [value, setValue] = useState(0);
  const [dark, setDark] = useState(false);

  // Good
  const doubleNumber = useMemo(() => {
    return slowFunction(value);
  }, [value]);

  const themeStyles = {
    color: dark ? 'red' : 'black',
  };

  return (
    <>
      <h3>Memo Component</h3>
      <input type="number" value={value} onChange={(e) => setValue(parseInt(e.target.value))} />
      <button onClick={() => setDark((prevDark) => !prevDark)}>Change Theme</button>
      <div style={themeStyles}>{doubleNumber}</div>
    </>
  );
};

const App = () => {
  return (
    <>
      <SlowComponent />
      <br />
      <MemoComponent />
    </>
  );
};

export default () => <App />;
