# Backup — Juspay SDK Integration (expresscheckout-nodejs)

This directory contains the original `juspay.js` that used the `expresscheckout-nodejs`
npm package for HDFC SmartGateway integration.

It was replaced on 2026-03-06 with a direct HTTPS implementation (matching the
approach from the previous year's PaymentHandler.js) to eliminate SDK dependency
issues and get payments running immediately.

## What changed

- `src/lib/juspay.js` was rewritten to make direct HTTPS calls to HDFC SmartGateway
- Same exported API: `getJuspayInstance()`, `verifyWebhookSignature()`, `APIError`, etc.
- No changes to `payment-service.js`, API routes, or any other file
- The `expresscheckout-nodejs` package is no longer needed at runtime

## To revert

1. Copy `juspay.js` from this directory back to `src/lib/juspay.js`
2. Make sure `expresscheckout-nodejs` is installed: `npm install expresscheckout-nodejs`
3. Set RSA keys in `.env` if using JWE/JWS auth
