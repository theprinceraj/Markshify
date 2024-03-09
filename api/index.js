import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.static("public"));


app.use(express.json({ limit: "10mb" }));
import { ocrScanFile } from "../src/controllers/scanner.js";
app.use("/scan", async (req, res) => {
  const base64versionImage = req.body.image;
  if (!base64versionImage) {
    return res
      .status(400)
      .json({ error: "Image data is missing in the request body" });
  }

  try {
    const ocrString = await ocrScanFile(base64versionImage);
    console.log(ocrString);
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
