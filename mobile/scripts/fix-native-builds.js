/**
 * fix-native-builds.js
 *
 * Postinstall script to patch CMakeLists.txt files for all React Native native
 * modules that need explicit c++_shared linkage under Android NDK 27.
 *
 * NDK 27 changed C++ ABI symbol visibility, causing undefined-symbol linker
 * errors (e.g. __cxa_guard_acquire, std::__ndk1::basic_string) for any
 * shared library that uses the C++ standard library but doesn't explicitly
 * link against libc++_shared.so.
 *
 * Affected packages:
 *   - react-native-screens
 *   - react-native-worklets
 *   - react-native-worklets-core
 *   - react-native-reanimated
 *
 * Run automatically via: npm install (postinstall)
 */

const fs = require('fs');
const path = require('path');

const NM = path.join(__dirname, '../node_modules');

// List of patches: each entry targets a specific CMakeLists.txt and
// specifies the exact string to search for and the replacement to use.
const PATCHES = [
  // ── react-native-screens ─────────────────────────────────────────────────
  {
    label: 'react-native-screens',
    file: path.join(NM, 'react-native-screens/android/src/main/jni/CMakeLists.txt'),
    search: `target_link_libraries(\n  \${LIB_TARGET_NAME}\n  ReactAndroid::reactnative\n  ReactAndroid::jsi\n  fbjni::fbjni\n)`,
    replace: `target_link_libraries(\n  \${LIB_TARGET_NAME}\n  ReactAndroid::reactnative\n  ReactAndroid::jsi\n  fbjni::fbjni\n  c++_shared\n)`,
  },

  // ── react-native-worklets ────────────────────────────────────────────────
  {
    label: 'react-native-worklets',
    file: path.join(NM, 'react-native-worklets/android/CMakeLists.txt'),
    search: `target_link_libraries(\n  \${PACKAGE_NAME}\n  log\n  android\n)`,
    replace: `target_link_libraries(\n  \${PACKAGE_NAME}\n  log\n  android\n  c++_shared\n)`,
  },

  // ── react-native-worklets-core ───────────────────────────────────────────
  {
    label: 'react-native-worklets-core',
    file: path.join(NM, 'react-native-worklets-core/android/CMakeLists.txt'),
    search: `target_link_libraries(\n  \${PACKAGE_NAME}\n  log\n  android\n)`,
    replace: `target_link_libraries(\n  \${PACKAGE_NAME}\n  log\n  android\n  c++_shared\n)`,
  },

  // ── react-native-reanimated ──────────────────────────────────────────────
  {
    label: 'react-native-reanimated',
    file: path.join(NM, 'react-native-reanimated/android/CMakeLists.txt'),
    search: `target_link_libraries(\n  reanimated\n  log\n  ReactAndroid::reactnative\n  ReactAndroid::jsi\n  fbjni::fbjni\n  android\n  react-native-worklets::worklets)`,
    replace: `target_link_libraries(\n  reanimated\n  log\n  ReactAndroid::reactnative\n  ReactAndroid::jsi\n  fbjni::fbjni\n  android\n  c++_shared\n  react-native-worklets::worklets)`,
  },
];

for (const patch of PATCHES) {
  if (!fs.existsSync(patch.file)) {
    console.log(`[fix-native-builds] SKIP: ${patch.label} CMakeLists.txt not found.`);
    continue;
  }

  const content = fs.readFileSync(patch.file, 'utf8');

  if (content.includes('c++_shared')) {
    console.log(`[fix-native-builds] ✓ ${patch.label} already patched.`);
    continue;
  }

  if (!content.includes(patch.search)) {
    console.warn(`[fix-native-builds] WARNING: ${patch.label} – expected content not found. Patch may be outdated or already applied by the package. Skipping.`);
    continue;
  }

  fs.writeFileSync(patch.file, content.replace(patch.search, patch.replace), 'utf8');
  console.log(`[fix-native-builds] ✓ Patched ${patch.label} with c++_shared linkage (NDK 27 fix).`);
}

console.log('[fix-native-builds] Done.');
