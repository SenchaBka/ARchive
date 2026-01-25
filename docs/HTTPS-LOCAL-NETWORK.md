# Hosting on Local Network over HTTPS

Use HTTPS so the AR experience (camera, geolocation) works on phones/tablets on your LAN.

## 1. Run the dev server with HTTPS

```bash
npm run dev:https
```

This runs `next dev --experimental-https -H 0.0.0.0`:
- **HTTPS** with a self-signed certificate
- **0.0.0.0** so the app is reachable from other devices on your network

## 2. Find your machine’s local IP

**macOS / Linux:**
```bash
# WiFi (common)
ipconfig getifaddr en0

# Or list all
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```
Use the IPv4 address of your active adapter (e.g. `192.168.1.100`).

## 3. Open the app from other devices

On your phone or another computer (same Wi‑Fi):

1. Open **`https://<YOUR_IP>:3000`** (e.g. `https://192.168.1.100:3000`).
2. Accept the browser’s self-signed certificate warning (e.g. “Advanced” → “Proceed”).
3. The app loads over HTTPS.

## 4. Auth0 (login) over HTTPS on LAN

If you use Auth0, you must allow the HTTPS LAN URL.

1. In [Auth0 Dashboard](https://manage.auth0.com/) → your Application → **Settings**.
2. Set **Allowed Callback URLs** to include:
   ```
   https://<YOUR_IP>:3000/api/auth/callback
   ```
   (Add it alongside existing URLs, comma-separated.)
3. Set **Allowed Logout URLs** to include:
   ```
   https://<YOUR_IP>:3000
   ```
4. Set **Allowed Web Origins** to include:
   ```
   https://<YOUR_IP>:3000
   ```
5. In `.env.local`, point the app at the HTTPS LAN URL:
   ```env
   AUTH0_BASE_URL=https://<YOUR_IP>:3000
   APP_BASE_URL=https://<YOUR_IP>:3000/
   ```
   Replace `<YOUR_IP>` with your actual IP (e.g. `192.168.1.100`).

Restart the dev server after changing env vars.

## 5. Optional: Custom certificates (e.g. mkcert)

To avoid browser cert warnings on your machines:

1. Install [mkcert](https://github.com/FiloSottile/mkcert):
   ```bash
   brew install mkcert
   mkcert -install
   ```
2. Create certs for localhost and your LAN IP:
   ```bash
   mkdir -p .cert
   mkcert -key-file .cert/key.pem -cert-file .cert/cert.pem localhost 127.0.0.1 192.168.1.100
   ```
   Replace `192.168.1.100` with your IP.
3. Run Next.js with those certs:
   ```bash
   next dev --experimental-https --experimental-https-key .cert/key.pem --experimental-https-cert .cert/cert.pem -H 0.0.0.0
   ```
4. Add `.cert/` to `.gitignore` so certs are not committed.

## Summary

| Step | Command / Action |
|------|------------------|
| Start HTTPS dev server | `npm run dev:https` |
| Get your IP | `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows) |
| Open on another device | `https://<YOUR_IP>:3000` |
| Auth0 | Add `https://<YOUR_IP>:3000` URLs in Dashboard + set `AUTH0_BASE_URL` / `APP_BASE_URL` in `.env.local` |
