// Variables for frame resize controls
let cssFilePath = 'Home Style.css';
let cssContent = '';
let isLocalFileSystem = window.location.protocol === 'file:';

// Default aspect ratios
const defaultRatios = {
    lg: { horizontal: '16/9', vertical: '9/16' },
    md: { horizontal: '4/3', vertical: '4/3' },
    sm: { horizontal: '1/1', vertical: '1/1' },
    xs: { horizontal: '3/2', vertical: '2/3' }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Setup frame resize controls
    setupFrameResizeControls();

    // Check if we're running from local file system
    if (isLocalFileSystem) {
        showLocalFileSystemMessage();
    }

    // Load current CSS values
    loadCurrentCSSValues();
});

// Function to show a message when running from local file system
function showLocalFileSystemMessage() {
    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.className = 'alert alert-warning';
    messageContainer.style.margin = '20px';
    messageContainer.innerHTML = `
        <h4 class="alert-heading">Local File System Detected</h4>
        <p>You are running this page directly from your file system. Due to browser security restrictions, 
        the automatic loading and saving of CSS files won't work.</p>
        <hr>
        <p class="mb-0">To use all features, please:</p>
        <ul>
            <li>Use a local web server (like XAMPP, MAMP, or VS Code's Live Server)</li>
            <li>Or use the "Download CSS" button to save your changes manually</li>
        </ul>
    `;

    // Add to the page
    document.querySelector('.container').prepend(messageContainer);

    // Add download button to all control sections
    const devSection = document.querySelector('.dev-section');
    const downloadBtn = document.createElement('button');
    downloadBtn.id = 'downloadCSS';
    downloadBtn.className = 'btn btn-primary mt-3';
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download CSS';
    downloadBtn.onclick = downloadCSSFile;

    // Add after the reset button
    const resetBtn = document.getElementById('resetDefaults');
    if (resetBtn && resetBtn.parentNode) {
        resetBtn.parentNode.insertBefore(downloadBtn, resetBtn.nextSibling);
    } else {
        devSection.appendChild(downloadBtn);
    }
}

// Function to load current CSS values from the CSS file
async function loadCurrentCSSValues() {
    try {
        if (isLocalFileSystem) {
            // When running locally, use default values
            console.log('Running from local file system. Using default CSS values.');

            // Create a basic CSS template with default values
            cssContent = `:root {
    --horizontal-aspect-ratio: 16/9;
    --vertical-aspect-ratio: 9/16;
    --horizontal-aspect-ratio-lg: 16/9;
    --vertical-aspect-ratio-lg: 9/16;
    --horizontal-aspect-ratio-md: 4/3;
    --vertical-aspect-ratio-md: 4/3;
    --horizontal-aspect-ratio-sm: 1/1;
    --vertical-aspect-ratio-sm: 1/1;
    --horizontal-aspect-ratio-xs: 3/2;
    --vertical-aspect-ratio-xs: 2/3;
}`;

            // Extract current values from CSS content and update input fields
            updateInputFieldsFromCSS(cssContent);
        } else {
            // When running on a server, fetch the CSS file
            const response = await fetch(cssFilePath);
            if (!response.ok) {
                throw new Error(`Failed to load CSS file: ${response.status} ${response.statusText}`);
            }

            cssContent = await response.text();

            // Extract current values from CSS content and update input fields
            updateInputFieldsFromCSS(cssContent);
        }
    } catch (error) {
        console.error('Error loading CSS file:', error);

        // If there's an error, still use default values
        if (!cssContent) {
            cssContent = `:root {
    --horizontal-aspect-ratio: 16/9;
    --vertical-aspect-ratio: 9/16;
    --horizontal-aspect-ratio-lg: 16/9;
    --vertical-aspect-ratio-lg: 9/16;
    --horizontal-aspect-ratio-md: 4/3;
    --vertical-aspect-ratio-md: 4/3;
    --horizontal-aspect-ratio-sm: 1/1;
    --vertical-aspect-ratio-sm: 1/1;
    --horizontal-aspect-ratio-xs: 3/2;
    --vertical-aspect-ratio-xs: 2/3;
}`;
            updateInputFieldsFromCSS(cssContent);
        }
    }
}

