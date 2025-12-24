import { useQuery } from '@tanstack/react-query';
import { getDashboard, getDataMode } from '@/services/dashboardClient';
import type { DashboardState } from '@/types/dashboard';
import { useState, useEffect } from 'react';

export function useDashboard() {
  const dataMode = getDataMode();
  const [demoElapsed, setDemoElapsed] = useState(0);
  
  // Track elapsed time for demo mode
  useEffect(() => {
    if (dataMode === 'demo') {
      const startTime = Date.now();
      const interval = setInterval(() => {
        setDemoElapsed((Date.now() - startTime) / 1000);
      }, 500); // Update every 500ms instead of 100ms
      return () => clearInterval(interval);
    }
  }, [dataMode]);
  
  // Demo mode: poll every 500ms for first 2 seconds, then every 2s for timestamp/latency (reduced from 100ms to improve video performance)
  // Mock mode: refetch every 800ms for live feel
  // API mode: refetch every 2 seconds
  let refetchInterval: number | false;
  if (dataMode === 'demo') {
    refetchInterval = demoElapsed >= 2 ? 2000 : 500; // Reduced frequency: 500ms for first 2s, then 2s for updates
  } else if (dataMode === 'mock') {
    refetchInterval = 800;
  } else {
    refetchInterval = 2000; // API mode
  }
  
  const query = useQuery<DashboardState>({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    refetchInterval,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
  
  return {
    ...query,
    dataMode,
  };
}
