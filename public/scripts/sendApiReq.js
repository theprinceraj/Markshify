/**
 * Sends an API request with the provided image input, and returns the OCR response.
 * Includes retry logic and error handling.
 *
 * @param {File} imageInput - The image file to be sent in the API request
 * @param {Object} options - Request options
 * @param {number} options.maxRetries - Maximum retry attempts (default: 2)
 * @param {number} options.retryDelay - Delay between retries in ms (default: 1000)
 * @returns {Promise<Array>} [ocrResponse, formattedString, additionalData]
 */
async function sendApiReq(imageInput, options = {}) {
    const { maxRetries = 2, retryDelay = 1000 } = options;

    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const base64version = await convertToBase64(imageInput);

            // Validate base64 size before sending
            const sizeInMB = (base64version.length * 0.75) / (1024 * 1024);
            if (sizeInMB > 15) {
                throw new Error(`Image size (${sizeInMB.toFixed(2)}MB) exceeds maximum of 15MB`);
            }

            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({ image: base64version }),
            };

            const response = await fetch("/api/scan", requestOptions);

            // Handle rate limiting
            if (response.status === 429) {
                const retryAfter = parseInt(response.headers.get("Retry-After") || "5");
                throw new Error(`Rate limited. Please wait ${retryAfter} seconds.`);
            }

            const data = await response.json();

            if (response.ok) {
                const { ocrResponse, formattedString, data: additionalData, requestId } = data;

                // Log request ID for debugging
                console.debug("Scan completed", { requestId, ocrResponse });

                return [ocrResponse, formattedString, additionalData];
            } else {
                // Handle structured error response
                const errorMessage = data.error?.message || response.statusText;
                throw new Error(errorMessage);
            }
        } catch (error) {
            lastError = error;
            console.warn(`Scan attempt ${attempt + 1} failed:`, error.message);

            // Don't retry on validation errors or rate limits
            if (error.message.includes("size") || error.message.includes("Rate")) {
                break;
            }

            // Wait before retrying
            if (attempt < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
            }
        }
    }

    // All retries exhausted
    console.error("All scan attempts failed:", lastError?.message);
    return [null, lastError?.message || "Request failed"];
}

/**
 * Sends a batch scan request for multiple images.
 *
 * @param {FileList|Array<File>} imageInputs - Array of image files
 * @returns {Promise<Object>} Batch scan results
 */
async function sendBatchApiReq(imageInputs) {
    try {
        const images = await Promise.all(Array.from(imageInputs).map((file) => convertToBase64(file)));

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({ images }),
        };

        const response = await fetch("/api/scan/batch", requestOptions);
        const data = await response.json();

        if (response.ok) {
            return {
                success: true,
                ...data,
            };
        } else {
            return {
                success: false,
                error: data.error?.message || "Batch scan failed",
            };
        }
    } catch (error) {
        console.error("Batch scan error:", error);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Asynchronously converts a file to base64 encoding.
 * Includes validation and error handling.
 *
 * @param {File} file - The file to be converted
 * @returns {Promise<string>} Base64 encoded string with data URI prefix
 */
async function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
            reject(new Error("Invalid file type. Please select an image file."));
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const base64String = reader.result.split(",")[1];
            resolve(`data:${file.type};base64,` + base64String);
        };

        reader.onerror = (error) => {
            reject(new Error("Failed to read file: " + error.message));
        };

        reader.onabort = () => {
            reject(new Error("File reading was aborted"));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Checks the API health status.
 *
 * @returns {Promise<Object>} Health status
 */
async function checkApiHealth() {
    try {
        const response = await fetch("/api/health");
        return await response.json();
    } catch (error) {
        return {
            status: "unreachable",
            error: error.message,
        };
    }
}
