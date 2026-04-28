# Backend Deployment — Fly.io

> **Owner**: Navnit (team lead)
> **Status**: Pre-launch (free tier)
> **Region**: Mumbai (`bom`) — closest to Indian users + Supabase project

This is the runbook for deploying and operating the MAA backend on Fly.io. Use it for the first deploy, every subsequent deploy after CI is wired up, and when you need to debug a production incident.

---

## 1. One-time setup (do once, then never again)

You only need to do this section the very first time the backend goes live.

### 1.1. Install flyctl on your laptop

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**macOS / Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

Then open a new terminal and verify:
```bash
fly version
```

### 1.2. Sign in / sign up

```bash
fly auth login
```

Opens a browser. Sign up with GitHub for fastest setup. Free tier requires a credit card on file but does not charge until you exceed limits.

### 1.3. Launch the app (first deploy ever)

From the **backend folder**:
```bash
cd MAA-Meditation-App/MAA-Project/backend
fly launch --no-deploy
```

When prompted:
- **App name**: `maa-backend` (or your choice — must be globally unique on Fly)
- **Region**: `bom` (Mumbai), or pick the closest to your users
- **Copy fly.toml from existing?**: **Yes** — we already wrote one at `backend/fly.toml`
- **Set up Postgres?**: **No** (we use Supabase)
- **Set up Upstash Redis?**: **No**
- **Deploy now?**: **No** — secrets aren't set yet

If your chosen app name conflicts, edit `backend/fly.toml` to match the unique name Fly suggests.

### 1.4. Configure production secrets

These are stored encrypted in Fly's vault, never in git or GitHub Actions. Set them once:

```bash
fly secrets set \
  SUPABASE_URL="https://<your-project>.supabase.co" \
  SUPABASE_ANON_KEY="<your-anon-key>" \
  SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>" \
  ALLOWED_ORIGINS="https://your-admin-domain.com"
```

> **Important**: While you're in pre-launch beta, you can use the same Supabase keys as your local dev. When you're ready to go live, create a separate Supabase project for production, run all migrations there, and rotate the keys via `fly secrets set` again.

### 1.5. First deploy (manual)

```bash
fly deploy
```

Watch the build logs. First deploy takes ~3–5 minutes (Docker build + push). Subsequent deploys are faster (~1–2 min) thanks to Fly's layer cache.

When it finishes:
```bash
fly status               # should show 1 machine running
fly logs --no-tail | tail -20    # should show "Server listening on :3000"
curl https://maa-backend.fly.dev/health   # should return {"status":"ok",...}
```

You're live.

### 1.6. Wire CI/CD auto-deploy

So pushes to `main` deploy automatically:

1. Generate a deploy token:
   ```bash
   fly tokens create deploy -x 8760h    # token valid for 1 year
   ```
   Copy the printed token. Treat it like a password — anyone with it can deploy.

2. Add it to GitHub repo secrets:
   - GitHub → your repo → **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `FLY_API_TOKEN`
   - Value: paste the token

3. Test by merging any commit to `main`. Watch the **Deploy Backend to Fly.io** workflow in the Actions tab. If green, CI/CD is live.

From this point on, you don't run `fly deploy` manually — every push to `main` deploys.

---

## 2. Day-to-day operations

### 2.1. Watch the live logs

```bash
fly logs                 # streams live, Ctrl+C to stop
fly logs --no-tail | tail -100   # last 100 lines, exits
```

### 2.2. Check service health

```bash
fly status               # machine state, region, recent deploy
curl https://maa-backend.fly.dev/health
```

### 2.3. Restart the app

```bash
fly machine restart      # restarts all machines
```

### 2.4. SSH into the running container (debugging)

```bash
fly ssh console
# you're now inside the container — node/dist/server.js is running
```

### 2.5. Roll back to a previous version

```bash
fly releases             # lists every deploy
fly releases rollback <version>
```

### 2.6. Rotate a secret

```bash
fly secrets set SUPABASE_SERVICE_ROLE_KEY="<new-value>"
# Fly automatically restarts the machine to pick up the change
```

### 2.7. Scale up (when you have real users)

While in pre-launch with `min_machines_running = 0`, the app sleeps when idle and the first request after sleep cold-starts (~1–3 seconds). To always keep one machine warm:

