import { createWorker } from "tesseract.js";
import {
  convertRomanNumeralToInteger,
  extractRelevantInformation,
} from "../utilities/extractRelevantInformation.js";
import { createRectangles } from "../utilities/createRectangles.js";

export async function scan(req, res) {
  const base64versionImage = req.body.image;
  if (!base64versionImage) {
    return res
      .status(400)
      .json({ error: "Image data is missing in the request body" });
  }

  try {
    const worker = await createWorker("eng");
    await worker.setParameters({
      tessedit_char_whitelist:
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-:. ",
    });
    const {
      data: { semInRoman },
    } = await worker.recognize(base64versionImage, {
      rectangle: createRectangles("semester")[0].split(":")[1].trim(),
    });
    const currentSemesterNumber = convertRomanNumeralToInteger(semInRoman);
    const {
      data: { personalInfo },
    } = await worker.recognize(base64versionImage, {
      rectangle: createRectangles("personal-info")[0].split(":")[1].trim(),
    });
    const [registraionNumber, studentName, fatherName, motherName, courseName] =
      personalInfo;
    const semGPAs = await worker.recognize(base64versionImage, {
      rectangle: createRectangles("gpa")[1].split(":")[1].trim(),
    });

    // res.json({ ocrResponse: ocrString, formattedString: formattedString });
  } catch (error) {
    console.error("Error processing OCR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
