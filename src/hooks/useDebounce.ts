/**
 * useDebounce Hook
 * 
 * Delays a value update until the user stops changing it for a specified time.
 * Useful for API calls during typing.
 * 
 * Example:
 *   const [email, setEmail] = useState('')
 *   const debouncedEmail = useDebounce(email, 500)
 *   
 *   useEffect(() => {
 *     // This runs 500ms after user stops typing
 *     checkEmailExists(debouncedEmail)
 *   }, [debouncedEmail])
 */

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
