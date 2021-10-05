import { useStateful } from './useStateful';

export const useSetState = (initial) => {
    const { value, setValue } = useStateful(initial)
    return {
        state: value,
        setState: useCallback(v => {
            return setValue(prevValue => ({
                ...prevValue,
                ...(typeof v === 'function' ? v(prevValue) : v)
            }));
        }, [])
    }
}