// Function to extract CSS variable values and update input fields
function updateInputFieldsFromCSS(css) {
    // Extract values for each breakpoint
    const breakpoints = ['lg', 'md', 'sm', 'xs'];
    const currentBreakpoint = document.getElementById('breakpointSelect').value;

    // Update input fields based on the selected breakpoint
    if (currentBreakpoint === 'all' || currentBreakpoint === 'lg') {
        // Extract horizontal aspect ratio
        const horizontalMatch = css.match(/--horizontal-aspect-ratio-lg:\s*(\d+)\/(\d+)/);
        if (horizontalMatch) {
            document.getElementById('horizontalWidth').value = horizontalMatch[1];
            document.getElementById('horizontalHeight').value = horizontalMatch[2];
        }

        // Extract vertical aspect ratio
        const verticalMatch = css.match(/--vertical-aspect-ratio-lg:\s*(\d+)\/(\d+)/);
        if (verticalMatch) {
            document.getElementById('verticalWidth').value = verticalMatch[1];
            document.getElementById('verticalHeight').value = verticalMatch[2];
        }
    } else {
        // Extract values for the selected breakpoint
        const horizontalMatch = css.match(new RegExp(`--horizontal-aspect-ratio-${currentBreakpoint}:\\s*(\\d+)\\/(\\d+)`));
        if (horizontalMatch) {
            document.getElementById('horizontalWidth').value = horizontalMatch[1];
            document.getElementById('horizontalHeight').value = horizontalMatch[2];
        }

        const verticalMatch = css.match(new RegExp(`--vertical-aspect-ratio-${currentBreakpoint}:\\s*(\\d+)\\/(\\d+)`));
        if (verticalMatch) {
            document.getElementById('verticalWidth').value = verticalMatch[1];
            document.getElementById('verticalHeight').value = verticalMatch[2];
        }
    }

    // Update preview frames
    updatePreviewFrames();
}

// Function to update preview frames
function updatePreviewFrames() {
    const horizontalRatio = document.getElementById('horizontalWidth').value + '/' + document.getElementById('horizontalHeight').value;
    const verticalRatio = document.getElementById('verticalWidth').value + '/' + document.getElementById('verticalHeight').value;

    // Update preview frames
    const horizontalFrame = document.querySelector('.photo-card.horizontal');
    const verticalFrame = document.querySelector('.photo-card.vertical');

    if (horizontalFrame) {
        horizontalFrame.style.aspectRatio = horizontalRatio;
    }

    if (verticalFrame) {
        verticalFrame.style.aspectRatio = verticalRatio;
    }
}

