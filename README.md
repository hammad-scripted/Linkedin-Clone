# LinkedIn Clone

A full-stack LinkedIn-style application built with React, Express, MongoDB,
Cloudinary, and Nodemailer. The production build runs as one Render web service:
Express serves both the API and the compiled Vite application.

## Local development

1. Copy `.env.example` to `.env` and provide the required values.
2. Install dependencies:

   ```bash
   npm install
   npm install --prefix frontend
   ```

3. Start the backend and frontend in separate terminals:

   ```bash
   npm run dev
   npm run dev --prefix frontend
   ```

Vite proxies `/api` requests to `http://localhost:5000` during development.

## Deploy to Render

### 1. Rotate exposed credentials

Never commit `.env`. Rotate any MongoDB, JWT, Cloudinary, or Mailtrap credentials
that have been pasted into source control, logs, or chat before deploying.

### 2. Prepare external services

- MongoDB Atlas: allow the outbound IP addresses shown for the Render service,
  or temporarily allow `0.0.0.0/0` with a strong database password.
- Cloudinary: create production API credentials.
- Mailtrap: verify a sending domain and copy the Transactional SMTP credentials.
  Sandbox SMTP only captures messages and does not deliver to real inboxes.

### 3. Create the service

1. Push this repository to GitHub or GitLab.
2. In Render, choose **New → Blueprint** and select the repository.
3. Render reads `render.yaml` and prompts for every secret marked `sync: false`.
4. Enter fresh values for:
   - `MONGO_URI`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `MAILTRAP_SMTP_USER`
   - `MAILTRAP_SMTP_PASS`
   - `EMAIL_FROM` (must use the verified sending domain)
5. Deploy the Blueprint.

The Blueprint builds with `npm ci && npm run build`, starts with `npm start`, and
checks `/api/health`. Render supplies `PORT`, `NODE_ENV`, and its public hostname.

### Custom domains

The application automatically uses its `onrender.com` hostname. If you attach a
custom domain, set `CLIENT_URL=https://your-domain.example` in Render. For any
additional browser origins, set `CORS_ORIGINS` to a comma-separated list of full
origins.

## Production commands

```bash
npm run build
npm start
```

Run frontend checks with:

```bash
npm run check
```
