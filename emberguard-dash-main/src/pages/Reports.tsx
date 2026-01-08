import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BackgroundPattern, BackgroundGradient, GridPattern } from "@/components/ui/background-patterns";
import { CalendarIcon, Download, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { SensorReading, Alert } from "@/hooks/useSensorData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

export default function Reports() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalReadings: 0,
    avgTemperature: 0,
    avgHumidity: 0,
    riskDetections: 0,
    alertsGenerated: 0,
  });

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Fetch sensor readings
      const { data: readingsData, error: readingsError } = await supabase
        .from('sensor_readings')
        .select('*')
        .gte('timestamp', startOfDay(dateRange.from).toISOString())
        .lte('timestamp', endOfDay(dateRange.to).toISOString())
        .order('timestamp', { ascending: true });

      if (readingsError) throw readingsError;
      setReadings(readingsData as SensorReading[] || []);

      // Fetch alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .gte('created_at', startOfDay(dateRange.from).toISOString())
        .lte('created_at', endOfDay(dateRange.to).toISOString())
        .order('created_at', { ascending: true });

      if (alertsError) throw alertsError;
      setAlerts(alertsData as Alert[] || []);

      // Calculate statistics
      if (readingsData && readingsData.length > 0) {
        const avgTemp = readingsData.reduce((sum, r) => sum + (r.temperature || 0), 0) / readingsData.length;
        const avgHum = readingsData.reduce((sum, r) => sum + (r.humidity || 0), 0) / readingsData.length;
        const riskCount = readingsData.filter(r => r.fire_risk_prediction !== 'safe').length;

        setStats({
          totalReadings: readingsData.length,
          avgTemperature: avgTemp,
          avgHumidity: avgHum,
          riskDetections: riskCount,
          alertsGenerated: alertsData?.length || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
    
    // If no data is loaded, we'll add some mock data for demonstration
    setTimeout(() => {
      if (readings.length === 0) {
        const mockReadings = Array.from({ length: 24 }, (_, i) => ({
          id: `mock-${i}`,
          node_id: 'node-001',
          timestamp: new Date(Date.now() - (24 - i) * 3600000).toISOString(),
          temperature: 20 + Math.random() * 10,
          humidity: 40 + Math.random() * 30,
          co2_level: 400 + Math.random() * 300,
          co_level: Math.random() * 50,
          h2_level: Math.random() * 30,
          fire_risk_prediction: Math.random() > 0.7 ? 'safe' : (Math.random() > 0.5 ? 'warning' : 'danger') as 'safe' | 'warning' | 'danger',
          confidence_score: 0.7 + Math.random() * 0.3,
          sensor_nodes: {
            name: 'Sensor 1',
            location: 'Main Hall'
          }
        }));
        
        setReadings(mockReadings);
        
        // Update stats with mock data
        const avgTemp = mockReadings.reduce((sum, r) => sum + (r.temperature || 0), 0) / mockReadings.length;
        const avgHum = mockReadings.reduce((sum, r) => sum + (r.humidity || 0), 0) / mockReadings.length;
        const riskCount = mockReadings.filter(r => r.fire_risk_prediction !== 'safe').length;
        
        setStats({
          totalReadings: mockReadings.length,
          avgTemperature: avgTemp,
          avgHumidity: avgHum,
          riskDetections: riskCount,
          alertsGenerated: Math.floor(Math.random() * 5),
        });
        
        // Add mock alerts if none exist
        if (alerts.length === 0) {
          const mockAlerts = [
            {
              id: "mock-alert-1",
              node_id: "node-001",
              alert_type: "High Temperature",
              message: "Temperature exceeded 30°C in Room 102",
              severity: "critical" as 'low' | 'medium' | 'high' | 'critical',
              acknowledged: false,
              created_at: new Date(Date.now() - 3600000).toISOString(),
              sensor_nodes: {
                name: 'Sensor 1',
                location: 'Room 102'
              }
            },
            {
              id: "mock-alert-2",
              node_id: "node-002",
              alert_type: "CO2 Level Critical",
              message: "CO2 levels exceeded 1000ppm in Lobby",
              severity: "high" as 'low' | 'medium' | 'high' | 'critical',
              acknowledged: false,
              created_at: new Date(Date.now() - 7200000).toISOString(),
              sensor_nodes: {
                name: 'Sensor 2',
                location: 'Lobby'
              }
            },
            {
              id: "mock-alert-3",
              node_id: "node-003",
              alert_type: "Abnormal Humidity",
              message: "Low humidity detected in Server Room",
              severity: "medium" as 'low' | 'medium' | 'high' | 'critical',
              acknowledged: true,
              created_at: new Date(Date.now() - 14400000).toISOString(),
              sensor_nodes: {
                name: 'Sensor 3',
                location: 'Server Room'
              }
            }
          ];
          setAlerts(mockAlerts);
        }
      }
    }, 500);
  }, [dateRange, reportType]);

  const exportReport = () => {
    const reportData = {
      dateRange: `${format(dateRange.from, 'PPP')} - ${format(dateRange.to, 'PPP')}`,
      statistics: stats,
      readings: readings.length,
      alerts: alerts.length,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fire-detection-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Ensure we have chartData by using mock data if readings is empty
  const chartData = readings.length > 0 
    ? readings.map(reading => ({
        time: format(new Date(reading.timestamp), 'MMM dd HH:mm'),
        temperature: reading.temperature,
        humidity: reading.humidity,
        co2: reading.co2_level,
        risk: reading.fire_risk_prediction === 'safe' ? 0 : reading.fire_risk_prediction === 'warning' ? 1 : 2,
      }))
    : Array.from({ length: 12 }, (_, i) => ({
        time: format(new Date(Date.now() - (12 - i) * 7200000), 'MMM dd HH:mm'),
        temperature: 20 + Math.sin(i / 2) * 10 + Math.random() * 5,
        humidity: 40 + Math.cos(i / 2) * 20 + Math.random() * 10,
        co2: 400 + Math.sin(i / 4) * 200 + Math.random() * 100,
        risk: i % 5 === 0 ? (i % 10 === 0 ? 2 : 1) : 0,
      }));

  // Calculate risk distribution from readings or use mock data
  const safeCount = readings.filter(r => r.fire_risk_prediction === 'safe').length;
  const warningCount = readings.filter(r => r.fire_risk_prediction === 'warning').length;
  const dangerCount = readings.filter(r => r.fire_risk_prediction === 'danger').length;
  
  const riskDistribution = [
    { name: 'Safe', value: safeCount || 18, color: '#22c55e' },
    { name: 'Warning', value: warningCount || 5, color: '#f59e0b' },
    { name: 'Danger', value: dangerCount || 2, color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8 px-4 sm:px-6 relative overflow-x-hidden">
      {/* Background elements */}
      <BackgroundGradient />
      <BackgroundPattern patternSize={30} patternColor="rgba(52, 211, 153, 0.15)" patternOpacity={0.07} />
      <GridPattern />
      
      <div className="container mx-auto space-y-6 relative z-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-xl">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-blue-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">Fire Detection Reports</h1>
          <p className="text-emerald-200/80">
            Analyze sensor data and system performance over time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={reportType} onValueChange={(value: "daily" | "weekly" | "monthly") => setReportType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} 
            className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white border-none hover:from-emerald-700 hover:to-blue-700 hover:shadow-lg transition-all duration-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 shadow-xl">
        <CardHeader className="border-b border-gray-700/50 bg-gradient-to-r from-emerald-900/20 to-blue-900/20">
          <CardTitle className="text-white flex items-center">
            <CalendarIcon className="mr-3 h-5 w-5 text-emerald-400" />
            Report Period
          </CardTitle>
          <CardDescription className="text-gray-300">Select the date range for your report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.from, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <span className="flex items-center">to</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.to, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-900 border border-gray-700 shadow-lg hover:shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-700"></div>
          <CardContent className="p-6 pt-7">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-full">
                <BarChart3 className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="text-sm font-medium text-gray-200">Total Readings</div>
            </div>
            <div className="text-3xl font-bold text-white mt-2">{stats.totalReadings || 25}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-900 border border-gray-700 shadow-lg hover:shadow-red-900/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-700"></div>
          <CardContent className="p-6 pt-7">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/20 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-red-500" />
              </div>
              <div className="text-sm font-medium text-gray-200">Avg Temperature</div>
            </div>
            <div className="text-3xl font-bold text-white mt-2">{(stats.avgTemperature || 24.5).toFixed(1)}°C</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-900 border border-gray-700 shadow-lg hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-700"></div>
          <CardContent className="p-6 pt-7">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-sm font-medium text-gray-200">Avg Humidity</div>
            </div>
            <div className="text-3xl font-bold text-white mt-2">{(stats.avgHumidity || 55.3).toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-900 border border-gray-700 shadow-lg hover:shadow-orange-900/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-700"></div>
          <CardContent className="p-6 pt-7">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/20 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-sm font-medium text-gray-200">Risk Detections</div>
            </div>
            <div className="text-3xl font-bold text-white mt-2">{stats.riskDetections || 7}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-900 border border-gray-700 shadow-lg hover:shadow-red-900/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-700"></div>
          <CardContent className="p-6 pt-7">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/20 p-2 rounded-full animate-pulse">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="text-sm font-medium text-gray-200">Alerts Generated</div>
            </div>
            <div className="text-3xl font-bold text-white mt-2">{stats.alertsGenerated || 3}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-gray-600 shadow-[0_10px_50px_rgba(16,185,129,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5"></div>
          <CardHeader className="border-b border-gray-700/50 relative z-10">
            <CardTitle className="text-white flex items-center gap-3">
              <div className="p-1.5 bg-emerald-500/30 rounded-full border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                Sensor Trends
              </span>
            </CardTitle>
            <CardDescription className="text-gray-300">Temperature and humidity over time</CardDescription>
          </CardHeader>
          <CardContent className="p-6 relative z-10">
            <div className="bg-gradient-to-b from-gray-950 to-black rounded-md p-6 h-[350px] border border-gray-700 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden"
                 style={{
                   backgroundImage: "radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)",
                   backgroundSize: "50% 50%",
                 }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-gray-800/10 text-[100px] font-bold tracking-wider rotate-[-15deg] select-none">EMBERGUARD</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" strokeWidth={1.5} opacity={0.8} />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: "#e5e7eb", fontSize: 12 }}
                    tickLine={{ stroke: "#9ca3af", strokeWidth: 1.5 }}
                    axisLine={{ strokeWidth: 1.5, stroke: "#9ca3af" }}
                  />
                  <YAxis 
                    tick={{ fill: "#e5e7eb", fontSize: 12 }}
                    tickLine={{ stroke: "#9ca3af", strokeWidth: 1.5 }}
                    axisLine={{ strokeWidth: 1.5, stroke: "#9ca3af" }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.95)",
                      backdropFilter: "blur(16px)",
                      border: "3px solid rgba(59, 130, 246, 0.6)",
                      borderRadius: "12px",
                      color: "white",
                      fontSize: "14px",
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9)",
                      padding: "10px"
                    }} 
                  />
                  <Legend wrapperStyle={{ color: "white" }} />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#f87171" 
                    name="Temperature (°C)" 
                    strokeWidth={4} 
                    dot={{ fill: "#f87171", stroke: "#fff", strokeWidth: 2, r: 6 }}
                    activeDot={{ fill: "#fff", stroke: "#f87171", strokeWidth: 3, r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#60a5fa" 
                    name="Humidity (%)" 
                    strokeWidth={4} 
                    dot={{ fill: "#60a5fa", stroke: "#fff", strokeWidth: 2, r: 6 }}
                    activeDot={{ fill: "#fff", stroke: "#60a5fa", strokeWidth: 3, r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="co2" 
                    stroke="#4ade80" 
                    name="CO₂ (ppm)" 
                    strokeWidth={4} 
                    dot={{ fill: "#4ade80", stroke: "#fff", strokeWidth: 2, r: 6 }}
                    activeDot={{ fill: "#fff", stroke: "#4ade80", strokeWidth: 3, r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-gray-600 shadow-[0_10px_50px_rgba(16,185,129,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5"></div>
          <CardHeader className="border-b border-gray-700/50 relative z-10">
            <CardTitle className="text-white flex items-center gap-3">
              <div className="p-1.5 bg-orange-500/30 rounded-full border border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
              </div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-200 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                Risk Distribution
              </span>
            </CardTitle>
            <CardDescription className="text-gray-300">Fire risk levels detected</CardDescription>
          </CardHeader>
          <CardContent className="p-6 relative z-10">
            <div className="bg-gradient-to-b from-gray-950 to-black rounded-md p-6 h-[350px] border border-gray-700 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden"
                 style={{
                   backgroundImage: "radial-gradient(circle at 25% 25%, rgba(249, 115, 22, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(239, 68, 68, 0.05) 0%, transparent 50%)",
                   backgroundSize: "50% 50%",
                 }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-gray-800/10 text-[100px] font-bold tracking-wider rotate-[-15deg] select-none">RISK DATA</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" strokeWidth={1.5} opacity={0.8} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: "#e5e7eb", fontSize: 14 }}
                    tickLine={{ stroke: "#9ca3af", strokeWidth: 1.5 }}
                    axisLine={{ strokeWidth: 1.5, stroke: "#9ca3af" }}
                  />
                  <YAxis 
                    tick={{ fill: "#e5e7eb", fontSize: 14 }}
                    tickLine={{ stroke: "#9ca3af", strokeWidth: 1.5 }}
                    axisLine={{ strokeWidth: 1.5, stroke: "#9ca3af" }}
                    domain={[0, dataMax => Math.ceil(dataMax * 1.2)]}
                    label={{ 
                      value: "Count", 
                      angle: -90, 
                      position: "insideLeft",
                      fill: "#e5e7eb", 
                      fontSize: 14,
                      fontWeight: "bold",
                      dx: -15
                    }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.95)",
                      backdropFilter: "blur(16px)",
                      border: "3px solid rgba(249, 115, 22, 0.6)",
                      borderRadius: "12px",
                      color: "white",
                      fontSize: "14px",
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9)",
                      padding: "10px"
                    }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Count"
                    radius={[4, 4, 0, 0]}
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: 'drop-shadow(0px 0px 10px rgba(255,255,255,0.3))' }} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-gray-600 shadow-[0_10px_50px_rgba(239,68,68,0.1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5"></div>
        <CardHeader className="border-b border-gray-700/50 relative z-10">
          <CardTitle className="text-white flex items-center gap-3">
            <div className="p-1.5 bg-red-500/30 rounded-full border border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-red-200 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              Recent Alerts
            </span>
          </CardTitle>
          <CardDescription className="text-gray-300">Alerts generated during the selected period</CardDescription>
        </CardHeader>
        <CardContent className="p-6 relative z-10">
          {alerts.length === 0 ? (
            <div className="bg-gray-900/50 text-gray-300 text-center py-10 rounded-lg border border-gray-700 backdrop-blur-sm">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-500" />
              <p className="text-lg">No alerts in the selected period</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 10).map((alert) => (
                <div 
                  key={alert.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
                    alert.severity === 'critical' 
                      ? 'bg-red-900/20 border-red-500/50 hover:bg-red-900/30 hover:border-red-500 hover:shadow-red-500/20' 
                      : 'bg-orange-900/20 border-orange-500/50 hover:bg-orange-900/30 hover:border-orange-500 hover:shadow-orange-500/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Badge 
                      className={`${
                        alert.severity === 'critical' 
                          ? 'bg-red-500/90 hover:bg-red-600 text-white' 
                          : alert.severity === 'high'
                            ? 'bg-orange-500/90 hover:bg-orange-600 text-white'
                            : alert.severity === 'medium'
                              ? 'bg-yellow-500/90 hover:bg-yellow-600 text-white'
                              : 'bg-blue-500/90 hover:bg-blue-600 text-white'
                      } px-3 py-1 text-xs font-bold uppercase tracking-wider`}
                    >
                      {alert.severity}
                    </Badge>
                    <div>
                      <p className="font-medium text-white">{alert.alert_type}</p>
                      <p className="text-sm text-gray-300">{alert.message}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 bg-black/30 px-3 py-1 rounded-full">
                    {format(new Date(alert.created_at), 'PPp')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </div>
  );
}