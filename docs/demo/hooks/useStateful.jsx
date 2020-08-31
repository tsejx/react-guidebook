import React, { useState } from 'react'

export const useStateful = initial => {
  const [value, setValue] = useState(initial);
  return {
    value,
    setvalue
  }
}