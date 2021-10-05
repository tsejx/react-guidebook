import React from 'react'
import logo from './logo.svg'
import LikeButton from './components/LikeButton'
import MouseTracker from './components/MouseTracker'
import DogShowHooks from './components/DogShowHooks'
import CatShowHooks from './components/CatShowWithHooks'
import useMousePosiiton from './hooks/useMousePosition'
import useClipboard from "react-use-clipboard"
import useMode from './hooks/useMode'
import './App.css'

function Child1 () {
  const [data, setData] = useMode()

  return <span>{data.a}</span>
}

function Child2 () {
  const [data, setData] = useMode()

  return <span>{data.a}</span>
}

function App () {

  const positions = useMousePosiiton()
  const [isCopied, setCopied] = useClipboard(positions.x)

  const [data, setData] = useMode()

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <DogShowHooks />
        <CatShowHooks />
        <LikeButton />
        <button onClick={setCopied}>
          Was it copied? {isCopied ? "Yes! 👍" : "Nope! 👎"}
        </button>
        {/* <MouseTracker /> */}
        <h1>{positions.x}</h1>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button onClick={() => setData({
          ...data,
          a: data.a++
        })}>sadalksd</button>
        <Child1 />
        <Child2 />
        <span>{data.a}</span>
      </header>
    </div>
  )
}

export default App
