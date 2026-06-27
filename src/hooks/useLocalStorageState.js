import { useEffect, useState } from 'react';

export function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const storedValue = window.localStorage.getItem(key);
      if (!storedValue) {
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        return initialValue;
      }

      return JSON.parse(storedValue);
    } catch (error) {
      console.warn(`Falha ao ler localStorage:${key}`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Falha ao salvar localStorage:${key}`, error);
    }
  }, [key, state]);

  return [state, setState];
}
