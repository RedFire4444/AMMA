#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# MAA Project — one-shot local setup
# Run from the repo root (Git Bash on Windows, Terminal on Mac/Linux):
#   bash scripts/setup.sh
#
# What it does:
#   1. Verifies Node 22.x and npm >=10
#   2. Finds JDK (Android Studio JBR or JAVA_HOME) and Android SDK
#   3. Creates mobile/android/local.properties with the detected SDK path
#   4. Creates mobile/.env, backend/.env, admin/.env from .env.example files
#      (backend/admin .env are auto-filled from credentialsSupabase.txt
#       during the build phase)
#   5. Runs npm install in mobile, backend, and admin
#
# Safe to re-run. Every step is idempotent — existing files are left alone.
#
# Flags:
#   --skip-install   Skip the npm install step (config-only)
#   --doctor         Print a diagnostic report (no changes) — paste this
#                    output to the team lead when asking for help
#   --clean          Nuke node_modules, gradle caches, and stale config,
#                    then run the full setup fresh (use when your laptop
#                    has leftovers from a previous broken attempt)
# -----------------------------------------------------------------------------

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

RED=$'\e[31m'; GREEN=$'\e[32m'; YELLOW=$'\e[33m'; CYAN=$'\e[36m'; BOLD=$'\e[1m'; RESET=$'\e[0m'
ok()    { echo "${GREEN}✓${RESET} $*"; }
warn()  { echo "${YELLOW}!${RESET} $*"; }
fail()  { echo "${RED}✗${RESET} $*"; exit 1; }
info()  { echo "${CYAN}→${RESET} $*"; }

MODE="setup"
for arg in "$@"; do
  case "$arg" in
    --doctor)       MODE="doctor" ;;
    --clean)        MODE="clean" ;;
    --skip-install) ;;  # handled later
    *) ;;
  esac
done

# -----------------------------------------------------------------------------
# --doctor mode: diagnostic-only, no side effects. Dump every check + its
# result so the team lead can see the exact state of a broken laptop.
# -----------------------------------------------------------------------------
if [ "$MODE" = "doctor" ]; then
  echo "${BOLD}MAA Project — Doctor report${RESET}"
  echo "Generated: $(date)"
  echo "Repo root: $ROOT"
  echo "OS:        $(uname -a)"
  echo ""

  # Shell + versions
  echo "[shell]"
  echo "  SHELL:     ${SHELL:-unknown}"
  echo "  BASH:      ${BASH_VERSION:-not-bash}"
  echo ""

  echo "[node/npm]"
  if command -v node >/dev/null 2>&1; then
    echo "  node:      $(node -v)    (location: $(command -v node))"
  else
    echo "  node:      NOT FOUND"
  fi
  if command -v npm >/dev/null 2>&1; then
    echo "  npm:       $(npm -v)     (location: $(command -v npm))"
  else
    echo "  npm:       NOT FOUND"
  fi
  if command -v nvm >/dev/null 2>&1; then
    echo "  nvm:       available"
  else
    echo "  nvm:       not on PATH (Windows nvm-for-windows still works in GUI)"
  fi
  echo ""

  echo "[java]"
  echo "  JAVA_HOME (env): ${JAVA_HOME:-<unset>}"
  if command -v java >/dev/null 2>&1; then
    echo "  java on PATH:    $(command -v java)"
    java -version 2>&1 | head -1 | sed 's/^/                   /'
  else
    echo "  java on PATH:    NOT FOUND"
  fi
  echo ""

  echo "[android]"
  echo "  ANDROID_HOME (env): ${ANDROID_HOME:-<unset>}"
  echo "  LOCALAPPDATA:       ${LOCALAPPDATA:-<unset>}"
  if [ -n "${ANDROID_HOME:-}" ] && [ -d "$ANDROID_HOME" ]; then
    echo "  SDK exists at ANDROID_HOME: yes"
    echo "  platforms:          $(ls "$ANDROID_HOME/platforms" 2>/dev/null | tr '\n' ' ' || echo 'none')"
  fi
  for p in \
    "/c/Users/$USER/AppData/Local/Android/Sdk" \
    "$HOME/Library/Android/sdk" \
    "$HOME/Android/Sdk"; do
    if [ -d "$p" ]; then echo "  SDK also at:        $p"; fi
  done
  if command -v adb >/dev/null 2>&1; then
    echo "  adb on PATH:        $(command -v adb)"
    adb devices 2>&1 | sed 's/^/                      /'
  else
    echo "  adb on PATH:        NOT FOUND"
  fi
  echo ""

  echo "[repo files — exist?]"
  for f in \
    ".nvmrc" \
    ".gitattributes" \
    "mobile/.env" \
    "mobile/.env.example" \
    "mobile/env.d.ts" \
    "mobile/android/local.properties" \
    "mobile/node_modules/.package-lock.json" \
    "MAA-Meditation-App/MAA-Project/backend/.env" \
    "MAA-Meditation-App/MAA-Project/backend/node_modules/.package-lock.json" \
    "MAA-Meditation-App/MAA-Project/admin/.env" \
    "MAA-Meditation-App/MAA-Project/admin/node_modules/.package-lock.json" \
    "credentialsSupabase.txt"; do
    if [ -e "$ROOT/$f" ]; then
      echo "  ✓ $f"
    else
      echo "  ✗ $f  (missing)"
    fi
  done
  echo ""

  if [ -f "$ROOT/mobile/.env" ]; then
    echo "[mobile/.env contents]"
    sed 's/^/  /' "$ROOT/mobile/.env"
    echo ""
  fi

  if [ -f "$ROOT/mobile/android/local.properties" ]; then
    echo "[mobile/android/local.properties contents]"
    sed 's/^/  /' "$ROOT/mobile/android/local.properties"
    echo ""
  fi

  echo "[git state]"
  cd "$ROOT"
  echo "  branch:    $(git branch --show-current 2>/dev/null || echo 'unknown')"
  echo "  head:      $(git log -1 --oneline 2>/dev/null || echo 'unknown')"
  dirty=$(git status --porcelain 2>/dev/null | wc -l)
  echo "  dirty:     $dirty file(s) modified"
  echo ""

  echo "[listening ports]"
  if command -v netstat >/dev/null 2>&1; then
    netstat -an 2>/dev/null | grep -E "(:3000|:8081)\b.*LISTEN" | sed 's/^/  /' || echo "  (no listener on :3000 or :8081)"
  fi
  echo ""

  echo "End of report. Paste everything above this line to the team lead."
  exit 0
