import { createWorker } from './tesseract.js/src/index';

const worker = await createWorker();

/**
 * Asynchronously processes an image using Tesseract OCR to extract text from specified rectangles.
 *
 * @param {string} img - The image to process.
 * @param {Array} rectanglesArr - An array of rectangles to extract text from.
 * @return {Promise<string>} The extracted text from the specified rectangles.
 */
export async function getJobDone(img, rectanglesArr) {
  await worker.setParameters({
    tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-:. ',
  });
  let result = [];
  let rectArrLen = rectanglesArr.length;
  for (let i = 0; i < rectArrLen; i++) {
    let {
      data: { text },
    } = await worker.recognize(img, {
      rectangle: rectanglesArr[i],
    });
    text = text.slice(0, -1);
    result.push(text);
  }
  return result;
}
