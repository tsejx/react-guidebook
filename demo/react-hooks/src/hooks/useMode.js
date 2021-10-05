import React, { useState } from 'react'

const useMode = () => {
  const [data, setData] = useState({
    a: 1,
    b: 2
  })

  return [data, setData]
}

export default useMode