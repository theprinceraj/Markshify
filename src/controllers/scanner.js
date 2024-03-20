import { createWorker } from "tesseract.js";
import { convertRomanNumeralToInteger } from "../utilities/extractRelevantInformation.js";
import { createRectangles } from "../utilities/createRectangles.js";
import { preProcessImage } from "../utilities/preProcessImage.js";

export async function scan(req, res) {
  const base64versionImage = req.body.image;
  if (!base64versionImage) {
    return res
      .status(400)
      .json({ error: "Image data is missing in the request body" });
  }
  const worker = await createWorker("eng");
  await worker.setParameters({
    tessedit_char_whitelist:
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-:. ",
  });
  const preProcessedImage = await preProcessImage(base64versionImage);

  try {
    const {
      data: { semInRoman },
    } = await worker.recognize(preProcessedImage, {
      rectangle: createRectangles("semester"),
    });
    const currentSemesterNumber = convertRomanNumeralToInteger(semInRoman);
    const {
      data: { personalInfo },
    } = await worker.recognize(preProcessedImage, {
      rectangle: createRectangles("personal-info"),
    });
    const [registraionNumber, studentName, fatherName, motherName, courseName] =
      personalInfo;
    // const {
    //   data: { semGPAs },
    // } = await worker.recognize(preProcessedImage, {
    //   rectangle: createRectangles("gpa"),
    // });

    console.log(registraionNumber, currentSemesterNumber);

    res.json({
      ocrResponse: [registraionNumber, currentSemesterNumber],
      formattedString: "",
    });
  } catch (error) {
    console.error("Error processing OCR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
