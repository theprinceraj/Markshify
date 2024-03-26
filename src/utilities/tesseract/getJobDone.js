import { createWorker } from "tesseract.js";
/**
 * Asynchronously processes an image using Tesseract OCR to extract text from specified rectangles.
 *
 * @param {string} img - The image to process.
 * @param {Array} rectanglesArr - An array of rectangles to extract text from.
 * @return {Promise<string>} The extracted text from the specified rectangles.
 */
export async function getJobDone(img, rectanglesArr) {
  const worker = await createWorker("eng");
  await worker.setParameters({
    tessedit_char_whitelist:
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-:. ",
  });

  const {
    data: { text },
  } = await worker.recognize(img, {
    rectangle: rectanglesArr,
  });
  text = text.slice(0, -1);
  await worker.terminate();
  return text;
}
