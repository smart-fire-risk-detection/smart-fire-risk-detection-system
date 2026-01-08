// Simple Node.js serverless function for Vercel
// This function accepts sensor data and returns a confirmation

export default function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the data from the request
    const data = req.body;
    
    // Check if we have data
    if (!data) {
      return res.status(400).json({ error: 'No data provided' });
    }
    
    // Log the received data (visible in Vercel logs)
    console.log('Received sensor data:', data);
    
    // Here you would typically save the data to a database
    // For now, we'll just return a success response
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Data received successfully',
      timestamp: new Date().toISOString(),
      data: data
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}