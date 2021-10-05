import React, { useState, useEffect } from 'react'

const MouseTracker = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateMouse = (event) => {
      console.log('inner')
      setPosition({ x: event.clientX, y: event.clientY })
    }

    console.log('add listener')
    document.addEventListener('click', updateMouse)

    return () => {
      console.log('remove listener')

      document.removeEventListener('click', updateMouse)
    }

  })

  return (
    <p>X:{position.x},Y:{position.y}</p>
  )
}

export default MouseTracker