fi

# -----------------------------------------------------------------------------
# --clean mode: remove stale state before running normal setup
# -----------------------------------------------------------------------------
if [ "$MODE" = "clean" ]; then
  echo "${BOLD}${YELLOW}MAA Project — clean + setup${RESET}"
  echo "This will DELETE: node_modules, Gradle build cache, mobile/android/local.properties"
  echo "It will NOT touch your .env files (your per-laptop config stays)."
  echo ""
  read -r -p "Proceed? [y/N] " ans
  case "$ans" in
    y|Y|yes|YES) ;;
    *) echo "Cancelled."; exit 0 ;;
  esac

  for d in \
    "$ROOT/mobile/node_modules" \
    "$ROOT/MAA-Meditation-App/MAA-Project/backend/node_modules" \
    "$ROOT/MAA-Meditation-App/MAA-Project/admin/node_modules" \
    "$ROOT/mobile/android/build" \
    "$ROOT/mobile/android/.gradle" \
    "$ROOT/mobile/android/app/build"; do
    if [ -d "$d" ]; then
      echo "  removing $d"
      rm -rf "$d"
    fi
  done
  rm -f "$ROOT/mobile/android/local.properties"
  echo "Clean complete. Running setup..."
  echo ""
fi

echo "${BOLD}MAA Project — local setup${RESET}"
echo "Working dir: $ROOT"
echo ""

# -----------------------------------------------------------------------------
# 1. Node + npm version check
# -----------------------------------------------------------------------------
command -v node >/dev/null 2>&1 || fail "Node.js not found. Install Node 22.11.0 (run: nvm install 22.11.0 && nvm use)"
command -v npm  >/dev/null 2>&1 || fail "npm not found on PATH"

NODE_VER=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 22 ]; then
  fail "Node $NODE_VER detected — need 22.x. At repo root: nvm install 22.11.0 && nvm use"
fi
ok "Node $NODE_VER"

NPM_VER=$(npm -v)
NPM_MAJOR=$(echo "$NPM_VER" | cut -d. -f1)
if [ "$NPM_MAJOR" -lt 10 ]; then
  warn "npm $NPM_VER — expected >=10. Usually ships with Node 22, but may need: npm install -g npm@latest"
else
  ok "npm $NPM_VER"
fi

