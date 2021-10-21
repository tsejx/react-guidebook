/**
 * title: 函数式更新
 * desc: 基于先前值变更 state
 */

import React, { useState } from 'react';
import './index.less';

const App = () => {
  const [count, setCount] = useState<number>(0);

  return (
    <div className="app">
      <button onClick={() => setCount((prevCount) => prevCount + 1)}>+</button>
      <button onClick={() => setCount((prevCount) => prevCount - 1)}>-</button>
      <div>{count}</div>
    </div>
  );
};

export default () => <App />;
