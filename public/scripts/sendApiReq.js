async function sendApiReq(imageInput) {
  try {
    const base64version = await convertToBase64(imageInput);
    const requestOptions = {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ image: base64version }),
    };
    const response = await fetch("/scan", requestOptions);

    if (response.ok) {
      const data = await response.json();
      const ocrString = data.ocrResponse;
      console.log(ocrString);
      return ocrString;
    } else {
      console.error("Error:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

async function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}
