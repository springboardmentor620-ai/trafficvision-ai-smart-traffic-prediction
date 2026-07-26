import { useState, useEffect, useRef } from 'react';
import apiClient from '../services/api';

/**
 * Custom React hook for live real-time traffic telemetry auto-polling.
 * Periodically fetches latest telemetry snapshot & history without page reloads.
 * 
 * @param {number|null} roadId - ID of road corridor to monitor (e.g. 5th Avenue = 103)
 * @param {boolean} enabled - Whether polling is active
 * @param {number} intervalMs - Polling interval in milliseconds (default: 1200ms)
 */
export const useLiveTelemetry = (roadId = null, enabled = true, intervalMs = 1200) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!enabled || !roadId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchTelemetry = async () => {
      try {
        if (isFirstLoad.current) {
          setIsLoading(true);
        }
        
        // Fetch uncached real-time telemetry from backend
        const res = await apiClient.get(`/traffic/road/${roadId}/telemetry`);
        
        if (isMounted) {
          setData(res);
          setError(null);
          if (isFirstLoad.current) {
            setIsLoading(false);
            isFirstLoad.current = false;
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn(`[Live Telemetry] Failed to fetch live metrics for road ${roadId}:`, err.message);
          setError(err.message);
          if (isFirstLoad.current) {
            setIsLoading(false);
            isFirstLoad.current = false;
          }
        }
      }
    };

    // Initial fetch
    fetchTelemetry();

    // Set up auto-refresh interval
    const timer = setInterval(fetchTelemetry, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [roadId, enabled, intervalMs]);

  return { data, isLoading, error };
};
