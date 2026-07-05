/*
 * ONYX Light — Smart Vehicle Lighting Controller
 * Arduino Uno + WS2812B Strips & Rings
 *
 * Komponen:
 *   Strip 1 (17 LED) → Pin 6  — Kiri Atas
 *   Strip 2 (17 LED) → Pin 5  — Kiri Bawah
 *   Strip 3 (17 LED) → Pin 9  — Kanan Atas
 *   Strip 4 (17 LED) → Pin 10 — Kanan Bawah
 *   Ring 1 (16 LED)  → Pin 3  — Kiri
 *   Ring 2 (16 LED)  → Pin 4  — Kiri Dalam
 *   Ring 3 (16 LED)  → Pin 11 — Kanan
 *
 * Library: FastLED
 * Install: Sketch → Include Library → Manage Libraries → FastLED
 */

#include <FastLED.h>

// ========== KONFIGURASI LED ==========
#define NUM_STRIP_TOP    17
#define NUM_STRIP_BOTTOM 17
#define NUM_RING         16

#define PIN_STRIP1  6   // Kiri Atas
#define PIN_STRIP2  5   // Kiri Bawah
#define PIN_STRIP3  9   // Kanan Atas
#define PIN_STRIP4  10  // Kanan Bawah
#define PIN_RING1   3   // Kiri
#define PIN_RING2   4   // Kiri Dalam
#define PIN_RING3   11  // Kanan

// ========== GRUP LED ==========
CRGB strip1[NUM_STRIP_TOP];    // Kiri Atas
CRGB strip2[NUM_STRIP_BOTTOM]; // Kiri Bawah
CRGB strip3[NUM_STRIP_TOP];    // Kanan Atas
CRGB strip4[NUM_STRIP_BOTTOM]; // Kanan Bawah
CRGB ring1[NUM_RING];          // Kiri
CRGB ring2[NUM_RING];          // Kiri Dalam
CRGB ring3[NUM_RING];          // Kanan

// ========== INPUT SIGNAL ==========
const int PIN_SIGNAL_L = A0;    // Sein Kiri
const int PIN_SIGNAL_R = A1;    // Sein Kanan
const int PIN_BRAKE    = A2;    // Rem
const int PIN_TAIL     = A3;    // Tail/Lampu Kota

// ========== WARNA ==========
const CRGB WARNA_DRL     = CRGB(0, 150, 255);  // Biru Neon
const CRGB WARNA_SEIN    = CRGB(255, 120, 0);  // Orange
const CRGB WARNA_BRAKE   = CRGB(255, 0, 0);    // Merah
const CRGB WARNA_TAIL    = CRGB(80, 0, 0);     // Merah Redup
const CRGB WARNA_OFF     = CRGB(0, 0, 0);      // Mati

// ========== VARIABEL STATE ==========
bool signalL = false;
bool signalR = false;
bool brake   = false;
bool tail    = false;

unsigned long lastBlinkL = 0;
unsigned long lastBlinkR = 0;
unsigned long animTimer  = 0;
int blinkStateL = 0;
int blinkStateR = 0;
int seqStep     = 0;

// ========== SETUP ==========
void setup() {
  FastLED.addLeds<WS2812B, PIN_STRIP1, GRB>(strip1, NUM_STRIP_TOP);
  FastLED.addLeds<WS2812B, PIN_STRIP2, GRB>(strip2, NUM_STRIP_BOTTOM);
  FastLED.addLeds<WS2812B, PIN_STRIP3, GRB>(strip3, NUM_STRIP_TOP);
  FastLED.addLeds<WS2812B, PIN_STRIP4, GRB>(strip4, NUM_STRIP_BOTTOM);
  FastLED.addLeds<WS2812B, PIN_RING1,  GRB>(ring1,  NUM_RING);
  FastLED.addLeds<WS2812B, PIN_RING2,  GRB>(ring2,  NUM_RING);
  FastLED.addLeds<WS2812B, PIN_RING3,  GRB>(ring3,  NUM_RING);

  FastLED.setBrightness(100);

  pinMode(PIN_SIGNAL_L, INPUT_PULLUP);
  pinMode(PIN_SIGNAL_R, INPUT_PULLUP);
  pinMode(PIN_BRAKE,    INPUT_PULLUP);
  pinMode(PIN_TAIL,     INPUT_PULLUP);

  // Animasi startup — welcome sweep
  welcomeAnimation();
}

