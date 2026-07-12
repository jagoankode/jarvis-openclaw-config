#!/bin/bash

# ==========================================
#  Uploader NodeMCU ESP8266
#  Compile + Upload via Arduino CLI
# ==========================================

SKETCH_DIR="$HOME/proyek_lampu"
PORT="/dev/ttyUSB0"
FQBN="esp8266:esp8266:nodemcuv2"

echo "=============================="
echo "  NodeMCU Uploader"
echo "=============================="

# Step 1: Cek port
echo ""
echo "[1/4] Mengecek port $PORT..."
if [ -e "$PORT" ]; then
  echo "  ✅ Port $PORT tersedia"
else
  echo "  ❌ Port $PORT tidak ditemukan!"
  echo "  Pastikan USB sudah diattach: usbipd attach --wsl --busid <BUSID>"
  exit 1
fi

# Step 2: Compile
echo ""
echo "[2/4] Compile sketch..."
arduino-cli compile --fqbn "$FQBN" "$SKETCH_DIR"
if [ $? -ne 0 ]; then
  echo "  ❌ Compile gagal!"
  exit 1
fi
echo "  ✅ Compile berhasil"

# Step 3: Upload
echo ""
echo "[3/4] Upload ke board..."
arduino-cli upload --port "$PORT" --fqbn "$FQBN" "$SKETCH_DIR"
if [ $? -ne 0 ]; then
  echo "  ❌ Upload gagal!"
  exit 1
fi
echo "  ✅ Upload berhasil"

# Step 4: Serial monitor info
echo ""
echo "[4/4] Selesai!"
echo "  📡 Board akan restart otomatis"
echo "  📊 Buka serial monitor: screen $PORT 9600"
echo "  atau: minicom -D $PORT -b 9600"
echo ""
echo "=============================="
echo "  🚀 Upload sukses!"
echo "=============================="
