import express from "express";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

const webMarkup = await fs.readFile("./public/index.html", (err) => {
  if (err) console.log(err.message, "\n", err.stack);
});
app.use("/", (req, res) => {
  res.send(webMarkup);
});

import { ocrScanFile } from "../src/controllers/scanner.js";
app.use(express.json());
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/scan", async (req, res) => {
  const base64versionImage = req.body.image;
  if (!base64versionImage) {
    return res.status(400).json({ error: "Image data is missing in the request body" });
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
