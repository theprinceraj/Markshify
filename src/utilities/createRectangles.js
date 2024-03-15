import { createWorker } from "tesseract.js";
function createRectangles(type) {
  switch (type) {
    case "semester":
      return [
        {
          left: 0,
          top: 0,
          width: 761,
          height: 63,
        },
      ];
    case "personal-info":
      return [
        {
          // Registration Number
          left: 574,
          top: 121,
          width: 610,
          height: 66,
        },
        {
          // Student Name
          left: 574,
          top: 191,
          width: 1538,
          height: 68,
        },
        {
          // Father's Name
          left: 572,
          top: 257,
          width: 629,
          height: 73,
        },
        {
          // Mother's Name
          left: 1523,
          top: 257,
          width: 591,
          height: 73,
        },
        {
          // Course Name
          left: 574,
          top: 407,
          width: 1540,
          height: 68,
        },
      ];
    default:
      if (!["theory", "practical"].includes(type))
        return "Error: Invalid type!";

      return [
        {
          // Subject 1 Code top:668
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
          top: type == "theory" ? 735 : 1193,
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
const rectangles = createRectangles("semester");
(async () => {
  const values = [];
  await worker.setParameters({
    tessedit_char_whitelist:
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-:. ",
  });
  for (let i = 0; i < rectangles.length; i++) {
    let {
      data: { text },
    } = await worker.recognize("croppedImage.png", {
      rectangle: rectangles[i],
    });
    text = text.slice(0, -1);
    values.push(text);
  }
  console.log(values);
  await worker.terminate();
})();
