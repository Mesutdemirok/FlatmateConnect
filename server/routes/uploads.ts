import { Router, Request, Response } from "express";
import Busboy from "busboy";
import sharp from "sharp";
import { uploadBufferToR2, getR2Url } from "../r2-utils";

const router = Router();

/**
 * Upload endpoint for seeker profile photos
 * - Accepts HEIC/HEIF/JPEG/PNG/WebP
 * - Converts all to JPEG with compression
 * - Auto-rotates based on EXIF
 * - Resizes to max 1600px width
 * - Uploads to R2 storage
 */
router.post("/api/uploads/seeker-photo", (req: Request, res: Response) => {
  const bb = Busboy({ headers: req.headers });
  let hasFile = false;

  bb.on("file", (fieldname: string, file: NodeJS.ReadableStream, info: Busboy.FileInfo) => {
    hasFile = true;
    const { mimeType, filename } = info;

    // Accept common image formats including HEIC
    const allowed = [
      "image/jpeg",
      "image/jpg", 
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif"
    ];

    if (!allowed.includes(mimeType.toLowerCase())) {
      file.resume(); // Drain the stream
      return res.status(400).json({ 
        message: "Desteklenmeyen dosya formatı. JPEG, PNG, WebP veya HEIC kullanın." 
      });
    }

    const chunks: Buffer[] = [];
    
    file.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    file.on("end", async () => {
      try {
        const inputBuffer = Buffer.concat(chunks);
        
        // Process image with Sharp:
        // 1. Auto-rotate based on EXIF orientation
        // 2. Resize to max 1600px width (maintain aspect ratio)
        // 3. Convert to JPEG with 82% quality
        const processedBuffer = await sharp(inputBuffer)
          .rotate() // Auto-rotate based on EXIF
          .resize({
            width: 1600,
            withoutEnlargement: true, // Don't upscale smaller images
            fit: 'inside'
          })
          .jpeg({
            quality: 82,
            progressive: true
          })
          .toBuffer();

        // Generate unique filename
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const r2Key = `seekers/${timestamp}-${randomSuffix}.jpg`;

        // Upload to R2
        await uploadBufferToR2(r2Key, processedBuffer, {
          contentType: "image/jpeg",
          cacheControl: "public, max-age=31536000, immutable"
        });

        // Return both the key and full CDN URL
        const cdnUrl = getR2Url(r2Key);

        return res.json({
          success: true,
          imagePath: r2Key, // Store this in DB
          url: cdnUrl // Use this for immediate preview
        });

      } catch (error) {
        console.error("Image processing error:", error);
        return res.status(500).json({ 
          message: "Fotoğraf işlenirken hata oluştu. Lütfen tekrar deneyin." 
        });
      }
    });

    file.on("error", (error: Error) => {
      console.error("File stream error:", error);
      res.status(500).json({ 
        message: "Dosya yüklenirken hata oluştu." 
      });
    });
  });

  bb.on("finish", () => {
    if (!hasFile) {
      res.status(400).json({ 
        message: "Fotoğraf seçilmedi." 
      });
    }
  });

  bb.on("error", (error: Error) => {
    console.error("Busboy error:", error);
    res.status(500).json({ 
      message: "Dosya yüklemesi başarısız oldu." 
    });
  });

  req.pipe(bb);
});

export default router;
