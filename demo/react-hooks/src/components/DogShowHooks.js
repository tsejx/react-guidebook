import React, { useState, useEffect } from 'react'
import axios from 'axios'
import useURLLoader from '../hooks/useURLLoader'

const DogShowHooks = () => {
  const [fetch, setFetch] = useState(false)
  const [data, loading] = useURLLoader('https://dog.ceo/api/breeds/image/random')

  const style = {
    width: 200
  }

  return (
    <>
      {loading ? <p>加载中</p> : <img src={data && data.message} alt="dog" style={style} />}
      <button onClick={() => setFetch(!fetch)}>再看一张</button>
    </>
  )
}

export default DogShowHooks