# -----------------------------------------------------------------------------
# 2. Detect JAVA_HOME
# -----------------------------------------------------------------------------
find_java() {
  # 2a. Respect existing JAVA_HOME if it has java
  if [ -n "${JAVA_HOME:-}" ] && { [ -x "$JAVA_HOME/bin/java" ] || [ -x "$JAVA_HOME/bin/java.exe" ]; }; then
    return 0
  fi
  # 2b. Android Studio bundled JBR (Win/Mac/Linux)
  for candidate in \
    "/c/Program Files/Android/Android Studio/jbr" \
    "/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
    "$HOME/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
    "/opt/android-studio/jbr" \
    "$HOME/android-studio/jbr"; do
    if [ -d "$candidate" ] && { [ -x "$candidate/bin/java" ] || [ -x "$candidate/bin/java.exe" ]; }; then
      export JAVA_HOME="$candidate"
      return 0
    fi
  done
  # 2c. System JDKs
  for candidate in \
    "/c/Program Files/Eclipse Adoptium"/jdk-17* \
    "/c/Program Files/Java"/jdk-17* \
    "/Library/Java/JavaVirtualMachines"/*-17*/Contents/Home \
    "/usr/lib/jvm"/java-17-*; do
    if [ -d "$candidate" ]; then
      export JAVA_HOME="$candidate"
      return 0
    fi
  done
  return 1
}

if find_java; then
  ok "JAVA_HOME: $JAVA_HOME"
else
  fail "JDK not found. Install Android Studio (ships with JBR) or JDK 17 from https://adoptium.net"
fi

# -----------------------------------------------------------------------------
# 3. Detect ANDROID_HOME
# -----------------------------------------------------------------------------
find_sdk() {
  if [ -n "${ANDROID_HOME:-}" ] && [ -d "$ANDROID_HOME" ]; then
    return 0
  fi
  # Windows via Git Bash: $LOCALAPPDATA is usually C:\Users\<you>\AppData\Local
  # Convert backslashes to msys style
  if [ -n "${LOCALAPPDATA:-}" ]; then
    local win_sdk="${LOCALAPPDATA//\\//}/Android/Sdk"
    win_sdk="${win_sdk/C:/c}"
    win_sdk="${win_sdk/D:/d}"
    if [ -d "/$win_sdk" ]; then
      export ANDROID_HOME="/$win_sdk"
      return 0
    fi
  fi
  for candidate in \
    "/c/Users/$USER/AppData/Local/Android/Sdk" \
    "$HOME/Library/Android/sdk" \
    "$HOME/Android/Sdk" \
    "/opt/android-sdk" \
    "/usr/local/android-sdk"; do
    if [ -d "$candidate" ]; then
      export ANDROID_HOME="$candidate"
      return 0
    fi
  done
  return 1
}

if find_sdk; then
  ok "ANDROID_HOME: $ANDROID_HOME"
else
  fail "Android SDK not found. Install Android Studio and run it once to set up the SDK."
fi

# -----------------------------------------------------------------------------
# 4. Verify adb and SDK 34
# -----------------------------------------------------------------------------
ADB="$ANDROID_HOME/platform-tools/adb"
[ -x "$ADB" ] || [ -x "$ADB.exe" ] || fail "adb not at $ADB — install Platform Tools via Android Studio SDK Manager"
ok "adb present"

# The project's gradle config may target API 34, 35, or 36 — any recent platform works.
# We just want at least one platform installed.
PLATFORMS_DIR="$ANDROID_HOME/platforms"
if [ -d "$PLATFORMS_DIR" ] && [ -n "$(ls -A "$PLATFORMS_DIR" 2>/dev/null)" ]; then
  INSTALLED=$(ls "$PLATFORMS_DIR" | tr '\n' ' ')
  ok "Android SDK platform(s) installed: $INSTALLED"
else
  warn "No Android SDK platforms installed — open Android Studio → SDK Manager → install at least Android 14 (API 34)"
fi

# -----------------------------------------------------------------------------
# 5. Write mobile/android/local.properties
# -----------------------------------------------------------------------------
LOCAL_PROPS="$ROOT/mobile/android/local.properties"
if [ -f "$LOCAL_PROPS" ]; then
  ok "mobile/android/local.properties already exists"
else
  # Convert /c/Users/... to C\:\\Users\\... for Windows,
  # leave Unix paths alone on Mac/Linux.
  case "$(uname -s)" in
    MINGW*|MSYS*|CYGWIN*)
      # msys path → Windows path with escaped separators
      win_path=$(echo "$ANDROID_HOME" | sed 's|^/\([a-z]\)/|\1:/|' | sed 's|/|\\\\|g' | sed 's|:|\\:|')
      echo "sdk.dir=$win_path" > "$LOCAL_PROPS"
      ;;
    *)
      echo "sdk.dir=$ANDROID_HOME" > "$LOCAL_PROPS"
      ;;
  esac
  ok "Created mobile/android/local.properties → $ANDROID_HOME"
fi

