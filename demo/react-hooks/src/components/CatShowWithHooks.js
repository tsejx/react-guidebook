import React, { useState, useEffect } from 'react'
import useURLLoader from '../hooks/useURLLoader'

const CatShowWithHooks = () => {
  const [category, setCategory] = useState('1')
  const [data, loading] = useURLLoader(`https://api.thecatapi.com/v1/images/search?limit1&category_ids=${category}`)

  return (
    <>
      {
        loading ? <p>😼读取中</p> : <img src={data && data[0].url} alt="cat" style={{ width: 200 }} />
      }
      <button onClick={() => setCategory('1')}>盒子</button>
      <button onClick={() => setCategory('5')}>帽子</button>
    </>
  )
}

export default CatShowWithHooks