// Setup frame resize controls
function setupFrameResizeControls() {
    const applyHorizontalBtn = document.getElementById('applyHorizontal');
    const applyVerticalBtn = document.getElementById('applyVertical');
    const applyAllBtn = document.getElementById('applyAllChanges');
    const resetBtn = document.getElementById('resetDefaults');
    const breakpointSelect = document.getElementById('breakpointSelect');

    // Apply horizontal aspect ratio
    applyHorizontalBtn.addEventListener('click', function() {
        const width = document.getElementById('horizontalWidth').value;
        const height = document.getElementById('horizontalHeight').value;
        const breakpoint = document.getElementById('breakpointSelect').value;

        if (width > 0 && height > 0) {
            const ratio = `${width}/${height}`;

            if (breakpoint === 'all') {
                updateCSSFile(ratio, document.getElementById('verticalWidth').value + '/' + document.getElementById('verticalHeight').value, 'all');
            } else {
                // Only update horizontal frames for the selected breakpoint
                updateCSSFile(ratio, null, breakpoint, 'horizontal');
            }

            // Update preview
            updatePreviewFrames();
        }
    });

    // Apply vertical aspect ratio
    applyVerticalBtn.addEventListener('click', function() {
        const width = document.getElementById('verticalWidth').value;
        const height = document.getElementById('verticalHeight').value;
        const breakpoint = document.getElementById('breakpointSelect').value;

        if (width > 0 && height > 0) {
            const ratio = `${width}/${height}`;

            if (breakpoint === 'all') {
                updateCSSFile(document.getElementById('horizontalWidth').value + '/' + document.getElementById('horizontalHeight').value, ratio, 'all');
            } else {
                // Only update vertical frames for the selected breakpoint
                updateCSSFile(null, ratio, breakpoint, 'vertical');
            }

            // Update preview
            updatePreviewFrames();
        }
    });

    // Apply all changes
    applyAllBtn.addEventListener('click', function() {
        const horizontalRatio = document.getElementById('horizontalWidth').value + '/' + document.getElementById('horizontalHeight').value;
        const verticalRatio = document.getElementById('verticalWidth').value + '/' + document.getElementById('verticalHeight').value;
        const breakpoint = document.getElementById('breakpointSelect').value;

        updateCSSFile(horizontalRatio, verticalRatio, breakpoint);

        // Update preview
        updatePreviewFrames();
    });

    // Reset to defaults
    resetBtn.addEventListener('click', function() {
        const breakpoint = document.getElementById('breakpointSelect').value;

        if (breakpoint === 'all') {
            // Reset all breakpoints
            Object.keys(defaultRatios).forEach(bp => {
                updateCSSFile(defaultRatios[bp].horizontal, defaultRatios[bp].vertical, bp);
            });
        } else {
            // Reset only the selected breakpoint
            updateCSSFile(defaultRatios[breakpoint].horizontal, defaultRatios[breakpoint].vertical, breakpoint);
        }

        // Update input fields to match defaults
        if (breakpoint === 'all' || breakpoint === 'lg') {
            document.getElementById('horizontalWidth').value = 16;
            document.getElementById('horizontalHeight').value = 9;
            document.getElementById('verticalWidth').value = 9;
            document.getElementById('verticalHeight').value = 16;
        } else if (breakpoint === 'md') {
            document.getElementById('horizontalWidth').value = 4;
            document.getElementById('horizontalHeight').value = 3;
            document.getElementById('verticalWidth').value = 4;
            document.getElementById('verticalHeight').value = 3;
        } else if (breakpoint === 'sm') {
            document.getElementById('horizontalWidth').value = 1;
            document.getElementById('horizontalHeight').value = 1;
            document.getElementById('verticalWidth').value = 1;
            document.getElementById('verticalHeight').value = 1;
        } else if (breakpoint === 'xs') {
            document.getElementById('horizontalWidth').value = 3;
            document.getElementById('horizontalHeight').value = 2;
            document.getElementById('verticalWidth').value = 2;
            document.getElementById('verticalHeight').value = 3;
        }

        // Update preview
        updatePreviewFrames();
    });

    // Update input fields when breakpoint changes
    breakpointSelect.addEventListener('change', function() {
        loadCurrentCSSValues();
    });
}

