import React, { useEffect } from 'react';
import { useLifecycleHooks } from './useLifecycleHooks'

export const useLogger = (name, props) => {
  useLifecycleHooks({
    onMount: () => console.log(`${name} has mounted`),
    onUnmount: () => console.log(`${name} has unmounted`)
  });
  useEffect(() => {
    console.log('Props updated', props);
  })
}