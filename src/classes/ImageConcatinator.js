/**
 * The ImageConcatinator class provides functionality to handle image uploads,
 * display them as thumbnails, and concatenate them into a single image on a canvas.
 * It offers methods to remove individual images, download the resulting concatenated image,
 * and manage its internal state based on user interactions.
 */
class ImageConcatinator {
    
    /**
     * @property {Image[]} selectedImages - Array holding the currently selected images.
     * @property {HTMLInputElement} fileInput - Reference to the file input element.
     * @property {HTMLButtonElement} concatenateButton - Reference to the button that triggers image concatenation.
     * @property {HTMLDivElement} imageContainer - Container where image thumbnails are displayed.
     * @property {HTMLCanvasElement} canvas - Canvas element used to combine selected images.
     */
    constructor() {
        this.selectedImages = [];
        this.fileInput = document.querySelector('#image-input');
        this.concatenateButton = document.querySelector('#concatenate-button');
        this.imageContainer = document.querySelector('#image-container');
        this.canvas = document.querySelector('#output-canvas');
        // Add an event listener to the file input to handle image selection
        this.fileInput.addEventListener('change', () => {
            this.handleImageChange();
        });
        //listener for submission
        this.concatenateButton.addEventListener('click', () => {
            this.doImageConcatination();
        });
    }

    /**
     * Combines multiple images into a single image.
     * @param {Image} images An array of Image objects to combine.
     * @returns {string} A data URL representing the combined image.
     */
    combineImages(images) {
        const { canvas } = this;
        const context = canvas.getContext('2d');
        let width = 0;
        let height = 0;
        const count = images.length;
        for (let index = 0; index < count; index++) {
            const image = images[index];
            width = Math.max(width, image.naturalWidth);
            height += image.naturalHeight;
        }
        canvas.width = width;
        canvas.height = height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Draw each image onto the canvas in sequence, maintaining their original quality
        let offsetY = 0; // Y-offset to position images vertically
        for (let index = 0; index < count; index++) {
            const image = images[index];
            context.drawImage(image, 0, offsetY, image.naturalWidth, image.naturalHeight);
            offsetY += image.naturalHeight;
        }
        return canvas.toDataURL('image/png');
    }

    /**
     * Fired when the user clicks the "Concatenate" button.
     * @returns {void}
     */
    doImageConcatination() {
        if (this.selectedImages.length === 0) {
            alert('Please upload at least one image.');
            return;
        }
        const dataUrl = this.combineImages(this.selectedImages);
        this.downloadImage(dataUrl);
        this.selectedImages.length = 0;
        this.concatenateButton.classList.add('hidden');
        removeAllChildren(this.imageContainer);
    }

    /**
     * Downloads an image from a data URL.
     * @param {string} dataUrl The data URL of the image to download.
     * @param {boolean} [cleanup=true] Whether to revoke the data URL after download.
     */
    downloadImage(dataUrl, cleanup = true) {
        const downloadLink = document.createElement('a');
        downloadLink.href = dataUrl;
        downloadLink.setAttribute('download', 'combined_image.png');
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        if (cleanup) {
            URL.revokeObjectURL(dataUrl);
        }
    }

    /**
     * Updates the user interface to display the selected images as thumbnails.
     */
    handleImageChange() {
        removeAllChildren(this.imageContainer);
        const fileCount = this.fileInput.files.length;
        for (let index = 0; index < fileCount; index++) {
            const file = this.fileInput.files[index];
            const image = new Image();
            image.onload = () => {
                const thumbnail = document.createElement('div');
                thumbnail.classList.add('thumbnail');
                thumbnail.appendChild(image);
                // Create a delete button for each thumbnail for easy removal
                const deleteButton = document.createElement('button');
                deleteButton.textContent = '\u2716'; // ✖
                deleteButton.addEventListener('click', () => {
                    // Remove the image from the selectedImages array
                    this.selectedImages.splice(this.selectedImages.indexOf(image), 1);
                    // Hide concat button if no images
                    if (this.selectedImages.length === 0) {
                        this.concatenateButton.classList.add('hidden');
                    }
                    // Remove the thumbnail element from the DOM
                    thumbnail.remove();
                });
                thumbnail.appendChild(deleteButton);
                this.imageContainer.appendChild(thumbnail);
                this.selectedImages.push(image);
            };
            image.src = URL.createObjectURL(file);
        }
        this.concatenateButton.classList.remove('hidden');
        //concatenateButton.style.display = 'flex'
    }
}

/*
 * Code Snippets preserved for reference
 */
// async function loadImages(images) {
//     // Return a Promise that resolves when all images are loaded and converted to Blob URLs
//     return Promise.all(images.map((img) => new Promise((resolve) => {
//         const canvas = document.createElement('canvas'); // Create a temporary canvas element
//         const ctx = canvas.getContext('2d'); // Get the 2D drawing context
//         canvas.width = img.naturalWidth; // Set canvas width to the natural width of the image
//         canvas.height = img.naturalHeight; // Set canvas height to the natural height of the image
//         ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight); // Draw the image onto the canvas
//         // Convert the canvas image to a Blob and create a URL from it
//         canvas.toBlob((blob) => {
//             resolve(URL.createObjectURL(blob)); // Resolve the Promise with the Blob URL
//         }, 'image/png'); // Specify the image format as PNG
//     })));
// }

// function loadImage(file) {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader(); // Create a new FileReader to read the file
//         reader.onload = function (event) {
//             const img = new Image(); // Create a new Image object
//             img.onload = () => resolve(img); // Resolve the Promise with the image once loaded
//             img.src = event.target.result; // Set the image source to the file data
//         };
//         reader.onerror = reject; // Reject the Promise if there's an error
//         reader.readAsDataURL(file); // Read the file as a data URL
//     });
// }
