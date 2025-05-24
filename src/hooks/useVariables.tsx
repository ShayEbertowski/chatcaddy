// hooks/useVariables.js
import { useEffect, useState } from 'react';
import { extractVariables } from '../utils/utils'; // ✅ import it

export function useVariables(input) {
  const [variables, setVariables] = useState([]);
  const [filledValues, setFilledValues] = useState({});

  useEffect(() => {
    const vars = extractVariables(input); // ✅ just use it
    setVariables(vars);
    setFilledValues(Object.fromEntries(vars.map(v => [v, ''])));
  }, [input]);

  return { variables, filledValues, setFilledValues };
}