# -----------------------------------------------------------------------------
# 6. Create .env files from .env.example + credentialsSupabase.txt
# -----------------------------------------------------------------------------
create_env_if_missing() {
  local target="$1" example="$2" label="$3"
  if [ -f "$target" ]; then
    ok "$label already exists ($target)"
    return 0
  fi
  [ -f "$example" ] || { warn "$label template missing: $example"; return 0; }
  cp "$example" "$target"
  ok "Created $label ($target)"
}

# mobile/.env
create_env_if_missing "$ROOT/mobile/.env" "$ROOT/mobile/.env.example" "mobile/.env"

# backend/.env — rebuild from credentialsSupabase.txt during build phase
BACKEND_ENV="$ROOT/MAA-Meditation-App/MAA-Project/backend/.env"
CREDS_FILE="$ROOT/credentialsSupabase.txt"
if [ -f "$BACKEND_ENV" ]; then
  ok "backend/.env already exists"
elif [ -f "$CREDS_FILE" ]; then
  {
    cat "$CREDS_FILE"
    echo ""
    echo "ALLOWED_ORIGINS=http://localhost:3001"
  } > "$BACKEND_ENV"
  ok "Created backend/.env (auto-filled from credentialsSupabase.txt)"
else
  create_env_if_missing "$BACKEND_ENV" \
    "$ROOT/MAA-Meditation-App/MAA-Project/backend/.env.example" "backend/.env"
  warn "Fill in Supabase values in backend/.env — credentialsSupabase.txt not found"
fi

# admin/.env — auto-fill VITE_ prefixed vars if credentials file exists
ADMIN_ENV="$ROOT/MAA-Meditation-App/MAA-Project/admin/.env"
if [ -f "$ADMIN_ENV" ]; then
  ok "admin/.env already exists"
elif [ -f "$CREDS_FILE" ]; then
  SUPA_URL=$(grep '^SUPABASE_URL=' "$CREDS_FILE" | head -1 | cut -d= -f2-)
  SUPA_KEY=$(grep '^SUPABASE_ANON_KEY=' "$CREDS_FILE" | head -1 | cut -d= -f2-)
  {
    echo "VITE_SUPABASE_URL=$SUPA_URL"
    echo "VITE_SUPABASE_ANON_KEY=$SUPA_KEY"
  } > "$ADMIN_ENV"
  ok "Created admin/.env (auto-filled from credentialsSupabase.txt)"
else
  create_env_if_missing "$ADMIN_ENV" \
    "$ROOT/MAA-Meditation-App/MAA-Project/admin/.env.example" "admin/.env"
fi

# -----------------------------------------------------------------------------
# 7. npm install (skip with --skip-install)
# -----------------------------------------------------------------------------
if [ "${1:-}" = "--skip-install" ]; then
  info "Skipping npm install (--skip-install)"
else
  echo ""
  info "Installing mobile deps..."
  (cd "$ROOT/mobile" && npm install --no-audit --no-fund) || fail "mobile npm install failed"
  ok "mobile deps installed"

  info "Installing backend deps..."
  (cd "$ROOT/MAA-Meditation-App/MAA-Project/backend" && npm install --no-audit --no-fund) || fail "backend npm install failed"
  ok "backend deps installed"

  info "Installing admin deps..."
  (cd "$ROOT/MAA-Meditation-App/MAA-Project/admin" && npm install --no-audit --no-fund) || fail "admin npm install failed"
  ok "admin deps installed"
fi

# -----------------------------------------------------------------------------
# 8. Summary + next steps
# -----------------------------------------------------------------------------
echo ""
echo "${BOLD}${GREEN}Setup complete.${RESET}"
echo ""
echo "Edit ${BOLD}mobile/.env${RESET} and set API_BASE_URL for your setup:"
echo "  • iOS simulator                  → http://localhost:3000/api"
echo "  • Android emulator (AVD)         → http://10.0.2.2:3000/api"
echo "  • Physical Android over USB      → http://localhost:3000/api  (default)"
echo "  • Physical phone over Wi-Fi      → http://<your-laptop-IP>:3000/api"
echo ""
echo "Then run the app with these three commands in three terminals:"
echo ""
echo "  ${CYAN}# Terminal 1 — backend (must start first)${RESET}"
echo "  cd MAA-Meditation-App/MAA-Project/backend && npm run dev"
echo ""
echo "  ${CYAN}# Terminal 2 — Metro bundler${RESET}"
echo "  cd mobile && npm start"
echo ""
echo "  ${CYAN}# Terminal 3 — build and launch on device${RESET}"
echo "  bash scripts/launch-android.sh"
