/**
 * title: Hook 形式
 * desc: 打开调试台查看打印结果
 */

import React, { useEffect, useRef } from 'react';

const App = () => {
  const divRef = useRef(null);

  useEffect(() => {
    console.log('Hook Ref:', divRef.current);
  }, [divRef]);

  return (
    <>
      <div ref={divRef}>Hook Ref</div>
    </>
  );
};

export default () => <App />;
