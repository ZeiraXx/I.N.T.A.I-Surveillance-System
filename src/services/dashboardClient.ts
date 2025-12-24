import type { DashboardState } from '@/types/dashboard';
import { DashboardStateSchema } from '@/types/dashboard';
import { mockGenerator } from './mockData';
import { demoGenerator } from './demoData';

const DATA_MODE = import.meta.env.VITE_DATA_MODE || 'mock';

async function fetchFromAPI(): Promise<DashboardState> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const DASHBOARD_PATH = import.meta.env.VITE_DASHBOARD_PATH || '/api/dashboard';
  const url = API_BASE_URL ? `${API_BASE_URL}${DASHBOARD_PATH}` : DASHBOARD_PATH;
  
  console.log('Fetching from:', url); // Debug log
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const rawData = await response.json();
    
    // Validate and parse with Zod
    const parsedData = DashboardStateSchema.parse(rawData);
    
    return parsedData;
  } catch (error) {
    console.error('Failed to fetch from API:', error);
    
    // Return fallback data on error
    return mockGenerator.generate();
  }
}

export async function getDashboard(): Promise<DashboardState> {
  if (DATA_MODE === 'demo') {
    // Demo mode: use client-side demo data (no backend needed)
    return demoGenerator.generate();
  }
  
  if (DATA_MODE === 'api') {
    return fetchFromAPI();
  }
  
  // Default: mock mode
  return mockGenerator.generate();
}

export function getDataMode(): 'demo' | 'mock' | 'api' {
  if (DATA_MODE === 'api') {
    return 'api';
  }
  if (DATA_MODE === 'demo') {
    return 'demo';
  }
  return 'mock';
}


