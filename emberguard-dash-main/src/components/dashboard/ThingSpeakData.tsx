import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ThingSpeakFeed {
  created_at: string;
  entry_id: number;
  field1: string; // Temperature
  field2: string; // Humidity
  field3: string; // CO2
  field4: string; // CO
  field5?: string; // H2
  field6?: string; // Fire detection
  field7?: string; // Risk score
  field8?: string; // Battery level
}

interface ThingSpeakChannel {
  id: number;
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  created_at: string;
  updated_at: string;
  last_entry_id: number;
  field1: string;
  field2: string;
  field3: string;
  field4: string;
  field5: string;
  field6: string;
  field7: string;
  field8: string;
}

interface ThingSpeakResponse {
  channel: ThingSpeakChannel;
  feeds: ThingSpeakFeed[];
}

export function ThingSpeakData() {
  const [data, setData] = useState<ThingSpeakResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalEntries, setTotalEntries] = useState(0);
  
  // ThingSpeak API configuration
  const CHANNEL_ID = "3111993";
  const API_KEY = "FWZVQI3THXH3CZH7";
  
  const fetchChannelData = async () => {
    try {
      // First fetch channel info to get total entries
      const channelResponse = await axios.get(
        `https://api.thingspeak.com/channels/${CHANNEL_ID}.json`,
        {
          params: { api_key: API_KEY }
        }
      );
      
      setTotalEntries(channelResponse.data.last_entry_id);
      
      // Then fetch the data for the current page
      const feedsResponse = await axios.get<ThingSpeakResponse>(
        `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json`,
        {
          params: {
            api_key: API_KEY,
            results: pageSize,
            start: (page - 1) * pageSize + 1
          }
        }
      );
      
      // Log the raw data for debugging
      console.log("Raw ThingSpeak data:", feedsResponse.data);
      
      // Process the data before setting it
      const processedData = {
        ...feedsResponse.data,
        feeds: feedsResponse.data.feeds.map(feed => {
          // Log each feed's values for debugging
          console.log(`Feed ${feed.entry_id} - CO2: ${feed.field3}, Temp: ${feed.field1}`);
          return feed;
        })
      };
      
      setData(processedData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching ThingSpeak data:", err);
      setError("Failed to fetch ThingSpeak data. Please try again.");
      setLoading(false);
    }
  };
  
  useEffect(() => {
    setLoading(true);
    fetchChannelData();
  }, [page, pageSize]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const formatValue = (value: string | undefined, type: string) => {
    if (!value) return "-";
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    
    // For debugging purposes
    if (type === 'field3') {
      console.log(`Formatting CO2 value: ${numValue}`);
    }
    
    switch (type) {
      case 'field1': // Temperature
        // Check for invalid temperature values (like the 3650°C problem)
        if (numValue < -50 || numValue > 100 || numValue > 1000) {
          return `Invalid (${numValue}°C)`;
        }
        return `${numValue.toFixed(1)}°C`;
      case 'field2': // Humidity
        if (numValue < 0 || numValue > 100) {
          return `Invalid (${numValue}%)`;
        }
        return `${numValue.toFixed(1)}%`;
      case 'field3': // CO2
        // Now accepting all CO2 values as valid for testing
        return `${numValue.toFixed(1)} ppm`;
      case 'field4': // CO
        if (numValue < 0 || numValue > 100) {
          return `Invalid (${numValue} ppm)`;
        }
        return `${numValue.toFixed(1)} ppm`;
      case 'field5': // H2
        if (numValue < 0 || numValue > 100) {
          return `Invalid (${numValue} ppm)`;
        }
        return `${numValue.toFixed(1)} ppm`;
      case 'field6': // Fire detection
        return numValue === 1 ? "Yes" : "No";
      case 'field7': // Risk score
        return numValue.toFixed(2);
      case 'field8': // Battery level
        return `${numValue.toFixed(0)}%`;
      default:
        return value;
    }
  };
  
  const getFieldName = (fieldKey: string): string => {
    if (!data?.channel) return fieldKey;
    
    const channel = data.channel;
    const fieldMap: Record<string, string> = {
      field1: channel.field1 || 'Temperature',
      field2: channel.field2 || 'Humidity',
      field3: channel.field3 || 'CO2',
      field4: channel.field4 || 'CO',
      field5: channel.field5 || 'H2',
      field6: channel.field6 || 'Fire Detected',
      field7: channel.field7 || 'Risk Score',
      field8: channel.field8 || 'Battery'
    };
    
    return fieldMap[fieldKey] || fieldKey;
  };
  
  const downloadCSV = () => {
    if (!data) return;
    
    // Create CSV header
    const headers = [
      'Entry ID',
      'Timestamp',
      getFieldName('field1'),
      getFieldName('field2'),
      getFieldName('field3'),
      getFieldName('field4'),
      getFieldName('field5'),
      getFieldName('field6'),
      getFieldName('field7'),
      getFieldName('field8')
    ];
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.feeds.map(feed => {
        return [
          feed.entry_id,
          formatDate(feed.created_at),
          feed.field1 || '',
          feed.field2 || '',
          feed.field3 || '',
          feed.field4 || '',
          feed.field5 || '',
          feed.field6 || '',
          feed.field7 || '',
          feed.field8 || ''
        ].join(',');
      })
    ].join('\n');
    
    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `thingspeak_data_${CHANNEL_ID}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const totalPages = Math.ceil(totalEntries / pageSize);
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button variant="outline" size="sm" onClick={fetchChannelData} className="ml-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          ThingSpeak Data Records
          {loading && <Loader2 className="h-5 w-5 animate-spin text-blue-400 ml-2" />}
        </CardTitle>
        <CardDescription className="text-white/80">
          {data?.channel?.name || "Channel"} - Complete sensor readings history
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && !data ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <span className="ml-3 text-lg text-white/80">Loading data...</span>
          </div>
        ) : (
          <>
            {/* Channel Info */}
            {data?.channel && (
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 mb-4 text-white/80">
                <h3 className="text-lg font-semibold text-white mb-2">Channel Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Channel ID:</span> {data.channel.id}</div>
                  <div><span className="font-medium">Name:</span> {data.channel.name}</div>
                  <div><span className="font-medium">Description:</span> {data.channel.description || "Not provided"}</div>
                  <div><span className="font-medium">Created:</span> {formatDate(data.channel.created_at)}</div>
                  <div><span className="font-medium">Last Updated:</span> {formatDate(data.channel.updated_at)}</div>
                  <div><span className="font-medium">Total Entries:</span> {totalEntries}</div>
                  {data.channel.latitude && data.channel.longitude && (
                    <div><span className="font-medium">Location:</span> {data.channel.latitude}, {data.channel.longitude}</div>
                  )}
                </div>
                
                <h4 className="text-md font-semibold text-white mt-4 mb-2">Field Mappings</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div><span className="font-medium">Field 1:</span> {data.channel.field1 || "Temperature"}</div>
                  <div><span className="font-medium">Field 2:</span> {data.channel.field2 || "Humidity"}</div>
                  <div><span className="font-medium">Field 3:</span> {data.channel.field3 || "CO2"}</div>
                  <div><span className="font-medium">Field 4:</span> {data.channel.field4 || "CO"}</div>
                  {data.channel.field5 && <div><span className="font-medium">Field 5:</span> {data.channel.field5}</div>}
                  {data.channel.field6 && <div><span className="font-medium">Field 6:</span> {data.channel.field6}</div>}
                  {data.channel.field7 && <div><span className="font-medium">Field 7:</span> {data.channel.field7}</div>}
                  {data.channel.field8 && <div><span className="font-medium">Field 8:</span> {data.channel.field8}</div>}
                </div>
              </div>
            )}
            
            {/* Data Table */}
            <div className="rounded-md border border-white/20 overflow-hidden">
              <Table>
                <TableHeader className="bg-white/10">
                  <TableRow>
                    <TableHead className="text-white">Entry ID</TableHead>
                    <TableHead className="text-white">Timestamp</TableHead>
                    <TableHead className="text-white">{getFieldName('field1')}</TableHead>
                    <TableHead className="text-white">{getFieldName('field2')}</TableHead>
                    <TableHead className="text-white">{getFieldName('field3')}</TableHead>
                    <TableHead className="text-white">{getFieldName('field4')}</TableHead>
                    {data?.channel?.field5 && <TableHead className="text-white">{getFieldName('field5')}</TableHead>}
                    {data?.channel?.field6 && <TableHead className="text-white">{getFieldName('field6')}</TableHead>}
                    {data?.channel?.field7 && <TableHead className="text-white">{getFieldName('field7')}</TableHead>}
                    {data?.channel?.field8 && <TableHead className="text-white">{getFieldName('field8')}</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.feeds.map((feed) => (
                    <TableRow key={feed.entry_id} className="text-white/90 hover:bg-white/10">
                      <TableCell>{feed.entry_id}</TableCell>
                      <TableCell>{formatDate(feed.created_at)}</TableCell>
                      <TableCell>{formatValue(feed.field1, 'field1')}</TableCell>
                      <TableCell>{formatValue(feed.field2, 'field2')}</TableCell>
                      <TableCell>{formatValue(feed.field3, 'field3')}</TableCell>
                      <TableCell>{formatValue(feed.field4, 'field4')}</TableCell>
                      {data?.channel?.field5 && <TableCell>{formatValue(feed.field5, 'field5')}</TableCell>}
                      {data?.channel?.field6 && <TableCell>{formatValue(feed.field6, 'field6')}</TableCell>}
                      {data?.channel?.field7 && <TableCell>{formatValue(feed.field7, 'field7')}</TableCell>}
                      {data?.channel?.field8 && <TableCell>{formatValue(feed.field8, 'field8')}</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || loading}
                  className="text-white bg-white/10 border-white/20 hover:bg-white/20"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <span className="text-white/70 text-sm mx-2">
                  Page {page} of {totalPages}
                </span>
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages || loading}
                  className="text-white bg-white/10 border-white/20 hover:bg-white/20"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
                
                <div className="ml-4 flex items-center gap-2">
                  <span className="text-white/70 text-sm">Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1); // Reset to page 1 when changing page size
                    }}
                    className="bg-white/10 text-white border border-white/20 rounded px-2 py-1 text-sm"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <span className="text-white/70 text-sm">entries</span>
                </div>
              </div>
              
              <Button 
                variant="outline"
                size="sm"
                onClick={downloadCSV}
                disabled={!data || loading}
                className="text-white bg-white/10 border-white/20 hover:bg-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}