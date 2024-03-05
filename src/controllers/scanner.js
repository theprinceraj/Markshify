import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export default async function ocrScanFile(inputFile) {
  try {
    const base64String = convertToBase64(inputFile);
    let formData = new FormData();
    formData.append("apikey", process.env.OCR_SPACE_API_KEY);
    formData.append("base64Image", base64String);
    formData.append("filetype", "png");

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
      headers: {},
    });

    if (!response.ok) {
      console.log("Error:", response.statusText);
      return;
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log(error);
  }
}
const assetFile = fs.readFileSync("./public/assets/image.png");
ocrScanFile(assetFile);

function convertToBase64(file) {
  return "data:image/png;base64," + file.toString("base64");
}
