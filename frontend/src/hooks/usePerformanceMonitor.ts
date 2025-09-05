import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  componentName: string;
  timestamp: number;
}

export function usePerformanceMonitor(componentName: string) {
  const startTimeRef = useRef<number>(performance.now());
  const mountTimeRef = useRef<number>(0);

  useEffect(() => {
    // Component mounted
    mountTimeRef.current = performance.now();
    const loadTime = mountTimeRef.current - startTimeRef.current;

    // Log initial load performance
    const metrics: PerformanceMetrics = {
      loadTime,
      renderTime: 0,
      componentName,
      timestamp: Date.now()
    };

    logPerformanceMetrics(metrics);

    return () => {
      // Component unmounted
      const unmountTime = performance.now();
      const totalRenderTime = unmountTime - mountTimeRef.current;

      const finalMetrics: PerformanceMetrics = {
        loadTime,
        renderTime: totalRenderTime,
        componentName,
        timestamp: Date.now()
      };

      logPerformanceMetrics(finalMetrics);
    };
  }, [componentName]);

  const logPerformanceMetrics = (metrics: PerformanceMetrics) => {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Performance [${metrics.componentName}]:`, {
        loadTime: `${metrics.loadTime.toFixed(2)}ms`,
        renderTime: `${metrics.renderTime.toFixed(2)}ms`,
        timestamp: new Date(metrics.timestamp).toISOString()
      });
    }

    // In production, you might want to send to analytics
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to analytics service
      // analytics.track('component_performance', metrics);
      
      // Or send to your own monitoring endpoint
      // fetch('/api/metrics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(metrics)
      // }).catch(console.error);
    }

    // Store in localStorage for debugging (optional)
    try {
      const existingMetrics = JSON.parse(localStorage.getItem('performanceMetrics') || '[]');
      const updatedMetrics = [...existingMetrics, metrics].slice(-100); // Keep last 100 entries
      localStorage.setItem('performanceMetrics', JSON.stringify(updatedMetrics));
    } catch (error) {
      console.warn('Failed to store performance metrics:', error);
    }
  };

  // Return a function to manually track operations
  const trackOperation = (operationName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      logPerformanceMetrics({
        loadTime: 0,
        renderTime: duration,
        componentName: `${componentName}.${operationName}`,
        timestamp: Date.now()
      });
    };
  };

  return { trackOperation };
}

// Web Vitals monitoring (optional - requires web-vitals package)
export function useWebVitals() {
  useEffect(() => {
    // Check if web-vitals is available
    try {
      // Only import if package is available
      const webVitals = require('web-vitals');
      if (webVitals) {
        webVitals.getCLS(console.log);
        webVitals.getFID(console.log);
        webVitals.getFCP(console.log);
        webVitals.getLCP(console.log);
        webVitals.getTTFB(console.log);
      }
    } catch (error) {
      console.log('Web Vitals package not installed - install with: npm install web-vitals');
    }
  }, []);
}

// Hook to track API call performance
export function useApiPerformance() {
  const trackApiCall = (url: string, method: string = 'GET') => {
    const startTime = performance.now();
    
    return (success: boolean, statusCode?: number) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const metrics = {
        url,
        method,
        duration,
        success,
        statusCode,
        timestamp: Date.now()
      };

      if (process.env.NODE_ENV === 'development') {
        console.log(`🌐 API Call [${method} ${url}]:`, {
          duration: `${duration.toFixed(2)}ms`,
          success,
          statusCode
        });
      }

      // Store API metrics
      try {
        const existingMetrics = JSON.parse(localStorage.getItem('apiMetrics') || '[]');
        const updatedMetrics = [...existingMetrics, metrics].slice(-50); // Keep last 50 API calls
        localStorage.setItem('apiMetrics', JSON.stringify(updatedMetrics));
      } catch (error) {
        console.warn('Failed to store API metrics:', error);
      }
    };
  };

  return { trackApiCall };
}
