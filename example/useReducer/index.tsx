/**
 * title: 基本用法
 * desc: 使用 <code>useReducer</code> 重写 <code>useState</code>
 */

import React, { useReducer } from 'react';
import './index.less'

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return initialState
    default:
      throw new Error();
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <div className="app">
      <div>Count: {state.count}</div>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button className="reset" onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}

export default () => <App />