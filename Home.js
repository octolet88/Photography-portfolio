// Variables for scroll functionality
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');
const scrollThreshold = 10; // Minimum scroll amount to trigger navbar visibility change
const transitionElement = document.querySelector('.transition-element');
const mainContent = document.querySelector('.main-content');
const gallerySection = document.querySelector('.gallery-section');
const photoCards = document.querySelectorAll('.photo-card');
let animationTriggered = false;

// Function to check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
    );
}

// Handle image loading and proper sizing
function setupImageHandling() {
    const images = document.querySelectorAll('.photo-img');
    const photoCards = document.querySelectorAll('.photo-card');

    // Handle image loading
    images.forEach(img => {
        // Handle image load event
        img.addEventListener('load', function() {
            const container = this.closest('.photo-card');

            // Hide placeholder text when image is loaded
            if (container) {
                const placeholder = container.querySelector('.placeholder-text');
                if (placeholder && this.src) {
                    placeholder.style.display = 'none';
                }
            }

            // Add loaded class
            this.classList.add('loaded');
        });

        // If image is already loaded (from cache)
        if (img.complete && img.src) {
            img.dispatchEvent(new Event('load'));
        }
    });

    // Setup drag and drop for easy image uploading
    photoCards.forEach(card => {
        card.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });

        card.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });

        card.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');

            // Handle dropped files
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];

                // Check if it's an image
                if (file.type.match('image.*')) {
                    const reader = new FileReader();
                    const img = this.querySelector('img');

                    reader.onload = function(e) {
                        img.src = e.target.result;
                        img.dispatchEvent(new Event('load'));
                    };

                    reader.readAsDataURL(file);
                }
            }
        });

        // Also add click to select file functionality
        card.addEventListener('click', function() {
            const img = this.querySelector('img');
            if (!img.src || img.src === window.location.href) {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';

                input.onchange = function() {
                    if (this.files && this.files[0]) {
                        const reader = new FileReader();

                        reader.onload = function(e) {
                            img.src = e.target.result;
                            img.dispatchEvent(new Event('load'));
                        };

                        reader.readAsDataURL(this.files[0]);
                    }
                };

                input.click();
            }
        });
    });
}

// Handle scroll events
window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Determine scroll direction and show/hide navbar
    if (scrollTop > lastScrollTop && scrollTop > 70) {
        // Scrolling down and past navbar height - hide navbar
        navbar.classList.add('hidden');
    } else if (scrollTop < lastScrollTop - scrollThreshold || scrollTop < 10) {
        // Scrolling up or near top - show navbar
        navbar.classList.remove('hidden');
    }

    // Trigger the wave animation when scrolling to the transition point
    const transitionPoint = mainContent.offsetHeight - (window.innerHeight / 2);

    if (scrollTop >= transitionPoint && !animationTriggered) {
        transitionElement.style.animationPlayState = 'running';
        animationTriggered = true;
    }

    // Add reveal class to photo cards when they come into view
    photoCards.forEach((card, index) => {
        if (isInViewport(card) && !card.classList.contains('reveal')) {
            // Add a slight delay based on the index for a cascade effect
            setTimeout(() => {
                card.classList.add('reveal');
            }, index * 100);
        }
    });

    // Parallax effect for hero background
    if (scrollTop < mainContent.offsetHeight) {
        const yPos = -(scrollTop * 0.3);
        mainContent.style.backgroundPositionY = yPos + 'px';
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For mobile or negative scrolling
}, false);

// Initial state - show navbar
document.addEventListener('DOMContentLoaded', function() {
    navbar.classList.remove('hidden');

    // Setup image handling
    setupImageHandling();

    // Frame resize controls moved to DevTools.HTML
    // setupFrameResizeControls();

    // Trigger first visible frames
    setTimeout(() => {
        window.dispatchEvent(new Event('scroll'));
    }, 500);
});

