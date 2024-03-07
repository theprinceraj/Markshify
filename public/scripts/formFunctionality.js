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
      await sendApiReq(selectedFile);
    } else {
      console.log("No file selected");
    }
  });
});
