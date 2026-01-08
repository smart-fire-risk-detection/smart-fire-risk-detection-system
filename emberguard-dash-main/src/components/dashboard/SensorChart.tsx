import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ChartDataPoint {
  time: string;
  temperature: number;
  humidity: number;
  co2: number;
  co: number;
  hydrogen: number;
}

interface SensorChartProps {
  data: ChartDataPoint[];
  selectedSensors?: string[];
}

export function SensorChart({ data = [], selectedSensors = ["temperature", "humidity", "co2", "co", "hydrogen"] }: SensorChartProps) {
  const sensorConfig = {
    temperature: { color: "#f87171", name: "Temperature (°C)" },   // red-400
    humidity: { color: "#60a5fa", name: "Humidity (%)" },         // blue-400
    co2: { color: "#4ade80", name: "CO₂ (ppm)" },                // green-400
    co: { color: "#fb923c", name: "CO (ppm)" },                  // orange-400
    hydrogen: { color: "#c084fc", name: "H₂ (ppm)" },            // purple-400
  };
  
  // Generate mock data if no data is provided
  const chartData = data.length > 0 ? data : Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    temperature: 20 + Math.random() * 15,
    humidity: 40 + Math.random() * 30,
    co2: 400 + Math.random() * 400,
    co: 10 + Math.random() * 50,
    hydrogen: 5 + Math.random() * 35,
  }));

  return (
        <Card className="col-span-full bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-gray-600 shadow-[0_10px_50px_rgba(16,185,129,0.15)] relative overflow-hidden animate-fadeIn">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5"></div>
      <CardHeader className="pb-6 relative z-10">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
          <div className="p-2 bg-emerald-500/30 rounded-full border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            📊
          </div>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
            Sensor Data Trends
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="bg-gradient-to-b from-gray-950 to-black rounded-md p-6 h-[450px] border-2 border-gray-600 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden"
             style={{
               backgroundImage: "radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)",
               backgroundSize: "50% 50%",
             }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-800/10 text-[120px] font-bold tracking-wider rotate-[-15deg] select-none">EMBERGUARD</span>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" strokeWidth={2} opacity={0.8} />
                            <XAxis 
                dataKey="time" 
                tick={{ fill: "#e5e7eb", fontSize: 14 }}
                tickLine={{ stroke: "#9ca3af", strokeWidth: 2 }}
                axisLine={{ strokeWidth: 2, stroke: "#9ca3af" }}
                label={{ 
                  value: "Time", 
                  position: "insideBottomRight", 
                  offset: -5,
                  fill: "#e5e7eb",
                  fontSize: 16,
                  fontWeight: "bold" 
                }}
              />
              <YAxis 
                stroke="#d1d5db" 
                tick={{ fill: "#e5e7eb", fontSize: 14 }}
                tickLine={{ stroke: "#9ca3af", strokeWidth: 2 }}
                axisLine={{ strokeWidth: 2, stroke: "#9ca3af" }}
                label={{ 
                  value: "Sensor Values", 
                  angle: -90, 
                  position: "insideLeft",
                  fill: "#e5e7eb", 
                  fontSize: 16,
                  fontWeight: "bold",
                  dx: -15
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(17, 24, 39, 0.95)",
                  backdropFilter: "blur(16px)",
                  border: "4px solid rgba(59, 130, 246, 0.7)",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "17px",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(59, 130, 246, 0.4)",
                  padding: "14px",
                  fontWeight: "600",
                  textShadow: "0 1px 2px rgba(0,0,0,0.8)"
                }}
                labelStyle={{ 
                  color: "white", 
                  fontWeight: "bold", 
                  marginBottom: "8px",
                  fontSize: "18px",
                  borderBottom: "2px solid rgba(59, 130, 246, 0.5)",
                  paddingBottom: "4px"
                }}
                itemStyle={{ 
                  padding: "6px 0",
                  fontSize: "16px",
                  fontWeight: "500"
                }}
                wrapperStyle={{
                  zIndex: 1000,
                  filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))"
                }}
              />
              {/* Hide default legend as we're using a custom one */}
              <Legend 
                wrapperStyle={{ 
                  display: 'none'
                }}
              />
              
              {selectedSensors.map((sensor) => (
                <Line
                  key={sensor}
                  type="monotone"
                  dataKey={sensor}
                  stroke={sensorConfig[sensor as keyof typeof sensorConfig].color}
                  strokeWidth={7}
                  filter="drop-shadow(0 0 10px currentColor)"
                  dot={{ 
                    fill: sensorConfig[sensor as keyof typeof sensorConfig].color, 
                    r: 10,
                    stroke: "#ffffff",
                    strokeWidth: 2,
                    filter: "drop-shadow(0 0 16px currentColor)"
                  }}
                  name={sensorConfig[sensor as keyof typeof sensorConfig].name}
                  activeDot={{ 
                    r: 14, 
                    stroke: sensorConfig[sensor as keyof typeof sensorConfig].color,
                    strokeWidth: 5,
                    fill: "#ffffff",
                    filter: "drop-shadow(0 0 20px currentColor)",
                    style: {
                      animation: "pulse 1.5s infinite",
                      transformOrigin: "center center"
                    }
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Enhanced Custom Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 mt-10 text-white bg-gradient-to-b from-gray-800 to-gray-900 p-5 rounded-xl border-2 border-gray-600 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]">
          <div className="flex items-center group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900/80 border-2 border-[#f87171] mr-3 shadow-[0_0_15px_rgba(248,113,113,0.5)] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(248,113,113,0.8)]">
              <span className="inline-block w-6 h-6 rounded-full bg-[#f87171]"></span>
            </div>
            <span className="text-lg font-medium">Temperature (°C)</span>
          </div>
          <div className="flex items-center group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900/80 border-2 border-[#60a5fa] mr-3 shadow-[0_0_15px_rgba(96,165,250,0.5)] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(96,165,250,0.8)]">
              <span className="inline-block w-6 h-6 rounded-full bg-[#60a5fa]"></span>
            </div>
            <span className="text-lg font-medium">Humidity (%)</span>
          </div>
          <div className="flex items-center group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900/80 border-2 border-[#4ade80] mr-3 shadow-[0_0_15px_rgba(74,222,128,0.5)] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(74,222,128,0.8)]">
              <span className="inline-block w-6 h-6 rounded-full bg-[#4ade80]"></span>
            </div>
            <span className="text-lg font-medium">CO₂ (ppm)</span>
          </div>
          <div className="flex items-center group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900/80 border-2 border-[#fb923c] mr-3 shadow-[0_0_15px_rgba(251,146,60,0.5)] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(251,146,60,0.8)]">
              <span className="inline-block w-6 h-6 rounded-full bg-[#fb923c]"></span>
            </div>
            <span className="text-lg font-medium">CO (ppm)</span>
          </div>
          <div className="flex items-center group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900/80 border-2 border-[#c084fc] mr-3 shadow-[0_0_15px_rgba(192,132,252,0.5)] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(192,132,252,0.8)]">
              <span className="inline-block w-6 h-6 rounded-full bg-[#c084fc]"></span>
            </div>
            <span className="text-lg font-medium">H₂ (ppm)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}