/**
 * title: 普通更新
 * desc: 通过点击 <code>+</code> 和 <code>-</code> 能增加或减小数值
 */

import React, { useState } from 'react';
import './index.less'

const App = () => {
  const [count, setCount] = useState<number>(0);

  return (
    <div className="app">
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
      <div>{count}</div>
    </div>
  );
};

export default () => <App />;
