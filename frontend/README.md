# SinghTrades Web App

This React app contains the SinghTrades landing page and account-access flows.

From this directory, install dependencies and start the development server:

```powershell
npm install
npm start
```

It runs on `http://localhost:3001` by default. Authentication and optional phone verification use the API configured by `REACT_APP_API_URL`. Phone verification sends real SMS only when the backend has Twilio Verify credentials configured.

For the complete setup, API, and deployment guide, see the [project README](../README.md).
