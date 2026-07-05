#!/bin/bash
# 🔄 Jarvis Migration Script
# Jalankan di LAPTOP BARU setelah clone repo ini

echo "🔄 Migrating Jarvis configuration..."

# 1. Workspace
WORKSPACE_DIR="$HOME/.openclaw/workspace"
if [ ! -d "$WORKSPACE_DIR" ]; then
  echo "❌ Workspace not found at $WORKSPACE_DIR"
  echo "   Jalankan dulu: git clone git@github.com:jagoankode/jarvis-openclaw-config.git $WORKSPACE_DIR"
  exit 1
fi

# 2. Restore OpenClaw config
if [ -f "$WORKSPACE_DIR/migrate/openclaw.json" ]; then
  mkdir -p "$HOME/.openclaw"
  cp "$WORKSPACE_DIR/migrate/openclaw.json" "$HOME/.openclaw/openclaw.json"
  echo "✅ OpenClaw config restored"
fi

# 3. Restore SSH config
if [ -f "$WORKSPACE_DIR/migrate/config" ]; then
  mkdir -p "$HOME/.ssh"
  cp "$WORKSPACE_DIR/migrate/config" "$HOME/.ssh/config"
  chmod 600 "$HOME/.ssh/config"
  echo "✅ SSH config restored"
fi

# 4. Restore SSH public key
if [ -f "$WORKSPACE_DIR/migrate/id_github.pub" ]; then
  cp "$WORKSPACE_DIR/migrate/id_github.pub" "$HOME/.ssh/id_github.pub"
  echo "✅ SSH public key restored"
  echo "⚠️  PRIVATE KEY (id_github) perlu dicopy manual dari laptop lama!"
  echo "   Copy ~/.ssh/id_github ke laptop baru, lalu: chmod 600 ~/.ssh/id_github"
fi

# 5. Restore zshrc
if [ -f "$WORKSPACE_DIR/migrate/.zshrc" ]; then
  cp "$WORKSPACE_DIR/migrate/.zshrc" "$HOME/.zshrc"
  echo "✅ .zshrc restored"
fi

# 6. Restore Wokwi CLI binary
if [ -f "$WORKSPACE_DIR/migrate/wokwi-cli" ]; then
  mkdir -p "$HOME/bin"
  cp "$WORKSPACE_DIR/migrate/wokwi-cli" "$HOME/bin/wokwi-cli"
  chmod +x "$HOME/bin/wokwi-cli"
  echo "✅ Wokwi CLI restored"
fi

# 7. Restore arduino-cli
if [ -f "$WORKSPACE_DIR/bin/arduino-cli" ]; then
  mkdir -p "$HOME/bin"
  cp "$WORKSPACE_DIR/bin/arduino-cli" "$HOME/bin/arduino-cli"
  chmod +x "$HOME/bin/arduino-cli"
  echo "✅ Arduino CLI restored"
fi

echo ""
echo "🎉 Migrasi selesai! Restart terminal atau source ~/.zshrc"
echo ""
echo "⚠️  Jangan lupa copy PRIVATE SSH KEY dari laptop lama:"
echo "   ~/.ssh/id_github"
echo ""
echo "   Dan login ulang gh CLI:"
echo "   gh auth login --hostname github.com --git-protocol ssh"
