import express from "express";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { storage } from "../storage";
import { generateToken } from "../auth";

const router = express.Router();

// Log OAuth configuration on startup
console.log("🔍 OAuth Configuration:");
console.log("   GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + "...");
console.log("   GOOGLE_REDIRECT_URI:", process.env.GOOGLE_REDIRECT_URI);
console.log("   FRONTEND_URL:", process.env.FRONTEND_URL);

const oauth2Client = new google.auth.OAuth2({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_REDIRECT_URI!,
});

// Test endpoint to verify OAuth routes are accessible
router.get("/oauth/test", (req, res) => {
  res.json({
    status: "OAuth routes are working",
    callbackUrl: process.env.GOOGLE_REDIRECT_URI,
    frontendUrl: process.env.FRONTEND_URL,
    timestamp: new Date().toISOString(),
  });
});

// STEP 1: Redirect to Google for consent
router.get("/oauth/google", (req, res) => {
  console.log("🔄 Initiating Google OAuth flow...");
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["openid", "email", "profile"],
  });
  console.log("✅ Redirecting to Google consent screen");
  res.redirect(url);
});

// STEP 2: Handle callback
router.get("/oauth/google/callback", async (req, res) => {
  console.log("🔔 OAuth callback hit! Query params:", Object.keys(req.query));
  console.log("🔔 Callback URL:", req.protocol + '://' + req.get('host') + req.originalUrl);
  
  try {
    const code = req.query.code as string;
    if (!code) {
      console.error("❌ No code in query params:", req.query);
      return res.redirect("/auth?error=oauth_failed");
    }
    
    console.log("✅ Received authorization code (length:", code.length, ")");

    // ✅ Force HTTPS redirect URI for production
    let redirectUri = process.env.GOOGLE_REDIRECT_URI || "https://www.odanet.com.tr/api/oauth/google/callback";
    if (redirectUri.startsWith("http://")) {
      redirectUri = redirectUri.replace("http://", "https://");
      console.log("⚠️ Converted HTTP to HTTPS for redirect URI");
    }
    console.log("🔐 Using redirect URI for token exchange:", redirectUri);
    console.log("🔄 Exchanging authorization code for tokens...");
    
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: redirectUri,
    });
    oauth2Client.setCredentials(tokens);
    console.log("✅ Received tokens from Google");

    // Fetch user info from Google
    console.log("🔄 Fetching user info from Google...");
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    if (!data.email) {
      console.error("❌ No email returned from Google:", data);
      return res.redirect("/auth?error=oauth_failed");
    }
    
    console.log("✅ Google user info received:", data.email);

    // Check if user exists in DB, otherwise create
    console.log("🔄 Checking if user exists in database...");
    let user = await storage.getUserByEmail(data.email);
    if (!user) {
      console.log("📝 Creating new user in database...");
      user = await storage.createUser({
        email: data.email,
        firstName: data.given_name || "",
        lastName: data.family_name || "",
        profileImageUrl: data.picture || "",
        password: null, // Not needed for Google users
      });
      console.log("✅ New user created:", user.id);
    } else {
      console.log("✅ Existing user found:", user.id);
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);
    console.log("✅ JWT token generated");

    // Cookie setup same as main app
    const isProduction = req.get("host")?.includes("odanet.com.tr");
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
      domain: isProduction ? ".odanet.com.tr" : undefined,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie("auth_token", token, cookieOptions);
    console.log("🍪 Auth cookie set with options:", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: cookieOptions.domain,
      path: "/",
    });

    const frontendUrl = process.env.FRONTEND_URL || "/";
    console.log("✅ Google OAuth success! Redirecting to:", frontendUrl);
    console.log("✅ User:", user.email);
    return res.redirect(frontendUrl);
  } catch (err: any) {
    console.error("❌ Google OAuth callback error:", err.message || err);
    
    // Enhanced error logging without exposing secrets
    if (err.response?.data) {
      console.error("🔍 Google API Error Details:", {
        error: err.response.data.error,
        error_description: err.response.data.error_description,
        status: err.response.status,
      });
    }
    
    if (err.code) {
      console.error("🔍 Error Code:", err.code);
    }
    
    return res.redirect("/auth?error=oauth_failed");
  }
});

export default router;
