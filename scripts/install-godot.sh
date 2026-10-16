#!/usr/bin/env bash
# Install Godot 4.7.2 stable Linux x86_64 into tools/godot/ (not committed).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/tools/godot"
VERSION="4.7.2-stable"
ZIP_NAME="Godot_v${VERSION}_linux.x86_64.zip"
BIN_NAME="Godot_v${VERSION}_linux.x86_64"
URL="https://github.com/godotengine/godot-builds/releases/download/${VERSION}/${ZIP_NAME}"

mkdir -p "$DEST"
if [[ -x "$DEST/$BIN_NAME" ]]; then
  ln -sfn "$DEST/$BIN_NAME" "$DEST/godot"
  if [[ ! -e /usr/local/bin/godot ]]; then
    sudo ln -sfn "$DEST/$BIN_NAME" /usr/local/bin/godot 2>/dev/null || ln -sfn "$DEST/$BIN_NAME" "$HOME/.local/bin/godot" 2>/dev/null || true
  fi
  echo "Godot already present: $($DEST/godot --version)"
  exit 0
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
echo "Downloading $URL ..."
curl -fsSL -o "$TMP/godot.zip" "$URL"
unzip -o "$TMP/godot.zip" -d "$TMP"
SRC="$(find "$TMP" -type f -name 'Godot*' ! -name '*.zip' | head -1)"
chmod +x "$SRC"
cp "$SRC" "$DEST/$BIN_NAME"
ln -sfn "$DEST/$BIN_NAME" "$DEST/godot"
mkdir -p "$HOME/.local/bin"
ln -sfn "$DEST/$BIN_NAME" "$HOME/.local/bin/godot"
if command -v sudo >/dev/null 2>&1; then
  sudo ln -sfn "$DEST/$BIN_NAME" /usr/local/bin/godot 2>/dev/null || true
fi
echo "Installed: $($DEST/godot --version)"
