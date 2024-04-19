let fileBuffer;

document.addEventListener("DOMContentLoaded", () => {
  const inputForm = document.getElementById("input-form");
  const inputFile = document.getElementById("marksheetInputField");
  const fileNameField = document.getElementById("file-name-field");

  inputForm.addEventListener("change", (e) => {
    const selectedFile = inputFile.files[0];
    if (selectedFile) {
      fileNameField.value = selectedFile.name;
    } else {
      fileNameField.value = "No file selected";
    }
  });

  inputForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const selectedFile = inputFile.files[0];
    if (selectedFile) {
      const loaderElement = document.querySelector(".load-3");
      const scanBtnText = document.querySelector("#scan-btn-text");
      scanBtnText.classList.add("hidden");
      loaderElement.classList.remove("hidden");
      const [ocrString, formattedString] = await sendApiReq(selectedFile);
      loaderElement.classList.add("hidden");
      scanBtnText.classList.remove("hidden");
      displayOcrResponse(ocrString, formattedString);
    } else {
      console.log("No file selected");
    }
  });
});
