# Android C++ Linking Issue - Fix Documentation

## Problem Summary

The React Native Android build was failing with linker errors when building the `react-native-safe-area-context` native module (and potentially other auto-linked modules). The error manifested as multiple undefined symbol errors related to C++ standard library functions.

### Error Details

```
ld.lld: error: undefined symbol: std::__ndk1::basic_string<char, ...>::basic_string(...)
ld.lld: error: undefined symbol: __cxa_begin_catch
ld.lld: error: undefined symbol: __cxa_end_catch
ld.lld: error: undefined symbol: operator new(unsigned long)
ld.lld: error: undefined symbol: operator delete(void*)
```

The linker command failed because the C++ standard library (`libc++_shared`) was not being explicitly linked into the shared object file (`libreact_codegen_safeareacontext.so`).

## Root Cause

In newer NDK versions (like NDK 27), the C++ ABI and symbol visibility requirements have changed. Shared libraries must explicitly link against `libc++_shared.so` instead of relying on the default static C++ standard library.

While React Native 0.84 correctly configures most of its own libraries, external autolinked modules (like `react-native-safe-area-context`) that rely on React Native's new Codegen infrastructure auto-generate their `CMakeLists.txt` files on the fly. These generated files omit explicitly linking `c++_shared`, causing the Android linker to fail with undefined symbols.

**Note on Previous Fix:** Previously, a manual `CMakeLists.txt` was added to `node_modules/react-native-safe-area-context` to force it to link `c++_shared`. However, this approach broke React Native 0.84's autolinking system entirely because it overrode the dynamically generated Codegen CMake configuration which includes necessary paths (like `hermestooling`).

## Solution Implemented

Instead of hacking individual node modules, the clean and permanent fix is to inject the required `c++_shared` linker flag globally across **all** CMake builds triggered by the Android app.

### Updated `android/app/build.gradle`

Added the `-DCMAKE_SHARED_LINKER_FLAGS=-lc++_shared` argument to the app's `defaultConfig.externalNativeBuild.cmake.arguments` block.

```gradle
android {
    defaultConfig {
        // ...
        ndk {
            abiFilters "arm64-v8a"
        }
        externalNativeBuild {
            cmake {
                // -> CRITICAL: Forces all shared libraries to link c++_shared
                arguments "-DANDROID_STL=c++_shared", "-DCMAKE_SHARED_LINKER_FLAGS=-lc++_shared"
            }
        }
    }
}
```

This tells CMake to automatically inject `-lc++_shared` during the linking phase for **every** shared library it builds, completely patching the NDK 27 linkage issue for all Codegen-based auto-linked modules without touching `node_modules`.

## How to Verify the Fix

1. Clean the CMake cache and build folder:
   ```bash
   cd mobile/android
   ./gradlew clean
   ```

2. Rebuild the Android app:
   ```bash
   cd ..
   npx react-native run-android
   ```

3. If successful, the build should complete without any `ld.lld` linker errors.

## Why This Works

- **Global Linker Flags**: The `CMAKE_SHARED_LINKER_FLAGS` ensures that all shared C++ modules implicitly have access to the C++ runtime symbols (memory management, exceptions, STL containers, etc.), regardless of whether their individual `CMakeLists.txt` explicitly requested them.
- **Preserves Codegen**: This fix doesn't interfere with React Native's New Architecture Codegen. Autolinked modules can continue to generate their own `CMakeLists.txt` dynamically.
- **NPM Safe**: Because this is configured in `app/build.gradle`, it survives `node_modules` reinstalls and doesn't require maintaining multiple `patch-package` files or `postinstall` scripts for individual modules.

## References

- [Android NDK C++ Support](https://developer.android.com/ndk/guides/cpp-support)
- [React Native New Architecture Autolinking](https://reactnative.dev/docs/next/the-new-architecture-intro)
- [CMake CMAKE_SHARED_LINKER_FLAGS Documentation](https://cmake.org/cmake/help/latest/variable/CMAKE_SHARED_LINKER_FLAGS.html)
