#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# MAA Project — build and launch the Android app on a connected device
# Run from the repo root (Git Bash on Windows, Terminal on Mac/Linux):
#   bash scripts/launch-android.sh
#
# What it does (the steps we all kept forgetting):
#   1. Finds JDK + Android SDK, exports JAVA_HOME / ANDROID_HOME / PATH
#   2. Verifies a phone is connected and USB-debugging-authorized
#   3. Runs `adb reverse` for BOTH port 3000 (backend) AND port 8081 (Metro)
#      — forgetting port 8081 is what causes the white screen
#   4. Warns if backend or Metro aren't running
#   5. Builds + installs the APK via gradlew directly (avoids the broken
#      RN CLI spawn on Windows)
#   6. Launches MainActivity
# -----------------------------------------------------------------------------

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

RED=$'\e[31m'; GREEN=$'\e[32m'; YELLOW=$'\e[33m'; CYAN=$'\e[36m'; BOLD=$'\e[1m'; RESET=$'\e[0m'
ok()   { echo "${GREEN}✓${RESET} $*"; }
warn() { echo "${YELLOW}!${RESET} $*"; }
fail() { echo "${RED}✗${RESET} $*"; exit 1; }
info() { echo "${CYAN}→${RESET} $*"; }

echo "${BOLD}MAA Project — launch app on Android device${RESET}"

# -----------------------------------------------------------------------------
# 1. Toolchain (reuse detection logic from setup.sh, inline for standalone use)
# -----------------------------------------------------------------------------
if [ -z "${JAVA_HOME:-}" ] || { [ ! -x "$JAVA_HOME/bin/java" ] && [ ! -x "$JAVA_HOME/bin/java.exe" ]; }; then
  for c in \
    "/c/Program Files/Android/Android Studio/jbr" \
    "/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
    "$HOME/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
    "/opt/android-studio/jbr" \
    "$HOME/android-studio/jbr"; do
    if [ -d "$c" ]; then export JAVA_HOME="$c"; break; fi
  done
fi
[ -n "${JAVA_HOME:-}" ] || fail "JAVA_HOME not set and JDK not found. Run: bash scripts/setup.sh"
ok "JAVA_HOME: $JAVA_HOME"

if [ -z "${ANDROID_HOME:-}" ] || [ ! -d "$ANDROID_HOME" ]; then
  for c in \
    "/c/Users/$USER/AppData/Local/Android/Sdk" \
    "$HOME/Library/Android/sdk" \
    "$HOME/Android/Sdk"; do
    if [ -d "$c" ]; then export ANDROID_HOME="$c"; break; fi
  done
fi
[ -n "${ANDROID_HOME:-}" ] || fail "ANDROID_HOME not set. Run: bash scripts/setup.sh"
ok "ANDROID_HOME: $ANDROID_HOME"

export PATH="$ANDROID_HOME/platform-tools:$JAVA_HOME/bin:$PATH"
ADB="$ANDROID_HOME/platform-tools/adb"
[ -x "$ADB" ] || ADB="$ADB.exe"

# -----------------------------------------------------------------------------
# 2. Check phone connected + authorized
# -----------------------------------------------------------------------------
DEVICES_OUT=$("$ADB" devices | tail -n +2 | grep -v '^$' || true)
if [ -z "$DEVICES_OUT" ]; then
  fail "No phone detected. Plug in USB cable, enable Developer options → USB debugging, and retry."
fi

if echo "$DEVICES_OUT" | grep -q "unauthorized"; then
  fail "Phone is UNAUTHORIZED. Unlock the screen, tap 'Allow USB debugging?' (check 'Always allow'), then retry."
fi

if ! echo "$DEVICES_OUT" | grep -q "device$"; then
  fail "Phone in unexpected state:
$DEVICES_OUT"
fi
ok "Phone connected and authorized: $(echo "$DEVICES_OUT" | head -1)"

# -----------------------------------------------------------------------------
# 3. adb reverse for BOTH ports — the white-screen fix
# -----------------------------------------------------------------------------
"$ADB" reverse tcp:3000 tcp:3000
"$ADB" reverse tcp:8081 tcp:8081
ok "adb reverse: phone's localhost:3000 and localhost:8081 now route to this laptop"

# -----------------------------------------------------------------------------
# 4. Warn if backend or Metro not running (don't hard-fail — user may intend
#    to start them in other terminals after this script)
# -----------------------------------------------------------------------------
check_port() {
  local port="$1"
  if command -v netstat >/dev/null 2>&1; then
    netstat -an 2>/dev/null | grep -E "[:.]$port\b" | grep -qi "LISTEN"
  elif command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
  else
    # Fall back to a TCP connect probe
    (echo > "/dev/tcp/127.0.0.1/$port") >/dev/null 2>&1
  fi
}

if check_port 3000; then
  ok "Backend listening on :3000"
else
  warn "Backend NOT running on :3000. In another terminal:"
  echo "     cd MAA-Meditation-App/MAA-Project/backend && npm run dev"
fi

if check_port 8081; then
  ok "Metro listening on :8081"
else
  warn "Metro NOT running on :8081. In another terminal:"
  echo "     cd mobile && npm start"
fi

# -----------------------------------------------------------------------------
# 5. Build + install — bypass RN CLI's broken Windows spawn by calling gradlew
# -----------------------------------------------------------------------------
echo ""
info "Building and installing APK (first build ~10 min, subsequent builds ~1 min)..."

cd "$ROOT/mobile/android"
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) GRADLE_CMD="./gradlew.bat" ;;
  *)                    GRADLE_CMD="./gradlew" ;;
esac

"$GRADLE_CMD" app:installDebug -PreactNativeDevServerPort=8081 --console=plain \
  || fail "Gradle build failed — scroll up for the error, or check mobile/android/build/reports/"
ok "APK installed on device"

# -----------------------------------------------------------------------------
# 6. Launch the main activity
# -----------------------------------------------------------------------------
"$ADB" shell monkey -p com.mobile -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 \
  || fail "Failed to launch com.mobile"
ok "com.mobile launched"

echo ""
echo "${BOLD}${GREEN}App is running on your phone.${RESET}"
echo ""
echo "Notes:"
echo "  • ${BOLD}adb reverse does NOT persist across USB unplugs${RESET} — if you unplug, re-run this script"
echo "    (or just: adb reverse tcp:3000 tcp:3000 && adb reverse tcp:8081 tcp:8081)"
echo "  • To reload JS only: shake phone → tap Reload, or press ${BOLD}R${RESET} twice in Metro terminal"
echo "  • To see JS errors: watch the Metro terminal, or: adb logcat | grep ReactNativeJS"
