# iOS Setup & Migration Guide

This guide details the requirements and steps needed to build and run the MAA Meditation App (which was initially built for Android) on iOS.

## 1. Operating System Requirements
Since you are currently developing on a **Windows** machine, you cannot build the iOS app natively on your computer. Apple requires macOS and Xcode to compile iOS applications. 

To build for iOS, you have a few options:
*   **Use a Mac:** Transfer the codebase to a Mac and follow the steps below.
*   **Use a Cloud Build Service:** Services like [Expo Application Services (EAS) Build](https://expo.dev/eas) (if you migrate to Expo), GitHub Actions, or App Center can compile the app in the cloud without needing a local Mac.
*   **Use a Virtual Machine:** Run macOS in a VM (like VMware or VirtualBox) or rent a cloud Mac (e.g., MacStadium).

## 2. Environment Setup (On macOS)
Once you are on a macOS environment, you need to install the required build tools:
1.  **Xcode**: Download and install Xcode from the Mac App Store. Open it at least once to accept the license agreement and install command-line tools.
2.  **CocoaPods**: This is the package manager for iOS native dependencies (similar to npm/gradle).
    ```bash
    sudo gem install cocoapods
    ```

## 3. Install iOS Dependencies
React Native uses CocoaPods to link native modules (like your Reanimated, Keychain, Audio, and Webview packages) to the iOS project.

Navigate to your `ios` folder and install the pods:
```bash
cd mobile/ios
bundle install  # To install the specific cocoapods version in your Gemfile
bundle exec pod install
```
*Note: The `pod install` command will read the `Podfile` and link all the native dependencies found in your `package.json`.*

## 4. App Permissions (`Info.plist` Updates)
Based on your current dependencies in `package.json`, you may need to add specific permissions to your `mobile/ios/mobile/Info.plist` file before releasing or fully testing the app:

*   **FaceID / Biometrics (`react-native-keychain`)**:
    If you use FaceID to secure tokens in the keychain, you must add the following key to `Info.plist` or Apple will reject the app:
    ```xml
    <key>NSFaceIDUsageDescription</key>
    <string>Enabling Face ID allows you quick and secure access to your account.</string>
    ```

*   **Background Audio (`react-native-sound` / `react-native-youtube-iframe`)**:
    If your meditation app plays audio in the background (when the screen is off or app is minimized), you must enable the "Audio, AirPlay, and Picture in Picture" background mode. You can do this in Xcode (Signing & Capabilities -> Background Modes) or by adding this to `Info.plist`:
    ```xml
    <key>UIBackgroundModes</key>
    <array>
        <string>audio</string>
    </array>
    ```

## 5. Running the App
Once CocoaPods are installed, you can start the Metro bundler and run the app on the iOS Simulator:

```bash
# In the mobile directory
npm start
```
And in another terminal:
```bash
npm run ios
# or
npx react-native run-ios
```

## Summary of Differences from Android
*   **Linking:** Android uses Gradle and CMake (as seen in your `FIX_ANDROID_LINKING_ISSUE.md`), while iOS uses CocoaPods. The C++ linking issues you faced on Android are generally handled automatically by CocoaPods on iOS.
*   **Permissions:** Android uses `AndroidManifest.xml`, while iOS uses `Info.plist`.
*   **Compilation:** Android uses Android Studio/Gradle, iOS uses Xcode/xcodebuild.
