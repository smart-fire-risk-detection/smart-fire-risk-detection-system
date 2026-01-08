import React from 'react';
import { useThingSpeak } from './ThingSpeakProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Thermometer, Droplets, Cloud, Flame, Atom, Zap } from 'lucide-react';

export const ThingSpeakSensors: React.FC = () => {
  const { latestReading, loading, error, lastUpdated } = useThingSpeak();
  
  // Format the lastUpdated timestamp
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    
    return lastUpdated.toLocaleTimeString();
  };

  if (loading && !latestReading) {
    return (
      <Card className="p-6 w-full max-w-md text-lg shadow-md bg-black/90 text-white">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
          <p>Loading sensor data...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 w-full max-w-md text-lg shadow-md bg-black/90">
        <div className="text-red-400">
          <p className="font-semibold">Error loading sensor data</p>
          <p className="text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  const renderSensorValue = (
    value: number | null, 
    unit: string, 
    errorMessage: string = "Invalid reading"
  ) => {
    if (value === null) {
      return <span className="text-red-400">{errorMessage}</span>;
    }
    return `${value.toFixed(1)} ${unit}`;
  };

  // Calculate risk status
  const calculateStatus = () => {
    if (!latestReading) return "Loading...";
    
    const { temperature, co, h2 } = latestReading;
    
    if ((temperature !== null && temperature > 50) || 
        (co !== null && co > 60) ||
        (h2 !== null && h2 > 40)) {
      return "🔥 Fire risk detected!";
    }
    
    return "✅ Safe";
  };

  const status = calculateStatus();
  const fireRisk = status.includes("🔥");

  return (
    <Card className="w-full max-w-md shadow-2xl bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white overflow-hidden border border-orange-500/20 animate-fadeIn">
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-r from-orange-600/30 to-red-700/30 opacity-50"></div>
        
        <div className="flex flex-col items-center pt-6 pb-2 relative">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full shadow-xl shadow-orange-500/30 mb-3">
            <Flame className="h-10 w-10 text-white" strokeWidth={2.5} />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-1">EmberGuard Sensor Dashboard</h2>
          <p className="text-orange-200/70 text-sm max-w-xs text-center px-6 mb-1">Real-time monitoring system for fire detection and environmental safety</p>
          
          <div className="flex items-center gap-1 mt-2 mb-1 text-xs text-white/60">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Last updated: {formatLastUpdated()}</span>
          </div>
          
          <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mt-2"></div>
        </div>
      </div>
      
      {latestReading ? (
        <div className="p-6 pt-3 space-y-4">
          <div className="flex items-center mb-4">
            <div className="flex items-center p-4 bg-gradient-to-r from-red-900/30 to-black/40 rounded-lg flex-1 hover:from-red-900/50 hover:to-black/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/20 border-l-4 border-red-500">
              <div className="bg-red-500/20 p-2 rounded-full mr-4">
                <Thermometer className="h-6 w-6 text-red-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-white/70 text-sm">Temperature:</span>
                <span className="text-xl font-bold text-white">
                  {renderSensorValue(latestReading.temperature, "°C")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <div className="flex items-center p-4 bg-gradient-to-r from-blue-900/30 to-black/40 rounded-lg flex-1 hover:from-blue-900/50 hover:to-black/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20 border-l-4 border-blue-500">
              <div className="bg-blue-500/20 p-2 rounded-full mr-4">
                <Droplets className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-white/70 text-sm">Humidity:</span>
                <span className="text-xl font-bold text-white">
                  {renderSensorValue(latestReading.humidity, "%")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <div className="flex items-center p-4 bg-gradient-to-r from-green-900/30 to-black/40 rounded-lg flex-1 hover:from-green-900/50 hover:to-black/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/20 border-l-4 border-green-500">
              <div className="bg-green-500/20 p-2 rounded-full mr-4">
                <Cloud className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-white/70 text-sm">CO₂:</span>
                <span className="text-xl font-bold text-white">
                  {renderSensorValue(latestReading.co2, "ppm")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <div className="flex items-center p-4 bg-gradient-to-r from-orange-900/30 to-black/40 rounded-lg flex-1 hover:from-orange-900/50 hover:to-black/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/20 border-l-4 border-orange-500">
              <div className="bg-orange-500/20 p-2 rounded-full mr-4">
                <Flame className="h-6 w-6 text-orange-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-white/70 text-sm">CO:</span>
                <span className="text-xl font-bold text-white">
                  {renderSensorValue(latestReading.co, "ppm")}
                </span>
              </div>
            </div>
          </div>

          {latestReading.h2 !== null && (
            <div className="flex items-center mb-4">
              <div className="flex items-center p-4 bg-gradient-to-r from-purple-900/30 to-black/40 rounded-lg flex-1 hover:from-purple-900/50 hover:to-black/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20 border-l-4 border-purple-500">
                <div className="bg-purple-500/20 p-2 rounded-full mr-4">
                  <Atom className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white/70 text-sm">H₂:</span>
                  <span className="text-xl font-bold text-white">
                    {renderSensorValue(latestReading.h2, "ppm")}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className={`mt-6 p-4 rounded-lg text-center flex items-center justify-center ${
            fireRisk 
              ? "bg-gradient-to-r from-red-800/50 to-red-900/70 text-white border-2 border-red-500 shadow-lg shadow-red-500/30 animate-pulse-glow" 
              : "bg-gradient-to-r from-green-800/50 to-green-900/70 text-white border-2 border-green-500 shadow-lg shadow-green-500/30"
          }`}>
            {fireRisk ? (
              <>
                <div className="relative">
                  <Flame className="h-7 w-7 mr-3 text-red-300 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-red-100">Fire Risk Detected!</span>
                  <span className="text-xs text-red-200/80">Immediate attention required</span>
                </div>
              </>
            ) : (
              <>
                <div className="p-1 bg-green-500/20 rounded-full mr-3">
                  <Zap className="h-6 w-6 text-green-300" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-green-100">All Systems Safe</span>
                  <span className="text-xs text-green-200/80">No risks detected</span>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6">
          <p className="text-center text-white/70">No sensor data available</p>
        </div>
      )}
    </Card>
  );
};