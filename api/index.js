import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.static("public"));

app.use(express.json({ limit: "10mb" }));
import { ocrSpace } from "ocr-space-api-wrapper";
app.use("/scan", async (req, res) => {
  const base64versionImage = req.body.image;
  if (!base64versionImage) {
    return res
      .status(400)
      .json({ error: "Image data is missing in the request body" });
  }

  try {
    const ocrResponse = await ocrSpace(base64versionImage, {
      apiKey: process.env.OCR_SPACE_API_KEY,
    });
    let ocrString = ocrResponse.ParsedResults[0].ParsedText;
    res.json({ ocrResponse: ocrString });
  } catch (error) {
    console.error("Error processing OCR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log("Made by Team Dhruv❤️✨!");
});

export default app;
