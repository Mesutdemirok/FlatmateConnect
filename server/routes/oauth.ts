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
    // openid-client v6 API
    const config = await client.discovery(
      new URL("https://accounts.google.com"),
      GOOGLE_CLIENT_ID,
      {
        client_secret: GOOGLE_CLIENT_SECRET,
      }
    );

    console.log("🔐 OAuth Redirect Details:");
    console.log("   Using GOOGLE_REDIRECT_URI:", GOOGLE_REDIRECT_URI);

    // Generate PKCE and state
    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const state = client.randomState();

    // Detect if we're on HTTPS (production domain or Replit)
    const isHttps = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https';
    
    // Store code_verifier and state in session (httpOnly cookie)
    res.cookie("code_verifier", codeVerifier, {
      httpOnly: true,
      secure: isHttps, // Use secure cookies on HTTPS
      sameSite: "lax",
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    res.cookie("oauth_state", state, {
      httpOnly: true,
      secure: isHttps, // Use secure cookies on HTTPS
      sameSite: "lax",
      maxAge: 10 * 60 * 1000, // 10 minutes
    });
    
    console.log("🍪 OAuth cookies set (secure:", isHttps, ")");

    // Build authorization URL
    const authUrl = client.buildAuthorizationUrl(config, {
      redirect_uri: GOOGLE_REDIRECT_URI,
      scope: "openid email profile",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state: state,
    });

    console.log("🔄 Redirecting to Google OAuth...");
    res.redirect(authUrl.href);
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
    const { code, state } = req.query;
    const codeVerifier = req.cookies?.code_verifier;
    const storedState = req.cookies?.oauth_state;

    console.log("🔐 OAuth Callback - Validating state and code");

    // Validate state and code
    if (!code || typeof code !== "string") {
      console.error("❌ No code received from Google");
      return res.redirect(`${FRONTEND_URL}/auth?error=no_code`);
    }

    if (!codeVerifier) {
      console.error("❌ No code_verifier found in cookies");
      return res.redirect(`${FRONTEND_URL}/auth?error=no_code_verifier`);
    }

    if (!storedState || state !== storedState) {
      console.error("❌ State mismatch or missing");
      return res.redirect(`${FRONTEND_URL}/auth?error=state_mismatch`);
    }

    console.log("✅ No OAuth errors, proceeding with authentication");

    // openid-client v6 API
    const config = await client.discovery(
      new URL("https://accounts.google.com"),
      GOOGLE_CLIENT_ID,
      {
        client_secret: GOOGLE_CLIENT_SECRET,
      }
    );

    console.log("✅ Google OAuth config discovered");

    // Exchange authorization code for tokens
    const tokens = await client.authorizationCodeGrant(config, new URL(req.url, GOOGLE_REDIRECT_URI), {
      pkceCodeVerifier: codeVerifier,
      expectedState: storedState,
      idTokenExpected: true,
    });

    console.log("✅ Tokens received, fetching userinfo...");

    // Fetch user info
    const userinfo = await client.fetchUserInfo(config, tokens.access_token, "sub");

    console.log("✅ Google user info received:", { 
      email: userinfo.email, 
      verified: userinfo.email_verified 
    });

    if (!userinfo.email || typeof userinfo.email !== "string") {
      console.error("❌ No email in userinfo");
      return res.redirect(`${FRONTEND_URL}/auth?error=no_email`);
    }

    // Find or create user in database
    let user = await db.query.users.findFirst({
      where: eq(users.email, userinfo.email),
    });

    if (!user) {
      console.log("➕ Creating new user from Google OAuth");
      const [newUser] = await db
        .insert(users)
        .values({
          email: userinfo.email,
          firstName: (userinfo.given_name as string) || null,
          lastName: (userinfo.family_name as string) || null,
          profileImageUrl: (userinfo.picture as string) || null,
          emailVerifiedAt: userinfo.email_verified ? new Date() : null,
        })
        .returning();
      user = newUser;
    }

    console.log("✅ User found/created:", user.id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ JWT token generated for user:", user.id);

    // Detect if we're on HTTPS (production domain or Replit)
    const isHttps = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https';
    const isProductionDomain = req.get('host')?.includes('odanet.com.tr');
    
    // Set httpOnly cookie with JWT (domain: .odanet.com.tr for subdomain access)
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: isHttps, // Use secure cookies on HTTPS
      sameSite: "lax",
      domain: isProductionDomain ? ".odanet.com.tr" : undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    console.log("🍪 Auth token cookie set (secure:", isHttps, "domain:", isProductionDomain ? ".odanet.com.tr" : "localhost", ")");

    // Clear temporary OAuth cookies
    res.clearCookie("code_verifier");
    res.clearCookie("oauth_state");

    console.log("🔄 OAuth Success - Redirecting to frontend:", `${FRONTEND_URL}/auth/callback`);
    res.redirect(`${FRONTEND_URL}/auth/callback`);
  } catch (error) {
    console.error("❌ OAuth callback error:", error);
    res.redirect(`${FRONTEND_URL}/auth?error=oauth_failed`);
  }
});

export default router;
