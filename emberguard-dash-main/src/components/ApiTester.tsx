// Test script to check API connectivity
// Place this in the emberguard-dash-main/emberguard-dash-main directory

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ApiTester() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testUpdateData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/updateData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testData: 'Testing API connection',
          timestamp: new Date().toISOString()
        }),
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>API Connection Tester</CardTitle>
        <CardDescription>Test connection to the /api/updateData endpoint</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testUpdateData} disabled={loading}>
          {loading ? 'Testing...' : 'Test API Connection'}
        </Button>
        
        {result && (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
            <pre className="text-xs overflow-auto">{result}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}