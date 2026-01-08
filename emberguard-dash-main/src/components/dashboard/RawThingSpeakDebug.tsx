import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

export function RawThingSpeakDebug() {
  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const CHANNEL_ID = "3111993";
  const API_KEY = "FWZVQI3THXH3CZH7";
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds/last.json`,
        { params: { api_key: API_KEY } }
      );
      
      console.log("Latest ThingSpeak data:", response.data);
      setRawData(response.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  return (
    <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
      <CardHeader className="p-4">
        <CardTitle className="text-white text-lg flex items-center justify-between">
          <span>Raw ThingSpeak Debug</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData} 
            disabled={loading}
            className="bg-white/10 hover:bg-white/20 text-white border-white/30"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {error ? (
          <div className="text-red-400">{error}</div>
        ) : loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            <span className="text-white/80">Loading...</span>
          </div>
        ) : rawData ? (
          <div className="bg-black/20 p-4 rounded-lg text-white/90 font-mono text-sm overflow-x-auto">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-bold">Entry ID:</div>
              <div>{rawData.entry_id}</div>
              
              <div className="font-bold">Created At:</div>
              <div>{new Date(rawData.created_at).toLocaleString()}</div>
              
              <div className="font-bold">Field 1 (CO2):</div>
              <div className="text-green-300">{rawData.field1} ppm</div>
              
              <div className="font-bold">Field 2 (CO):</div>
              <div className="text-orange-300">{rawData.field2} ppm</div>
              
              <div className="font-bold">Field 3 (H2):</div>
              <div className="text-purple-300">{rawData.field3} ppm</div>
              
              <div className="font-bold">Field 4 (Temperature):</div>
              <div className="text-red-300">{rawData.field4}°C</div>
              
              <div className="font-bold">Field 5 (Humidity):</div>
              <div className="text-blue-300">{rawData.field5}%</div>
            </div>
          </div>
        ) : (
          <div className="text-white/70">No data available</div>
        )}
      </CardContent>
    </Card>
  );
}