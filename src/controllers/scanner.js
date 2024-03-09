import dotenv from "dotenv";
dotenv.config();

export async function ocrScanFile(inputFile) {
  try {
    let formData = new FormData();
    formData.append("apikey", process.env.OCR_SPACE_API_KEY);
    formData.append("base64Image", inputFile);
    formData.append("filetype", "png");
    formData.append("isTable", true);

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
    console.log(
      "\n\nSCANNER.JS FILE\n" +
        data.ParsedResults +
        "\n\nSCANNER.JS FILE\n"
    );

    return data.ParsedResults[0].ParsedText;
  } catch (error) {
    console.log(error);
  }
}
