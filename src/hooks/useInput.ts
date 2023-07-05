import { ChangeEvent, useCallback, useState } from 'react';

// eslint-disable-next-line no-unused-vars
type ReturnType<T> = [T, (e: ChangeEvent<HTMLInputElement>) => void];

const useInput = <T>(initialData: T): ReturnType<T> => {
  const [value, setValue] = useState(initialData);
  const handler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value as unknown as T);
  }, []);
  return [value, handler];
};

export default useInput;
