/**
 * title: 惰性初始化
 * desc: 初始值通过执行函数产生
 */

import React, { useReducer } from 'react';
import './index.less';

function init(initialCount) {
  return { count: initialCount };
}

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return init(action.payload);
    default:
      throw new Error();
  }
}

function App({ initialCount }) {
  const [state, dispatch] = useReducer(reducer, initialCount, init);
  return (
    <div className="app">
      <div>Count: {state.count}</div>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button className="reset" onClick={() => dispatch({ type: 'reset', payload: initialCount })}>
        Reset
      </button>
    </div>
  );
}

export default () => <App initialCount={0} />;