// Function to update CSS file with new aspect ratios
async function updateCSSFile(horizontalRatio, verticalRatio, breakpoint = 'lg', frameType = 'both') {
    if (!cssContent) {
        await loadCurrentCSSValues();
    }

    let updatedCSS = cssContent;

    // Update CSS variables based on the breakpoint and frame type
    if (breakpoint === 'lg' || breakpoint === 'all') {
        if (horizontalRatio && (frameType === 'both' || frameType === 'horizontal')) {
            // Update main horizontal aspect ratio
            updatedCSS = updatedCSS.replace(
                /--horizontal-aspect-ratio:\s*[^;]+;/,
                `--horizontal-aspect-ratio: ${horizontalRatio};`
            );

            // Update lg horizontal aspect ratio
            updatedCSS = updatedCSS.replace(
                /--horizontal-aspect-ratio-lg:\s*[^;]+;/,
                `--horizontal-aspect-ratio-lg: ${horizontalRatio};`
            );
        }

        if (verticalRatio && (frameType === 'both' || frameType === 'vertical')) {
            // Update main vertical aspect ratio
            updatedCSS = updatedCSS.replace(
                /--vertical-aspect-ratio:\s*[^;]+;/,
                `--vertical-aspect-ratio: ${verticalRatio};`
            );

            // Update lg vertical aspect ratio
            updatedCSS = updatedCSS.replace(
                /--vertical-aspect-ratio-lg:\s*[^;]+;/,
                `--vertical-aspect-ratio-lg: ${verticalRatio};`
            );
        }
    }

    if ((breakpoint === 'md' || breakpoint === 'all') && breakpoint !== 'lg') {
        if (horizontalRatio && (frameType === 'both' || frameType === 'horizontal')) {
            updatedCSS = updatedCSS.replace(
                /--horizontal-aspect-ratio-md:\s*[^;]+;/,
                `--horizontal-aspect-ratio-md: ${horizontalRatio};`
            );
        }

        if (verticalRatio && (frameType === 'both' || frameType === 'vertical')) {
            updatedCSS = updatedCSS.replace(
                /--vertical-aspect-ratio-md:\s*[^;]+;/,
                `--vertical-aspect-ratio-md: ${verticalRatio};`
            );
        }
    }

    if ((breakpoint === 'sm' || breakpoint === 'all') && breakpoint !== 'lg') {
        if (horizontalRatio && (frameType === 'both' || frameType === 'horizontal')) {
            updatedCSS = updatedCSS.replace(
                /--horizontal-aspect-ratio-sm:\s*[^;]+;/,
                `--horizontal-aspect-ratio-sm: ${horizontalRatio};`
            );
        }

        if (verticalRatio && (frameType === 'both' || frameType === 'vertical')) {
            updatedCSS = updatedCSS.replace(
                /--vertical-aspect-ratio-sm:\s*[^;]+;/,
                `--vertical-aspect-ratio-sm: ${verticalRatio};`
            );
        }
    }

    if ((breakpoint === 'xs' || breakpoint === 'all') && breakpoint !== 'lg') {
        if (horizontalRatio && (frameType === 'both' || frameType === 'horizontal')) {
            updatedCSS = updatedCSS.replace(
                /--horizontal-aspect-ratio-xs:\s*[^;]+;/,
                `--horizontal-aspect-ratio-xs: ${horizontalRatio};`
            );
        }

        if (verticalRatio && (frameType === 'both' || frameType === 'vertical')) {
            updatedCSS = updatedCSS.replace(
                /--vertical-aspect-ratio-xs:\s*[^;]+;/,
                `--vertical-aspect-ratio-xs: ${verticalRatio};`
            );
        }
    }

    // Update local variable
    cssContent = updatedCSS;

    // If running locally, just update the preview and show a message
    if (isLocalFileSystem) {
        // Show success message
        const successMessage = document.getElementById('saveSuccess');
        if (successMessage) {
            successMessage.innerHTML = 'Changes applied to preview. Use "Download CSS" to save your changes.';
            successMessage.style.display = 'block';

            // Hide success message after 3 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
        } else {
            alert('Changes applied to preview. Use "Download CSS" to save your changes.');
        }

        return true;
    }

    // If running on a server, try to save the file
    try {
        // Send the updated CSS to the server
        const response = await fetch('save-css.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ css: updatedCSS, path: cssFilePath }),
        });

        const result = await response.json();

        if (result.success) {
            // Show success message
            const successMessage = document.getElementById('saveSuccess');
            successMessage.style.display = 'block';

            // Hide success message after 3 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);

            console.log('CSS file updated successfully');
            return true;
        } else {
            console.error('Error saving CSS file:', result.message);
            alert('Error saving changes: ' + result.message);
            return false;
        }
    } catch (error) {
        console.error('Error updating CSS file:', error);
        alert('Error saving changes. Please try again.');
        return false;
    }
}

// Function to download the CSS file
function downloadCSSFile() {
    // Create a blob with the CSS content
    const blob = new Blob([cssContent], { type: 'text/css' });

    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = cssFilePath;

    // Append to the body, click, and remove
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Show a message
    alert('CSS file downloaded. Please replace the original file with this downloaded file.');
}
