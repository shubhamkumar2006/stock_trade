# Stock Traders

Stock Traders is an educational investing and trading interface built from the existing React/Express/MongoDB project. It offers a modern landing experience, password-based account access, optional real SMS verification, password recovery by email, user-specific watchlists, and simulated orders. **It is not connected to an exchange or broker.**

## Stack

- Landing and auth UI: React 18, Create React App, React Router
- Dashboard: separate React 18 application
- API: Node.js, Express, Mongoose
- Data: MongoDB Atlas
- Sessions/passwords: opaque HttpOnly cookie sessions, Node.js scrypt password hashing
- Optional external services: Twilio Verify for SMS and SMTP for password recovery

## Requirements and install

- Node.js 18 or later
- npm
- MongoDB Atlas URI and database access for API-backed features

Install each app's dependencies once:

```powershell
cd backend; npm install
cd ..\frontend; npm install
cd ..\dashboard; npm install
```

## Configuration

Copy `backend/.env.example` to `backend/.env` and set a valid `MONGO_URL`. Do not commit `.env` or expose its values. `frontend/.env.example` and `dashboard/.env.example` document the browser-side API and dashboard URLs; copy them to `.env` only if changing defaults.

### Optional SMS verification

Configure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_VERIFY_SERVICE_SID` using a Twilio Verify service. Without all three values, phone verification returns an explicit unavailable response; the application does not claim to send an SMS or display a fake OTP.

Each signed-in user may request up to five verification actions per 15 minutes. A verification challenge is bound to that user and phone number, expires after 10 minutes, allows at most five code checks, and is removed after successful verification. Twilio Verify performs the actual SMS delivery and code validation; configure and fund the Verify service in Twilio before enabling it.

### Optional password reset email

Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`. The API returns an explicit service-unavailable response when SMTP is not configured, avoiding a false claim that an email was sent.

The API checks SMTP connectivity before processing reset requests and reports service unavailability rather than claiming mail was sent when the SMTP service is missing or unreachable. Reset links expire after 30 minutes, their tokens are stored as hashes, and each token can be consumed only once. Password-reset attempts also share the authentication rate limit.

## Start in development

Run these commands in three terminals:

```powershell
cd backend; npm start
cd frontend; npm start
cd dashboard; npm start
```

- Landing/auth: http://localhost:3001
- Dashboard app: http://localhost:3000 (requires a valid Stock Traders session)
- API: http://localhost:3002

The dashboard is embedded by the landing app. Both browser apps need to use the same hostname (localhost) so their browser session cookie is shared. Set `CORS_ORIGINS` to the exact browser origins used in development/deployment.

## Authentication

- Sign up with name, email, and a strong password. Indian mobile number is optional.
- Passwords are hashed with scrypt. Session tokens are random, stored only as hashes in MongoDB, and sent in HttpOnly SameSite cookies.
- Login errors are generic. Logout revokes the current server session.
- Phone verification requires configured Twilio Verify; it is optional and never simulated.
- Forgot-password requests return a generic message. A single-use, expiring token is hashed at rest and delivered only when SMTP is configured.

## API

- `GET /api/health` — API/database status
- `GET /api/market/overview` — clearly labeled illustrative market snapshot
- `POST /api/auth/signup`, `POST /api/auth/login`
- `GET /api/auth/me`, `POST /api/auth/logout`
- `POST /api/auth/phone-otp/start`, `POST /api/auth/phone-otp/check`
- `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- `GET/POST/DELETE /api/watchlist` — authenticated, user-owned watchlist
- `GET/POST /api/orders` — authenticated simulated orders only

The legacy `/allHoldings` and `/allPositions` endpoints are demo data endpoints and explicitly mark their response as simulated. They are not execution or user portfolio APIs.

## Checks

```powershell
cd backend; node --check index.js
cd ..\frontend; npm run build
cd ..\dashboard; npm run build
```

## Deployment and limitations

- Use HTTPS, `NODE_ENV=production`, and exact trusted `CORS_ORIGINS` in deployment.
- `Secure` cookies are enabled in production. Configure reverse-proxy trust and CSRF/origin policy for the deployment topology.
- In-memory rate limiting is per API process; use a shared rate-limit store for multi-instance production deployments.
- Twilio Verify and SMTP require paid/configured external accounts. This repository has no provider secrets.
- Market data are illustrative static values. Simulated orders do not execute, and the dashboard's preloaded holdings are educational sample data, not actual user positions.
- The original project contains a separate legacy dashboard and sample trading UI. It is session-gated, but its sample portfolio remains simulated and does not represent data attached to the signed-in user.
- Existing sample data and older model files are retained for compatibility; they should be migrated before treating the product as a live financial service.
