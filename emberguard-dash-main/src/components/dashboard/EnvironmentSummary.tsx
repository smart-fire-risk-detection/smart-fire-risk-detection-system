import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { useSensorData } from "../../hooks/useSensorData";

interface EnvironmentRating {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  description: string;
}

export const EnvironmentSummary = () => {
  const { latestReading, recentReadings, loading } = useSensorData();
  
  // Create environment rating data based on sensor readings
  const environmentRatings: EnvironmentRating[] = [
    {
      label: "Air Quality",
      value: calculateAirQualityRating(latestReading, recentReadings),
      color: "bg-emerald-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75">
          <path d="M2 22h20"></path>
          <path d="M12 11v5"></path>
          <path d="M9 11v5"></path>
          <path d="M15 11v5"></path>
          <path d="M6 11a3 3 0 0 1-3-3c0-1.4.7-2.7 1.5-3.5 1.5-1.5 1.5-5.5 9.5-5.5s8 4 9.5 5.5c.8.8 1.5 2.1 1.5 3.5a3 3 0 0 1-3 3Z"></path>
        </svg>
      ),
      description: "Based on CO2, CO, and gas sensors",
    },
    {
      label: "Temperature",
      value: calculateTemperatureRating(latestReading, recentReadings),
      color: "bg-amber-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
        </svg>
      ),
      description: "Based on ambient temperature readings",
    },
    {
      label: "Humidity",
      value: calculateHumidityRating(latestReading, recentReadings),
      color: "bg-blue-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75">
          <path d="M12 2v10"></path>
          <path d="m4.93 10.93 1.41 1.41"></path>
          <path d="M2 18h2"></path>
          <path d="M20 18h2"></path>
          <path d="m19.07 10.93-1.41 1.41"></path>
          <path d="M22 22H2"></path>
          <path d="M16 6 7 22"></path>
          <path d="m8 6 9 16"></path>
          <path d="M12 2v10"></path>
        </svg>
      ),
      description: "Based on relative humidity sensors",
    },
    {
      label: "Fire Risk",
      value: calculateFireRiskRating(latestReading, recentReadings),
      color: "bg-red-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
        </svg>
      ),
      description: "Calculated from temperature, smoke, and gas readings",
    }
  ];

  return (
    <Card className="shadow-lg border-slate-200/50 dark:border-slate-800/60 bg-white/50 backdrop-blur-md dark:bg-slate-950/50">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18.5 12.5a.5.5 0 0 1 0-1h2a.5.5 0 0 1 0 1z"></path>
            <path d="M18.5 15a.5.5 0 0 0 .5-.5 .5.5 0 0 1 1 0 .5.5 0 0 0 .5.5h0a.5.5 0 0 1 0 1h0a.5.5 0 0 0-.5.5.5.5 0 0 1-1 0 .5.5 0 0 0-.5-.5h0a.5.5 0 0 1 0-1z"></path>
            <path d="M18.5 9a.5.5 0 0 0 .5-.5 .5.5 0 0 1 1 0 .5.5 0 0 0 .5.5h0a.5.5 0 0 1 0 1h0a.5.5 0 0 0-.5.5.5.5 0 0 1-1 0 .5.5 0 0 0-.5-.5h0a.5.5 0 0 1 0-1z"></path>
            <path d="M11.09 12h.92a1.98 1.98 0 0 0 1.98-1.98V2H6v8.02A1.98 1.98 0 0 0 7.99 12H11Z"></path>
            <path d="M6 4H2v6c0 1.1.9 2 2 2h2"></path>
            <path d="M14 4h4v6c0 1.1-.9 2-2 2h-2"></path>
            <path d="M10 14v6"></path>
            <path d="M7 18h6"></path>
          </svg>
          Environment Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`space-y-4 ${loading ? 'opacity-70' : ''}`}>
          {environmentRatings.map((rating, index) => (
            <div key={index} className={`space-y-1 ${loading ? 'animate-pulse-glow' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-full ${rating.color} text-white`}>
                    {rating.icon}
                  </div>
                  <span className="text-sm font-medium">{rating.label}</span>
                </div>
                <span className="text-sm font-bold">{Math.round(rating.value)}%</span>
              </div>
              <Progress 
                value={rating.value} 
                className={`h-2 ${loading ? 'animate-shimmer' : ''}`} 
                indicatorColor={rating.color} 
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{rating.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper functions to calculate ratings based on sensor data
function calculateAirQualityRating(latestReading: any, recentReadings: any[] = []): number {
  // Check if we have data
  if (!latestReading && (!recentReadings || recentReadings.length === 0)) {
    return 85; // Default value if no data
  }
  
  // Use latest reading if available, otherwise use the most recent from recentReadings
  const reading = latestReading || recentReadings[recentReadings.length - 1];
  
  // Get the sensor values from the reading
  const co2Level = reading.co2_level || 400;
  const coLevel = reading.co_level || 0;
  const h2Level = reading.h2_level || 0; // Using h2 as a proxy for gas
  
  // Simplified rating calculation (0-100)
  const co2Rating = Math.max(0, 100 - (co2Level - 400) / 10);
  const coRating = Math.max(0, 100 - coLevel * 100);
  const gasRating = Math.max(0, 100 - h2Level * 100);
  
  return Math.min(100, (co2Rating + coRating + gasRating) / 3);
}

function calculateTemperatureRating(latestReading: any, recentReadings: any[] = []): number {
  // Check if we have data
  if (!latestReading && (!recentReadings || recentReadings.length === 0)) {
    return 90; // Default value if no data
  }
  
  // Use latest reading if available, otherwise use the most recent from recentReadings
  const reading = latestReading || recentReadings[recentReadings.length - 1];
  
  // Get temperature from the reading
  const temp = reading.temperature || 21;
  const optimalTemp = 21;
  const deviation = Math.abs(temp - optimalTemp);
  
  // Rating decreases as we get further from optimal temperature
  return Math.max(0, 100 - (deviation * 5));
}

function calculateHumidityRating(latestReading: any, recentReadings: any[] = []): number {
  // Check if we have data
  if (!latestReading && (!recentReadings || recentReadings.length === 0)) {
    return 80; // Default value if no data
  }
  
  // Use latest reading if available, otherwise use the most recent from recentReadings
  const reading = latestReading || recentReadings[recentReadings.length - 1];
  
  // Get humidity from the reading
  const humidity = reading.humidity || 50;
  
  if (humidity < 30) {
    return humidity * 3.33; // Scale 0-30 to 0-100
  } else if (humidity > 70) {
    return Math.max(0, 100 - ((humidity - 70) * 3.33)); // Scale 70-100 to 100-0
  } else if (humidity >= 40 && humidity <= 60) {
    return 100; // Optimal range
  } else {
    // Between 30-40 or 60-70: slightly less than optimal
    return 90;
  }
}

function calculateFireRiskRating(latestReading: any, recentReadings: any[] = []): number {
  // Check if we have data
  if (!latestReading && (!recentReadings || recentReadings.length === 0)) {
    return 15; // Default low risk if no data
  }
  
  // Use latest reading if available, otherwise use the most recent from recentReadings
  const reading = latestReading || recentReadings[recentReadings.length - 1];
  
  // Determine risk level based on fire_risk_prediction
  if (reading.fire_risk_prediction === 'danger') {
    return 80; // High risk
  } else if (reading.fire_risk_prediction === 'warning') {
    return 40; // Medium risk
  } else {
    return 15; // Low risk
  }
}