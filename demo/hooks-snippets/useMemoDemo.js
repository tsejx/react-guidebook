import React from 'react'

function useMemoDemo ({ a, b }) {
  const child1 = useMemo(() => <Child1 a={a} />, [a])
  const child2 = useMemo(() => <Child2 b={b} />, [b])

  return (
    <>
      {child1}
      {child2}
    </>
  )
}