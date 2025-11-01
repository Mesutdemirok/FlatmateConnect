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

// Debug log (safe)
console.log("🔍 OAuth Environment Variables:");
console.log(
  "   GOOGLE_CLIENT_ID:",
  GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.slice(0, 20)}...` : "NOT SET",
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

/* ---------------------------------------------------------
   🔧 Helper: cookie options for Odanet domain
--------------------------------------------------------- */
function getCookieOptions(req: Request, shortLived = false) {
  const isHttps =
    req.protocol === "https" || req.get("x-forwarded-proto") === "https";
  const isProductionDomain = req.get("host")?.includes("odanet.com.tr");
  return {
    httpOnly: true,
    secure: isHttps,
    sameSite: "none" as const,
    domain: isProductionDomain ? ".odanet.com.tr" : undefined,
    maxAge: shortLived ? 10 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 10 min or 7 days
  };
}

/* ---------------------------------------------------------
   1️⃣ Redirect user to Google OAuth consent screen
--------------------------------------------------------- */
router.get("/oauth/google/redirect", async (req: Request, res: Response) => {
  try {
    const config = await client.discovery(
      new URL("https://accounts.google.com"),
      GOOGLE_CLIENT_ID,
      { client_secret: GOOGLE_CLIENT_SECRET },
    );

    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const state = client.randomState();

    // 🍪 Set short-lived cookies for OAuth flow
    res.cookie("code_verifier", codeVerifier, getCookieOptions(req, true));
    res.cookie("oauth_state", state, getCookieOptions(req, true));

    console.log("🍪 OAuth cookies set with domain .odanet.com.tr");

    // Build authorization URL
    const authUrl = client.buildAuthorizationUrl(config, {
      redirect_uri: GOOGLE_REDIRECT_URI,
      scope: "openid email profile",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
    });

    console.log("🔄 Redirecting to Google OAuth...");
    res.redirect(authUrl.href);
  } catch (error) {
    console.error("❌ OAuth redirect error:", error);
    res.status(500).json({ message: "Google OAuth başlatılamadı" });
  }
});

/* ---------------------------------------------------------
   2️⃣ Handle Google's OAuth callback
--------------------------------------------------------- */
router.get("/oauth/google/callback", async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const codeVerifier = req.cookies?.code_verifier;
    const storedState = req.cookies?.oauth_state;

    console.log("🔐 Google OAuth callback received");

    if (!code || typeof code !== "string") {
      console.error("❌ Missing code from Google");
      return res.redirect(`${FRONTEND_URL}/auth?error=no_code`);
    }
    if (!codeVerifier) {
      console.error("❌ Missing code_verifier in cookies");
      return res.redirect(`${FRONTEND_URL}/auth?error=no_code_verifier`);
    }
    if (!storedState || state !== storedState) {
      console.error("❌ OAuth state mismatch");
      return res.redirect(`${FRONTEND_URL}/auth?error=state_mismatch`);
    }

    const config = await client.discovery(
      new URL("https://accounts.google.com"),
      GOOGLE_CLIENT_ID,
      { client_secret: GOOGLE_CLIENT_SECRET },
    );

    console.log("✅ Google configuration discovered");

    // Exchange authorization code for tokens
    const tokens = await client.authorizationCodeGrant(
      config,
      new URL(req.url, GOOGLE_REDIRECT_URI),
      {
        pkceCodeVerifier: codeVerifier,
        expectedState: storedState,
        idTokenExpected: true,
      },
    );

    console.log("✅ Tokens received, fetching user info...");
    const userinfo = await client.fetchUserInfo(
      config,
      tokens.access_token,
      "sub",
    );

    console.log("✅ Google user info:", {
      email: userinfo.email,
      verified: userinfo.email_verified,
    });

    if (!userinfo.email) {
      console.error("❌ No email in Google userinfo");
      return res.redirect(`${FRONTEND_URL}/auth?error=no_email`);
    }

    // 🧠 Find or create user
    let user = await db.query.users.findFirst({
      where: eq(users.email, userinfo.email),
    });

    if (!user) {
      console.log("➕ Creating new user from Google account");
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

    // 🪙 Create JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // 🍪 Set JWT cookie
    res.cookie("auth_token", token, getCookieOptions(req));
    console.log("🍪 Auth cookie set for domain .odanet.com.tr");

    // 🧹 Clear temp cookies
    res.clearCookie("code_verifier", getCookieOptions(req, true));
    res.clearCookie("oauth_state", getCookieOptions(req, true));

    console.log("✅ OAuth success - redirecting to frontend");
    res.redirect(`${FRONTEND_URL}/auth/callback`);
  } catch (error: any) {
    console.error("❌ OAuth callback error:", error?.message || error);
    res.redirect(`${FRONTEND_URL}/auth?error=oauth_failed`);
  }
});

export default router;
