# 🧪 NodeMCU V3 ESP8266 — Setup Guide

Panduan lengkap dari awal sampai upload pertama.

---

## 📦 1. Install Arduino CLI

```bash
# Buat folder local bin
mkdir -p ~/.local/bin

# Install Arduino CLI
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=~/.local/bin sh

# Tambah ke PATH (pilih sesuai shell)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc   # bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc    # zsh

source ~/.bashrc  # atau source ~/.zshrc

# Verifikasi
arduino-cli version
```

---

## 🌐 2. Install ESP8266 Core

```bash
# Tambah URL board ESP8266 (pake http, bukan https — sertifikat expired)
arduino-cli config set board_manager.additional_urls http://arduino.esp8266.com/stable/package_esp8266com_index.json

# Update index & install
arduino-cli core update-index
arduino-cli core install esp8266:esp8266
```

---

## 🔌 3. Setup USB (Windows → WSL)

### Di Windows — Install usbipd-win

**PowerShell (Admin):**
```powershell
winget install --interactive --exact dorssel.usbipd-win
```

### Flow attach USB tiap kali mau upload

**PowerShell (Admin) — bind sekali aja:**
```powershell
usbipd list                      # lihat BUSID NodeMCU
usbipd bind --busid <BUSID>      # misal: usbipd bind --busid 1-5
```

**PowerShell (biasa) — attach ke WSL:**
```powershell
usbipd attach --wsl --busid <BUSID>
```

### Di WSL — cek port

```bash
ls /dev/ttyUSB*
# Kalo muncul /dev/ttyUSB0 → siap
```

---

## 👤 4. Setup Permission

Biar bisa akses `/dev/ttyUSB0` tanpa `sudo`:

```bash
sudo usermod -a -G dialout $USER
```

**Logout WSL & login ulang** biar efeknya jalan.

Atau kalo buru-buru (sementara):
```bash
sudo chmod 666 /dev/ttyUSB0
```

---

## 📁 5. Struktur Project

Nama folder & file `.ino` **harus sama**.

```
~/proyek_lampu/
├── proyek_lampu.ino     # file code utama
└── upload.sh             # script upload (optional)
```

---

## ✍️ 6. Contoh Code

**`~/proyek_lampu/proyek_lampu.ino`**

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

const char *SSID = "WIFI_SSID";
const char *PASSWORD = "***";

const int LED_PIN = LED_BUILTIN;
ESP8266WebServer server(80);

const char PAGE[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<body>
  <h1>NodeMCU</h1>
  <a href="/on"><button>LED ON</button></a>
  <a href="/off"><button>LED OFF</button></a>
  <p id="s">-</p>
  <script>
    fetch("/s").then(r=>r.text()).then(t=>document.getElementById("s").innerText="LED: "+t);
  </script>
</body>
</html>
)rawliteral";

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);

  WiFi.begin(SSID, PASSWORD);
  int c = 0;
  while (WiFi.status() != WL_CONNECTED && c < 40) { delay(500); c++; }

  if (WiFi.status() == WL_CONNECTED) Serial.println(WiFi.localIP());

  server.on("/", []() { server.send_P(200, "text/html", PAGE); });
  server.on("/on", []() { digitalWrite(LED_PIN, LOW); server.send(200, "text/plain", "ON"); });
  server.on("/off", []() { digitalWrite(LED_PIN, HIGH); server.send(200, "text/plain", "OFF"); });
  server.on("/s", []() { server.send(200, "text/plain", digitalRead(LED_PIN) == LOW ? "ON" : "OFF"); });
  server.begin();
}

void loop() {
  server.handleClient();
  delay(10);
}
```

Jangan lupa ganti `SSID` & `PASSWORD`.

---

## 🚀 7. Upload Script

**`~/proyek_lampu/upload.sh`**

```bash
#!/bin/bash

SKETCH_DIR="$HOME/proyek_lampu"
PORT="/dev/ttyUSB0"
FQBN="esp8266:esp8266:nodemcuv2"

echo "=============================="
echo "  NodeMCU Uploader"
echo "=============================="

echo "[1/4] Mengecek port $PORT..."
if [ -e "$PORT" ]; then
  echo "  ✅ Port $PORT tersedia"
else
  echo "  ❌ Port $PORT tidak ditemukan!"
  echo "  Pastikan USB sudah diattach: usbipd attach --wsl --busid <BUSID>"
  exit 1
fi

echo "[2/4] Compile sketch..."
arduino-cli compile --fqbn "$FQBN" "$SKETCH_DIR"
if [ $? -ne 0 ]; then
  echo "  ❌ Compile gagal!"
  exit 1
fi
echo "  ✅ Compile berhasil"

echo "[3/4] Upload ke board..."
arduino-cli upload --port "$PORT" --fqbn "$FQBN" "$SKETCH_DIR"
if [ $? -ne 0 ]; then
  echo "  ❌ Upload gagal!"
  exit 1
fi
echo "  ✅ Upload berhasil"

echo "[4/4] Selesai!"
echo "  📡 Board restart otomatis"
echo "  📊 Buka serial: screen $PORT 9600"
echo ""
echo "=============================="
echo "  🚀 Upload sukses!"
echo "=============================="
```

Buat executable:
```bash
chmod +x ~/proyek_lampu/upload.sh
```

---

## 🎯 8. Upload ke Board

### Setiap kali mau upload:

**Step 1 — Attach USB (PowerShell):**
```powershell
usbipd attach --wsl --busid <BUSID>
```

**Step 2 — Upload (WSL terminal):**
```bash
cd ~/proyek_lampu && ./upload.sh
```

Berhasil! Board akan restart otomatis dan menjalankan code baru. 🚀

---

## 🔧 9. VS Code (Optional)

### Install extension:
- **Remote — WSL** — biar bisa akses WSL dari VS Code
- **Arduino CLI** — tombol compile/upload (optional)

### Buka project:
```bash
code ~/proyek_lampu
```

### Fix squiggles `#include`:
`Ctrl+Shift+P` → `C/C++: Edit Configurations (JSON)`

```json
{
  "configurations": [
    {
      "name": "ESP8266",
      "includePath": [
        "${workspaceFolder}/**",
        "/home/rizal/.arduino15/packages/esp8266/hardware/esp8266/3.1.2/**",
        "/home/rizal/.arduino15/packages/esp8266/hardware/esp8266/3.1.2/libraries/**"
      ],
      "defines": [],
      "intelliSenseMode": "gcc-x64",
      "cStandard": "c17",
      "cppStandard": "c++17",
      "compilerPath": "/usr/bin/gcc"
    }
  ],
  "version": 4
}
```

---

## ⚠️ Trouble

| Masalah | Solusi |
|---------|--------|
| `Permission denied: /dev/ttyUSB0` | `sudo usermod -a -G dialout $USER` lalu logout WSL |
| `Failed to write to target RAM` | Tahan FLASH + tekan RST, lepas FLASH |
| Port gak muncul | Cek kabel USB (harus data, bukan charging) |
| `certificate signed by unknown authority` | Pake `http` bukan `https` di board URL |
| Chip terdeteksi tapi upload gagal | Upload speed default pake `--baud 115200` |

---

Selamat ngoding IoT! 🧪🤖
