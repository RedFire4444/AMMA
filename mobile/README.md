# MAA Mobile App

React Native mobile app for the MAA project.

## Setup

```sh
npm install
copy .env.example .env
```

The default `.env.example` points at the deployed Render backend:

```sh
API_BASE_URL=https://amma-vljt.onrender.com/api
```

Keep that value for remote testing, installed APKs, and real devices. Only change
`API_BASE_URL` when you intentionally want to run against a local backend.

## Development With Metro

Use Metro only for local development and Fast Refresh:

```sh
npm start
npm run android
```

## Android Without Metro

To build an Android app with the JavaScript bundle embedded:

```sh
npm run bundle:android
npm run assemble:android
```

The release APK is generated under:

```text
android/app/build/outputs/apk/release/
```

You can also install a release build directly on a connected device:

```sh
npm run android:release
```

Release builds do not require a running Metro server. They use the bundled
JavaScript and the configured Render backend.

## Local Backend Override

If you need to test against a backend running on your laptop, edit `.env`:

```sh
# iOS simulator or adb-reversed Android USB
API_BASE_URL=http://localhost:3000/api

# Android emulator
API_BASE_URL=http://10.0.2.2:3000/api

# Physical phone on the same Wi-Fi
API_BASE_URL=http://<your-laptop-LAN-IP>:3000/api
```

For Android USB with localhost, run:

```sh
adb reverse tcp:3000 tcp:3000
```
