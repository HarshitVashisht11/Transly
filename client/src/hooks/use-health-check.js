import { useState, useEffect } from 'react';

/**
 * Custom hook to check backend health status
 * @param {number} interval - Polling interval in milliseconds (default: 30000ms)
 * @returns {object} Health status information
 */
export function useHealthCheck(interval = 30000) {
  const [status, setStatus] = useState({
    isHealthy: true,
    loading: true,
    lastChecked: null,
    services: {
      api: true,
    },
    error: null,
    status: "ok",
    service: "transly-api"
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/health');
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        setStatus({
          status: data.status,
          service: data.service,
          isHealthy: data.status === "ok",
          loading: false,
          lastChecked: new Date(),
          services: {
            [data.service]: data.status === "ok"
          },
          error: null
        });
      } catch (error) {
        console.error('Health check failed:', error);
        setStatus(prev => ({
          ...prev,
          status: "error",
          isHealthy: false,
          loading: false,
          lastChecked: new Date(),
          error: error.message || 'Failed to connect to health service'
        }));
      }
    };

    // Initial check
    checkHealth();

    // Set up polling
    const intervalId = setInterval(checkHealth, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return status;
}
