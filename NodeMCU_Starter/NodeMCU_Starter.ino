/*
 * NodeMCU V3 (ESP8266) — Starter Sample
 * 
 * Fitur:
 * 1. Connect ke WiFi
 * 2. Built-in LED (D4 / GPIO2) blink sebagai indikator
 * 3. Simple web server buat control LED via browser
 * 4. Serial monitor buat debug
 * 
 * Koneksi:
 * - Micro USB → laptop
 * - Baud rate: 9600 (Serial Monitor)
 */

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

// ===== GANTI INI =====
const char *SSID = "WIFI_SSID";
const char *PASSWORD = "WIFI_PASSWORD";
// =====================

const int LED_PIN = LED_BUILTIN; // D4 / GPIO2 — aktif LOW di NodeMCU
const int BAUD = 9600;

ESP8266WebServer server(80);

/* ===== HTML buat web control ===== */
const char WEB_PAGE[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <title>ESP8266 Control</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: sans-serif; text-align: center; padding: 40px; background: #1a1a2e; color: #eee; }
    h1 { font-size: 2rem; margin-bottom: 30px; }
    .btn {
      display: inline-block; padding: 16px 40px; margin: 10px; font-size: 1.2rem;
      border: none; border-radius: 8px; cursor: pointer; color: white;
    }
    .btn-on { background: #00c853; }
    .btn-off { background: #e53935; }
    .btn:hover { opacity: 0.85; }
    .status { margin-top: 20px; font-size: 1.1rem; }
  </style>
</head>
<body>
  <h1>⚡ NodeMCU Control</h1>
  <a href="/on"><button class="btn btn-on">🔴 LED ON</button></a>
  <a href="/off"><button class="btn btn-off">⚫ LED OFF</button></a>
  <p class="status" id="status">Checking...</p>
  <script>
    fetch("/status").then(r => r.text()).then(t => document.getElementById("status").innerText = "LED: " + t);
  </script>
</body>
</html>
)rawliteral";

/* ===== Setup — jalan sekali pas board nyala ===== */
void setup() {
  Serial.begin(BAUD);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH); // Matiin LED (HIGH = off karena aktif LOW)

  Serial.println("\n==============================");
  Serial.println("  NodeMCU V3 — Starter Sample");
  Serial.println("==============================\n");

  // Connect WiFi
  Serial.print("Connecting to WiFi: ");
  Serial.println(SSID);
  WiFi.begin(SSID, PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi gagal connect. Cek SSID & password.");
  }

  // Setup web server routes
  server.on("/", []() { server.send_P(200, "text/html", WEB_PAGE); });
  server.on("/on", []() {
    digitalWrite(LED_PIN, LOW);
    server.send_P(200, "text/plain", "ON");
    Serial.println("🔴 LED ON");
  });
  server.on("/off", []() {
    digitalWrite(LED_PIN, HIGH);
    server.send_P(200, "text/plain", "OFF");
    Serial.println("⚫ LED OFF");
  });
  server.on("/status", []() {
    String state = digitalRead(LED_PIN) == LOW ? "ON" : "OFF";
    server.send(200, "text/plain", state);
  });

  server.begin();
  Serial.println("🌐 Web server started!");
  Serial.print("Buka browser: http://");
  Serial.println(WiFi.localIP());
}

/* ===== Loop — jalan terus ===== */
void loop() {
  server.handleClient(); // Handle request dari browser

  // Blink cepat kalo belum connect WiFi (indikator)
  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_PIN, LOW);
    delay(200);
    digitalWrite(LED_PIN, HIGH);
    delay(200);
  }

  delay(10); // Biar gak makan CPU full
}