Edit `backend/fly.toml`:
```toml
[http_service]
  min_machines_running = 1
```

Commit and push to main — CI deploys it. Or manually:
```bash
fly deploy
fly scale count 1
```

---

## 3. Post-deploy: point the mobile app at production

Once the backend is live at `https://maa-backend.fly.dev`, mobile builds need to know about it.

For **dev builds** (running against your laptop), `mobile/.env` keeps `API_BASE_URL=http://localhost:3000/api`.

For **release builds**, set:
```env
API_BASE_URL=https://maa-backend.fly.dev/api
```

You can manage this with a separate `.env.production` file or by overriding at build time:

```bash
# iOS
ENVFILE=.env.production npx react-native run-ios --configuration Release

# Android
ENVFILE=.env.production npx react-native run-android --variant=release
```

(Requires `react-native-config`-style env routing, which our `react-native-dotenv` setup supports — see [mobile README](../../mobile/README.md).)

---

## 4. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `fly deploy` fails with "image too large" | Docker build pulled in node_modules or test artifacts | Verify `backend/.dockerignore` is committed and excludes `node_modules`, `dist`, `coverage`, `tests` |
| Health check fails (`/health` returns 502) | Server crashed at startup | `fly logs` — usually a missing env var. Run `fly secrets list` to verify all four secrets are set |
| Every API call returns 401 | `SUPABASE_SERVICE_ROLE_KEY` mismatch between Fly and Supabase project | Re-set the secret with the value from Supabase dashboard → Settings → API |
| CORS blocked from admin | `ALLOWED_ORIGINS` doesn't include the admin URL | `fly secrets set ALLOWED_ORIGINS="https://admin1.com,https://admin2.com"` (comma-separated, no spaces) |
| Cold start hits ~3 seconds | Free-tier scale-to-zero behavior | Set `min_machines_running = 1` (see section 2.7). One always-on machine is still inside the free tier as of Apr 2026 |
| GitHub Action says "FLY_API_TOKEN not found" | Token missing or expired | Regenerate via `fly tokens create deploy -x 8760h`, update repo secret |
| Build OOMs at the TypeScript step | 256MB shared CPU is too small for tsc | Bump fly.toml `[[vm]] memory = "512mb"`. Still in free tier. |

---

## 5. Cost ceilings

Free tier as of April 2026:
- 3 shared-cpu-1x machines with 256MB RAM, always running, free
- 160 GB outbound bandwidth/month free
- 3 GB persistent volume storage free

Our setup uses **0 to 1** machine (scales to zero when idle, max 1 running). We won't exceed the free tier in pre-launch. Keep an eye on `fly dashboard` once real users arrive — that's your billing alert.

---

## 6. Splitting dev/prod Supabase (when you're ready to launch)

Currently dev and prod share one Supabase project. Before public launch:

1. In Supabase dashboard → New Project → name it `maa-prod`
2. Copy the schema: from local terminal in `backend/`:
   ```bash
   npx supabase link --project-ref <prod-project-ref>
   npx supabase db push    # applies all migrations
   ```
3. Rotate Fly secrets to the new prod project:
   ```bash
   fly secrets set \
     SUPABASE_URL="https://<prod-project-ref>.supabase.co" \
     SUPABASE_ANON_KEY="<prod-anon-key>" \
     SUPABASE_SERVICE_ROLE_KEY="<prod-service-role-key>"
   ```
4. The dev project keeps the keys in `credentialsSupabase.txt` and developers' local `backend/.env`.

After this, dev data and prod data are isolated. Production users never see test bhajans, test users never see real ones.

---

## 7. Related docs

- [docs/REQUIREMENTS.md](../REQUIREMENTS.md) — local dev setup (laptops)
- [docs/deployment/ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) — full env variable reference
- [backend/fly.toml](../../MAA-Meditation-App/MAA-Project/backend/fly.toml) — Fly app config
- [backend/Dockerfile](../../MAA-Meditation-App/MAA-Project/backend/Dockerfile) — container build
- [.github/workflows/deploy-backend.yml](../../.github/workflows/deploy-backend.yml) — CI/CD pipeline
