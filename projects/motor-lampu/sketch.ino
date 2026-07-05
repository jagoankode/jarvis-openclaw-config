/*
 * Motor Lampu Variasi - RGB Sequential Running Light
 * Arduino Uno + WS2812B LED Ring
 * 
 * Mode: Running light rainbow bergeser
 * Gak pake saklar — langsung jalan pas dinyalain
 * 
 * Pinout:
 *   Pin 6 → DIN LED Ring 1 (kiri)
 *   Pin 5 → DIN LED Ring 2 (kanan)
 *   5V   → VCC LED Rings
 *   GND  → GND semua
 */

#include <Adafruit_NeoPixel.h>

#define PIN_RING1    6
#define PIN_RING2    5
#define NUM_LEDS     12

Adafruit_NeoPixel ring1(NUM_LEDS, PIN_RING1, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel ring2(NUM_LEDS, PIN_RING2, NEO_GRB + NEO_KHZ800);

#define SPEED  40     // ms per langkah (makin kecil makin cepet)
int pos = 0;

// ===== Konversi HSV ke RGB =====
// Hue 0-65536 -> warna rainbow penuh
uint32_t wheel(Adafruit_NeoPixel &ring, int wheelPos) {
  wheelPos = 255 - wheelPos;
  if (wheelPos < 85) {
    return ring.Color(255 - wheelPos * 3, 0, wheelPos * 3);
  }
  if (wheelPos < 170) {
    wheelPos -= 85;
    return ring.Color(0, wheelPos * 3, 255 - wheelPos * 3);
  }
  wheelPos -= 170;
  return ring.Color(wheelPos * 3, 255 - wheelPos * 3, 0);
}

void setup() {
  ring1.begin();
  ring2.begin();
  ring1.clear(); ring1.show();
  ring2.clear(); ring2.show();
}

void loop() {
  // Geser posisi setiap SPEED ms
  delay(SPEED);
  pos = (pos + 1) % NUM_LEDS;

  ring1.clear();
  ring2.clear();

  // Isi setiap LED dengan warna rainbow
  // Posisi geser: makin lama makin maju -> efek chase rainbow
  for (int i = 0; i < NUM_LEDS; i++) {
    int hue = (i * 256 / NUM_LEDS + pos * 20) % 256;
    ring1.setPixelColor(i, wheel(ring1, hue));
    ring2.setPixelColor(NUM_LEDS - 1 - i, wheel(ring2, hue));
  }

  ring1.show();
  ring2.show();
}
