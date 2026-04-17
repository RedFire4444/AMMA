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

## 4. One-time commands after cloning

Run in this exact order:

```bash
# 1. Clone and enter
git clone https://github.com/ninjacode911/Project-MAA.git
cd Project-MAA

# 2. Get the right Node version (reads .nvmrc)
nvm install 22.11.0     # skip if already installed
nvm use

# 3. Mobile
cd mobile
cp .env.example .env    # edit API_BASE_URL per the table in section 2.1
npm install

# 4. Backend
cd ../MAA-Meditation-App/MAA-Project/backend
cp .env.example .env    # fill in Supabase values from credentialsSupabase.txt
npm install

# 5. Admin (only if you're working on it)
cd ../admin
cp .env.example .env
npm install

# 6. iOS native deps (Mac only, mobile)
cd ../../../mobile/ios
bundle install && bundle exec pod install
```

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

# Terminal 3 — Build and install
cd mobile
npm run android                       # or: npm run ios
```

**If testing on a physical Android phone over USB**, run this once per plug-in:

```bash
adb reverse tcp:3000 tcp:3000
```

**If you edit `mobile/.env`**, restart Metro with a cache reset:

```bash
npm start -- --reset-cache
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

## 7. Related docs

- [Root README.md](../README.md) — Project overview, installation quick-start
- [mobile/README.md](../mobile/README.md) — Mobile-specific setup
- [docs/deployment/ENVIRONMENT_SETUP.md](deployment/ENVIRONMENT_SETUP.md) — Full environment variable reference
- [docs/GIT_EXCLUSIONS.md](GIT_EXCLUSIONS.md) — What's git-ignored and why
