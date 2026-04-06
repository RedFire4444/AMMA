# Files & Items NOT to Push to GitHub

> This document lists everything that must NEVER be committed or pushed to the GitHub repository.

---

## Files / Directories — Never Commit

| Item | Reason |
|------|--------|
| `.env`, `.env.local`, `.env.*.local` | Contains API keys, secrets, credentials |
| `node_modules/` | Dependencies — install via `npm ci` |
| `dist/`, `build/` | Build artifacts — generated from source |
| `.DS_Store`, `Thumbs.db`, `desktop.ini` | OS-generated files |
| `.vscode/`, `.idea/` | IDE-specific settings |
| `ios/Pods/` | CocoaPods — install via `pod install` |
| `*.xcuserdata`, `*.xcworkspace` | Xcode user-specific data |
| `coverage/` | Test coverage reports — generated on demand |
| `*.tsbuildinfo` | TypeScript incremental build cache |
| `npm-debug.log*`, `yarn-debug.log*` | Debug logs |

## Content Rules — Never Include In Commits

| Rule | Details |
|------|---------|
| No secrets | No API keys, tokens, passwords, or connection strings in any file |
| No credentials files | No `credentials.json`, `serviceAccountKey.json`, or similar |
| Only collaborator | **ninjacode911** — never add anyone else |
| Single collaborator only | The only collaborator on all repos is **ninjacode911** — no exceptions |

## Enforced Via

- `.gitignore` — blocks files from being staged
- This document — reference for manual review
- Pre-commit hooks (when set up) — automated checks

---

*All items above are also listed in `.gitignore`. If you find something missing, add it to both this document and `.gitignore`.*
