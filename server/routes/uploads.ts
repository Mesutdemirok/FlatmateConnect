import { Router, Request, Response } from "express";
import Busboy from "busboy";
import sharp from "sharp";
import { uploadBufferToR2, getR2Url } from "../r2-utils";
import { storage } from "../storage";
import { jwtAuth } from "../auth";

const router = Router();

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function badRequest(res: Response, message: string, extra: any = {}) {
  res.type("application/json");
  return res.status(400).json({ success: false, message, ...extra });
}

function serverError(res: Response, err: any, fallback = "Sunucu hatası.") {
  const msg = err instanceof Error ? err.message : String(err);
  res.type("application/json");
  return res.status(500).json({ success: false, message: fallback, error: msg });
}

function sanityCheckMultipart(req: Request, res: Response): boolean {
  const ct = req.headers["content-type"] || "";
  if (typeof ct !== "string" || !ct.startsWith("multipart/form-data")) {
    badRequest(res, "Geçersiz içerik türü. multipart/form-data bekleniyor.");
    return false;
  }
  return true;
}

function makeBusboy(req: Request, res: Response) {
  try {
    return Busboy({ headers: req.headers });
  } catch (e) {
    serverError(res, e, "Yükleme başlatılamadı.");
    return null;
  }
}

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "", // some browsers omit HEIC mime
]);
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);
const MAX_MB = 10;
const MAX_BYTES = MAX_MB * 1024 * 1024;

// -----------------------------------------------------------------------------
// 1) Seeker profile photo
// -----------------------------------------------------------------------------
router.post("/seeker-photo", jwtAuth, (req: Request, res: Response) => {
  res.type("application/json");
  if (!sanityCheckMultipart(req, res)) return;

  const bb = makeBusboy(req, res);
  if (!bb) return;

  let hasFile = false;
  let sent = false;

  bb.on("file", (_field, file, info: Busboy.FileInfo) => {
    hasFile = true;
    const { mimeType, filename } = info;
    const ext = (filename.split(".").pop() || "").toLowerCase();
    const valid =
      ALLOWED_MIME.has((mimeType || "").toLowerCase()) ||
      ALLOWED_EXT.has(ext);

    if (!valid) {
      file.resume();
      if (!sent) {
        sent = true;
        return badRequest(
          res,
          `Desteklenmeyen dosya formatı (${mimeType || ext}). JPEG/PNG/WebP/HEIC kullanın.`,
        );
      }
      return;
    }

    const chunks: Buffer[] = [];
    let total = 0;

    file.on("data", (chunk: Buffer) => {
      total += chunk.length;
      if (total > MAX_BYTES) file.resume();
      else chunks.push(chunk);
    });

    file.on("end", async () => {
      if (sent) return;
      if (total > MAX_BYTES) {
        sent = true;
        return badRequest(res, `Dosya çok büyük. Maksimum ${MAX_MB}MB yükleyebilirsiniz.`);
      }

      try {
        const input = Buffer.concat(chunks);
        const processed = await sharp(input)
          .rotate()
          .resize({ width: 1600, withoutEnlargement: true, fit: "inside" })
          .jpeg({ quality: 82, progressive: true })
          .toBuffer();

        const key = `seekers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        await uploadBufferToR2(key, processed, {
          contentType: "image/jpeg",
          cacheControl: "public, max-age=31536000, immutable",
        });

        sent = true;
        return res.status(201).json({
          success: true,
          imagePath: key,
          url: getR2Url(key),
          message: "Fotoğraf başarıyla yüklendi.",
        });
      } catch (e) {
        if (!sent) {
          sent = true;
          return serverError(res, e, "Fotoğraf işlenirken hata oluştu.");
        }
      }
    });

    file.on("error", (e: Error) => {
      if (!sent) {
        sent = true;
        return serverError(res, e, "Dosya yüklenirken hata oluştu.");
      }
    });
  });

  bb.on("finish", () => {
    if (!hasFile && !sent) {
      sent = true;
      return badRequest(res, "Fotoğraf seçilmedi.");
    }
  });

  bb.on("error", (e: Error) => {
    if (!sent) {
      sent = true;
      return serverError(res, e, "Dosya yüklemesi başarısız oldu.");
    }
  });

  req.pipe(bb);
});

// -----------------------------------------------------------------------------
// 2) User profile photo (square 800x800)
// -----------------------------------------------------------------------------
router.post("/profile-photo", jwtAuth, (req: Request, res: Response) => {
  res.type("application/json");
  if (!sanityCheckMultipart(req, res)) return;

  const bb = makeBusboy(req, res);
  if (!bb) return;

  let hasFile = false;
  let sent = false;

  bb.on("file", (_field, file, info: Busboy.FileInfo) => {
    hasFile = true;
    const { mimeType, filename } = info;
    const ext = (filename.split(".").pop() || "").toLowerCase();
    const valid =
      ALLOWED_MIME.has((mimeType || "").toLowerCase()) ||
      ALLOWED_EXT.has(ext);

    if (!valid) {
      file.resume();
      if (!sent) {
        sent = true;
        return badRequest(res, "Desteklenmeyen dosya formatı. JPEG/PNG/WebP/HEIC kullanın.");
      }
      return;
    }

    const chunks: Buffer[] = [];
    let total = 0;

    file.on("data", (chunk: Buffer) => {
      total += chunk.length;
      if (total > MAX_BYTES) file.resume();
      else chunks.push(chunk);
    });

    file.on("end", async () => {
      if (sent) return;
      if (total > MAX_BYTES) {
        sent = true;
        return badRequest(res, `Dosya çok büyük. Maksimum ${MAX_MB}MB yükleyebilirsiniz.`);
      }

      try {
        const input = Buffer.concat(chunks);
        const processed = await sharp(input)
          .rotate()
          .resize({ width: 800, height: 800, fit: "cover" })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();

        const key = `profiles/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        await uploadBufferToR2(key, processed, {
          contentType: "image/jpeg",
          cacheControl: "public, max-age=31536000, immutable",
        });

        sent = true;
        return res.status(201).json({
          success: true,
          imagePath: key,
          url: getR2Url(key),
          message: "Profil fotoğrafı başarıyla yüklendi.",
        });
      } catch (e) {
        if (!sent) {
          sent = true;
          return serverError(res, e, "Fotoğraf işlenirken hata oluştu.");
        }
      }
    });

    file.on("error", (e: Error) => {
      if (!sent) {
        sent = true;
        return serverError(res, e, "Dosya yüklenirken hata oluştu.");
      }
    });
  });

  bb.on("finish", () => {
    if (!hasFile && !sent) {
      sent = true;
      return badRequest(res, "Fotoğraf seçilmedi.");
    }
  });

  bb.on("error", (e: Error) => {
    if (!sent) {
      sent = true;
      return serverError(res, e, "Dosya yüklemesi başarısız oldu.");
    }
  });

  req.pipe(bb);
});

