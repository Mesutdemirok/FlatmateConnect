import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID?.trim()!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID?.trim()!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY?.trim()!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME?.trim() || "odanet-uploads";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function configureCORS() {
  console.log("🔧 Configuring CORS for R2 bucket:", R2_BUCKET_NAME);

  const corsRules = [
    {
      AllowedHeaders: ["*"],
      AllowedMethods: ["GET", "HEAD"],
      AllowedOrigins: [
        "https://www.odanet.com.tr",
        "https://odanet.com.tr",
        "http://localhost:5000",
        "http://localhost:5173",
        "https://*.replit.dev"
      ],
      ExposeHeaders: ["ETag"],
      MaxAgeSeconds: 3600,
    },
  ];

  try {
    // Set CORS configuration
    const putCommand = new PutBucketCorsCommand({
      Bucket: R2_BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: corsRules,
      },
    });

    await s3Client.send(putCommand);
    console.log("✅ CORS configuration updated successfully!");

    // Verify CORS configuration
    const getCommand = new GetBucketCorsCommand({
      Bucket: R2_BUCKET_NAME,
    });

    const corsConfig = await s3Client.send(getCommand);
    console.log("\n📋 Current CORS Configuration:");
    console.log(JSON.stringify(corsConfig.CORSRules, null, 2));

    console.log("\n🎉 Images should now load on www.odanet.com.tr!");
    console.log("\nAllowed origins:");
    corsRules[0].AllowedOrigins.forEach(origin => console.log(`  - ${origin}`));

  } catch (error: any) {
    console.error("❌ Error configuring CORS:", error.message);
    throw error;
  }
}

configureCORS();
