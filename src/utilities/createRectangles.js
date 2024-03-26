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
          left: 180,
          top: 15,
          width: 592,
          height: 63,
        },
      ];
    case "personal-info":
      return [
        {
          // Registration Number
          left: 587,
          top: 132,
          width: 501,
          height: 69,
        },
        {
          // Student Name
          left: 587,
          top: 202,
          width: 1358,
          height: 69,
        },
        {
          // Father's Name
          left: 587,
          top: 279,
          width: 565,
          height: 69,
        },
        {
          // Mother's Name
          left: 1711,
          top: 279,
          width: 410,
          height: 69,
        },
        {
          // Course Name
          left: 589,
          top: 420,
          width: 1512,
          height: 69,
        },
      ];
    case "gpa":
      return [
        {
          // Semester GPA
          left: 2027,
          top: 1542,
          width: 78,
          height: 61,
        },
        {
          // Current GPA
          left: 1815,
          top: 1731,
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
          left: 10,
          top: type == "theory" ? 678 : 1150,
          width: 311,
          height: 63,
        },
        {
          // Subject 1 Total Marks
          left: 1646,
          top: type == "theory" ? 671 : 1150,
          width: 129,
          height: 73,
        },
        {
          // Subject 2 Code
          left: 10,
          top: type == "theory" ? 745 : 1230,
          width: 311,
          height: 63,
        },
        {
          // Subject 2 Total Marks
          left: 1646,
          top: type == "theory" ? 749 : 1223,
          width: 129,
          height: 73,
        },
        {
          // Subject 3 Code
          left: 10,
          top: type == "theory" ? 822 : 1296,
          width: 311,
          height: 63,
        },
        {
          // Subject 3 Total Marks
          left: 1646,
          top: type == "theory" ? 819 : 1301,
          width: 129,
          height: 73,
        },
        {
          // Subject 4 Code
          left: 10,
          top: type == "theory" ? 890 : 1366,
          width: 311,
          height: 63,
        },
        {
          // Subject 4 Total Marks
          left: 1646,
          top: type == "theory" ? 897 : 1369,
          width: 129,
          height: 73,
        },
        {
          // Subject 5 Code
          left: 10,
          top: type == "theory" ? 965 : 1437,
          width: 311,
          height: 63,
        },
        {
          // Subject 5 Total Marks
          left: 1646,
          top: type == "theory" ? 965 : 1442,
          width: 129,
          height: 73,
        },
      ];
  }
}

// console.log("Begun!");
// const worker = await createWorker("eng");
// const rectangles = createRectangles("gpa");
// (async () => {
//   const values = [];
//   await worker.setParameters({
//     tessedit_char_whitelist:
//       "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-:. ",
//   });
//   for (let i = 0; i < rectangles.length; i++) {
//     let {
//       data: { text },
//     } = await worker.recognize("processedImage.png", {
//       rectangle: rectangles[i],
//     });
//     text = text.slice(0, -1);
//     values.push(text);
//   }
//   console.log(values);
//   await worker.terminate();
// })();
