import express from "express";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { storage } from "../storage";
import { generateToken } from "../auth";

const router = express.Router();

const oauth2Client = new google.auth.OAuth2({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_REDIRECT_URI!,
});

// STEP 1: Redirect to Google for consent
router.get("/oauth/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["openid", "email", "profile"],
  });
  res.redirect(url);
});

// STEP 2: Handle callback
router.get("/oauth/google/callback", async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      console.error("❌ No code in query");
      return res.redirect("/auth?error=oauth_failed");
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user info from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    if (!data.email) {
      console.error("❌ No email returned from Google:", data);
      return res.redirect("/auth?error=oauth_failed");
    }

    // Check if user exists in DB, otherwise create
    let user = await storage.getUserByEmail(data.email);
    if (!user) {
      user = await storage.createUser({
        email: data.email,
        firstName: data.given_name || "",
        lastName: data.family_name || "",
        profileImageUrl: data.picture || "",
        password: null, // Not needed for Google users
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

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

    console.log("✅ Google OAuth success:", user.email);
    return res.redirect("/");
  } catch (err: any) {
    console.error("❌ Google OAuth callback error:", err.message || err);
    return res.redirect("/auth?error=oauth_failed");
  }
});

export default router;
