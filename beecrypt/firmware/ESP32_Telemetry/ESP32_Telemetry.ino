/*
 * ==============================================================================
 *  BeeCrypt — ESP32 DevKit IoT Environmental & Vibration Telemetry Firmware
 *  Production Hardened & Resilient Architecture (SIH'26)
 * ==============================================================================
 *  Target Board   : ESP32 Dev Module / ESP32 DevKit V1
 *  Sensors        : DHT11 (Temperature & Humidity) + Digital Vibration Sensor (SW-420)
 *  Remediations   : HC-018 (Configurable Network IP/Host), HC-019 (Telemetry Modes & Offline Buffer)
 * ==============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <esp_sleep.h>

// ==============================================================================
// 1. CONFIGURATION & NETWORK TARGETS
// ==============================================================================
#ifndef WIFI_SSID
#define WIFI_SSID     "YOUR_WIFI_SSID"        // Configurable via build flags / captive portal
#endif

#ifndef WIFI_PASSWORD
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"    // Configurable via build flags / captive portal
#endif

// Canonical Backend URL: Override via compiler -DBACKEND_URL="..." or DNS hostname
#ifndef BACKEND_URL
#define BACKEND_URL   "http://gateway.honeychain.internal:3001/api/v1/sensors/telemetry"
#endif

// Secret device key matching SENSOR_DEVICE_KEY in server environment
#ifndef SENSOR_KEY
#define SENSOR_KEY    "beecrypt_sensor_secret_key_2026"
#endif

#define DEVICE_ID     "ESP32-DEVKIT-01"
#define HIVE_ID       "H-1000"

// Operational Telemetry Modes
#define MODE_REALTIME 1   // Continuous non-blocking streaming
#define MODE_BATTERY  2   // Deep-sleep duty cycling for solar/battery hives
#define TELEMETRY_MODE MODE_REALTIME

// Sampling intervals
#define REALTIME_INTERVAL_MS 5000     // 5 seconds in realtime mode
#define BATTERY_SLEEP_SEC    60       // 60 seconds deep sleep in battery mode

// ==============================================================================
// 2. PIN DEFINITIONS & RANGES
// ==============================================================================
#define DHTPIN          4
#define DHTTYPE         DHT11
#define VIBRATION_PIN   5
#define LED_PIN         2
#define VIBRATION_ACTIVE_HIGH true

#define MIN_TEMP_C      -20.0
#define MAX_TEMP_C      70.0
#define MIN_HUMIDITY    0.0
#define MAX_HUMIDITY    100.0

// ==============================================================================
// 3. OFFLINE TELEMETRY RING BUFFER
// ==============================================================================
struct TelemetrySample {
  float temperature;
  float humidity;
  bool vibration;
  uint32_t seq;
  unsigned long timestampMs;
};

#define BUFFER_CAPACITY 20
RTC_DATA_ATTR static TelemetrySample offlineBuffer[BUFFER_CAPACITY];
RTC_DATA_ATTR static int bufferHead = 0;
RTC_DATA_ATTR static int bufferCount = 0;
RTC_DATA_ATTR static uint32_t sequenceNumber = 0;

DHT dht(DHTPIN, DHTTYPE);
unsigned long lastSendTime = 0;
int backoffDelayMs = 1000;
const int maxBackoffDelayMs = 16000;

// ==============================================================================
// 4. SETUP & INITIALIZATION
// ==============================================================================
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println();
  Serial.println("=================================================");
  Serial.println("   BeeCrypt — Hardened ESP32 Sensor Telemetry   ");
  Serial.printf("   Target: %s\n", BACKEND_URL);
  Serial.println("=================================================");

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  pinMode(VIBRATION_PIN, INPUT);

  dht.begin();
  connectWiFi();

  if (TELEMETRY_MODE == MODE_BATTERY) {
    // Single-shot sample, flush, and deep sleep
    sampleAndTransmit();
    Serial.printf("[SLEEP] Entering deep sleep for %d seconds...\n", BATTERY_SLEEP_SEC);
    esp_sleep_enable_timer_wakeup((uint64_t)BATTERY_SLEEP_SEC * 1000000ULL);
    esp_deep_sleep_start();
  }
}

// ==============================================================================
// 5. MAIN LOOP (REALTIME MODE)
// ==============================================================================
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WIFI] Reconnecting with backoff...");
    connectWiFi();
  }

  unsigned long now = millis();
  if (now - lastSendTime >= REALTIME_INTERVAL_MS) {
    lastSendTime = now;
    sampleAndTransmit();
  }
}

// ==============================================================================
// 6. WI-FI WITH EXPONENTIAL BACKOFF
// ==============================================================================
void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.printf("[WIFI] Connecting to %s ", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(300);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WIFI] Connected! IP: " + WiFi.localIP().toString());
    backoffDelayMs = 1000;
  } else {
    Serial.printf("\n[WIFI] Connection failed. Waiting %d ms before retry...\n", backoffDelayMs);
    delay(backoffDelayMs);
    backoffDelayMs = min(backoffDelayMs * 2, maxBackoffDelayMs);
  }
}

// ==============================================================================
// 7. SAMPLING, VALIDATION & TRANSMISSION
// ==============================================================================
bool postTelemetryPayload(const char* payload) {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-sensor-device-key", SENSOR_KEY);
  http.setTimeout(4000);

  digitalWrite(LED_PIN, HIGH);
  int httpCode = http.POST(payload);
  digitalWrite(LED_PIN, LOW);

  bool success = (httpCode >= 200 && httpCode < 300);
  if (success) {
    Serial.printf("[HTTP] Transmit SUCCESS (%d)\n", httpCode);
  } else {
    Serial.printf("[HTTP] Transmit FAILED (%d): %s\n", httpCode, http.errorToString(httpCode).c_str());
  }
  http.end();
  return success;
}

void sampleAndTransmit() {
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  // Validate physical bounds to filter hardware glitches
  if (isnan(humidity) || isnan(temperature) ||
      temperature < MIN_TEMP_C || temperature > MAX_TEMP_C ||
      humidity < MIN_HUMIDITY || humidity > MAX_HUMIDITY) {
    Serial.printf("[SENSOR] Invalid reading (Temp: %.1f, Hum: %.1f). Skipping.\n", temperature, humidity);
    return;
  }

  int rawVibe = digitalRead(VIBRATION_PIN);
  bool vibrationDetected = VIBRATION_ACTIVE_HIGH ? (rawVibe == HIGH) : (rawVibe == LOW);
  sequenceNumber++;

  char payload[384];
  snprintf(payload, sizeof(payload),
    "{\"deviceId\":\"%s\",\"hiveId\":\"%s\",\"temperature\":%.1f,\"humidity\":%.1f,\"vibration\":%s,\"vibrationValue\":%d,\"seq\":%u}",
    DEVICE_ID, HIVE_ID, temperature, humidity,
    vibrationDetected ? "true" : "false",
    vibrationDetected ? 1 : 0,
    sequenceNumber
  );

  Serial.printf("[#%u] T:%.1fC H:%.1f%% Vibe:%d -> Sending...\n", sequenceNumber, temperature, humidity, vibrationDetected ? 1 : 0);

  bool sent = postTelemetryPayload(payload);
  if (!sent) {
    // Buffer locally if network is unreachable
    if (bufferCount < BUFFER_CAPACITY) {
      int idx = (bufferHead + bufferCount) % BUFFER_CAPACITY;
      offlineBuffer[idx] = { temperature, humidity, vibrationDetected, sequenceNumber, millis() };
      bufferCount++;
      Serial.printf("[BUFFER] Network down. Reading stored in offline buffer (%d/%d)\n", bufferCount, BUFFER_CAPACITY);
    }
  } else if (bufferCount > 0) {
    // Flush buffered readings
    Serial.printf("[BUFFER] Flushing %d offline samples...\n", bufferCount);
    while (bufferCount > 0) {
      TelemetrySample s = offlineBuffer[bufferHead];
      char flushPayload[384];
      snprintf(flushPayload, sizeof(flushPayload),
        "{\"deviceId\":\"%s\",\"hiveId\":\"%s\",\"temperature\":%.1f,\"humidity\":%.1f,\"vibration\":%s,\"vibrationValue\":%d,\"seq\":%u,\"buffered\":true}",
        DEVICE_ID, HIVE_ID, s.temperature, s.humidity,
        s.vibration ? "true" : "false",
        s.vibration ? 1 : 0,
        s.seq
      );
      if (postTelemetryPayload(flushPayload)) {
        bufferHead = (bufferHead + 1) % BUFFER_CAPACITY;
        bufferCount--;
      } else {
        break;
      }
    }
  }
}
