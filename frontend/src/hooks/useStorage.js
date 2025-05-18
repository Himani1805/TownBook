import { useState, useEffect } from 'react';

// Helper function to safely access localStorage/sessionStorage
const getStorageValue = (key, defaultValue, storage) => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const saved = storage.getItem(key);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${storage === localStorage ? 'localStorage' : 'sessionStorage'} key "${key}":`, error);
    return defaultValue;
  }
};

// Generic storage hook
const useStorage = (key, initialValue, storage) => {
  const [storedValue, setStoredValue] = useState(() => {
    return getStorageValue(key, initialValue, storage);
  });

  // Update state when the key or storage value changes
  useEffect(() => {
    setStoredValue(getStorageValue(key, initialValue, storage));
  }, [key, initialValue, storage]);

  // Return a wrapped version of useState's setter function that persists the new value to storage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save to state
      setStoredValue(valueToStore);
      
      // Save to storage
      if (typeof window !== 'undefined') {
        storage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting ${storage === localStorage ? 'localStorage' : 'sessionStorage'} key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        storage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing ${storage === localStorage ? 'localStorage' : 'sessionStorage'} key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};

// Hook for local storage
export const useLocalStorage = (key, initialValue) => {
  return useStorage(key, initialValue, localStorage);
};

// Hook for session storage
export const useSessionStorage = (key, initialValue) => {
  return useStorage(key, initialValue, sessionStorage);
};

// Hook that syncs state with URL search params
export const useSearchParamsState = (paramName, defaultValue) => {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return defaultValue;
    
    const params = new URLSearchParams(window.location.search);
    const paramValue = params.get(paramName);
    return paramValue !== null ? JSON.parse(decodeURIComponent(paramValue)) : defaultValue;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    
    if (value === undefined || value === null || (typeof value === 'object' && Object.keys(value).length === 0)) {
      params.delete(paramName);
    } else {
      params.set(paramName, encodeURIComponent(JSON.stringify(value)));
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [value, paramName]);

  return [value, setValue];
};

// Hook that syncs state with multiple URL search params
export const useSearchParams = (initialState = {}) => {
  const [params, setParams] = useState(() => {
    if (typeof window === 'undefined') return initialState;
    
    const searchParams = new URLSearchParams(window.location.search);
    const result = {};
    
    // Initialize with default values
    Object.keys(initialState).forEach(key => {
      const value = searchParams.get(key);
      result[key] = value !== null ? JSON.parse(decodeURIComponent(value)) : initialState[key];
    });
    
    return result;
  });

  const setParam = (key, value) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Update URL when params change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, encodeURIComponent(JSON.stringify(value)));
      }
    });
    
    const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [params]);

  return [params, setParam, setParams];
};
