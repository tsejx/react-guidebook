export const useLifecycleHooks = ({ onMount, onUnmount }) => (
  useEffect(() => {
    onMount && onMount();

    return () => onUnmount && onUnmount()
  }, [])
)