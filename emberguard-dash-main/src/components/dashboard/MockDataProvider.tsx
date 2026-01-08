import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SensorData } from "./SensorCard";
import { RiskLevel } from "./StatusIndicator";
import { Thermometer, Droplets, Cloud, Zap, Flame } from "lucide-react";

interface DashboardData {
  riskLevel: RiskLevel;
  sensors: SensorData[];
  chartData: Array<{
    time: string;
    temperature: number;
    humidity: number;
    co2: number;
    co: number;
    hydrogen: number;  // Note: this is hydrogen, while DataProvider uses h2
  }>;
  lastUpdate: Date;
}

const DashboardContext = createContext<DashboardData | null>(null);

export function useDashboardData() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboardData must be used within a MockDataProvider");
  }
  return context;
}

// Define the generator functions outside of the component to avoid hoisting issues
const generateSensorData = (): SensorData[] => {
  const baseTemp = 22 + Math.random() * 8; // 22-30°C
  const baseHumidity = 45 + Math.random() * 20; // 45-65%
  const baseCO2 = 400 + Math.random() * 200; // 400-600 ppm
  const baseCO = Math.random() * 10; // 0-10 ppm
  const baseH2 = Math.random() * 5; // 0-5 ppm

  return [
    {
      id: "temperature",
      name: "Temperature",
      value: baseTemp,
      unit: "°C",
      threshold: 35,
      icon: Thermometer,
      color: "hsl(var(--temperature))",
      trend: Math.random() > 0.5 ? "up" : "down",
    },
    {
      id: "humidity",
      name: "Humidity",
      value: baseHumidity,
      unit: "%",
      threshold: 70,
      icon: Droplets,
      color: "hsl(var(--humidity))",
      trend: Math.random() > 0.5 ? "stable" : "down",
    },
    {
      id: "co2",
      name: "Carbon Dioxide",
      value: baseCO2,
      unit: "ppm",
      threshold: 1000,
      icon: Cloud,
      color: "hsl(var(--co2))",
      trend: "up",
    },
    {
      id: "co",
      name: "Carbon Monoxide",
      value: baseCO,
      unit: "ppm",
      threshold: 50,
      icon: Zap,
      color: "hsl(var(--co))",
      trend: "stable",
    },
    {
      id: "hydrogen",
      name: "Hydrogen",
      value: baseH2,
      unit: "ppm",
      threshold: 40,
      icon: Flame,
      color: "hsl(var(--hydrogen))",
      trend: Math.random() > 0.7 ? "up" : "stable",
    },
  ];
};

// Calculate risk level based on sensor data
const calculateRiskLevel = (sensors: SensorData[]): RiskLevel => {
  const overThresholdCount = sensors.filter(s => s.value > s.threshold).length;
  const tempSensor = sensors.find(s => s.id === "temperature");
  const coSensor = sensors.find(s => s.id === "co");
  
  if (overThresholdCount >= 2 || (tempSensor && tempSensor.value > 40) || (coSensor && coSensor.value > 25)) {
    return "danger";
  } else if (overThresholdCount >= 1 || (tempSensor && tempSensor.value > 30)) {
    return "warning";
  }
  return "safe";
};

// Generate chart data for the last 24 hours with more realistic trends
const generateChartData = () => {
  const points = [];
  const now = new Date();
  
  // Base values that will be used to generate smooth trends
  let tempBase = 22 + Math.random() * 5;
  let humidityBase = 50 + Math.random() * 10;
  let co2Base = 400 + Math.random() * 100;
  let coBase = 5 + Math.random() * 3;
  let hydrogenBase = 2 + Math.random() * 2;
    
    // Time of day affects temperature and humidity
    const currentHour = now.getHours();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourOfPoint = (currentHour - i + 24) % 24; // Hour of day for this data point
      
      // Temperature varies by time of day (higher during afternoon)
      const timeOfDayFactor = Math.sin((hourOfPoint - 6) * Math.PI / 12);
      const tempTimeVariation = timeOfDayFactor * 5; // +/- 5 degrees based on time of day
      
      // Random slight variations to create natural fluctuations
      tempBase += (Math.random() - 0.5) * 0.5; // Slowly drift temperature
      humidityBase += (Math.random() - 0.5) * 1;
      co2Base += (Math.random() - 0.5) * 10;
      coBase += (Math.random() - 0.5) * 0.3;
      hydrogenBase += (Math.random() - 0.5) * 0.2;
      
      // Keep within realistic bounds
      tempBase = Math.max(15, Math.min(tempBase, 35));
      humidityBase = Math.max(30, Math.min(humidityBase, 90));
      co2Base = Math.max(350, Math.min(co2Base, 1200));
      coBase = Math.max(0, Math.min(coBase, 25));
      hydrogenBase = Math.max(0, Math.min(hydrogenBase, 10));
      
      // Generate point with realistic variations
      points.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: tempBase + tempTimeVariation + Math.sin(i * 0.5) * 1,
        humidity: humidityBase + Math.cos(i * 0.3) * 5 - (tempTimeVariation * 0.7), // Humidity inversely related to temperature
        co2: co2Base + Math.sin(i * 0.2) * 30,
        co: coBase + Math.sin(i * 0.4) * 2,
        hydrogen: hydrogenBase + Math.cos(i * 0.6) * 1,
      });
    }
    
    return points;
};

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData>({
    riskLevel: "safe",
    sensors: generateSensorData(), // Initialize with data immediately
    chartData: generateChartData(), // Initialize with data immediately
    lastUpdate: new Date(),
  });

  useEffect(() => {
    const updateData = () => {
      const sensors = generateSensorData();
      const riskLevel = calculateRiskLevel(sensors);
      
      setData({
        riskLevel,
        sensors,
        chartData: generateChartData(),
        lastUpdate: new Date(),
      });
    };

    // Initial data
    updateData();

    // Update every 3 seconds to simulate real-time data
    const interval = setInterval(updateData, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardContext.Provider value={data}>
      {children}
    </DashboardContext.Provider>
  );
}