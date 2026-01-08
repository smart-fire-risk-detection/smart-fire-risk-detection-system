/**
 * ThingSpeak Field Mapping Verification Test
 * 
 * This file contains a small test to verify the correct mapping of ThingSpeak fields
 * to their respective sensor types.
 * 
 * ThingSpeak Channel ID: 3111993
 * API Key: FWZVQI3THXH3CZH7
 * 
 * Field Mapping:
 * - Field1 = CO2 (~3650 ppm)
 * - Field2 = CO (~30 ppm)
 * - Field3 = H2 (~40 ppm) 
 * - Field4 = Temperature (~34°C)
 * - Field5 = Humidity (~67%)
 */

import React, { useEffect } from 'react';
import axios from 'axios';

// Test function - can be run in a browser console to verify the data mapping
export async function testThingSpeakMapping() {
  const CHANNEL_ID = "3111993";
  const API_KEY = "K1IG00G3V1A00VEW";
  
  console.log("Fetching latest ThingSpeak data to verify field mapping...");
  
  try {
    // Fetch the latest reading
    const response = await axios.get(
      `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds/last.json`,
      { params: { api_key: API_KEY } }
    );
    
    // Log raw data
    console.log("Raw ThingSpeak data:", response.data);
    
    // Parse fields with validation
    const parseFieldValue = (value: string | null, type: string): number | null => {
      if (!value || value === 'null' || value === 'undefined') {
        return null;
      }
      
      let parsedValue = parseFloat(value);
      
      if (isNaN(parsedValue)) {
        return null;
      }
      
      // Validate based on sensor type
      switch (type) {
        case 'temperature':
          // Temperature should be between -50°C and 100°C
          return (parsedValue < -50 || parsedValue > 100) ? null : parsedValue;
        case 'humidity':
          // Humidity should be between 0% and 100%
          return (parsedValue < 0 || parsedValue > 100) ? null : parsedValue;
        case 'co2':
          // CO2 levels can be higher (3000-4000 ppm is expected)
          return (parsedValue < 0 || parsedValue > 10000) ? null : parsedValue;
        case 'co':
        case 'h2':
          // CO and H2 levels typically between 0-100 ppm
          return (parsedValue < 0 || parsedValue > 100) ? null : parsedValue;
        default:
          return parsedValue;
      }
    };
    
    // Format validated data with the correct mapping
    const data = response.data;
    const formattedData = {
      temperature: parseFieldValue(data.field4, 'temperature'),  // Field4 = Temperature
      humidity: parseFieldValue(data.field5, 'humidity'),        // Field5 = Humidity
      co2: parseFieldValue(data.field1, 'co2'),                  // Field1 = CO2
      co: parseFieldValue(data.field2, 'co'),                    // Field2 = CO
      h2: parseFieldValue(data.field3, 'h2'),                    // Field3 = H2
      timestamp: data.created_at,
      entryId: data.entry_id
    };
    
    console.log("Formatted ThingSpeak data with correct mapping:", formattedData);
    
    // Verify the data is valid and in expected ranges
    console.log("\nVerification Results:");
    console.log("----------------------");
    console.log(`CO2: ${formattedData.co2} ppm - ${formattedData.co2 > 3000 && formattedData.co2 < 4000 ? '✅ VALID' : '❌ UNEXPECTED'} (Expected ~3650 ppm)`);
    console.log(`CO: ${formattedData.co} ppm - ${formattedData.co > 0 && formattedData.co < 100 ? '✅ VALID' : '❌ UNEXPECTED'} (Expected ~30 ppm)`);
    console.log(`H2: ${formattedData.h2} ppm - ${formattedData.h2 > 0 && formattedData.h2 < 100 ? '✅ VALID' : '❌ UNEXPECTED'} (Expected ~40 ppm)`);
    console.log(`Humidity: ${formattedData.humidity}% - ${formattedData.humidity > 0 && formattedData.humidity < 100 ? '✅ VALID' : '❌ UNEXPECTED'} (Expected ~67%)`);
    console.log(`Temperature: ${formattedData.temperature}°C - ${formattedData.temperature > 0 && formattedData.temperature < 50 ? '✅ VALID' : '❌ UNEXPECTED'} (Expected ~34°C)`);
    
    return formattedData;
  } catch (err) {
    console.error("Error verifying ThingSpeak mapping:", err);
    return null;
  }
}

// React component for testing in a component context
export const ThingSpeakMappingTest: React.FC = () => {
  useEffect(() => {
    testThingSpeakMapping();
  }, []);
  
  return (
    <div>
      <h1>ThingSpeak Field Mapping Verification</h1>
      <p>Check the console for test results</p>
    </div>
  );
};

export default ThingSpeakMappingTest;