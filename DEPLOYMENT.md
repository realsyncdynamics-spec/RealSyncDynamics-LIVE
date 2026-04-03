# CreatorSeal | RealSyncDynamics - Deployment Guide

This application is a full-stack SaaS platform built with React (Vite) and Express. It is designed to be deployed to **Vercel** or **Google Cloud Run**.

## 1. Deployment to Vercel (Recommended)

The project is already configured with a `vercel.json` file for a split deployment:
- **Frontend**: Served as static assets from the `dist/` directory.
- **Backend**: Served as serverless functions from `server.ts`.

### Steps:
1.  **Push to GitHub**: Connect your local repository to a new GitHub repository.
2.  **Connect to Vercel**: Import the repository in the Vercel dashboard.
3.  **Configure Environment Variables**: Add all variables listed in `.env.example` to the Vercel project settings.
4.  **Deploy**: Vercel will automatically detect the `vercel.json` and build the project.

---

## 2. Deployment to Google Cloud Run

If you prefer a containerized deployment, use the provided `Dockerfile`.

### Steps:
1.  **Build the Image**:
    ```bash
    gcloud builds submit --tag gcr.io/[PROJECT_ID]/creatorseal
    ```
2.  **Deploy to Cloud Run**:
    ```bash
    gcloud run deploy creatorseal --image gcr.io/[PROJECT_ID]/creatorseal --platform managed --allow-unauthenticated
    ```

---

## 3. Required Environment Variables

Ensure the following variables are set in your production environment:

| Variable | Description |
| :--- | :--- |
| `STRIPE_SECRET_KEY` | Your Stripe Secret Key (sk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe Webhook Secret (whsec_...) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Your Stripe Publishable Key (pk_live_...) |
| `GEMINI_API_KEY` | Your Google Gemini API Key |
| `VITE_STRIPE_PRICE_BRONZE` | Stripe Price ID for Bronze Plan |
| `VITE_STRIPE_PRICE_SILVER` | Stripe Price ID for Silver Plan |
| `VITE_STRIPE_PRICE_GOLD` | Stripe Price ID for Gold Plan |
| `VITE_STRIPE_PRICE_PLATINUM` | Stripe Price ID for Platinum Plan |
| `VITE_STRIPE_PRICE_DIAMOND` | Stripe Price ID for Diamond Plan |

---

## 4. Firebase Configuration

The application relies on `firebase-applet-config.json` for both client and server initialization.
- **Client**: Vite injects the configuration during the build.
- **Server**: The Express server reads this file at runtime.

**Note**: For production, it is recommended to use a Service Account for the backend. You can update `server.ts` to use `FIREBASE_SERVICE_ACCOUNT` environment variable if needed.

---

## 5. Stripe Webhooks

Once deployed, update your Stripe Dashboard with your production webhook URL:
`https://your-domain.com/api/webhook`
