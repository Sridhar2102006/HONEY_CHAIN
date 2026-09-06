/*
 * ==============================================================================
 *  BeeCrypt — ESP32 DevKit IoT Environmental & Vibration Telemetry Firmware
 * ==============================================================================
 *  Target Board   : ESP32 Dev Module / ESP32 DevKit V1
 *  Sensors        : DHT11 (Temperature & Humidity) + Digital Vibration Sensor
 *  Backend Target : http://<BACKEND_IP>:3001/api/v1/sensors/telemetry
 *  MongoDB Coll   : READINGS (Time-Series Collection in database 'ESP32CAM')
 * ==============================================================================
 *  WIRING INSTRUCTIONS:
 *  ------------------------------------------------------------------------------
 *  DHT11 Sensor:
 *    - VCC  ---> ESP32 3.3V (or 5V depending on module)
 *    - GND  ---> ESP32 GND
 *    - DATA ---> ESP32 GPIO 4  (Add 10k pull-up resistor if module has no resistor)
 *
 *  Digital Vibration Sensor (SW-420 or similar 801S / ball tilt):
 *    - VCC  ---> ESP32 3.3V
 *    - GND  ---> ESP32 GND
 *    - DO   ---> ESP32 GPIO 5  (Digital Output)
 *
 *  Onboard Status LED:
 *    - GPIO 2 (Blinks on successful telemetry transmission)
 * ==============================================================================
 *  REQUIRED ARDUINO LIBRARIES:
 *    1. "DHT sensor library" by Adafruit (Tools -> Manage Libraries -> Search "DHT sensor library")
 *    2. "Adafruit Unified Sensor" by Adafruit
 *    3. WiFi and HTTPClient are built into the ESP32 board package
 * ==============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// ==============================================================================
// 1. CONFIGURATION — EDIT YOUR WI-FI CREDENTIALS HERE
// ==============================================================================
const char* WIFI_SSID     = "YOUR_WIFI_SSID";         // <-- Replace with your Wi-Fi Name
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";     // <-- Replace with your Wi-Fi Password

// Cloud/Local Backend Telemetry API Endpoint
// NOTE: 10.131.229.86 is your laptop's current Wi-Fi IP. Ensure port 3001 is accessible.
const char* BACKEND_URL   = "http://10.131.229.86:3001/api/v1/sensors/telemetry";

// Secret authentication key matching SENSOR_DEVICE_KEY in server/.env
const char* SENSOR_KEY    = "beecrypt_sensor_secret_key_2026";

// Logical identifiers for this sensor node and apiary hive box
const char* DEVICE_ID     = "ESP32-DEVKIT-01";
const char* HIVE_ID       = "H-1000";

// Telemetry interval in milliseconds (3000ms = 3 seconds)
const unsigned long SEND_INTERVAL_MS = 3000;

// ==============================================================================
// 2. PIN DEFINITIONS
// ==============================================================================
#define DHTPIN          4       // GPIO 4 for DHT11 Data
#define DHTTYPE         DHT11   // DHT 11 sensor model
#define VIBRATION_PIN   5       // GPIO 5 for Digital Vibration Sensor DO
#define LED_PIN         2       // GPIO 2 for On-board Blue Status LED

// Set to true if sensor outputs HIGH on motion/vibration, or false if active LOW
#define VIBRATION_ACTIVE_HIGH true

// ==============================================================================
// 3. GLOBAL OBJECTS & STATE
// ==============================================================================
DHT dht(DHTPIN, DHTTYPE);
unsigned long lastSendTime = 0;
int transmitCount = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("=================================================");
  Serial.println("   BeeCrypt — ESP32 DevKit Telemetry Sensor Node");
  Serial.println("=================================================");

  // Initialize GPIOs
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  pinMode(VIBRATION_PIN, INPUT);

  // Initialize DHT11 sensor
  Serial.println("[SETUP] Initializing DHT11 sensor on GPIO 4...");
  dht.begin();

  // Connect to Wi-Fi
  connectWiFi();
}

void loop() {
  // Maintain Wi-Fi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WIFI] Connection lost. Reconnecting...");
    connectWiFi();
  }

  // Non-blocking transmission timer
  unsigned long now = millis();
  if (now - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = now;
    readAndTransmitSensors();
  }
}

// ==============================================================================
// 4. WI-FI CONNECTION ROUTINE
// ==============================================================================
void connectWiFi() {
  Serial.printf("[WIFI] Connecting to SSID: %s ", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("[WIFI] Connected successfully!");
    Serial.printf("[WIFI] Device IP Address : %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("[WIFI] Signal Strength   : %d dBm\n", WiFi.RSSI());
    Serial.printf("[WIFI] Backend Target    : %s\n", BACKEND_URL);
    Serial.println("-------------------------------------------------");
  } else {
    Serial.println();
    Serial.println("[WIFI] Failed to connect. Will retry during loop...");
  }
}

// ==============================================================================
// 5. SENSOR SAMPLING & HTTP TELEMETRY TRANSMISSION
// ==============================================================================
void readAndTransmitSensors() {
  // 1. Read DHT11 sensor
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature(); // Celsius

  // Check if readings are valid
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("[WARN] DHT11 read returned NaN. Sensor may still be stabilizing...");
    return;
  }

  // 2. Read Digital Vibration sensor
  int rawVibe = digitalRead(VIBRATION_PIN);
  bool vibrationDetected = VIBRATION_ACTIVE_HIGH ? (rawVibe == HIGH) : (rawVibe == LOW);
  int vibrationValue = vibrationDetected ? 1 : 0;

  transmitCount++;
  Serial.println();
  Serial.printf(">>> [#%d] Sampling Sensors:\n", transmitCount);
  Serial.printf("    Temperature : %.1f °C\n", temperature);
  Serial.printf("    Humidity    : %.1f %%\n", humidity);
  Serial.printf("    Vibration   : %s (raw=%d)\n", vibrationDetected ? "ALERT (Detected)" : "Normal (Quiet)", rawVibe);

  // 3. Build JSON payload
  // Uses snprintf for deterministic buffer formatting without dynamic allocation
  char payload[384];
  snprintf(payload, sizeof(payload),
    "{\"deviceId\":\"%s\",\"hiveId\":\"%s\",\"temperature\":%.1f,\"humidity\":%.1f,\"vibration\":%s,\"vibrationValue\":%d}",
    DEVICE_ID,
    HIVE_ID,
    temperature,
    humidity,
    vibrationDetected ? "true" : "false",
    vibrationValue
  );

  // 4. Send HTTP POST to Cloud/Backend Gateway
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(BACKEND_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-sensor-device-key", SENSOR_KEY);
    http.setTimeout(4000); // 4-second timeout

    // Blink LED to indicate transmission
    digitalWrite(LED_PIN, HIGH);
    int httpResponseCode = http.POST(payload);
    digitalWrite(LED_PIN, LOW);

    if (httpResponseCode > 0) {
      String responseBody = http.getString();
      Serial.printf("[HTTP] Status: %d OK | MongoDB Collection: 'READINGS'\n", httpResponseCode);
      Serial.printf("[HTTP] Server Response: %s\n", responseBody.c_str());
    } else {
      Serial.printf("[HTTP] POST Failed. Error code: %d (%s)\n",
        httpResponseCode, http.errorToString(httpResponseCode).c_str());
      Serial.println("[HINT] Check if backend server is running and laptop firewall permits port 3001.");
    }
    http.end();
  } else {
    Serial.println("[ERR] Cannot transmit: Wi-Fi disconnected.");
  }
}
