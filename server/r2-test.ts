import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const bucket = process.env.R2_BUCKET_NAME!;

async function testR2() {
  try {
    const result = await r2.send(new ListObjectsV2Command({ Bucket: bucket }));
    console.log("✅ R2 connected successfully!");
    console.log("Objects in bucket:", result.