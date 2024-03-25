import { createWorker } from "tesseract.js";

/**
 * Generates an array of rectangles based on the type provided.
 *
 * @param {string} type - The type of rectangles to generate. Valid types are "semester", "personal-info", "gpa", "theory", or "practical".
 * @return {Array} An array of objects representing rectangles with specific dimensions based on the type.
 *   - If the type is "semester", an array with a single rectangle object is returned:
 *     - left: The x-coordinate of the rectangle's left edge (number).
 *     - top: The y-coordinate of the rectangle's top edge (number).
 *     - width: The width of the rectangle (number).
 *     - height: The height of the rectangle (number).
 *   - If the type is "personal-info", an array with five rectangle objects is returned:
 *     - left: The x-coordinate of the rectangle's left edge (number).
 *     - top: The y-coordinate of the rectangle's top edge (number).
 *     - width: The width of the rectangle (number).
 *     - height: The height of the rectangle (number).
 *   - If the type is "gpa", an array with nine rectangle objects is returned:
 *     - left: The x-coordinate of the rectangle's left edge (number).
 *     - top: The y-coordinate of the rectangle's top edge (number).
 *     - width: The width of the rectangle (number).
 *     - height: The height of the rectangle (number).
 *   - If the type is "theory" or "practical", an array with eight rectangle objects is returned:
 *     - left: The x-coordinate of the rectangle's left edge (number).
 *     - top: The y-coordinate of the rectangle's top edge (number).
 *     - width: The width of the rectangle (number).
 *     - height: The height of the rectangle (number).
 *   - If the type is not one of the valid types, the function returns the string "Error: Invalid type!".
 */
export function createRectangles(type) {
  switch (type) {
    case "semester":
      return [
        {
          left: 169,
          top: 1,
          width: 592,
          height: 63,
        },
      ];
    case "personal-info":
      return [
        {
          // Registration Number
          left: 577,
          top: 122,
          width: 501,
          height: 69,
        },
        {
          // Student Name
          left: 577,
          top: 192,
          width: 1358,
          height: 69,
        },
        {
          // Father's Name
          left: 577,
          top: 269,
          width: 565,
          height: 69,
        },
        {
          // Mother's Name
          left: 1701,
          top: 269,
          width: 410,
          height: 69,
        },
        {
          // Course Name
          left: 579,
          top: 410,
          width: 1512,
          height: 69,
        },
      ];
    case "gpa":
      return [
        {
          // Semester 1 GPA
          left: 217,
          top: 1721,
          width: 202,
          height: 63,
        },
        {
          // Semester 2 GPA
          left: 427,
          top: 1721,
          width: 202,
          height: 63,
        },
        {
          // Semester 3 GPA
          left: 640,
          top: 1721,
          width: 180,
          height: 63,
        },
        {
          // Semester 4 GPA
          left: 820,
          top: 1721,
          width: 175,
          height: 63,
        },
        {
          // Semester 5 GPA
          left: 1000,
          top: 1721,
          width: 175,
          height: 63,
        },
        {
          // Semester 6 GPA
          left: 1174,
          top: 1721,
          width: 175,
          height: 63,
        },
        {
          // Semester 7 GPA
          left: 1353,
          top: 1721,
          width: 175,
          height: 63,
        },
        {
          // Semester 8 GPA
          left: 1530,
          top: 1721,
          width: 175,
          height: 63,
        },
        {
          // Current GPA
          left: 1805,
          top: 1721,
          width: 205,
          height: 63,
        },
      ];
    default:
      if (!["theory", "practical"].includes(type))
        return "Error: Invalid type!";

      return [
        {
          // Subject 1 Code
          left: 0,
          top: type == "theory" ? 668 : 1140,
          width: 311,
          height: 63,
        },
        {
          // Subject 1 Total Marks
          left: 1636,
          top: type == "theory" ? 661 : 1140,
          width: 129,
          height: 73,
        },
        {
          // Subject 2 Code
          left: 0,
          top: type == "theory" ? 735 : 1220,
          width: 311,
          height: 63,
        },
        {
          // Subject 2 Total Marks
          left: 1636,
          top: type == "theory" ? 739 : 1213,
          width: 129,
          height: 73,
        },
        {
          // Subject 3 Code
          left: 0,
          top: type == "theory" ? 812 : 1286,
          width: 311,
          height: 63,
        },
        {
          // Subject 3 Total Marks
          left: 1636,
          top: type == "theory" ? 809 : 1291,
          width: 129,
          height: 73,
        },
        {
          // Subject 4 Code
          left: 0,
          top: type == "theory" ? 880 : 1356,
          width: 311,
          height: 63,
        },
        {
          // Subject 4 Total Marks
          left: 1636,
          top: type == "theory" ? 887 : 1359,
          width: 129,
          height: 73,
        },
        {
          // Subject 5 Code
          left: 0,
          top: type == "theory" ? 955 : 1427,
          width: 311,
          height: 63,
        },
        {
          // Subject 5 Total Marks
          left: 1636,
          top: type == "theory" ? 955 : 1432,
          width: 129,
          height: 73,
        },
      ];
  }
}

console.log("Begun!");
const worker = await createWorker("eng");
const rectangles = createRectangles("gpa");
(async () => {
  const values = [];
  await worker.setParameters({
    tessedit_char_whitelist:
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-:. ",
  });
  for (let i = 0; i < rectangles.length; i++) {
    let {
      data: { text },
    } = await worker.recognize("processedImage.png", {
      rectangle: rectangles[i],
    });
    text = text.slice(0, -1);
    values.push(text);
  }
  console.log(values);
  await worker.terminate();
})();