// -----------------------------------------------------------------------------
// 3) Listing images (multi-file)
// -----------------------------------------------------------------------------
router.post("/listings/:id/images", jwtAuth, async (req: Request, res: Response) => {
  res.type("application/json");
  const listingId = req.params.id;
  const userId = (req as any).userId;

  try {
    const listing = await storage.getListing(listingId);
    if (!listing) return badRequest(res, "İlan bulunamadı");
    if (listing.userId !== userId)
      return res.status(403).json({
        success: false,
        message: "Bu ilana resim yükleme yetkiniz yok.",
      });
  } catch (e) {
    return serverError(res, e, "İlan doğrulanamadı.");
  }

  if (!sanityCheckMultipart(req, res)) return;
  const bb = makeBusboy(req, res);
  if (!bb) return;

  const uploaded: Array<{ imagePath: string; url: string }> = [];
  let filesProcessing = 0;
  let filesFinished = 0;
  let sent = false;

  const maybeFlush = () => {
    if (!sent && filesProcessing > 0 && filesFinished === filesProcessing) {
      sent = true;
      return res.status(201).json({
        success: true,
        images: uploaded,
        count: uploaded.length,
      });
    }
  };

  bb.on("file", async (_field, file, info: Busboy.FileInfo) => {
    filesProcessing++;
    const { mimeType, filename } = info;
    const ext = (filename.split(".").pop() || "").toLowerCase();
    const valid =
      ALLOWED_MIME.has((mimeType || "").toLowerCase()) ||
      ALLOWED_EXT.has(ext);
    if (!valid) {
      file.resume();
      filesFinished++;
      return maybeFlush();
    }

    const chunks: Buffer[] = [];
    let total = 0;

    file.on("data", (chunk: Buffer) => {
      total += chunk.length;
      if (total > MAX_BYTES) file.resume();
      else chunks.push(chunk);
    });

    file.on("end", async () => {
      try {
        if (total > MAX_BYTES) {
          filesFinished++;
          return maybeFlush();
        }
        const input = Buffer.concat(chunks);
        const processed = await sharp(input)
          .rotate()
          .resize({ width: 1600, withoutEnlargement: true, fit: "inside" })
          .jpeg({ quality: 82, progressive: true })
          .toBuffer();

        const key = `listings/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        await uploadBufferToR2(key, processed, {
          contentType: "image/jpeg",
          cacheControl: "public, max-age=31536000, immutable",
        });

        try {
          await storage.addListingImage({
            listingId,
            imagePath: key,
            isPrimary: uploaded.length === 0,
          });
        } catch (dbErr) {
          console.error("DB save error (listing image):", dbErr);
        }

        uploaded.push({ imagePath: key, url: getR2Url(key) });
        filesFinished++;
        return maybeFlush();
      } catch (e) {
        console.error("Image processing error:", e);
        filesFinished++;
        return maybeFlush();
      }
    });

    file.on("error", (e: Error) => {
      console.error("File stream error:", e);
      filesFinished++;
      return maybeFlush();
    });
  });

  bb.on("finish", () => {
    if (!sent && filesProcessing === 0) {
      sent = true;
      return badRequest(res, "Resim seçilmedi.");
    }
  });

  bb.on("error", (e: Error) => {
    if (!sent) {
      sent = true;
      return serverError(res, e, "Dosya yüklemesi başarısız oldu.");
    }
  });

  req.pipe(bb);
});

// -----------------------------------------------------------------------------
// Error boundary
// -----------------------------------------------------------------------------
router.use((err: any, _req: Request, res: Response, _next: any) => {
  const code = err?.status || 500;
  res.type("application/json");
  res.status(code).json({
    success: false,
    message: "İstek işlenemedi.",
    error: err?.message || String(err),
  });
});

export default router;
