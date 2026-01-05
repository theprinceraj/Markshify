/**
 * Displays the OCR response in the specified output element.
 * Shows detailed feedback based on response status.
 *
 * @param {string} ocrString - The OCR status response ('Success', 'Error', etc.)
 * @param {string} formattedString - The formatted OCR result or error message
 * @param {Object} additionalData - Additional metadata from the response
 * @returns {void}
 */
function displayOcrResponse(ocrString, formattedString, additionalData = null) {
    if (!ocrString) {
        showNotification(
            "error",
            "An error occurred. Please check that you have uploaded the correct file and that it is clear."
        );
        return;
    }

    if (ocrString === "Success") {
        console.log("Scan successful:", formattedString);

        // Log detailed data if available
        if (additionalData) {
            console.log("Student:", additionalData.student?.name);
            console.log("Registration:", additionalData.student?.registrationNumber);
            console.log("Semester:", additionalData.student?.semester);
            console.log("Confidence:", additionalData.meta?.avgConfidence + "%");
            console.log("Records uploaded:", additionalData.meta?.recordsUploaded);
            console.log("Records skipped:", additionalData.meta?.recordsSkipped);
            console.log("Processing time:", additionalData.meta?.processingTimeMs + "ms");
        }

        // Build detailed success message
        let message = "✅ Scan Completed Successfully!\n\n";

        if (additionalData) {
            const student = additionalData.student;
            const meta = additionalData.meta;
            const subjects = additionalData.subjects;

            message += `📋 STUDENT DETAILS\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n`;
            message += `Name: ${student?.name || "N/A"}\n`;
            message += `Reg. No: ${student?.registrationNumber || "N/A"}\n`;
            message += `Course: ${student?.course || "N/A"}\n`;
            message += `Semester: ${student?.semester || "N/A"}\n`;
            message += `SGPA: ${student?.sgpa || "N/A"} | CGPA: ${student?.cgpa || "N/A"}\n\n`;

            message += `📊 PROCESSING STATS\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n`;
            message += `OCR Confidence: ${meta?.avgConfidence?.toFixed(1) || "N/A"}%\n`;
            message += `Processing Time: ${meta?.processingTimeMs || "N/A"}ms\n`;
            message += `Records Uploaded: ${meta?.recordsUploaded || 0}\n`;
            message += `Records Skipped: ${meta?.recordsSkipped || 0} (duplicates)\n\n`;

            if (subjects) {
                const theoryCount = subjects.theory?.length || 0;
                const practicalCount = subjects.practical?.length || 0;
                message += `📚 SUBJECTS EXTRACTED\n`;
                message += `━━━━━━━━━━━━━━━━━━━━\n`;
                message += `Theory: ${theoryCount} | Practical: ${practicalCount}\n`;
            }
        } else {
            message += "Marksheet processed successfully!";
        }

        showNotification("success", message);

        // Turn the "Get CSV" button green to indicate data is ready
        highlightGetCsvButton();
    } else if (ocrString === "Error") {
        console.warn("Scan error:", formattedString);
        showNotification("warning", formattedString || "Unable to process the image.");
    } else {
        console.log("OCR Response:", ocrString, ":", formattedString);
    }
}

/**
 * Highlights the "Get CSV" button to indicate data is ready for download.
 */
function highlightGetCsvButton() {
    const getCsvBtn = document.querySelector('a[href="/api/generate"]');
    if (getCsvBtn) {
        getCsvBtn.style.backgroundColor = "#22c55e"; // Green color
        getCsvBtn.style.borderColor = "#16a34a";
        getCsvBtn.style.transition = "background-color 0.3s ease";
        getCsvBtn.classList.add("csv-ready");

        // Add a subtle pulse animation
        getCsvBtn.style.animation = "pulse-green 2s ease-in-out 3";
    }
}

/**
 * Shows a notification to the user.
 *
 * @param {string} type - Notification type ('success', 'error', 'warning', 'info')
 * @param {string} message - Message to display
 */
function showNotification(type, message) {
    // For now, use alert to maintain existing UI behavior
    // This can be enhanced with a toast library without changing UI
    alert(message);

    console.log(`[${type.toUpperCase()}]`, message);
}

/**
 * Displays batch processing results.
 *
 * @param {Object} results - Batch processing results
 */
function displayBatchResults(results) {
    if (!results || !results.summary) {
        showNotification("error", "Failed to process batch request.");
        return;
    }

    const { summary, results: itemResults } = results;

    console.log("Batch processing completed:");
    console.log(`  Total: ${summary.total}`);
    console.log(`  Successful: ${summary.successful}`);
    console.log(`  Failed: ${summary.failed}`);
    console.log(`  Records uploaded: ${summary.recordsUploaded}`);
    console.log(`  Records skipped: ${summary.recordsSkipped}`);
    console.log(`  Processing time: ${summary.processingTimeMs}ms`);

    const message =
        `Processed ${summary.successful} of ${summary.total} images. ` + `${summary.recordsUploaded} records uploaded.`;

    showNotification(summary.failed === 0 ? "success" : "warning", message);

    // Log individual results
    itemResults.forEach((result, index) => {
        if (result.success) {
            console.log(`  [${index}] ✓ ${result.studentName} (${result.registrationNumber})`);
        } else {
            console.log(`  [${index}] ✗ ${result.error}`);
        }
    });
}
