/**
 * Utility to preprocess screenshots using an offscreen HTML5 Canvas.
 * Upscales the image by 2x and applies high-contrast filters to maximize Tesseract OCR accuracy.
 */
export async function preprocessImage(imageFile: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(imageFile); // Fallback if canvas context is not supported
            return;
          }

          // 1. Upscale by 2x to make small in-game text much more legible for OCR
          const scale = 2.0;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          // Disable smoothing to prevent blurring of text edges when scaling
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Get image pixel data
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          // 2. Grayscale, Contrast Stretching and Adaptive Thresholding
          // Wurm Online windows are extremely dark (R,G,B < 40) with light golden/beige/white text (R,G,B > 100).
          // We can use a simple threshold to binarize (black and white) the text for optimal OCR.
          const threshold = 75; // Golden/white text will easily be above 75, dark background will be below

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Standard luminance weights for grayscale conversion
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;

            // Binarization: set to pure white text on black background
            const val = gray > threshold ? 255 : 0;

            data[i] = val;     // Red
            data[i + 1] = val; // Green
            data[i + 2] = val; // Blue
            // Alpha (data[i+3]) is kept untouched (255)
          }

          // Write pixels back to canvas
          ctx.putImageData(imgData, 0, 0);

          // Convert canvas content back to a File
          canvas.toBlob((blob) => {
            if (blob) {
              const processedFile = new File([blob], `preprocessed_${imageFile.name}`, {
                type: 'image/png',
                lastModified: Date.now(),
              });
              resolve(processedFile);
            } else {
              resolve(imageFile); // Fallback on blob conversion error
            }
          }, 'image/png');
        } catch (err) {
          console.error('[Preprocess] Error during canvas manipulation:', err);
          resolve(imageFile); // Fallback on canvas error
        }
      };
      img.onerror = () => {
        resolve(imageFile); // Fallback on image load error
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      resolve(imageFile); // Fallback on reader error
    };
    reader.readAsDataURL(imageFile);
  });
}
