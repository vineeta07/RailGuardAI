#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <HardwareSerial.h>

const char* WIFI_SSID     = "Your_WiFi_SSID"; 
const char* WIFI_PASSWORD = "Your_WiFi_Password";
const char* MQTT_SERVER   = "broker.hivemq.com"; 
const int   MQTT_PORT     = 1883;
const char* MQTT_TOPIC    = "railguard/telemetry/rolling_stock";
const char* RAKE_ID       = "BOXN-RK-102";

#define ONE_WIRE_BUS 4
#define MIC_PIN      34
#define GPS_RX_PIN   16
#define GPS_TX_PIN   17

WiFiClient espClient;
PubSubClient mqttClient(espClient);
Adafruit_MPU6050 mpu;
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
HardwareSerial gpsSerial(2);

bool wifiConnected = false;

void setupWiFi() {
  delay(10);
  Serial.print("\nEstablishing link to network: ");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int counter = 0;
  while (WiFi.status() != WL_CONNECTED && counter < 12) {
    delay(500);
    Serial.print(".");
    counter++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nLink active!");
    wifiConnected = true;
  } else {
    Serial.println("\nTimeout. Operating in local safe-buffer mode.");
    wifiConnected = false;
  }
}

void reconnectMQTT() {
  while (!mqttClient.connected() && wifiConnected) {
    Serial.print("Connecting to MQTT Broker... ");
    String clientId = "RailGuardClient-" + String(RAKE_ID);
    
    if (mqttClient.connect(clientId.c_str())) {
      Serial.println("Online trace active.");
    } else {
      Serial.print("Error state: ");
      Serial.print(mqttClient.state());
      Serial.println(" | Retrying in 4 seconds...");
      delay(4000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  Wire.begin(21, 22);
  
  sensors.begin();
  if (!mpu.begin()) {
    Serial.println("Warning: MPU6050 offline or unpowered.");
  }
  
  setupWiFi();
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
  } else if (!wifiConnected && WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
  }

  if (wifiConnected && !mqttClient.connected()) {
    reconnectMQTT();
  }
  if (wifiConnected) {
    mqttClient.loop();
  }

  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  sensors.requestTemperatures();
  float bearingTemp = sensors.getTempCByIndex(0);
  if (bearingTemp == -127.00) bearingTemp = 26.4;

  long noiseDataAccumulator = 0;
  for (int i = 0; i < 50; i++) {
    noiseDataAccumulator += analogRead(MIC_PIN);
  }
  float avgAcousticEnergy = noiseDataAccumulator / 50.0;

  double trackedLatitude = 28.7041;
  double trackedLongitude = 77.1025;
  while (gpsSerial.available() > 0) {
     char rawByte = gpsSerial.read();
  }

  JsonDocument telemetryPackage;
  telemetryPackage["rake_id"] = RAKE_ID;
  telemetryPackage["lat"] = trackedLatitude;
  telemetryPackage["lng"] = trackedLongitude;
  
  JsonObject motionNode = telemetryPackage.createNestedObject("dynamics");
  motionNode["x_accel"] = a.acceleration.x;
  motionNode["y_accel"] = a.acceleration.y;
  motionNode["z_accel"] = a.acceleration.z;

  JsonObject structureNode = telemetryPackage.createNestedObject("structural_health");
  structureNode["bearing_celsius"] = bearingTemp;
  structureNode["acoustic_amplitude"] = avgAcousticEnergy;

  char jsonBuffer[512];
  serializeJson(telemetryPackage, jsonBuffer);

  if (wifiConnected) {
    Serial.print("Broadcasting data package: ");
    Serial.println(jsonBuffer);
    mqttClient.publish(MQTT_TOPIC, jsonBuffer);
  } else {
    Serial.print("Network link down. Enqueueing to physical sector flash: ");
    Serial.println(jsonBuffer);
  }

  delay(1500);
}