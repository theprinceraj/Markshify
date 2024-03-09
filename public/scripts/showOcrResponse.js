/**
 * Displays the OCR response in the specified output element.
 *
 * @param {string} responseString - The OCR response to be displayed
 * @return {void}
 */
function displayOcrResponse(responseString){
    const outputDiv = document.getElementById("output");
    outputDiv.innerText = responseString;
}