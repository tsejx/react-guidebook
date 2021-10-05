import React, { useState, useEffect } from 'react'

const useMousePosition = () => {
  const [positions, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateMouse = (event) => {
      setPosition({ x: event.clientX, y: event.clientY })
    }

    document.addEventListener('mousemove', updateMouse)

    return () => {
      document.removeEventListener('mousemove', updateMouse)
    }
  })

  return positions
}

export default useMousePosition