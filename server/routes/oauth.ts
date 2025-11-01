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

// 🧭 Environment sanity check
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
  console.error("❌ Eksik environment değişkenleri var (Google OAuth için)");
}

/* ---------------------------------------------------------
   ⚙️ Ortak Cookie Ayarları (Chrome “partitioned” desteği eklendi)
--------------------------------------------------------- */
function getCookieOptions(req: Request, shortLived = false) {
  const isProductionDomain = req.get("host")?.includes("odanet.com.tr");
  
  // OAuth callback cross-site olduğu için:
  // - SameSite=None: Google'dan .odanet.com.tr'ye redirect izni
  // - Secure=true: SameSite=None için zorunlu (HTTPS gerekli)
  // - Domain: .odanet.com.tr (subdomain erişimi)

  return {
    httpOnly: true,
 secure: true, // OAuth için her zaman secure (HTTPS zorunlu)
    sameSite: "none" as const,
    domain: isProductionDomain ? ".odanet.com.tr" : undefined,
    path: "/",
    maxAge: shortLived ? 10 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
  };
}

/* ---------------------------------------------------------
   1️⃣ Kullanıcıyı Google OAuth ekranına yönlendir
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

    // 🍪 PKCE doğrulaması için kısa ömürlü çerezleri ayarla
    res.cookie("code_verifier", codeVerifier, getCookieOptions(req, true));
    res.cookie("oauth_state", state, getCookieOptions(req, true));

    console.log(
      "🍪 OAuth çerezleri ayarlandı (.odanet.com.tr, SameSite=None, Partitioned)",
    );

    // 🔗 Google yönlendirme bağlantısı oluştur
    const authUrl = client.buildAuthorizationUrl(config, {
      redirect_uri: GOOGLE_REDIRECT_URI,
      scope: "openid email profile",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
    });

    console.log("🔄 Google OAuth'a yönlendiriliyor...");
    console.log("   redirect_uri:", GOOGLE_REDIRECT_URI);
    console.log("   state:", state);
    res.redirect(authUrl.href);
  } catch (error) {
    console.error("❌ OAuth yönlendirme hatası:", error);
    res.status(500).json({ message: "Google OAuth başlatılamadı" });
  }
});

/* ---------------------------------------------------------
   2️⃣ Google'dan gelen geri dönüşü işle
--------------------------------------------------------- */
router.get("/oauth/google/callback", async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const codeVerifier = req.cookies?.code_verifier;
    const storedState = req.cookies?.oauth_state;

    console.log("🔐 Google OAuth geri dönüşü alındı");
    console.log("   Gelen state:", state);
    console.log("   Kaydedilen state:", storedState);

    // 🔎 Durum kontrolleri
    if (!code || typeof code !== "string") {
      console.error("❌ Google'dan code değeri gelmedi");
      return res.redirect(`${FRONTEND_URL}/auth?error=no_code`);
    }
    if (!codeVerifier) {
      console.error("❌ code_verifier çerezi bulunamadı");
      return res.redirect(`${FRONTEND_URL}/auth?error=no_code_verifier`);
    }
    if (!storedState || state !== storedState) {
      console.error("❌ OAuth state uyuşmazlığı");
      // Temizle, böylece sonraki denemede karışıklık olmaz
      res.clearCookie("oauth_state", getCookieOptions(req, true));
      res.clearCookie("code_verifier", getCookieOptions(req, true));
      return res.redirect(`${FRONTEND_URL}/auth?error=state_mismatch`);
    }

    const config = await client.discovery(
      new URL("https://accounts.google.com"),
      GOOGLE_CLIENT_ID,
      { client_secret: GOOGLE_CLIENT_SECRET },
    );

    console.log("✅ Google yapılandırması bulundu");

    // 🔗 Callback URL'ini doğru şekilde oluştur (query parametreleri ile birlikte)
    const callbackUrl = new URL(GOOGLE_REDIRECT_URI);
    callbackUrl.search = new URLSearchParams(req.query as Record<string, string>).toString();
    
    console.log("🔗 Callback URL:", callbackUrl.href);

    // 🔄 Google token alma işlemi
    const tokens = await client.authorizationCodeGrant(
      config,
      callbackUrl,
      {
        pkceCodeVerifier: codeVerifier,
        expectedState: storedState,
        idTokenExpected: true,
      },
    );

    console.log("✅ Tokenlar alındı, kullanıcı bilgileri getiriliyor...");
    const userinfo = await client.fetchUserInfo(
      config,
      tokens.access_token,
      "sub",
    );

    console.log("✅ Google kullanıcı bilgisi:", {
      email: userinfo.email,
      verified: userinfo.email_verified,
    });

    if (!userinfo.email) {
      console.error("❌ Kullanıcı e-posta bilgisi yok");
      return res.redirect(`${FRONTEND_URL}/auth?error=no_email`);
    }

    // 🧠 Kullanıcıyı bul veya oluştur
    let user = await db.query.users.findFirst({
      where: eq(users.email, userinfo.email),
    });

    if (!user) {
      console.log("➕ Yeni kullanıcı oluşturuluyor (Google hesabından)");
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

    // 🔑 JWT üret
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // 🍪 Kullanıcıyı giriş yapmış olarak ayarla
    res.cookie("auth_token", token, getCookieOptions(req));
    console.log("🍪 auth_token ayarlandı (.odanet.com.tr)");

    // 🧹 Geçici çerezleri sil
    res.clearCookie("code_verifier", getCookieOptions(req, true));
    res.clearCookie("oauth_state", getCookieOptions(req, true));

    console.log("✅ OAuth başarılı — frontend'e yönlendiriliyor");
    res.redirect(`${FRONTEND_URL}/auth/callback`);
  } catch (error: any) {
    console.error("❌ OAuth callback hatası:", error?.message || error);
    res.redirect(`${FRONTEND_URL}/auth?error=oauth_failed`);
  }
});

export default router;