// ========== LOOP UTAMA ==========
void loop() {
  // Baca input (LOW = aktif karena INPUT_PULLUP)
  signalL = !digitalRead(PIN_SIGNAL_L);
  signalR = !digitalRead(PIN_SIGNAL_R);
  brake   = !digitalRead(PIN_BRAKE);
  tail    = !digitalRead(PIN_TAIL);

  // Prioritaskan rem
  if (brake) {
    modeBrake();
    return;
  }

  // Sein kiri & kanan bisa bareng (hazard)
  if (signalL || signalR) {
    modeTurnSignal(signalL, signalR);
    return;
  }

  // Mode normal — DRL + tail
  modeNormal();
}

// ========== MODE NORMAL (DRL + Tail) ==========
void modeNormal() {
  CRGB drlColor = tail ? WARNA_TAIL : WARNA_DRL;

  // Ring DRL — efek breathing lembut
  uint8_t breath = (sin8(millis() / 8) / 2) + 80;
  CRGB ringColor = WARNA_DRL;
  ringColor.nscale8(breath);
  fill_solid(ring1, NUM_RING, ringColor);
  fill_solid(ring2, NUM_RING, ringColor);
  fill_solid(ring3, NUM_RING, ringColor);

  // Strip — DRL solid (brightness rendah)
  CRGB stripDRL = WARNA_DRL;
  stripDRL.nscale8(60);
  fill_solid(strip1, NUM_STRIP_TOP,    stripDRL);
  fill_solid(strip2, NUM_STRIP_BOTTOM, stripDRL);
  fill_solid(strip3, NUM_STRIP_TOP,    stripDRL);
  fill_solid(strip4, NUM_STRIP_BOTTOM, stripDRL);

  FastLED.show();
  delay(30);
}

// ========== MODE TURN SIGNAL (Sequential) ==========
void modeTurnSignal(bool left, bool right) {
  unsigned long now = millis();
  int blinkDelay = 80; // kecepatan sequential

  if (now - animTimer >= blinkDelay) {
    animTimer = now;
    seqStep++;

    // Reset semua dulu
    if (left) {
      fill_solid(strip1, NUM_STRIP_TOP,    WARNA_OFF);
      fill_solid(strip2, NUM_STRIP_BOTTOM, WARNA_OFF);
    }
    if (right) {
      fill_solid(strip3, NUM_STRIP_TOP,    WARNA_OFF);
      fill_solid(strip4, NUM_STRIP_BOTTOM, WARNA_OFF);
    }

    // Animasi sequential — nyala dari tengah ke pinggir
    if (left) {
      int s = seqStep % (NUM_STRIP_TOP + 2); // +2 buat jeda
      if (s < NUM_STRIP_TOP) {
        strip1[s] = WARNA_SEIN;
        strip2[s] = WARNA_SEIN;
      }
      // Ring ikut nyala
      fill_solid(ring1, NUM_RING, WARNA_SEIN);
      fill_solid(ring2, NUM_RING, WARNA_SEIN);
    }

    if (right) {
      int s = seqStep % (NUM_STRIP_TOP + 2);
      if (s < NUM_STRIP_TOP) {
        strip3[s] = WARNA_SEIN;
        strip4[s] = WARNA_SEIN;
      }
      fill_solid(ring3, NUM_RING, WARNA_SEIN);
    }

    // Ring matiin pas off phase
    if (seqStep % (NUM_STRIP_TOP + 2) > NUM_STRIP_TOP) {
      if (left)  { fill_solid(ring1, NUM_RING, WARNA_OFF); fill_solid(ring2, NUM_RING, WARNA_OFF); }
      if (right) { fill_solid(ring3, NUM_RING, WARNA_OFF); }
    }

    FastLED.show();
  }
}

