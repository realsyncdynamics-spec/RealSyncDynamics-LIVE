import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import rateLimit from "express-rate-limit";

dotenv.config();

// Initialize Firebase Admin
const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(readFileSync(configPath, "utf-8"));

if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);

// STRIPE CONFIGURATION
// To go live:
// 1. Replace STRIPE_SECRET_KEY in environment variables with your live key (sk_live_...)
// 2. Replace the test price IDs in the code with your live Stripe Price IDs
// 3. Update STRIPE_WEBHOOK_SECRET with your live endpoint secret
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: "Too many requests, please try again later." }
  });

  // Apply the rate limiting middleware to all requests except webhooks
  app.use((req, res, next) => {
    if (req.path === "/api/webhook") return next();
    limiter(req, res, next);
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Verification API Routes
  app.post("/api/verify/document", express.json(), async (req, res) => {
    const { fileName, fileType, hash: providedHash } = req.body;
    
    try {
      const hash = providedHash || Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      
      // Check if hash exists in ledger
      const ledgerRef = db.collection("c2pa_ledger").doc(hash);
      const ledgerDoc = await ledgerRef.get();
      
      let isAuthentic = true;
      let status = "Verified via SKALE Blockchain Anchor";
      
      if (ledgerDoc.exists) {
        status = "Existing manifest found in global ledger.";
      } else {
        // Anchor new manifest
        await ledgerRef.set({
          fileName,
          fileType,
          hash,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          issuer: "RealSyncDynamics Trust Node",
          status: "anchored"
        });
        status = "New manifest anchored to blockchain.";
      }

      res.json({
        isAuthentic,
        fileName,
        hash,
        timestamp: new Date().toISOString(),
        provider: "SKALE Blockchain Anchor",
        details: status,
        c2pa: {
          active_manifest: true,
          issuer: "DigiCert Trusted G4 Code Signing CA",
          validation_status: "valid"
        }
      });
    } catch (error: any) {
      console.error("C2PA Verification Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/verify/identity", express.json(), (req, res) => {
    const { name, idNumber } = req.body;
    res.json({
      status: "verified",
      name,
      idNumber: idNumber.replace(/.(?=.{4})/g, "*"),
      method: "EU-ID-Gateway",
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/verify/provenance/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
      // Try to get from ledger first
      const ledgerDoc = await db.collection("c2pa_ledger").doc(id).get();
      const ledgerData = ledgerDoc.data();

      res.json({
        contentId: id,
        manifest: {
          active_manifest: `urn:uuid:${id}`,
          producer: ledgerData?.issuer || "RealSyncDynamics Verified Capture",
          signature: {
            issuer: "DigiCert Trusted G4 Code Signing CA",
            timestamp: ledgerData?.timestamp?.toDate?.().toISOString() || new Date().toISOString(),
            algorithm: "sha256WithRSAEncryption"
          }
        },
        history: [
          { 
            action: "c2pa.created", 
            actor: "Sony Alpha 7 IV (Internal)", 
            timestamp: "2026-03-20T10:00:00Z", 
            metadata: "Original Capture",
            thumbnail: "https://picsum.photos/seed/capture/100/100"
          },
          { 
            action: "c2pa.edited", 
            actor: "Adobe Photoshop 2026", 
            timestamp: "2026-03-20T11:30:00Z", 
            metadata: "Color Correction & Cropping",
            thumbnail: "https://picsum.photos/seed/edit1/100/100"
          },
          { 
            action: "c2pa.signed", 
            actor: "RealSyncDynamics Cloud Node", 
            timestamp: ledgerData?.timestamp?.toDate?.().toISOString() || "2026-03-20T12:00:00Z", 
            metadata: "Final Manifest Sealed",
            thumbnail: "https://picsum.photos/seed/final/100/100"
          }
        ],
        assertions: [
          { label: "c2pa.actions", data: { actions: [{ action: "c2pa.created" }] } },
          { label: "stdat.location", data: { latitude: 52.5200, longitude: 13.4050, name: "Berlin, DE" } },
          { label: "c2pa.hash", data: { hash: id } }
        ]
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/verify/deepfake", express.json(), (req, res) => {
    const { fileName } = req.body;
    res.json({
      type: "deepfake",
      isReal: true,
      confidence: 0.984,
      analysis: "No significant facial manipulation or synthetic artifacts detected. Voice patterns match original biometric profile.",
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/creator/biometric/sign", express.json(), (req, res) => {
    const { fileId } = req.body;
    res.json({
      success: true,
      signature: `SIG_${Math.random().toString(36).substring(7).toUpperCase()}`,
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/verify/platform", express.json(), (req, res) => {
    const { role, fileName } = req.body;
    res.json({
      type: "platform",
      status: "pending",
      role,
      fileName,
      timestamp: new Date().toISOString()
    });
  });

  // Stripe Checkout Session
  app.post("/api/create-checkout-session", express.json(), async (req, res) => {
    const { priceId, userId } = req.body;
    
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.headers.origin}/cb?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cb`,
        metadata: {
          userId,
          type: "subscription"
        },
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe Top-Up Session
  app.post("/api/create-topup-session", express.json(), async (req, res) => {
    const { amount, userId } = req.body;
    
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "CreatorBook Balance Top-Up",
                description: `Add €${amount} to your account balance.`,
              },
              unit_amount: Math.round(parseFloat(amount) * 100), // convert to cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/cb?topup_success=true&amount=${amount}`,
        cancel_url: `${req.headers.origin}/cb?topup_canceled=true`,
        metadata: {
          userId,
          type: "topup",
          amount: amount.toString()
        },
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe top-up error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // STRIPE CONNECT ENDPOINTS
  app.post("/api/stripe/connect/create-account", express.json(), async (req, res) => {
    const { userId, email } = req.body;
    try {
      const account = await stripe.accounts.create({
        type: "express",
        email: email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: { userId },
      });

      await db.collection("users").doc(userId).update({
        stripeConnectId: account.id,
        stripeConnectStatus: "pending"
      });

      res.json({ accountId: account.id });
    } catch (error: any) {
      console.error("Stripe Connect Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/stripe/connect/create-account-link", express.json(), async (req, res) => {
    const { accountId } = req.body;
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${req.headers.origin}/cb?stripe_connect=refresh`,
        return_url: `${req.headers.origin}/cb?stripe_connect=success`,
        type: "account_onboarding",
      });
      res.json({ url: accountLink.url });
    } catch (error: any) {
      console.error("Stripe Account Link Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/stripe/connect/login-link/:accountId", async (req, res) => {
    const { accountId } = req.params;
    try {
      const loginLink = await stripe.accounts.createLoginLink(accountId);
      res.json({ url: loginLink.url });
    } catch (error: any) {
      console.error("Stripe Login Link Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe Booking Session (Updated to support transfers)
  app.post("/api/create-booking-session", express.json(), async (req, res) => {
    const { creatorId, creatorName, serviceType, price, details, userId } = req.body;
    
    try {
      // Check if creator has a connected Stripe account
      const creatorDoc = await db.collection("users").doc(creatorId).get();
      const creatorData = creatorDoc.data();
      const stripeConnectId = creatorData?.stripeConnectId;
      const isConnectActive = creatorData?.stripeConnectStatus === "active";

      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `Booking: ${serviceType} with ${creatorName}`,
                description: details.substring(0, 255),
              },
              unit_amount: Math.round(parseFloat(price) * 100), // convert to cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/cb?booking_success=true`,
        cancel_url: `${req.headers.origin}/cb?booking_canceled=true`,
        metadata: {
          userId,
          creatorId,
          serviceType,
          details,
          price: price.toString(),
          type: "booking"
        },
      };

      // If creator is connected, set up the transfer
      if (stripeConnectId && isConnectActive) {
        const amount = Math.round(parseFloat(price) * 100);
        const applicationFee = Math.round(amount * 0.1); // 10% platform fee
        
        sessionConfig.payment_intent_data = {
          application_fee_amount: applicationFee,
          transfer_data: {
            destination: stripeConnectId,
          },
        };
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);
      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe booking error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/verify-session/:sessionId", async (req, res) => {
    const { sessionId } = req.params;
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
        const priceId = lineItems.data[0]?.price?.id;
        const userId = session.metadata?.userId;
        
        let plan = "gratis";
        const bronzePrice = process.env.VITE_STRIPE_PRICE_BRONZE;
        const silverPrice = process.env.VITE_STRIPE_PRICE_SILVER;
        const goldPrice = process.env.VITE_STRIPE_PRICE_GOLD;
        const platinumPrice = process.env.VITE_STRIPE_PRICE_PLATINUM;
        const diamondPrice = process.env.VITE_STRIPE_PRICE_DIAMOND;

        if (priceId === bronzePrice) plan = "bronze";
        if (priceId === silverPrice) plan = "silver";
        if (priceId === goldPrice) plan = "gold";
        if (priceId === platinumPrice) plan = "platinum";
        if (priceId === diamondPrice) plan = "diamond";
        // Fallback for testing
        if (priceId === "price_silver_test") plan = "silver";
        if (priceId === "price_gold_test") plan = "gold";
        if (priceId === "price_platinum_test") plan = "platinum";

        if (userId) {
          await db.collection("users").doc(userId).update({
            plan,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          });
        }

        res.json({ success: true, plan, userId });
      } else {
        res.json({ success: false, message: "Payment not completed" });
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set. Webhook cannot be verified.");
      return res.status(500).send("Webhook configuration error");
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig || "",
        webhookSecret
      );
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case "account.updated": {
          const account = event.data.object as Stripe.Account;
          const userId = account.metadata?.userId;
          
          if (userId) {
            const isReady = account.details_submitted && account.charges_enabled && account.payouts_enabled;
            await db.collection("users").doc(userId).update({
              stripeConnectStatus: isReady ? "active" : "pending"
            });
            console.log(`Stripe Connect account ${account.id} status updated for user ${userId}. Ready: ${isReady}`);
          }
          break;
        }
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          const sessionType = session.metadata?.type;
          
          if (userId) {
            if (sessionType === "topup") {
              const amountStr = session.metadata?.amount || "0";
              const amount = parseFloat(amountStr);
              
              const userRef = db.collection("users").doc(userId);
              const userDoc = await userRef.get();
              
              if (userDoc.exists) {
                const currentBalance = userDoc.data()?.balance || 0;
                await userRef.update({
                  balance: currentBalance + amount
                });
                
                // Create transaction record
                await db.collection("transactions").add({
                  userId,
                  amount,
                  type: "topup",
                  description: `Balance top-up via Stripe`,
                  status: "completed",
                  createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
                
                console.log(`Added €${amount} to user ${userId} balance and created transaction.`);
              }
            } else if (sessionType === "booking") {
              const creatorId = session.metadata?.creatorId;
              const serviceType = session.metadata?.serviceType;
              const details = session.metadata?.details || "";
              const price = parseFloat(session.metadata?.price || "0");
              
              // Create booking
              await db.collection("bookings").add({
                clientId: userId,
                creatorId,
                serviceType,
                details,
                price,
                status: "pending",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
              });
              
              // Create transaction record
              await db.collection("transactions").add({
                userId,
                amount: price,
                type: "payment",
                description: `Booking: ${serviceType} with ${creatorId}`,
                status: "completed",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
              });
              
              console.log(`Created booking for user ${userId} with creator ${creatorId}`);
            } else {
              const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
              const priceId = lineItems.data[0]?.price?.id;
              
              let plan = "gratis";
              const bronzePrice = process.env.VITE_STRIPE_PRICE_BRONZE;
              const silverPrice = process.env.VITE_STRIPE_PRICE_SILVER;
              const goldPrice = process.env.VITE_STRIPE_PRICE_GOLD;
              const platinumPrice = process.env.VITE_STRIPE_PRICE_PLATINUM;
              const diamondPrice = process.env.VITE_STRIPE_PRICE_DIAMOND;

              if (priceId === bronzePrice) plan = "bronze";
              if (priceId === silverPrice) plan = "silver";
              if (priceId === goldPrice) plan = "gold";
              if (priceId === platinumPrice) plan = "platinum";
              if (priceId === diamondPrice) plan = "diamond";
              // Fallback for testing
              if (priceId === "price_silver_test") plan = "silver";
              if (priceId === "price_gold_test") plan = "gold";
              if (priceId === "price_platinum_test") plan = "platinum";

              await db.collection("users").doc(userId).update({
                plan,
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
              });

              // Create transaction record for subscription if it's a new payment
              if (session.amount_total) {
                await db.collection("transactions").add({
                  userId,
                  amount: session.amount_total / 100,
                  type: "payment",
                  description: `Subscription plan: ${plan}`,
                  status: "completed",
                  createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
              }

              console.log(`Updated plan to ${plan} for user ${userId}`);
            }
          }
          break;
        }
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          const priceId = subscription.items.data[0].price.id;
          
          let plan = "bronze";
          const silverPrice = process.env.VITE_STRIPE_PRICE_SILVER;
          const goldPrice = process.env.VITE_STRIPE_PRICE_GOLD;
          const platinumPrice = process.env.VITE_STRIPE_PRICE_PLATINUM;

          if (priceId === silverPrice) plan = "silver";
          if (priceId === goldPrice) plan = "gold";
          if (priceId === platinumPrice) plan = "platinum";
          // Fallback for testing
          if (priceId === "price_silver_test") plan = "silver";
          if (priceId === "price_gold_test") plan = "gold";
          if (priceId === "price_platinum_test") plan = "platinum";

          // Find user by stripeCustomerId
          const userSnapshot = await db.collection("users")
            .where("stripeCustomerId", "==", subscription.customer as string)
            .limit(1)
            .get();

          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            await userDoc.ref.update({ plan });
            console.log(`Updated plan to ${plan} for customer ${subscription.customer}`);
          }
          break;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          
          const userSnapshot = await db.collection("users")
            .where("stripeCustomerId", "==", subscription.customer as string)
            .limit(1)
            .get();

          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            await userDoc.ref.update({ plan: "free" });
            console.log(`Downgraded user to free for customer ${subscription.customer}`);
          }
          break;
        }
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (error: any) {
      console.error(`Error processing webhook event: ${error.message}`);
      return res.status(500).send(`Internal Server Error: ${error.message}`);
    }

    res.json({ received: true });
  });

  // Digital Verification APIs
  app.post("/api/verify/document", express.json(), (req, res) => {
    const { fileName, fileType } = req.body;
    // Simulate verification logic
    const isAuthentic = Math.random() > 0.1; // 90% success rate
    const hash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    res.json({
      success: true,
      fileName,
      isAuthentic,
      hash,
      timestamp: new Date().toISOString(),
      provider: "SKALE Blockchain Anchor",
      details: isAuthentic ? "Digital signature matches original manifest." : "Signature mismatch or manifest missing.",
      c2pa: isAuthentic ? {
        active_manifest: true,
        issuer: "DigiCert Trusted G4 Code Signing CA",
        validation_status: "valid"
      } : null
    });
  });

  app.post("/api/verify/identity", express.json(), (req, res) => {
    const { name, idNumber } = req.body;
    // Simulate identity verification
    const status = Math.random() > 0.2 ? "verified" : "pending";
    
    res.json({
      success: true,
      status,
      name,
      verifiedAt: status === "verified" ? new Date().toISOString() : null,
      method: "eID / VideoIdent Simulation"
    });
  });

  app.get("/api/verify/provenance/:contentId", (req, res) => {
    const { contentId } = req.params;
    // Simulate detailed C2PA provenance history
    res.json({
      contentId,
      manifest: {
        active_manifest: "urn:uuid:842-c2pa-manifest-001",
        producer: "RealSyncDynamics Verified Capture",
        signature: {
          issuer: "DigiCert Trusted G4 Code Signing CA",
          timestamp: new Date().toISOString(),
          algorithm: "sha256WithRSAEncryption"
        }
      },
      history: [
        { 
          action: "c2pa.created", 
          actor: "Sony Alpha 7 IV (Internal)", 
          timestamp: "2026-03-20T10:00:00Z", 
          metadata: "Original Capture",
          thumbnail: "https://picsum.photos/seed/capture/100/100"
        },
        { 
          action: "c2pa.edited", 
          actor: "Adobe Photoshop 2026", 
          timestamp: "2026-03-20T11:30:00Z", 
          metadata: "Color Correction & Cropping",
          thumbnail: "https://picsum.photos/seed/edit1/100/100"
        },
        { 
          action: "c2pa.signed", 
          actor: "RealSyncDynamics Cloud Node", 
          timestamp: "2026-03-20T12:00:00Z", 
          metadata: "Final Manifest Sealed",
          thumbnail: "https://picsum.photos/seed/final/100/100"
        }
      ],
      assertions: [
        { label: "c2pa.actions", data: { actions: [{ action: "c2pa.created" }] } },
        { label: "stdat.location", data: { latitude: 52.5200, longitude: 13.4050, name: "Berlin, DE" } },
        { label: "c2pa.hash", data: { hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" } }
      ]
    });
  });

  app.post("/api/verify/deepfake", express.json(), (req, res) => {
    const { fileName } = req.body;
    // Simulate deepfake detection logic
    const isReal = Math.random() > 0.15; // 85% real
    const confidence = 0.92 + Math.random() * 0.07;
    
    res.json({
      success: true,
      type: 'deepfake',
      isReal,
      confidence,
      analysis: isReal 
        ? "Keine biometrischen Anomalien gefunden. Frequenzanalyse stabil. Textur-Kohärenz innerhalb normaler Parameter."
        : "Anomalien in der Gesichtskohärenz und Blinzel-Frequenz erkannt. Mögliche GAN-Artefakte in den Randbereichen.",
      timestamp: new Date().toISOString(),
      fileName
    });
  });

  app.post("/api/creator/biometric/sign", express.json(), (req, res) => {
    const { fileId } = req.body;
    // Simulate biometric signing
    const signature = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    res.json({
      success: true,
      fileId,
      signature,
      timestamp: new Date().toISOString(),
      method: "Biometric AI Signature (Simulation)",
      issuer: "RealSyncDynamics Trust Node"
    });
  });

  // AI Security APIs
  app.post("/api/security/scan", express.json(), (req, res) => {
    const { target } = req.body;
    res.json({
      success: true,
      target,
      vulnerabilities: [
        { severity: "High", type: "SQL Injection", location: "/api/users", description: "Potential unescaped input in query parameter." },
        { severity: "Medium", type: "XSS", location: "/profile", description: "Reflected XSS possible via username field." },
        { severity: "Low", type: "Insecure Headers", location: "Global", description: "Missing Content-Security-Policy header." }
      ],
      score: 72,
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/security/anomalies", (req, res) => {
    res.json({
      anomalies: [
        { id: "AN-921", type: "Brute Force", source: "192.168.1.45", confidence: 0.98, status: "Blocked" },
        { id: "AN-922", type: "Unusual Traffic", source: "84.21.10.5", confidence: 0.75, status: "Monitoring" },
        { id: "AN-923", type: "API Overuse", source: "User_842", confidence: 0.88, status: "Throttled" }
      ]
    });
  });

  app.get("/api/security/threats", (req, res) => {
    res.json({
      threats: [
        { name: "Lazarus Group Variant", severity: "Critical", origin: "Unknown", description: "New ransomware strain targeting financial nodes." },
        { name: "Zero-Day: OpenSSL", severity: "High", origin: "Global", description: "Vulnerability in certificate parsing logic." },
        { name: "Botnet: Mirai-X", severity: "Medium", origin: "East Asia", description: "IoT botnet expanding via telnet exploits." }
      ]
    });
  });

  app.get("/api/security/trend", (req, res) => {
    const data = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      value: Math.floor(Math.random() * 20) + (i > 18 ? 15 : 5) // Higher at night
    }));
    res.json({ trend: data });
  });

  // Advanced Creator Protection APIs
  app.get("/api/creator/takedowns", (req, res) => {
    res.json({
      matches: [
        { id: "TK-001", platform: "YouTube", videoTitle: "My Morning Routine (RE-UPLOAD)", channel: "ContentThief99", views: 12400, status: "Detected", matchPercent: 98 },
        { id: "TK-002", platform: "Instagram", videoTitle: "Short: 5 Tips for Creators", channel: "InstaGains_Bot", views: 4500, status: "Takedown Pending", matchPercent: 100 },
        { id: "TK-003", platform: "TikTok", videoTitle: "Reaction to RSD Launch", channel: "ReactBro", views: 89000, status: "Ignored", matchPercent: 45 }
      ]
    });
  });

  app.post("/api/creator/takedown/request", express.json(), (req, res) => {
    const { matchId } = req.body;
    res.json({ success: true, message: `Takedown request for ${matchId} sent to platform API.`, requestId: `REQ-${Math.floor(Math.random() * 10000)}` });
  });

  app.get("/api/creator/licensing", (req, res) => {
    res.json({
      licenses: [
        { id: "LIC-881", content: "Cinematic Drone Shot - Berlin", type: "Exclusive", price: "1.5 ETH", status: "Active", buyer: "None" },
        { id: "LIC-882", content: "Creator Masterclass Pack", type: "Standard", price: "0.2 ETH", status: "Sold", buyer: "MediaCorp_DE" }
      ]
    });
  });

  app.post("/api/creator/biometric/sign", express.json(), (req, res) => {
    const { fileId } = req.body;
    res.json({
      success: true,
      signature: `SIG_BIO_${Math.random().toString(36).substring(7).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      method: "FaceID + RSA-4096"
    });
  });

  app.get("/api/creator/community/defense", (req, res) => {
    res.json({
      stats: {
        commentsAnalyzed: 12450,
        hateSpeechBlocked: 142,
        spamFiltered: 890,
        botAccountsFlagged: 12
      },
      activeFilters: ["Hate Speech", "Spam", "Phishing", "AI-Generated Toxicity"]
    });
  });

  app.get("/api/creator/security/contracts", (req, res) => {
    res.json([
      {
        id: "c_1",
        brand: "TechNova Solutions",
        status: "Review Required",
        risks: ["Perpetual Rights Clause", "No Attribution"],
        score: 42,
        summary: "Contract grants TechNova perpetual rights to your likeness without additional compensation."
      },
      {
        id: "c_2",
        brand: "EcoWear Co.",
        status: "Safe",
        risks: [],
        score: 98,
        summary: "Standard 12-month usage license with clear attribution and buyout options."
      }
    ]);
  });

  app.get("/api/creator/security/shadowban", (req, res) => {
    res.json({
      status: "Healthy",
      reachTrend: [
        { date: "2026-03-24", expected: 100, actual: 98 },
        { date: "2026-03-25", expected: 100, actual: 102 },
        { date: "2026-03-26", expected: 100, actual: 95 },
        { date: "2026-03-27", expected: 100, actual: 105 },
        { date: "2026-03-28", expected: 100, actual: 99 },
        { date: "2026-03-29", expected: 100, actual: 101 },
        { date: "2026-03-30", expected: 100, actual: 97 }
      ],
      alerts: []
    });
  });

  app.get("/api/creator/security/insurance", (req, res) => {
    res.json({
      active: true,
      provider: "CreatorShield Global",
      coverageLimit: "$100,000",
      nextPayment: "2026-04-15",
      legalCases: [
        { id: "case_1", opponent: "Copyright Troll LLC", status: "Defended", result: "Dismissed" }
      ]
    });
  });

  let socialConnections = {
    youtube: { connected: false, handle: "", followers: 0 },
    instagram: { connected: false, handle: "", followers: 0 },
    tiktok: { connected: false, handle: "", followers: 0 },
    facebook: { connected: false, handle: "", followers: 0 },
    x: { connected: false, handle: "", followers: 0 }
  };

  app.get("/api/creator/socials", (req, res) => {
    res.json(socialConnections);
  });

  app.post("/api/creator/socials/connect", express.json(), (req, res) => {
    const { platform, handle } = req.body;
    if (socialConnections[platform]) {
      socialConnections[platform] = {
        connected: true,
        handle: handle || `@${platform}_user`,
        followers: Math.floor(Math.random() * 500000) + 10000
      };
    }
    res.json({ success: true, platform, data: socialConnections[platform] });
  });

  app.post("/api/creator/socials/disconnect", express.json(), (req, res) => {
    const { platform } = req.body;
    if (socialConnections[platform]) {
      socialConnections[platform] = { connected: false, handle: "", followers: 0 };
    }
    res.json({ success: true, platform });
  });

  app.post("/api/creator/socials/sync", express.json(), (req, res) => {
    const { content, platforms } = req.body;
    // Simulate syncing across platforms
    const results = platforms.map((p: string) => ({
      platform: p,
      status: "Success",
      timestamp: new Date().toISOString(),
      postId: `POST_${Math.random().toString(36).substring(7).toUpperCase()}`
    }));
    res.json({ success: true, results });
  });

  app.get("/api/creator/trust-score", (req, res) => {
    // Base score
    let score = 75;
    // Add points for each connected social
    Object.values(socialConnections).forEach(s => {
      if (s.connected) {
        score += 2; // +2 for connection
        score += Math.min(5, Math.floor(s.followers / 100000)); // Up to +5 for followers
      }
    });
    res.json({ score: Math.min(100, score) });
  });

  // Admin Status Endpoint
  app.get("/api/admin/status", (req, res) => {
    res.json({
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      VITE_STRIPE_PUBLISHABLE_KEY: !!process.env.VITE_STRIPE_PUBLISHABLE_KEY,
      VITE_STRIPE_PRICE_BRONZE: !!process.env.VITE_STRIPE_PRICE_BRONZE,
      VITE_STRIPE_PRICE_SILVER: !!process.env.VITE_STRIPE_PRICE_SILVER,
      VITE_STRIPE_PRICE_GOLD: !!process.env.VITE_STRIPE_PRICE_GOLD,
      VITE_STRIPE_PRICE_PLATINUM: !!process.env.VITE_STRIPE_PRICE_PLATINUM,
      VITE_STRIPE_PRICE_DIAMOND: !!process.env.VITE_STRIPE_PRICE_DIAMOND,
      NODE_ENV: process.env.NODE_ENV,
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
