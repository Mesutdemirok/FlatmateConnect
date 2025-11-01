import express, { type Request, Response } from "express";
import * as client from "openid-client";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const FRONTEND_URL = process.env.FRONTEND_URL!;
const JWT_SECRET = process.env.JWT_SECRET!;

// Debug: Log environment variables (without exposing secrets)
console.log("🔍 OAuth Environment Variables:");
console.log("   GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.substring(0, 20)}...` : "NOT SET");
console.log("   GOOGLE_CLIENT_SECRET:", GOOGLE_CLIENT_SECRET ? "SET (hidden)" : "NOT SET");
console.log("   GOOGLE_REDIRECT_URI:", GOOGLE_REDIRECT_URI || "NOT SET");
console.log("   FRONTEND_URL:", FRONTEND_URL || "NOT SET");
console.log("   JWT_SECRET:", JWT_SECRET ? "SET (hidden)" : "NOT SET");

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI || !FRONTEND_URL || !JWT_SECRET) {
  console.error("❌ Missing required environment variables for Google OAuth");
  console.error("Required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, FRONTEND_URL, JWT_SECRET");
}

/**
 * GET /api/oauth/google/redirect
 * Redirects user to Google's OAuth consent screen
 */
router.get("/api/oauth/google/redirect", async (req: Request, res: Response) => {
  try {
    // Discover Google's OAuth configuration
    const config = await client.discovery(
      new URL("https://accounts.google.com"),
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET
    );

    // Generate PKCE parameters
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

    console.log("🔐 OAuth Redirect Details:");
    console.log("   Using GOOGLE_REDIRECT_URI:", GOOGLE_REDIRECT_URI);
    console.log("   Full Google OAuth URL:", authUrl.href);
    res.redirect(authUrl.href);
  } catch (error) {
    console.error("❌ OAuth redirect error:", error);
    res.status(500).json({ 
      message: "Google OAuth başlatılamadı",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/oauth/google/callback
 * Handles Google's OAuth callback, creates/finds user, sets JWT cookie
 */
router.get("/api/oauth/google/callback", async (req: Request, res: Response) => {
  try {
    const codeVerifier = req.cookies.code_verifier;
    const expectedState = req.cookies.oauth_state;

    if (!codeVerifier) {
      console.error("❌ No code_verifier found in cookies");
      return res.redirect(`${FRONTEND_URL}/auth?error=no_verifier`);
    }

    if (!expectedState) {
      console.error("❌ No oauth_state found in cookies");
      return res.redirect(`${FRONTEND_URL}/auth?error=no_state`);
    }

    console.log("🔐 Processing Google OAuth callback...");

    // Discover Google's OAuth configuration
    const config = await client.discovery(
      new URL("https://accounts.google.com"),
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET
    );

    // Get current callback URL with all parameters
    const currentUrl = new URL(req.url, `${req.protocol}://${req.get('host')}`);

    // Exchange code for tokens
    const tokens = await client.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: codeVerifier,
      expectedState: expectedState,
    });

    console.log("✅ Tokens received, fetching userinfo...");

    // Fetch user info using access token
    const claims = tokens.claims();
    const sub = claims?.sub || "";
    const userinfo = await client.fetchUserInfo(config, tokens.access_token, sub);

    console.log("✅ Google user info received:", { 
      email: userinfo.email, 
      verified: userinfo.email_verified 
    });

    if (!userinfo.email) {
      console.error("❌ No email in Google profile");
      return res.redirect(`${FRONTEND_URL}/auth?error=no_email`);
    }

    // Find or create user by email
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
    } else {
      // Update email verification if not set
      if (!user.emailVerifiedAt && userinfo.email_verified) {
        console.log("✓ Updating email verification status");
        const [updatedUser] = await db
          .update(users)
          .set({ 
            emailVerifiedAt: new Date(),
            // Also update profile info if missing
            firstName: user.firstName || (userinfo.given_name as string) || null,
            lastName: user.lastName || (userinfo.family_name as string) || null,
            profileImageUrl: user.profileImageUrl || (userinfo.picture as string) || null,
          })
          .where(eq(users.id, user.id))
          .returning();
        user = updatedUser!;
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        emailVerified: true,
      },
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

    // Redirect to frontend callback
    const callbackUrl = `${FRONTEND_URL}/auth/callback`;
    console.log("🔄 OAuth Success - Redirecting to frontend:");
    console.log("   FRONTEND_URL:", FRONTEND_URL);
    console.log("   Full callback URL:", callbackUrl);
    res.redirect(callbackUrl);

  } catch (error) {
    console.error("❌ OAuth callback error - DETAILED DEBUG:");
    console.error("   Error type:", error?.constructor?.name);
    console.error("   Error message:", error instanceof Error ? error.message : String(error));
    console.error("   Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Check if it's a database error
    if (error && typeof error === 'object' && 'code' in error) {
      console.error("   Database error code:", (error as any).code);
      console.error("   Database error severity:", (error as any).severity);
    }
    
    // Log cookies and request details for debugging
    console.error("   Cookies present:", {
      code_verifier: !!req.cookies.code_verifier,
      oauth_state: !!req.cookies.oauth_state,
    });
    console.error("   Request URL:", req.url);
    console.error("   Request query:", req.query);
    
    res.redirect(`${FRONTEND_URL}/auth?error=oauth_failed`);
  }
});

export default router;
