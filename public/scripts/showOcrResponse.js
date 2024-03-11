/**
 * Displays the OCR response in the specified output element.
 *
 * @param {string} responseString - The OCR response to be displayed
 * @return {void}
 */
function displayOcrResponse(responseString) {
  if (!responseString) {
    alert(
      "An error encountered. Please recheck that you have scanned the correct file and that it is absolutely clear."
    );
    return;
  }
  const outputDiv = document.getElementById("output");
  outputDiv.innerText = responseString;
}
