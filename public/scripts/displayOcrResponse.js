/**
 * Displays the OCR response in the specified output element.
 *
 * @param {string} ocrString - The OCR response to be displayed
 * @return {void}
 */
function displayOcrResponse(ocrString, formattedString) {
  if (!ocrString) {
    alert(
      "An error encountered. Please recheck that you have scanned the correct file and that it is absolutely clear."
    );
    return;
  }
  console.log(formattedString)
  alert(formattedString);
  console.log(ocrString, "\n", formattedString);
}
