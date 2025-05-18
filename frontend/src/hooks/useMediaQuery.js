import { useState, useEffect, useCallback } from 'react';

// Media query hook with SSR support
export function useMediaQuery(query, defaultValue = false) {
  const [matches, setMatches] = useState(defaultValue);
  const [isMounted, setIsMounted] = useState(false);

  const updateMatches = useCallback(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      setMatches(media.matches);
    }
  }, [query]);

  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
      updateMatches();
      
      const media = window.matchMedia(query);
      
      // For older browsers that don't support addEventListener on MediaQueryList
      const listener = () => updateMatches();
      
      if (media.addEventListener) {
        media.addEventListener('change', listener);
      } else {
        media.addListener(listener);
      }
      
      return () => {
        if (media.removeEventListener) {
          media.removeEventListener('change', listener);
        } else {
          media.removeListener(listener);
        }
      };
    }
    
    return undefined;
  }, [query, updateMatches]);

  // Return default value during SSR and hydration
  return isMounted ? matches : defaultValue;
}

// Common media queries
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
export const useIsPortrait = () => useMediaQuery('(orientation: portrait)');
export const useIsLandscape = () => useMediaQuery('(orientation: landscape)');

// Hook to detect if the user prefers reduced motion
export function useReducedMotion(initialValue = false) {
  return useMediaQuery('(prefers-reduced-motion: reduce)', initialValue);
}

// Hook to detect if the user prefers dark mode
export function useDarkMode(initialValue = false) {
  return useMediaQuery('(prefers-color-scheme: dark)', initialValue);
}

// Hook to detect if the user is online
export function useOnlineStatus(initialStatus = true) {
  const [isOnline, setIsOnline] = useState(initialStatus);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
    
    return undefined;
  }, []);

  return isOnline;
}

// Hook to detect if an element is in the viewport
export function useInViewport(ref, options = {}) {
  const [isInView, setIsInView] = useState(false);
  const [wasInView, setWasInView] = useState(false);
  const [intersectionRatio, setIntersectionRatio] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
      setIntersectionRatio(entry.intersectionRatio);
      
      if (entry.isIntersecting) {
        setWasInView(true);
      }
    }, {
      threshold: 0,
      rootMargin: '0px',
      ...options,
    });
    
    observer.observe(ref.current);
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return { isInView, wasInView, intersectionRatio };
}

// Hook to measure an element's dimensions and position
export function useMeasure(ref) {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!ref.current) return;
    
    const measure = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
          x: rect.x,
          y: rect.y,
        });
      }
    };
    
    // Initial measurement
    measure();
    
    // Set up resize observer for responsive elements
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(ref.current);
    
    // Also listen to window resize for cases where the parent changes size
    window.addEventListener('resize', measure);
    
    return () => {
      if (ref.current) {
        resizeObserver.unobserve(ref.current);
      }
      window.removeEventListener('resize', measure);
    };
  }, [ref]);

  return dimensions;
}

// Hook to debounce a value
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook to throttle a callback
export function useThrottle(callback, delay, options = { leading: true, trailing: true }) {
  const { leading, trailing } = options;
  const [throttledValue, setThrottledValue] = useState(null);
  const lastExecuted = React.useRef(Date.now());
  const timeoutId = React.useRef(null);
  const lastValue = React.useRef(null);
  const isMounted = React.useRef(true);

  const cancel = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      cancel();
    };
  }, [cancel]);

  const throttledFunction = useCallback((...args) => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecuted.current;
    lastValue.current = args[0];

    const execute = () => {
      if (!isMounted.current) return;
      lastExecuted.current = now;
      setThrottledValue(callback(...args));
    };

    if (timeSinceLastExecution >= delay) {
      if (leading) {
        execute();
      }
    } else if (trailing && !timeoutId.current) {
      timeoutId.current = setTimeout(() => {
        execute();
        timeoutId.current = null;
      }, delay - timeSinceLastExecution);
    }
  }, [callback, delay, leading, trailing]);

  return [throttledValue, throttledFunction, cancel];
}
