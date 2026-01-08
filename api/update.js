// EmberGuard Sensor Data API Endpoint
// Accepts sensor data and stores it in Supabase
// Required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js';

// Setup Supabase client using environment variables
const getSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

// Validate sensor data payload
const validateSensorData = (data) => {
  // Check that all required fields exist
  const requiredFields = ['temperature', 'humidity', 'co2', 'carbonMonoxide', 'h2', 'fireDetected'];
  const missingFields = requiredFields.filter(field => data[field] === undefined);
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  // Validate field types and ranges
  if (typeof data.temperature !== 'number' || data.temperature < -50 || data.temperature > 150) {
    return { valid: false, error: 'Invalid temperature value (must be number between -50 and 150)' };
  }
  
  if (typeof data.humidity !== 'number' || data.humidity < 0 || data.humidity > 100) {
    return { valid: false, error: 'Invalid humidity value (must be number between 0 and 100)' };
  }
  
  if (typeof data.co2 !== 'number' || data.co2 < 0 || data.co2 > 10000) {
    return { valid: false, error: 'Invalid CO2 value (must be number between 0 and 10000)' };
  }
  
  if (typeof data.carbonMonoxide !== 'number' || data.carbonMonoxide < 0 || data.carbonMonoxide > 1000) {
    return { valid: false, error: 'Invalid carbon monoxide value (must be number between 0 and 1000)' };
  }
  
  if (typeof data.h2 !== 'number' || data.h2 < 0 || data.h2 > 1000) {
    return { valid: false, error: 'Invalid H2 value (must be number between 0 and 1000)' };
  }
  
  if (typeof data.fireDetected !== 'boolean') {
    return { valid: false, error: 'Invalid fireDetected value (must be boolean)' };
  }
  
  return { valid: true };
};

// Process the incoming request
export default async function handler(req, res) {
  // Only accept POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Validate request body
    if (!req.body) {
      return res.status(400).json({ error: 'Missing request body' });
    }
    
    // Parse JSON body if needed (Vercel may handle this automatically)
    const sensorData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    // Validate sensor data
    const validation = validateSensorData(sensorData);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Add timestamp if not provided
    const dataToInsert = {
      ...sensorData,
      created_at: sensorData.created_at || new Date().toISOString()
    };
    
    // Initialize Supabase client
    const supabase = getSupabaseClient();
    
    // Insert data into sensor_data table
    const { data, error } = await supabase
      .from('sensor_data')
      .insert([dataToInsert]);
      
    // Check for database errors
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to store sensor data' });
    }
    
    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Sensor data recorded successfully',
      timestamp: dataToInsert.created_at
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
