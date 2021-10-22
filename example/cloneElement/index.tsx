/**
 * title: 基本用法
 * desc: 点击按钮基于原 React 元素克隆新的 React 元素
 */
import React, { useState } from 'react';

const initialElement = React.createElement('div', null, 'Nothing');

const cloneElement = React.cloneElement(
  initialElement,
  { className: 'myClass' },
  React.createElement('h2', null, 'Hello world!'),
  React.createElement('hr')
);

const App = () => {
  const [ele, setEle] = useState<any>(initialElement);

  return (
    <>
      <button onClick={() => setEle(cloneElement)}>TOGGLE</button>
      <br />
      {ele}
    </>
  );
};

export default () => <App />;
