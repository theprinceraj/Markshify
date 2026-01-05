let fileBuffer;

document.addEventListener("DOMContentLoaded", () => {
    const inputForm = document.getElementById("input-form");
    const inputFile = document.getElementById("marksheetInputField");
    const fileNameField = document.getElementById("file-name-field");

    // Validate file on selection
    inputForm.addEventListener("change", (e) => {
        const selectedFile = inputFile.files[0];
        if (selectedFile) {
            // Validate file type
            if (!selectedFile.type.startsWith("image/")) {
                fileNameField.value = "Invalid file type";
                inputFile.value = "";
                alert("Please select an image file (PNG, JPEG, or WebP).");
                return;
            }

            // Validate file size (15MB limit)
            const maxSize = 15 * 1024 * 1024;
            if (selectedFile.size > maxSize) {
                fileNameField.value = "File too large";
                inputFile.value = "";
                alert("File size exceeds 15MB limit. Please select a smaller image.");
                return;
            }

            fileNameField.value = selectedFile.name;
        } else {
            fileNameField.value = "No file selected";
        }
    });

    inputForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const selectedFile = inputFile.files[0];

        if (!selectedFile) {
            alert("Please select a marksheet image to scan.");
            return;
        }

        const loaderElement = document.querySelector(".load-3");
        const scanBtnText = document.querySelector("#scan-btn-text");
        const scanBtn = document.querySelector('button[type="submit"]');

        try {
            // Disable button and show loader
            scanBtn.disabled = true;
            scanBtnText.classList.add("hidden");
            loaderElement.classList.remove("hidden");

            // Make API request
            const [ocrString, formattedString, additionalData] = await sendApiReq(selectedFile);

            // Display results
            displayOcrResponse(ocrString, formattedString, additionalData);
        } catch (error) {
            console.error("Scan error:", error);
            alert("An unexpected error occurred. Please try again.");
        } finally {
            // Re-enable button and hide loader
            loaderElement.classList.add("hidden");
            scanBtnText.classList.remove("hidden");
            scanBtn.disabled = false;
        }
    });

    // Check API health on page load
    checkApiHealth().then((health) => {
        if (health.status === "healthy") {
            console.log("API is healthy and ready");
        } else if (health.status === "degraded") {
            console.warn("API is running in degraded mode");
        } else {
            console.error("API health check failed:", health);
        }
    });
});
