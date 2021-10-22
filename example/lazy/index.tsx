/**
 * title: 通过变量控制加载
 * desc: 当点击需要该组件显示时，页面才去加载该脚本文件，这能达到代码分离并懒加载的目的
 */
import React, { useState, Suspense, lazy } from 'react';

// 像常规组件一样动态引入组件，使用 React 文档中的 React.lazy 函数语法
const LazyComponent = lazy(() => import('./LazyComponent'));

const App = () => {
  const [visible, setVisible] = useState(false);
  // LazyComponent 未加载完，就必须显示一些提示等待的 fallback 内容，比如一个加载指示器
  return (
    <div>
      <button onClick={() => setVisible((prev) => !prev)}>TOGGLE</button>
      {visible && (
        <Suspense fallback={<div>Lodaing</div>}>
          <LazyComponent />
        </Suspense>
      )}
    </div>
  );
};

export default () => <App />;