// ========== MODE BRAKE ==========
void modeBrake() {
  CRGB brakeColor = WARNA_BRAKE;

  // Strips — solid red
  fill_solid(strip1, NUM_STRIP_TOP,    brakeColor);
  fill_solid(strip2, NUM_STRIP_BOTTOM, brakeColor);
  fill_solid(strip3, NUM_STRIP_TOP,    brakeColor);
  fill_solid(strip4, NUM_STRIP_BOTTOM, brakeColor);

  // Rings — pulsing brake
  uint8_t pulse = (sin8(millis() / 5) / 3) + 170; // 170–255
  CRGB ringBrake = WARNA_BRAKE;
  ringBrake.nscale8(pulse);
  fill_solid(ring1, NUM_RING, ringBrake);
  fill_solid(ring2, NUM_RING, ringBrake);
  fill_solid(ring3, NUM_RING, ringBrake);

  FastLED.show();
  delay(20);
}

// ========== WELCOME ANIMATION ==========
void welcomeAnimation() {
  // Sweep dari tengah ke pinggir — semua LED
  for (int i = 0; i < NUM_STRIP_TOP; i++) {
    strip1[i] = WARNA_DRL;
    strip2[i] = WARNA_DRL;
    strip3[NUM_STRIP_TOP - 1 - i] = WARNA_DRL;
    strip4[NUM_STRIP_TOP - 1 - i] = WARNA_DRL;
    FastLED.show();
    delay(40);
  }

  // Rings — fade in
  for (int b = 0; b <= 255; b += 5) {
    CRGB c = WARNA_DRL;
    c.nscale8(b);
    fill_solid(ring1, NUM_RING, c);
    fill_solid(ring2, NUM_RING, c);
    fill_solid(ring3, NUM_RING, c);
    FastLED.show();
    delay(10);
  }

  delay(500);

  // Blink semua 2x
  for (int x = 0; x < 2; x++) {
    fill_solid(strip1, NUM_STRIP_TOP,    WARNA_OFF);
    fill_solid(strip2, NUM_STRIP_BOTTOM, WARNA_OFF);
    fill_solid(strip3, NUM_STRIP_TOP,    WARNA_OFF);
    fill_solid(strip4, NUM_STRIP_BOTTOM, WARNA_OFF);
    fill_solid(ring1, NUM_RING, WARNA_OFF);
    fill_solid(ring2, NUM_RING, WARNA_OFF);
    fill_solid(ring3, NUM_RING, WARNA_OFF);
    FastLED.show();
    delay(150);
    fill_solid(strip1, NUM_STRIP_TOP,    WARNA_DRL);
    fill_solid(strip2, NUM_STRIP_BOTTOM, WARNA_DRL);
    fill_solid(strip3, NUM_STRIP_TOP,    WARNA_DRL);
    fill_solid(strip4, NUM_STRIP_BOTTOM, WARNA_DRL);
    fill_solid(ring1, NUM_RING, WARNA_DRL);
    fill_solid(ring2, NUM_RING, WARNA_DRL);
    fill_solid(ring3, NUM_RING, WARNA_DRL);
    FastLED.show();
    delay(150);
  }

  delay(300);
  // Fade out rings
  for (int b = 255; b >= 80; b -= 3) {
    CRGB c = WARNA_DRL;
    c.nscale8(b);
    fill_solid(ring1, NUM_RING, c);
    fill_solid(ring2, NUM_RING, c);
    fill_solid(ring3, NUM_RING, c);
    FastLED.show();
    delay(10);
  }
}
