import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ThingSpeakProvider, ThingSpeakReading, useThingSpeak } from "./ThingSpeakProvider";
import { MockDataProvider, useDashboardData } from "./MockDataProvider";

// Combined data interface
export interface SensorDataReading {
  temperature: number | null;
  humidity: number | null;
  co2: number | null;
  co: number | null;
  h2: number | null;
  timestamp: string;
}

interface DataContextType {
  latestReading: SensorDataReading | null;
  historicalReadings: SensorDataReading[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  usingMockData: boolean;
  toggleMockData: () => void;
  alerts: any[]; // Adding alerts property to match what RealTimeAlerts is expecting
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Component that renders either real data or mock data
const ThingSpeakWithFallback = ({ children, onUseMock }: { children: ReactNode, onUseMock: (isMock: boolean) => void }) => {
  const { latestReading, historicalReadings, loading, error, lastUpdated } = useThingSpeak();
  const mockData = useDashboardData();
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Decide whether to use real or mock data
  useEffect(() => {
    const shouldUseMock = Boolean(error || 
      !latestReading || 
      (latestReading && (
        latestReading.temperature === null && 
        latestReading.humidity === null && 
        latestReading.co2 === null && 
        latestReading.co === null && 
        latestReading.h2 === null
      ))
    );
    
    setUsingMockData(shouldUseMock);
    onUseMock(shouldUseMock);
  }, [latestReading, error]);
  
  // If using real data and it's available
  if (!usingMockData) {
    // Convert ThingSpeak readings to SensorDataReading format
    const convertedLatest: SensorDataReading | null = latestReading ? {
      temperature: latestReading.temperature,
      humidity: latestReading.humidity,
      co2: latestReading.co2,
      co: latestReading.co,
      h2: latestReading.h2,
      timestamp: latestReading.timestamp
    } : null;
    
    const convertedHistorical: SensorDataReading[] = historicalReadings.map(reading => ({
      temperature: reading.temperature,
      humidity: reading.humidity,
      co2: reading.co2,
      co: reading.co,
      h2: reading.h2,
      timestamp: reading.timestamp
    }));
    
    return (
      <DataContext.Provider value={{
        latestReading: convertedLatest,
        historicalReadings: convertedHistorical,
        loading,
        error,
        lastUpdated,
        usingMockData: false,
        toggleMockData: () => setUsingMockData(!usingMockData),
        alerts: [] // Adding empty alerts array
      }}>
        {children}
      </DataContext.Provider>
    );
  }
  
  // Using mock data
  const mockLatest: SensorDataReading = {
    temperature: mockData.sensors.find(s => s.id === 'temperature')?.value ?? null,
    humidity: mockData.sensors.find(s => s.id === 'humidity')?.value ?? null,
    co2: mockData.sensors.find(s => s.id === 'co2')?.value ?? null,
    co: mockData.sensors.find(s => s.id === 'co')?.value ?? null,
    h2: mockData.sensors.find(s => s.id === 'hydrogen')?.value ?? null, // Using hydrogen as h2
    timestamp: mockData.lastUpdate.toISOString()
  };
  
  const mockHistorical: SensorDataReading[] = mockData.chartData.map((point, index) => ({
    temperature: point.temperature,
    humidity: point.humidity,
    co2: point.co2,
    co: point.co,
    h2: point.hydrogen, // Using hydrogen as h2
    // Generate timestamps going backward from now
    timestamp: new Date(new Date().getTime() - index * 60000).toISOString() // Create sequential timestamps
  }));
  
  return (
    <DataContext.Provider value={{
      latestReading: mockLatest,
      historicalReadings: mockHistorical,
      loading: false,
      error: null,
      lastUpdated: mockData.lastUpdate,
      usingMockData: true,
      toggleMockData: () => setUsingMockData(!usingMockData),
      alerts: [
        // Add some mock alerts for testing
        {
          id: '1',
          node_id: 'node1',
          alert_type: 'temperature',
          message: 'High temperature detected',
          severity: 'high',
          acknowledged: false,
          created_at: new Date().toISOString(),
          sensor_nodes: { name: 'Living Room', location: 'First Floor' }
        },
        {
          id: '2',
          node_id: 'node2',
          alert_type: 'smoke',
          message: 'Critical smoke levels detected',
          severity: 'critical',
          acknowledged: false,
          created_at: new Date(Date.now() - 1800000).toISOString(),
          sensor_nodes: { name: 'Kitchen', location: 'First Floor' }
        },
        {
          id: '3',
          node_id: 'node1',
          alert_type: 'humidity',
          message: 'Low humidity warning',
          severity: 'medium',
          acknowledged: true,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          sensor_nodes: { name: 'Living Room', location: 'First Floor' }
        }
      ]
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [isMock, setIsMock] = useState(false);

  return (
    <ThingSpeakProvider>
      <MockDataProvider>
        <ThingSpeakWithFallback onUseMock={setIsMock}>
          {children}
        </ThingSpeakWithFallback>
      </MockDataProvider>
    </ThingSpeakProvider>
  );
};