# Requirements & Required Files — MAA Project

> **Last Updated**: 2026-04-17
> **Purpose**: Single-page checklist of everything a teammate needs installed and every file they need to create locally before the project will run.

If anything here is missing on your machine, the project will not build. Work through each section top to bottom.

---

## 1. System Software

Install these on your laptop **once**. All three sub-projects (mobile, backend, admin) require the same versions.

| Tool | Required version | Purpose | Install link |
|---|---|---|---|
| **Node.js** | **22.11.0 LTS** (see root [`.nvmrc`](../.nvmrc)) | Runs mobile Metro, backend, and admin | via nvm (next row) |
| **nvm** (Windows) | latest | Node version manager | [nvm-windows releases](https://github.com/coreybutler/nvm-windows/releases) |
| **nvm** (Mac/Linux) | latest | Node version manager | [nvm install script](https://github.com/nvm-sh/nvm) |
| **npm** | ≥10.0.0 | Comes bundled with Node 22 | — |
| **Git** | any recent | Clone + pull | [git-scm.com](https://git-scm.com/downloads) |
| **JDK (Java)** | **17** | Required by React Native 0.84 Android build | [Adoptium Temurin 17](https://adoptium.net/temurin/releases/?version=17) |
| **Android Studio** | latest stable | Provides Android SDK + emulator + `adb` | [developer.android.com/studio](https://developer.android.com/studio) |
| **Android SDK Platform** | **34** | RN 0.84 target SDK | Install via Android Studio → SDK Manager |
| **Android SDK Build-Tools** | 34.x | Build + package APKs | Install via Android Studio → SDK Manager |
| **Android Emulator** | latest | Optional if you test on physical phone | Install via Android Studio → SDK Manager |
| **Xcode** (Mac only) | 15+ | iOS simulator + builds | Mac App Store |
| **CocoaPods** (Mac only) | latest | iOS native dependencies | `brew install cocoapods` or `sudo gem install cocoapods` |
| **Watchman** (Mac/Linux, recommended) | latest | Faster Metro file watching | `brew install watchman` |

### Environment variables your OS must expose

| Variable | Windows location | Mac/Linux `~/.zshrc` or `~/.bashrc` | Why |
|---|---|---|---|
| `ANDROID_HOME` | `C:\Users\<you>\AppData\Local\Android\Sdk` | `$HOME/Library/Android/sdk` (Mac) | RN Android build |
| `JAVA_HOME` | JDK 17 install path | JDK 17 install path | Gradle build |
| `PATH` add | `%ANDROID_HOME%\platform-tools` | `$ANDROID_HOME/platform-tools` | Exposes `adb` |

Verify with:

```bash
node --version     # v22.11.0
npm --version      # >=10.0.0
java -version      # 17.x
adb --version      # any recent
```

---

## 2. Files YOU must create locally (git-ignored — never commit these)

Each of the three sub-projects needs its own `.env`. They are in `.gitignore` on purpose so that per-laptop values (backend URLs, ports) don't collide.

### 2.1 `mobile/.env`

**Template to copy**: [`mobile/.env.example`](../mobile/.env.example)

```bash
cd mobile
cp .env.example .env
```

Minimum content:

```env
API_BASE_URL=http://localhost:3000/api
```

Pick the right `API_BASE_URL` for your setup:

| Your setup | Value | Extra step |
|---|---|---|
| iOS simulator (Mac) | `http://localhost:3000/api` | — |
| Android emulator (AVD) | `http://10.0.2.2:3000/api` | — |
| **Physical Android over USB** | `http://localhost:3000/api` | `adb reverse tcp:3000 tcp:3000` after plug-in |
| Physical phone over Wi-Fi | `http://<your-laptop-LAN-IP>:3000/api` | Phone + laptop on same Wi-Fi |

> Find your laptop IP: `ipconfig` (Windows), `ifconfig` or `ip addr` (Mac/Linux). Look for the Wi-Fi adapter.

### 2.2 `MAA-Meditation-App/MAA-Project/backend/.env`

**Template to copy**: [`MAA-Meditation-App/MAA-Project/backend/.env.example`](../MAA-Meditation-App/MAA-Project/backend/.env.example)

```bash
cd MAA-Meditation-App/MAA-Project/backend
cp .env.example .env
```

Minimum content (pull Supabase values from [`credentialsSupabase.txt`](../credentialsSupabase.txt) at the repo root during build phase):

```env
SUPABASE_URL=<from credentialsSupabase.txt>
SUPABASE_ANON_KEY=<from credentialsSupabase.txt>
SUPABASE_SERVICE_ROLE_KEY=<from credentialsSupabase.txt>
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3001
```

### 2.3 `MAA-Meditation-App/MAA-Project/admin/.env`

**Template to copy**: [`MAA-Meditation-App/MAA-Project/admin/.env.example`](../MAA-Meditation-App/MAA-Project/admin/.env.example)

```bash
cd MAA-Meditation-App/MAA-Project/admin
cp .env.example .env
```

Minimum content:

```env
VITE_SUPABASE_URL=<from credentialsSupabase.txt>
VITE_SUPABASE_ANON_KEY=<from credentialsSupabase.txt>
```

---

## 3. Files already in the repo (you do NOT create these)

These are committed — `git clone` + `npm install` is all you do.

| File | Location | Purpose |
|---|---|---|
| [`.nvmrc`](../.nvmrc) | repo root | Pins Node to `22.11.0` — `nvm use` reads this |
| [`.gitattributes`](../.gitattributes) | repo root | Normalizes line endings (LF for text, CRLF for `.bat`/`.cmd`) |
| [`mobile/package.json`](../mobile/package.json) | mobile root | Mobile dependencies (React Native 0.84, Zustand, Supabase, etc.) |
| `mobile/package-lock.json` | mobile root | Locked mobile dep versions — `npm install` uses this |
| [`mobile/babel.config.js`](../mobile/babel.config.js) | mobile root | Wires `react-native-dotenv` so `@env` import works |
| [`mobile/env.d.ts`](../mobile/env.d.ts) | mobile root | TypeScript type declaration for `@env` module |
| `mobile/metro.config.js` | mobile root | Metro bundler config |
| `mobile/tsconfig.json` | mobile root | TypeScript compile config |
| `mobile/android/build.gradle` | mobile/android | Android native build |
| `mobile/ios/Podfile` | mobile/ios (Mac) | iOS CocoaPods manifest |
| [`MAA-Meditation-App/MAA-Project/backend/package.json`](../MAA-Meditation-App/MAA-Project/backend/package.json) | backend root | Backend dependencies (Express, Supabase, Zod) |
| [`MAA-Meditation-App/MAA-Project/backend/.nvmrc`](../MAA-Meditation-App/MAA-Project/backend/.nvmrc) | backend root | Node 22.11.0 pin |
| `MAA-Meditation-App/MAA-Project/backend/tsconfig.json` | backend root | TypeScript compile config |
| [`MAA-Meditation-App/MAA-Project/admin/package.json`](../MAA-Meditation-App/MAA-Project/admin/package.json) | admin root | Admin dependencies (React, Vite, Tailwind) |

---

## 4. One-time setup after cloning

We ship a script that does every manual step automatically: detects the SDK, writes `local.properties`, copies all `.env` files, and runs `npm install` in all three folders.

```bash
# 1. Clone and enter
git clone https://github.com/ninjacode911/Project-MAA.git
cd Project-MAA

# 2. Get the right Node version (reads .nvmrc)
nvm install 22.11.0     # skip if already installed
nvm use

# 3. Run the setup script — handles everything else
bash scripts/setup.sh

# 4. (Mac only) iOS native deps
cd mobile/ios && bundle install && bundle exec pod install
```

> **Windows users**: run `bash scripts/setup.sh` from **Git Bash** (ships with [Git for Windows](https://git-scm.com/download/win)). PowerShell / CMD aren't supported by the script yet.

The script is safe to re-run — every step is idempotent. Pass `--skip-install` to skip the `npm install` step if you only want it to create config files.

### What the script sets up for you

- Verifies Node version, finds your JDK (Android Studio's bundled JBR is fine), finds your Android SDK
- Creates `mobile/android/local.properties` with your detected SDK path
- Creates `mobile/.env` from the template (you still edit `API_BASE_URL` for your scenario — see section 2.1)
- Creates `backend/.env` and `admin/.env`, auto-filling Supabase values from `credentialsSupabase.txt`
- Runs `npm install` in mobile, backend, and admin

### Manual alternative

If you prefer to do it by hand (or the script fails), follow the manual steps in [section 2](#2-files-you-must-create-locally--git-ignored--never-commit-these). Make sure the environment variables in section 1 are set as **persistent** (System Properties → Environment Variables on Windows, or in your shell rc file on Mac/Linux) — not just for one terminal session.

---

## 5. Daily run order

Three terminals, each staying open while you develop:

```bash
# Terminal 1 — Backend (must start first; mobile calls it)
cd MAA-Meditation-App/MAA-Project/backend
npm run dev                           # http://localhost:3000

# Terminal 2 — Metro bundler
cd mobile
npm start

# Terminal 3 — Build and launch on device
bash scripts/launch-android.sh        # handles adb reverse, gradle, launch
```

### What `launch-android.sh` does for you

This script exists because manually running the app on a physical Android phone has five easy-to-forget steps — and forgetting any one of them fails silently:

1. Exports `JAVA_HOME` / `ANDROID_HOME` / `PATH` for this session
2. Verifies the phone is connected and USB-debugging-authorized
3. Runs `adb reverse tcp:3000 tcp:3000` **and** `adb reverse tcp:8081 tcp:8081` — forgetting 8081 gives you the white screen
4. Warns if backend or Metro aren't running
5. Runs Gradle directly (`./gradlew.bat app:installDebug -PreactNativeDevServerPort=8081`) to avoid a bug in the React Native CLI on Windows + Git Bash where `gradlew.bat` can't be spawned
6. Launches the `com.mobile` MainActivity

Re-run it any time you unplug/replug the phone — `adb reverse` doesn't persist across USB disconnects.

**If you edit `mobile/.env`**, restart Metro with a cache reset:

```bash
npm start -- --reset-cache
```

### iOS alternative (Mac users)

The scripts are Android-focused. For iOS, the RN CLI works fine:

```bash
cd mobile && npm run ios
```

---

## 6. Verification checklist

Before saying "it doesn't work", confirm each of these prints what's expected:

```bash
node --version                              # v22.11.0
npm --version                               # >=10.0.0
java -version                               # 17.x
adb --version                               # any recent
adb devices                                 # your phone/emulator, status "device"
curl http://localhost:3000/api/health       # {"status":"ok"} or similar (backend running)
cat mobile/.env                             # has API_BASE_URL line
```

If any of these fails, fix that step before moving on. 90% of "the app won't load" issues come from one of these being wrong.

---

## 7. Troubleshooting — errors we have actually seen

Every error in this table was hit by someone on the team. If you see one of these, the fix is listed — don't debug from scratch.

### App shows a white / blank screen (physical Android)

**Cause**: The phone can't reach Metro on port 8081. Only the backend port (3000) is reversed.

**Fix**:
```bash
adb reverse tcp:8081 tcp:8081
# Then shake the phone → tap Reload, or force-stop + relaunch the app
```

`bash scripts/launch-android.sh` does this automatically, which is why you should prefer it over raw `npm run android`.

---

### `'gradlew.bat' is not recognized as an internal or external command`

**Cause**: Known bug in the RN community CLI on Windows + Git Bash — it spawns `gradlew.bat` with a broken PATH.

**Fix**: don't go through the RN CLI. Run Gradle directly:
```bash
cd mobile/android
./gradlew.bat app:installDebug -PreactNativeDevServerPort=8081
```
Or just use `bash scripts/launch-android.sh`, which does exactly this.

---

### `'"adb"' is not recognized as an internal or external command`

**Cause**: `platform-tools` is not on the shell's PATH.

**Fix**: Set `ANDROID_HOME` as a persistent system environment variable and add `%ANDROID_HOME%\platform-tools` to PATH (Windows) or `$ANDROID_HOME/platform-tools` to PATH (Mac/Linux). Re-open the terminal. The setup/launch scripts also export this for their own run, but the persistent version is what you want long-term.

---

### Gradle build error: `JAVA_HOME is not set and no 'java' command could be found in your PATH`

**Cause**: Java isn't installed, or `JAVA_HOME` isn't set.

**Fix**: If you installed Android Studio, its bundled JBR works fine. Set:

- **Windows** (persistent): System Properties → Environment Variables → add `JAVA_HOME` = `C:\Program Files\Android\Android Studio\jbr`
- **Mac**: in `~/.zshrc`: `export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"`
- **Linux**: in `~/.bashrc`: `export JAVA_HOME="/opt/android-studio/jbr"` (or wherever you installed it)

---

### `react-native run-android` prompts "Another process is running on port 8081. Use port 8082 instead?"

**Cause**: You started Metro in one terminal, then `npm run android` tried to start its own.

**Fix**: Either
- Use `npm run android -- --no-packager` to tell RN CLI not to start Metro, **or**
- Use `bash scripts/launch-android.sh` (skips Metro start by default), **or**
- Stop your Metro terminal first, let `npm run android` start one

---

### Phone shows `unauthorized` in `adb devices`

**Cause**: The laptop hasn't been approved on the phone yet, or its previous approval was revoked.

**Fix**:
1. Unlock the phone screen
2. Plug the USB cable in (unplug first if already plugged)
3. On the phone: tap **Always allow from this computer** → **Allow** on the popup
4. If no popup appears, go to **Settings → Developer options → Revoke USB debugging authorizations**, then unplug/replug

---

### Phone disconnects from adb after a few minutes (Samsung-specific)

**Cause**: Samsung phones drop USB debugging when the screen locks for a while.

**Fix**: Enable **Settings → Developer options → Stay awake** to keep the screen on while charging. Or tap the screen periodically. Or accept that it drops and re-run `adb devices` when it does.

---

### `npm ERR! code EENGINE` or similar engine-mismatch errors

**Cause**: You're on Node 20 (or other non-22) in this folder.

**Fix**:
```bash
# At the repo root:
nvm use               # reads .nvmrc, switches to Node 22.11.0
```

Mixing Node 20 in backend and Node 22 in mobile is the most common cause of "works on their laptop but not mine" bugs.

---

### LF/CRLF warnings on `git commit` or `git checkout`

**Cause**: Your local Git was configured before we committed `.gitattributes`.

**Fix**:
```bash
git add --renormalize .
git commit -m "Normalize line endings"
```

Does not happen on fresh clones after `.gitattributes` landed.

---

### `pod install` fails on Mac with `RubyGems` permission error

**Cause**: Using system Ruby without bundler isolation.

**Fix**:
```bash
cd mobile/ios
bundle install
bundle exec pod install     # not plain `pod install`
```

---

## 8. Related docs

- [Root README.md](../README.md) — Project overview, installation quick-start
- [mobile/README.md](../mobile/README.md) — Mobile-specific setup
- [docs/deployment/ENVIRONMENT_SETUP.md](deployment/ENVIRONMENT_SETUP.md) — Full environment variable reference
- [docs/GIT_EXCLUSIONS.md](GIT_EXCLUSIONS.md) — What's git-ignored and why
- [scripts/setup.sh](../scripts/setup.sh) — Automated first-time setup (source if curious)
- [scripts/launch-android.sh](../scripts/launch-android.sh) — Automated Android build + launch
