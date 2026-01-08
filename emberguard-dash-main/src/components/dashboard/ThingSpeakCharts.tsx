import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ThingSpeakData {
  channel: {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    latitude?: string;
    longitude?: string;
    field1: string; // Field name for CO2
    field2: string; // Field name for CO
    field3: string; // Field name for H2
    field4: string; // Field name for Temperature
    field5?: string; // Field name for Humidity
    field6?: string; // Field name for FireDetected
    field7?: string; // Field name for RiskScore
    field8?: string; // Field name for BatteryLevel
    last_entry_id: number;
  };
  feeds: Array<{
    created_at: string;
    entry_id: number;
    field1: string; // CO2
    field2: string; // CO
    field3: string; // H2
    field4: string; // Temperature
    field5?: string; // Humidity
    field6?: string; // FireDetected
    field7?: string; // RiskScore
    field8?: string; // BatteryLevel
  }>;
}

interface ChartData {
  time: string;
  value: number | null;
}

export function ThingSpeakCharts() {
  const [data, setData] = useState<ThingSpeakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("temperature");
  const [timeRange, setTimeRange] = useState<string>("hour");
  
  // ThingSpeak API configuration
  const CHANNEL_ID = "3111993"; // Fire Project Channel ID
  const API_KEY = "FWZVQI3THXH3CZH7"; // Read API Key
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calculate appropriate time parameters based on selected range
      let params: Record<string, string | number> = {
        api_key: API_KEY,
      };
      
      const now = new Date();
      
      if (timeRange === "hour") {
        // For 1 hour: get records from the last hour with 1 minute intervals
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        params.start = oneHourAgo.toISOString();
        params.end = now.toISOString();
        params.minutes = 1;
      } else if (timeRange === "day") {
        // For 24 hours: get records from the last day with 10 minute intervals
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        params.start = oneDayAgo.toISOString();
        params.end = now.toISOString();
        params.minutes = 10;
      } else if (timeRange === "week") {
        // For 7 days: get records from the last week with hourly intervals
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        params.start = oneWeekAgo.toISOString();
        params.end = now.toISOString();
        params.hours = 1;
      }
      
      // Log the request parameters for debugging
      console.log("ThingSpeak API request params:", params);
      
      const response = await axios.get<ThingSpeakData>(
        `https://api.thingspeak.com/channels/${CHANNEL_ID}/feed.json`,
        { params }
      );
      
      // Log the raw response data for debugging
      console.log("ThingSpeak API raw response:", response.data);
      
      if (!response.data?.feeds?.length) {
        console.warn("No data received from ThingSpeak API");
        setError("No sensor data available for the selected time period");
      } else {
        // Check for CO2 values in the response
        response.data.feeds.forEach((feed, index) => {
          console.log(`Feed ${index} CO2 (field3): ${feed.field3}`);
        });
        
        setData(response.data);
      }
    } catch (err) {
      console.error("Error fetching ThingSpeak data:", err);
      setError("Failed to fetch sensor data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh at different intervals based on the time range
    // More frequent for shorter time ranges, less frequent for longer ones
    let refreshInterval = 15000; // 15 seconds for hour view
    
    if (timeRange === "day") {
      refreshInterval = 60000; // 1 minute for day view
    } else if (timeRange === "week") {
      refreshInterval = 300000; // 5 minutes for week view
    }
    
    const intervalId = setInterval(fetchData, refreshInterval);
    
    // Clean up interval on unmount or when time range changes
    return () => clearInterval(intervalId);
  }, [timeRange]);
  
  const formatChartData = (fieldNumber: 1 | 2 | 3 | 4 | 5): ChartData[] => {
    if (!data || !data.feeds) return [];
    
    return data.feeds.map(feed => {
      const fieldKey = `field${fieldNumber}` as keyof typeof feed;
      const rawValue = feed[fieldKey] as string;
      
      // For debugging - log all CO2 values
      if (fieldNumber === 3) {
        console.log(`Raw CO2 value from ThingSpeak: ${rawValue}`);
      }
      
      // Check if value exists and is a valid number
      if (!rawValue || rawValue === 'null' || rawValue === 'undefined') {
        return { time: formatTimestamp(feed.created_at), value: null };
      }
      
      // More robust parsing to handle potential issues
      let value: number | null;
      try {
        value = parseFloat(rawValue);
        if (isNaN(value)) value = null;
      } catch (e) {
        value = null;
      }
      
      // For debugging - log parsed values
      if (fieldNumber === 3 && value !== null) {
        console.log(`Parsed CO2 value: ${value}`);
      }
      
      // Apply data validation based on sensor type
      if (value !== null) {
        switch (fieldNumber) {
          case 4: // Temperature (Field4)
            // Temperature values should be reasonable (e.g., -50°C to 100°C)
            if (value < -50 || value > 100) {
              console.warn(`Invalid temperature reading filtered: ${value}°C`);
              value = null; // Exclude invalid temperatures
            }
            break;
          case 5: // Humidity (Field5)
            // Humidity should be between 0-100%
            if (value < 0 || value > 100) {
              value = null;
            }
            break;
          case 1: // CO2 (Field1)
            // CO2 levels are around 3600-3700 ppm
            // Accept higher values for CO2 since our sensors report ~3650 ppm
            if (value < 0 || value > 10000) {
              value = null;
            }
            console.log(`CO2 value after validation: ${value}`);
            break;
          case 2: // Carbon Monoxide (Field2)
            // CO levels typically between 0-100 ppm
            if (value < 0 || value > 100) {
              value = null;
            }
            break;
          case 3: // Hydrogen Gas (H2) (Field3)
            // H2 levels typically between 0-100 ppm
            if (value < 0 || value > 100) {
              value = null;
            }
            break;
        }
      }
      
      return {
        time: formatTimestamp(feed.created_at),
        value
      };
    });
  };
  
  // Helper function to format timestamp consistently across the component
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    let timeFormat: string;
    
    if (timeRange === "hour") {
      // For hourly view, show hour:minute (e.g. 14:30)
      timeFormat = date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else if (timeRange === "day") {
      // For daily view, show hour:minute (e.g. 14:30)
      timeFormat = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else {
      // For weekly view, show abbreviated day and time (e.g. Mon 14:30)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const day = days[date.getDay()];
      timeFormat = `${day} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    return timeFormat;
  };
  
  const getChartColor = (sensor: string): string => {
    switch (sensor) {
      case "temperature":
        return "#ef4444"; // Red for temperature
      case "humidity":
        return "#3b82f6"; // Blue for humidity
      case "co2":
        return "#22c55e"; // Green for CO2
      case "co":
        return "#f97316"; // Orange for CO
      case "h2":
        return "#8b5cf6"; // Purple for H2
      default:
        return "#8b5cf6"; // Purple default
    }
  };
  
  const getSensorUnit = (sensor: string): string => {
    switch (sensor) {
      case "temperature":
        return "°C";
      case "humidity":
        return "%";
      case "co2":
      case "co":
      case "h2":
        return "ppm";
      default:
        return "";
    }
  };
  
  // Get min/max/avg values for active chart
  const getDataStats = (chartData: ChartData[]) => {
    if (!chartData.length) return { min: 0, max: 0, avg: 0 };
    
    // Filter out null values
    const validData = chartData.filter(item => item.value !== null);
    if (!validData.length) return { min: 0, max: 0, avg: 0 };
    
    const values = validData.map(item => item.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = parseFloat((sum / values.length).toFixed(1));
    
    return { min, max, avg };
  };
  
  const renderActiveChart = () => {
    let fieldNumber: 1 | 2 | 3 | 4 | 5;
    let title: string;
    let validRange: { min: number; max: number } = { min: 0, max: 0 };
    
    switch (activeTab) {
      case "temperature":
        fieldNumber = 4; // Field4 = Temperature
        title = "Temperature";
        validRange = { min: -50, max: 100 };
        break;
      case "humidity":
        fieldNumber = 5; // Field5 = Humidity
        title = "Humidity";
        validRange = { min: 0, max: 100 };
        break;
      case "co2":
        fieldNumber = 1; // Field1 = CO2
        title = "CO₂ Level";
        validRange = { min: 0, max: 10000 }; // Increased max to accommodate ~3600-3700 ppm readings
        break;
      case "co":
        fieldNumber = 2; // Field2 = CO
        title = "Carbon Monoxide";
        validRange = { min: 0, max: 100 };
        break;
      case "h2":
        fieldNumber = 3; // Field3 = H2
        title = "Hydrogen Gas";
        validRange = { min: 0, max: 100 };
        break;
      default:
        fieldNumber = 4; // Default to temperature (Field4)
        title = "Temperature";
        validRange = { min: -50, max: 100 };
    }
    
    const chartData = formatChartData(fieldNumber);
    
    // Check for data issues
    const totalDataPoints = data?.feeds?.length || 0;
    const validDataPoints = chartData.filter(item => item.value !== null).length;
    const hasInvalidData = totalDataPoints > validDataPoints;
    const noValidData = validDataPoints === 0;
    
    // Calculate stats only if we have valid data
    const stats = getDataStats(chartData);
    const unit = getSensorUnit(activeTab);
    const color = getChartColor(activeTab);
    
    // If we have no valid data at all, show a message
    if (noValidData && totalDataPoints > 0) {
      return (
        <div className="flex flex-col justify-center items-center h-[300px] bg-black/10 rounded-lg border border-white/10">
          <p className="text-center text-yellow-300 mb-2 font-semibold">No valid {title.toLowerCase()} readings available</p>
          <p className="text-center text-white/70 text-sm mb-3">
            All readings were outside the valid range ({validRange.min} to {validRange.max} {unit})
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData} 
            className="bg-white/10 hover:bg-white/20 text-white border-white/30"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="bg-black/20 backdrop-blur-sm p-2 rounded-lg">
            <span className="text-white/70">Min:</span> <span className="font-semibold text-white">{stats.min}{unit}</span>
          </div>
          <div className="bg-black/20 backdrop-blur-sm p-2 rounded-lg">
            <span className="text-white/70">Max:</span> <span className="font-semibold text-white">{stats.max}{unit}</span>
          </div>
          <div className="bg-black/20 backdrop-blur-sm p-2 rounded-lg">
            <span className="text-white/70">Avg:</span> <span className="font-semibold text-white">{stats.avg}{unit}</span>
          </div>
        </div>
        
        {hasInvalidData && (
          <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-lg p-2 text-sm text-yellow-300">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>Some abnormal readings detected and filtered for accuracy</span>
            </div>
          </div>
        )}
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
              <XAxis 
                dataKey="time" 
                tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 13 }}
                tickLine={{ stroke: 'rgba(255,255,255,0.5)', strokeWidth: 1.5 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.5)', strokeWidth: 1.5 }}
                angle={-45}
                textAnchor="end"
                height={60}
                minTickGap={15}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 13 }}
                tickLine={{ stroke: 'rgba(255,255,255,0.5)', strokeWidth: 1.5 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.5)', strokeWidth: 1.5 }}
                width={45}
                domain={[
                  (dataMin: number) => {
                    // Calculate appropriate Y-axis min value based on sensor type
                    if (activeTab === 'temperature') return Math.max(-10, Math.floor(dataMin - 5));
                    if (activeTab === 'humidity') return 0;
                    return Math.max(0, Math.floor(dataMin - (dataMin * 0.1)));
                  }, 
                  (dataMax: number) => {
                    // Calculate appropriate Y-axis max value based on sensor type
                    if (activeTab === 'temperature') return Math.min(100, Math.ceil(dataMax + 5));
                    if (activeTab === 'humidity') return 100;
                    if (activeTab === 'co2') {
                      // Special handling for CO2 to ensure 3600-3700 ppm values are visible
                      console.log(`CO2 Y-axis dataMax: ${dataMax}`);
                      // Force a minimum scale for CO2 to ensure visibility of NodeMCU values
                      return dataMax > 0 ? Math.ceil(dataMax * 1.1) : 4000;
                    }
                    if (activeTab === 'co') return Math.min(100, Math.ceil(dataMax * 1.1));
                    if (activeTab === 'h2') return Math.min(100, Math.ceil(dataMax * 1.1));
                    return Math.ceil(dataMax * 1.1);
                  }
                ]}
                allowDataOverflow={false}
                label={{ 
                  value: title + ' (' + unit + ')', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: 'rgba(255,255,255,0.7)', fontSize: 12 } 
                }}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '8px 12px'
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
                itemStyle={{ color: color }}
                formatter={(value) => [value === null ? 'No data' : `${value} ${unit}`, title]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color}
                strokeWidth={4}
                filter="drop-shadow(0 0 8px currentColor)"
                dot={{ 
                  fill: color, 
                  strokeWidth: 2,
                  r: 6,
                  stroke: 'white',
                  filter: "drop-shadow(0 0 6px currentColor)"
                }}
                activeDot={{ 
                  r: 10, 
                  stroke: 'white', 
                  strokeWidth: 3,
                  fill: color,
                  filter: "drop-shadow(0 0 15px currentColor)"
                }}
                connectNulls={false}  // Don't connect across null values
                isAnimationActive={true}
                animationDuration={500}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-500/20 border border-red-400/30 text-white">
        <AlertTitle className="font-semibold">Error Loading ThingSpeak Data</AlertTitle>
        <AlertDescription className="mt-2">
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData} 
            className="ml-4 mt-2 bg-white/10 hover:bg-white/20 text-white border-white/30"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/15 hover:border-white/30 hover:shadow-2xl transition-all duration-500 ease-in-out transform hover:scale-[1.01] group">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                <path d="M10 2h4c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v16c0 .5-.2 1-.6 1.4-.4.4-.9.6-1.4.6h-4c-.5 0-1-.2-1.4-.6-.4-.4-.6-.9-.6-1.4V4c0-.5.2-1 .6-1.4C9 2.2 9.5 2 10 2Z" />
                <path d="M14 14.25A4 4 0 0 0 17.25 11" />
                <path d="M14 10.25A8 8 0 0 0 21.25 3" />
              </svg>
              <span className="drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)]">ThingSpeak Sensor Data</span>
            </CardTitle>
            <CardDescription className="text-white/80 mt-1 drop-shadow-[1px_1px_2px_rgba(0,0,0,0.6)]">
              Live environmental sensor readings from IoT devices
            </CardDescription>
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchData} 
            className="h-8 w-8 text-white bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-6 sm:px-6">
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-4">
          <div className="flex flex-wrap justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-5 bg-black/30 border border-white/10">
                <TabsTrigger value="temperature" className="data-[state=active]:bg-red-500/30 data-[state=active]:text-white text-white/70">
                  Temperature
                </TabsTrigger>
                <TabsTrigger value="humidity" className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-white text-white/70">
                  Humidity
                </TabsTrigger>
                <TabsTrigger value="co2" className="data-[state=active]:bg-green-500/30 data-[state=active]:text-white text-white/70">
                  CO₂
                </TabsTrigger>
                <TabsTrigger value="co" className="data-[state=active]:bg-orange-500/30 data-[state=active]:text-white text-white/70">
                  CO
                </TabsTrigger>
                <TabsTrigger value="h2" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white text-white/70">
                  H₂
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setTimeRange("hour")} 
                className={`text-white ${timeRange === 'hour' ? 'bg-white/30 border-white/50' : 'bg-black/30 border-white/10'}`}
              >
                1H
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setTimeRange("day")} 
                className={`text-white ${timeRange === 'day' ? 'bg-white/30 border-white/50' : 'bg-black/30 border-white/10'}`}
              >
                24H
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setTimeRange("week")} 
                className={`text-white ${timeRange === 'week' ? 'bg-white/30 border-white/50' : 'bg-black/30 border-white/10'}`}
              >
                7D
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            {loading && !data ? (
              <div className="flex justify-center items-center h-[300px]">
                <Loader2 size={48} className="animate-spin text-emerald-400" />
                <span className="ml-3 text-lg text-white/80">Loading sensor data...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center h-[300px] bg-black/10 rounded-lg border border-white/10">
                <div className="text-red-300 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <p className="text-center text-white/80 mb-4">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchData} 
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : (
              renderActiveChart()
            )}
          </div>
        </div>
        
        {/* Channel Info */}
        {data?.channel && (
          <div className="text-xs text-white/50 flex flex-wrap justify-between items-center">
            <div className="flex items-center">
              <span>Channel: {data.channel.name} (ID: {data.channel.id})</span>
              <span className="ml-2 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30 text-emerald-300">Data Validated</span>
            </div>
            <div>Last updated: {new Date().toLocaleString()}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}