/**
 * Odanet Monorepo Verification Script
 * -----------------------------------
 * Verifies API connectivity for:
 * - Express backend
 * - React/Vite frontend
 * - Expo mobile app
 */

const BACKEND_URL = process.env.API_BASE_URL || "http://localhost:5000/api";
const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000";

async function verifyAPI() {
  console.log("\n🔍 Verifying Odanet System Connectivity...\n");

  // 1. Backend health check
  try {
    const res = await fetch(`${BACKEND_URL}/health`);
    if (res.ok) {
      const data = await res.json();
      console.log(`✅ Backend API reachable at ${BACKEND_URL}`);
      console.log(`   Response: ${data.message || 'OK'}`);
    } else {
      console.error(`❌ Backend responded with status ${res.status}`);
    }
  } catch (err) {
    console.error(`❌ Backend API not reachable: ${err.message}`);
  }

  // 2. Test listings endpoint
  try {
    const res = await fetch(`${BACKEND_URL}/listings`);
    if (res.ok) {
      const data = await res.json();
      console.log(`✅ Listings API working - Found ${data.length || 0} listings`);
    } else {
      console.error(`❌ Listings API responded with status ${res.status}`);
    }
  } catch (err) {
    console.error(`❌ Listings API error: ${err.message}`);
  }

  // 3. Frontend .env check
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    // Check for .env files in new monorepo structure
    const envPaths = [
      'frontend-web/.env.local',
      'frontend-web/.env',
      '.env.shared'
    ];
    
    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        console.log(`✅ Found environment file: ${envPath}`);
      }
    }
  } catch (err) {
    console.warn("⚠️ Could not check environment files");
  }

  // 4. Mobile .env check
  try {
    const fs = await import('fs');
    const mobileConfigPath = "mobile-app/app.config.ts";
    
    if (fs.existsSync(mobileConfigPath)) {
      const configContent = fs.readFileSync(mobileConfigPath, "utf-8");
      const apiUrlMatch = configContent.match(/apiBaseUrl:\s*["']([^"']+)["']/);
      
      if (apiUrlMatch) {
        console.log(`✅ Mobile app configured to use API: ${apiUrlMatch[1]}`);
      } else {
        console.warn("⚠️ Could not find apiBaseUrl in mobile config");
      }
    }
  } catch (err) {
    console.warn("⚠️ Could not read mobile app config");
  }

  console.log("\n🧩 Verification Complete — Check logs above.\n");
}

verifyAPI();
