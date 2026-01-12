#include "FireProject_model.h"   // Your exported ML model
#include <DHT.h>                 // Include DHT sensor library
#include <ESP8266WiFi.h>         // WiFi library
#include <ThingSpeak.h>          // ThingSpeak library

// ================================
// WiFi Configuration
// ================================
const char* ssid = "Chuti iPhone";          // 🔹 Replace with your WiFi name
const char* password = "Chuti119";  // 🔹 Replace with your WiFi password

WiFiClient client;

// ================================
// ThingSpeak Configuration
// ================================
unsigned long myChannelNumber = 3111993; // 🔹 Replace with your channel number
const char * myWriteAPIKey = "K1IG00G3V1A00VEW";         // 🔹 Replace with your Write API Key


// ================================
// Sensor and pin configuration
// ================================
#define DHTPIN D2          // DHT sensor data pin
#define DHTTYPE DHT11      // Change to DHT22 if you're using that model
#define GAS_SENSOR_PIN A0  // Analog pin for MQ-2 or MQ-135

#define RED_LED D5         // Fire indicator LED
#define GREEN_LED D6       // Safe indicator LED

// Create objects
DHT dht(DHTPIN, DHTTYPE);
Eloquent::ML::Port::DecisionTree clf;

void setup() {
  Serial.begin(115200);
  pinMode(GAS_SENSOR_PIN, INPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);

  dht.begin();

  // ================================
  // WiFi Connection (ADDED)
  // ================================
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Initialize ThingSpeak (ADDED)
  ThingSpeak.begin(client);

  Serial.println("🔥 Fire Detection System Initialized...");
  delay(2000);
}

void loop() {
  // ================================
  // Read sensor values
  // ================================
  float temperature = dht.readTemperature();  // °C
  float humidity = dht.readHumidity();        // %
  int gasValue = analogRead(GAS_SENSOR_PIN);  // raw analog value (0–1023)

  // Convert gas sensor raw value into approximate gas concentration
  // (Simple scaling; fine-tune with calibration)
  float co2 = map(gasValue, 0, 1023, 350, 5000); // CO2 in ppm
  float co = map(gasValue, 0, 1023, 1, 100);     // CO in ppm
  float h2 = map(gasValue, 0, 1023, 1, 50);      // H2 in ppm

  // ================================
  // Prepare features for the ML model
  // ⚠️ Ensure this order matches your training feature order!
  // Example: {CO2, CO, H2, Humidity, Temperature}
  // ================================
  float features[] = {co2, co, h2, humidity, temperature};

  // ================================
  // Make prediction using ML model
  // ================================
  int prediction = clf.predict(features);

  // ================================
  // Output results
  // ================================
  Serial.print("CO2: "); Serial.print(co2);
  Serial.print(" | CO: "); Serial.print(co);
  Serial.print(" | H2: "); Serial.print(h2);
  Serial.print(" | Humidity: "); Serial.print(humidity);
  Serial.print(" | Temp: "); Serial.print(temperature);

 String status;
  if (prediction == 1) {
    Serial.println(" => 🔥 FIRE RISK DETECTED!");
    digitalWrite(RED_LED, HIGH);
    digitalWrite(GREEN_LED, LOW);
  } else {
    Serial.println(" => ✅ Safe (No Fire)");
    digitalWrite(RED_LED, LOW);
    digitalWrite(GREEN_LED, HIGH);
  }

  // ================================
  // SEND DATA TO THINGSPEAK (ADDED)
  // ================================
  ThingSpeak.setField(1, co2);
  ThingSpeak.setField(2, co);
  ThingSpeak.setField(3, h2);
  ThingSpeak.setField(4, temperature);
  ThingSpeak.setField(5, humidity);
  ThingSpeak.setField(6, (prediction == 1) ? 1 : 0); // 1 = Fire, 0 = Safe

  int response = ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);

  if (response == 200) {
    Serial.println("📡 Data sent to ThingSpeak successfully!");
  } else {
    Serial.print("⚠️ Error sending data. HTTP error code: ");
    Serial.println(response);
  }

  delay(5000);  // wait 3 seconds before next reading
}
