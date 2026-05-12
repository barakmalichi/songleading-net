#!/bin/zsh
cd "$(dirname "$0")"

PORT="${1:-3040}"
LOG_FILE="/tmp/lyric-slide-studio.log"
NODE_BIN="/Applications/Codex.app/Contents/Resources/node"

clear
echo "Starting Lyric Slide Studio..."
echo "Folder: $(pwd)"
echo "Log: $LOG_FILE"
echo ""

if [ -x "$NODE_BIN" ]; then
  WORK_NODE="/tmp/lyric-slide-studio-node"
  cp "$NODE_BIN" "$WORK_NODE" 2>/dev/null
  codesign --force --sign - "$WORK_NODE" >/dev/null 2>&1
else
  WORK_NODE="$(command -v node)"
fi

if [ -z "$WORK_NODE" ] || [ ! -x "$WORK_NODE" ]; then
  echo "Node.js was not found."
  echo "Install Node.js from https://nodejs.org/ and run this again."
  read "?Press enter to close..."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Missing node_modules. Run npm install in this folder first."
  read "?Press enter to close..."
  exit 1
fi

SWC_FILE="$(find node_modules/.pnpm -path '*@next+swc-darwin-x64*/node_modules/@next/swc-darwin-x64/next-swc.darwin-x64.node' -print -quit 2>/dev/null)"
if [ -n "$SWC_FILE" ]; then
  codesign --force --sign - "$SWC_FILE" >/dev/null 2>&1
fi

echo "Building latest version..."
"$WORK_NODE" node_modules/next/dist/bin/next build --webpack > "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
  echo "Build failed. Details:"
  tail -80 "$LOG_FILE"
  read "?Press enter to close..."
  exit 1
fi

for TRY_PORT in "$PORT" 3040 3030 3050 3060; do
  if lsof -nP -iTCP:"$TRY_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    continue
  fi

  echo "Starting on http://localhost:$TRY_PORT/songs/new"
  "$WORK_NODE" node_modules/next/dist/bin/next start -H 127.0.0.1 -p "$TRY_PORT" >> "$LOG_FILE" 2>&1 &
  APP_PID=$!

  for i in {1..30}; do
    if lsof -nP -iTCP:"$TRY_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
      echo "Opening app..."
      open "http://localhost:$TRY_PORT/songs/new" >/dev/null 2>&1
      echo ""
      echo "The app is running at:"
      echo "http://localhost:$TRY_PORT/songs/new"
      echo ""
      echo "Leave this window open while using the app."
      wait "$APP_PID"
      exit 0
    fi
    sleep 1
  done

  echo "Port $TRY_PORT did not start. Trying another port..."
  kill "$APP_PID" >/dev/null 2>&1
done

echo "The app did not start. Details:"
tail -80 "$LOG_FILE"
read "?Press enter to close..."
exit 1