// Setup frame resize controls
function setupFrameResizeControls() {
    const toggleButton = document.getElementById('toggleResizeControls');
    const controlPanel = document.getElementById('resizeControlPanel');
    const applyHorizontalBtn = document.getElementById('applyHorizontal');
    const applyVerticalBtn = document.getElementById('applyVertical');
    const applyAllBtn = document.getElementById('applyAllChanges');
    const resetBtn = document.getElementById('resetDefaults');

    // Default aspect ratios
    const defaultRatios = {
        lg: { horizontal: '16/9', vertical: '9/16' },
        md: { horizontal: '4/3', vertical: '4/3' },
        sm: { horizontal: '1/1', vertical: '1/1' },
        xs: { horizontal: '3/2', vertical: '2/3' }
    };

    // Toggle control panel visibility
    toggleButton.addEventListener('click', function() {
        const isVisible = controlPanel.style.display !== 'none';
        controlPanel.style.display = isVisible ? 'none' : 'block';
    });

    // Apply horizontal aspect ratio
    applyHorizontalBtn.addEventListener('click', function() {
        const width = document.getElementById('horizontalWidth').value;
        const height = document.getElementById('horizontalHeight').value;
        const breakpoint = document.getElementById('breakpointSelect').value;

        if (width > 0 && height > 0) {
            const ratio = `${width}/${height}`;

            if (breakpoint === 'all') {
                resizeFrames(ratio, document.getElementById('verticalWidth').value + '/' + document.getElementById('verticalHeight').value, 'all');
            } else {
                // Only update horizontal frames for the selected breakpoint
                const root = document.documentElement;

                if (breakpoint === 'lg') {
                    root.style.setProperty('--horizontal-aspect-ratio', ratio);
                    root.style.setProperty('--horizontal-aspect-ratio-lg', ratio);
                } else {
                    root.style.setProperty('--horizontal-aspect-ratio-' + breakpoint, ratio);
                }

                updateMasonryLayout();
            }
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
                resizeFrames(document.getElementById('horizontalWidth').value + '/' + document.getElementById('horizontalHeight').value, ratio, 'all');
            } else {
                // Only update vertical frames for the selected breakpoint
                const root = document.documentElement;

                if (breakpoint === 'lg') {
                    root.style.setProperty('--vertical-aspect-ratio', ratio);
                    root.style.setProperty('--vertical-aspect-ratio-lg', ratio);
                } else {
                    root.style.setProperty('--vertical-aspect-ratio-' + breakpoint, ratio);
                }

                updateMasonryLayout();
            }
        }
    });

    // Apply all changes
    applyAllBtn.addEventListener('click', function() {
        const horizontalRatio = document.getElementById('horizontalWidth').value + '/' + document.getElementById('horizontalHeight').value;
        const verticalRatio = document.getElementById('verticalWidth').value + '/' + document.getElementById('verticalHeight').value;
        const breakpoint = document.getElementById('breakpointSelect').value;

        resizeFrames(horizontalRatio, verticalRatio, breakpoint);
    });

    // Reset to defaults
    resetBtn.addEventListener('click', function() {
        const breakpoint = document.getElementById('breakpointSelect').value;

        if (breakpoint === 'all') {
            // Reset all breakpoints
            Object.keys(defaultRatios).forEach(bp => {
                const root = document.documentElement;

                if (bp === 'lg') {
                    root.style.setProperty('--horizontal-aspect-ratio', defaultRatios[bp].horizontal);
                    root.style.setProperty('--vertical-aspect-ratio', defaultRatios[bp].vertical);
                }

                root.style.setProperty('--horizontal-aspect-ratio-' + bp, defaultRatios[bp].horizontal);
                root.style.setProperty('--vertical-aspect-ratio-' + bp, defaultRatios[bp].vertical);
            });
        } else {
            // Reset only the selected breakpoint
            const root = document.documentElement;

            if (breakpoint === 'lg') {
                root.style.setProperty('--horizontal-aspect-ratio', defaultRatios[breakpoint].horizontal);
                root.style.setProperty('--vertical-aspect-ratio', defaultRatios[breakpoint].vertical);
            }

            root.style.setProperty('--horizontal-aspect-ratio-' + breakpoint, defaultRatios[breakpoint].horizontal);
            root.style.setProperty('--vertical-aspect-ratio-' + breakpoint, defaultRatios[breakpoint].vertical);
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

        updateMasonryLayout();
    });

    // Update input fields when breakpoint changes
    document.getElementById('breakpointSelect').addEventListener('change', function() {
        const breakpoint = this.value;

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
    });
}

// Function to resize frames by adjusting CSS variables
function resizeFrames(horizontalRatio, verticalRatio, breakpoint = 'lg') {
    // Get the root element to modify CSS variables
    const root = document.documentElement;

    // Set the CSS variables based on the breakpoint
    if (breakpoint === 'lg' || breakpoint === 'all') {
        root.style.setProperty('--horizontal-aspect-ratio', horizontalRatio);
        root.style.setProperty('--vertical-aspect-ratio', verticalRatio);
        root.style.setProperty('--horizontal-aspect-ratio-lg', horizontalRatio);
        root.style.setProperty('--vertical-aspect-ratio-lg', verticalRatio);
    }

    if (breakpoint === 'md' || breakpoint === 'all') {
        root.style.setProperty('--horizontal-aspect-ratio-md', horizontalRatio);
        root.style.setProperty('--vertical-aspect-ratio-md', verticalRatio);
    }

    if (breakpoint === 'sm' || breakpoint === 'all') {
        root.style.setProperty('--horizontal-aspect-ratio-sm', horizontalRatio);
        root.style.setProperty('--vertical-aspect-ratio-sm', verticalRatio);
    }

    if (breakpoint === 'xs' || breakpoint === 'all') {
        root.style.setProperty('--horizontal-aspect-ratio-xs', horizontalRatio);
        root.style.setProperty('--vertical-aspect-ratio-xs', verticalRatio);
    }

    // Reinitialize masonry layout after resizing
    updateMasonryLayout();
}

// Function to resize a specific frame by ID or class
function resizeSpecificFrame(selector, newAspectRatio) {
    const frame = document.querySelector(selector);
    if (frame) {
        frame.style.aspectRatio = newAspectRatio;
    }
}

// Function to update the masonry layout
function updateMasonryLayout() {
    const masonryGrid = document.querySelector('.row[data-masonry]');
    if (masonryGrid && typeof Masonry !== 'undefined') {
        const masonry = new Masonry(masonryGrid, {
            percentPosition: true
        });
        masonry.layout();
    }
}

// Function to resize image to fit frame
function resizeImageToFit(img, frame) {
    if (!img || !frame) return;

    // Ensure the image covers the frame properly
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
}

// Handle window resize
window.addEventListener('resize', function() {
    // Recalculate positions on resize
    window.dispatchEvent(new Event('scroll'));

    // Resize all images to fit viewport on resize
    document.querySelectorAll('.photo-img.loaded').forEach(img => {
        const frame = img.closest('.photo-card');
        if (frame) {
            resizeImageToFit(img, frame);
        }
    });

    // Update masonry layout
    updateMasonryLayout();
});
