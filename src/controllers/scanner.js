import { ocrSpace } from "ocr-space-api-wrapper";
import { extractRelevantInformation } from "../utilities/extractRelevantInformation.js";
import fs from "fs";

export async function scan(req, res) {
  const base64versionImage = req.body.image;
  if (!base64versionImage) {
    return res
      .status(400)
      .json({ error: "Image data is missing in the request body" });
  }

  try {
    const ocrResponse = await ocrSpace(base64versionImage, {
      apiKey: process.env.OCR_SPACE_API_KEY,
      scale: true,
      isTable: true,
      isOverlayRequired: true,
    });

    const formattedString = extractRelevantInformation(
      ocrResponse.ParsedResults[0].TextOverlay.Lines
    );
    console.log(formattedString);
    // write formattedString in a txt file and store the file in buffer
    fs.writeFileSync("./public/history/output.txt", formattedString);
    let ocrString = ocrResponse.ParsedResults[0].ParsedText;
    res.json({ ocrResponse: ocrString });
  } catch (error) {
    console.error("Error processing OCR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
