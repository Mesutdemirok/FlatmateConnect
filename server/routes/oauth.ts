import express, { type Request, Response } from "express";
import * as client from "openid-client";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";
import cookieParser from "cookie-parser";

const router = express.Router();
router.use(cookieParser());

// 🔐 Load environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const FRONTEND_URL = process.env.FRONTEND_URL!;
const JWT_SECRET = process.env.JWT_SECRET!;

// Debug log (no secrets shown)
console.log("🔍 OAuth Environment Variables:");
console.log(
  "   GOOGLE_CLIENT_ID:",
  GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.substring(0, 20)}...` : "NOT SET",
);
console.log("   GOOGLE_REDIRECT_URI:", GOOGLE_REDIRECT_URI || "NOT SET");
console.log("   FRONTEND_URL:", FRONTEND_URL || "NOT SET");
console.log("   JWT_SECRET:", JWT_SECRET ? "SET (hidden)" : "NOT SET");

if (
  !GOOGLE_CLIENT_ID ||
  !GOOGLE_CLIENT_SECRET ||
  !GOOGLE_REDIRECT_URI ||
  !FRONTEND_URL ||
  !JWT_SECRET
) {
  console.error("❌ Missing required environment variables for Google OAuth");
}

/**
 * 1️⃣ Redirect user to Google's OAuth consent screen
 * GET /api/oauth/google/redirect
 */
router.get("/oauth/google/redirect", async (req: Request, res: Response) => {
  try {
    const issuer = await client.Issuer.discover("https://accounts.google.com");
    const googleClient = new issuer.Client({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uris: [GOOGLE_REDIRECT_URI],
      response_types: ["code"],
    });

    const codeVerifier = client.generators.codeVerifier();
    const codeChallenge = client.generators.codeChallenge(codeVerifier);
    const state = client.generators.state();

    const isHttps =
      req.protocol === "https" || req.get("x-forwarded-proto") === "https";

    res.cookie("code_verifier", codeVerifier, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
    });

    res.cookie("oauth_state", state, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
    });

    const authorizationUrl = googleClient.authorizationUrl({
      scope: "openid email profile",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
    });

    console.log("🔐 Redirecting user to Google...");
    res.redirect(authorizationUrl);
  } catch (error) {
    console.error("❌ OAuth redirect error:", error);
    res.status(500).json({ message: "Google OAuth başlatılamadı" });
  }
});

/**
 * 2️⃣ Handle Google's callback
 * GET /api/oauth/google/callback
 */
router.get("/oauth/google/callback", async (req: Request, res: Response) => {
  try {
    const codeVerifier = req.cookies.code_verifier;
    const expectedState = req.cookies.oauth_state;

    if (!codeVerifier || !expectedState) {
      console.error("❌ Missing PKCE cookies");
      return res.redirect(`${FRONTEND_URL}/auth?error=missing_pkce`);
    }

    const issuer = await client.Issuer.discover("https://accounts.google.com");
    const googleClient = new issuer.Client({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uris: [GOOGLE_REDIRECT_URI],
      response_types: ["code"],
    });

    console.log("🔐 Processing Google OAuth callback...");
    const params = googleClient.callbackParams(req);
    const tokenSet = await googleClient.callback(GOOGLE_REDIRECT_URI, params, {
      code_verifier: codeVerifier,
      state: expectedState,
    });

    const userinfo = await googleClient.userinfo(tokenSet);
    console.log("✅ Google user info:", userinfo);

    if (!userinfo.email) {
      console.error("❌ No email in Google profile");
      return res.redirect(`${FRONTEND_URL}/auth?error=no_email`);
    }

    // Find or create user
    let user = await db.query.users.findFirst({
      where: eq(users.email, userinfo.email as string),
    });

    if (!user) {
      console.log("➕ Creating new user from Google profile");
      const [newUser] = await db
        .insert(users)
        .values({
          email: userinfo.email as string,
          firstName: (userinfo.given_name as string) || null,
          lastName: (userinfo.family_name as string) || null,
          profileImageUrl: (userinfo.picture as string) || null,
          emailVerifiedAt: userinfo.email_verified ? new Date() : null,
        })
        .returning();
      user = newUser!;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, emailVerified: true },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    const isHttps =
      req.protocol === "https" || req.get("x-forwarded-proto") === "https";
    const isProductionDomain = req.get("host")?.includes("odanet.com.tr");

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      domain: isProductionDomain ? ".odanet.com.tr" : undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Clean up temp cookies
    res.clearCookie("code_verifier");
    res.clearCookie("oauth_state");

    console.log("✅ OAuth success - user authenticated:", user.email);
    res.redirect(`${FRONTEND_URL}/auth/callback`);
  } catch (error) {
    console.error("❌ OAuth callback error:", error);
    res.redirect(`${FRONTEND_URL}/auth?error=oauth_failed`);
  }
});

export default router;
