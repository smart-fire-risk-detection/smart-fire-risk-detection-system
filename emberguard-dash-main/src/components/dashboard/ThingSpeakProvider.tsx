import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// ThingSpeak data interfaces
export interface ThingSpeakReading {
  temperature: number | null;
  humidity: number | null;
  co2: number | null;
  co: number | null;
  h2: number | null;
  timestamp: string;
}

interface ThingSpeakContextType {
  latestReading: ThingSpeakReading | null;
  historicalReadings: ThingSpeakReading[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
}

const ThingSpeakContext = createContext<ThingSpeakContextType | undefined>(undefined);

export const useThingSpeak = () => {
  const context = useContext(ThingSpeakContext);
  if (context === undefined) {
    throw new Error('useThingSpeak must be used within a ThingSpeakProvider');
  }
  return context;
};

interface ThingSpeakProviderProps {
  children: ReactNode;
  channelId?: string;
  apiKey?: string;
  refreshInterval?: number;
}

export const ThingSpeakProvider: React.FC<ThingSpeakProviderProps> = ({ 
  children, 
  channelId = "3111993",
  apiKey = "FWZVQI3THXH3CZH7", 
  refreshInterval = 2000 
}) => {
  const [latestReading, setLatestReading] = useState<ThingSpeakReading | null>(null);
  const [historicalReadings, setHistoricalReadings] = useState<ThingSpeakReading[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const apiURL = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}`;
  
  // Function to validate and correct temperature readings
  const validateTemperature = (value: number | null): number | null => {
    if (value === null || isNaN(value)) return null;
    
    // Handle the decimal point issue (values around 3436)
    if (value > 3000) {
      // Attempt to correct by dividing by 100
      return value / 100;
    }
    
    // Regular validation (-50 to 100°C range)
    if (value < -50 || value > 100) {
      return null;
    }
    
    return value;
  };
  
  // Function to parse and validate a field value
  const parseFieldValue = (value: string | null, type: 'temperature' | 'humidity' | 'co2' | 'co' | 'h2'): number | null => {
    if (!value) return null;
    
    try {
      const parsedValue = parseFloat(value);
      
      if (isNaN(parsedValue)) return null;
      
      switch (type) {
        case 'temperature':
          // More conservative validation for temperature (0-50°C common range)
          return (parsedValue < -50 || parsedValue > 100) ? null : parsedValue;
        case 'humidity':
          return (parsedValue < 0 || parsedValue > 100) ? null : parsedValue;
        case 'co2':
          return (parsedValue < 0) ? null : parsedValue;
        case 'co':
          return (parsedValue < 0) ? null : parsedValue;
        case 'h2':
          return (parsedValue < 0) ? null : parsedValue;
        default:
          return parsedValue;
      }
    } catch (e) {
      console.error(`Error parsing ${type} value:`, e);
      return null;
    }
  };

  const fetchData = async (resultsCount = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchUrl = `${apiURL}&results=${resultsCount}`;
      const response = await fetch(fetchUrl);
      const data = await response.json();
      
      if (!data.feeds || data.feeds.length === 0) {
        setError('No data available from ThingSpeak');
        setLoading(false);
        return;
      }
      
      // Process the latest reading
      const latestFeed = data.feeds[data.feeds.length - 1];
      
      // UPDATED: Map fields correctly according to the actual sensor readings
      // field1 = CO2 (~3691.00 ppm)
      // field2 = CO (~72.00 ppm)
      // field3 = H2 (~36.00 ppm)
      // field4 = Temperature (~30.80°C)  // Swapped with field5
      // field5 = Humidity (~75.00%)      // Swapped with field4
      const processedReading: ThingSpeakReading = {
        temperature: parseFieldValue(latestFeed.field4, 'temperature'),  // Changed to field4
        humidity: parseFieldValue(latestFeed.field5, 'humidity'),        // Changed to field5
        co2: parseFieldValue(latestFeed.field1, 'co2'),                  // Field1 is correct
        co: parseFieldValue(latestFeed.field2, 'co'),                    // Field2 is correct
        h2: parseFieldValue(latestFeed.field3, 'h2'),                    // Field3 is correct
        timestamp: latestFeed.created_at
      };
      
      setLatestReading(processedReading);
      
      // Process historical readings with the correct field mapping based on actual sensor readings
      const historicalData = data.feeds.map((feed: any) => ({
        temperature: parseFieldValue(feed.field4, 'temperature'),  // Field4 = Temperature
        humidity: parseFieldValue(feed.field5, 'humidity'),        // Field5 = Humidity
        co2: parseFieldValue(feed.field1, 'co2'),                  // Field1 = CO2
        co: parseFieldValue(feed.field2, 'co'),                    // Field2 = CO
        h2: parseFieldValue(feed.field3, 'h2'),                    // Field3 = H2
        timestamp: feed.created_at
      }));
      
      setHistoricalReadings(historicalData);
      
      // Set the lastUpdated timestamp
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching ThingSpeak data:', err);
      setError('Failed to fetch data from ThingSpeak');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchData();
  };

  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh
    const intervalId = setInterval(() => fetchData(), refreshInterval);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [channelId, apiKey, refreshInterval]);

  return (
    <ThingSpeakContext.Provider value={{
      latestReading,
      historicalReadings,
      loading,
      error,
      lastUpdated,
      refreshData
    }}>
      {children}
    </ThingSpeakContext.Provider>
  );
};