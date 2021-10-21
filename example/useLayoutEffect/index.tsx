/**
 * title: 基本用法
 * desc: 点击数值更新，<code>useEffect</code> 会有闪烁问题，而 <code>useLayoutEffect</code> 不会闪烁
 */

import React, { useState, useEffect, useLayoutEffect } from 'react';
import './index.less'

const random = () => {
  return 10 + Math.random() * 200
}

const App = () => {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);

  useEffect(() => {
    if (count1 === 0) {
      setCount1(random());
    }
  }, [count1]);

  useLayoutEffect(() => {
    if (count2 === 0) {
      setCount2(random());
    }
  }, [count2]);

  return (
    <div className="useLayoutEffect">
      <div onClick={() => setCount1(0)}>useEffect：{count1}</div>
      <div onClick={() => setCount2(0)}>useLayoutEffect：{count2}</div>
    </div>
  );
};

export default () => <App />;
