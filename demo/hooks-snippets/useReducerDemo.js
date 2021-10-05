import React from 'react'

const initialState = { count: 0 }

// reducer 纯函数，接收当前的 state 和 action，action 身上带
// reducer 每次执行都会返回一个新的数据
function reducer (state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    case 'decrement':
      return { count: state.count - 1 }
    default:
      throw new Error()
  }
}

export default function useReducerDemo () {
  // 利用 useReducer 生成状态
  // 第一个参数为处理数据的 reducer，第二个参数为初始状态
  // dispatch 每次调用都会触发 reducer 来生成新的状态
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </>
  )
}