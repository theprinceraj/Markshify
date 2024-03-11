/**
 * Sends an API request with the provided image input, and returns the OCR response if successful.
 *
 * @param {type} imageInput - the image input to be sent in the API request
 * @return {type} the OCR response if the API request is successful, otherwise null
 */
async function sendApiReq(imageInput) {
  try {
    const base64version = await convertToBase64(imageInput);
    const requestOptions = {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ image: base64version }),
    };
    const response = await fetch("/api/scan", requestOptions);

    if (response.ok) {
      const data = await response.json();
      const { ocrResponse, formattedString } = data;
      console.log(ocrResponse, "\n", formattedString);
      return [ocrResponse, formattedString];
    } else {
      console.error("Error:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

/**
 * Asynchronously converts the given file to base64 encoding.
 *
 * @param {File} file - the file to be converted to base64
 * @return {Promise<string>} a promise that resolves with the base64 encoded string
 */
async function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];
      resolve(`data:${file.type};base64,` + base64String);
    };
    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}
