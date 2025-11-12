import express, { Request, Response } from "express";
const router = express.Router();

// ✅ POST /api/seekers
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      preferredLocation,
      shortBio,
      budget,
      isSmoker,
      hasPets,
      smokingPreference,
      petPreference,
    } = req.body;

    // For now, just log and return the received data
    console.log("Seeker form data:", req.body);

    // TODO: connect to your database and save the data
    return res.status(201).json({
      success: true,
      message: "Seeker profile created successfully",
      data: {
        fullName,
        preferredLocation,
        shortBio,
        budget,
        isSmoker,
        hasPets,
        smokingPreference,
        petPreference,
      },
    });
  } catch (err) {
    console.error("Error creating seeker profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
