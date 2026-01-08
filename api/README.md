# EmberGuard Sensor Data API

This API endpoint accepts sensor data from IoT devices and stores it in the Supabase database.

## Endpoint

```
POST /api/update
```

## Request Format

Send a JSON payload with the following fields:

```json
{
  "temperature": 25.5,       // Temperature in degrees Celsius (-50 to 150)
  "humidity": 45,            // Relative humidity percentage (0 to 100)
  "co2": 450,               // CO2 levels in ppm (0 to 10000)
  "carbonMonoxide": 2,       // Carbon monoxide levels in ppm (0 to 1000)
  "h2": 0.5,                // Hydrogen gas levels in ppm (0 to 1000)
  "fireDetected": false      // Boolean indicating if fire is detected
}
```

## Responses

### Success (200 OK)

```json
{
  "success": true,
  "message": "Sensor data recorded successfully",
  "timestamp": "2025-10-12T15:30:45.123Z"
}
```

### Invalid Request (400 Bad Request)

```json
{
  "error": "Missing required fields: temperature, humidity"
}
```

### Method Not Allowed (405)

```json
{
  "error": "Method not allowed"
}
```

### Server Error (500)

```json
{
  "error": "Failed to store sensor data"
}
```

## Environment Variables

The API requires the following environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (with write permissions)

## Database Table Schema

The API expects a table in Supabase called `sensor_data` with the following schema:

```sql
create table sensor_data (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  temperature numeric not null,
  humidity numeric not null,
  co2 numeric not null,
  carbon_monoxide numeric not null,
  h2 numeric not null,
  fire_detected boolean not null,
  device_id text
);
```

Note: `device_id` is optional in this implementation.