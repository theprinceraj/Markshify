import { ocrSpace } from "ocr-space-api-wrapper";
import { extractRelevantInformation } from "../utilities/extractRelevantInformation.js";
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
    let ocrString = ocrResponse.ParsedResults[0].ParsedText;
    res.json({ ocrResponse: ocrString, formattedString: formattedString });
  } catch (error) {
    console.error("Error processing OCR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
