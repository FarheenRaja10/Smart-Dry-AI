// Helper function to load an image from a base64 string
function loadImage(base64Image: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = base64Image;
  });
}

// Calculates the variance of an array of numbers
function getVariance(data: number[]): number {
  if (data.length === 0) return 0;
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  return data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
}

/**
 * Checks the quality of a base64 encoded image.
 * @param base64Image The image data.
 * @returns A promise that resolves to an object indicating if the quality is good and a message.
 */
export async function checkImageQuality(base64Image: string): Promise<{ isGood: boolean; message: string }> {
  const MIN_RESOLUTION = 300; // Minimum width and height
  const MAX_ASPECT_RATIO = 2.0; // Corresponds to a 2:1 landscape ratio
  const MIN_ASPECT_RATIO = 0.5; // Corresponds to a 1:2 portrait ratio
  const BRIGHTNESS_DARK_THRESHOLD = 70;
  const BRIGHTNESS_BRIGHT_THRESHOLD = 185;
  const CLIPPED_PERCENT_THRESHOLD = 20; // % of pixels that are pure black or white
  const BLUR_THRESHOLD = 100; // Laplacian variance threshold, lower is more blurry.

  try {
    const img = await loadImage(base64Image);

    // 1. Check Resolution
    if (img.width < MIN_RESOLUTION || img.height < MIN_RESOLUTION) {
      return { isGood: false, message: `Image resolution is too low (${img.width}x${img.height}). Please provide a clearer, higher-quality photo of at least ${MIN_RESOLUTION}x${MIN_RESOLUTION} pixels.` };
    }

    // 2. Check Aspect Ratio for unusual shapes
    const aspectRatio = img.width / img.height;
    if (aspectRatio > MAX_ASPECT_RATIO) {
      return { isGood: false, message: 'Image is too wide (panoramic). Please use a standard photo shape, like 4:3 or 16:9.' };
    }
    if (aspectRatio < MIN_ASPECT_RATIO) {
        return { isGood: false, message: 'Image is too tall and narrow. Please use a standard photo shape, like 3:4 or 9:16.' };
    }
    
    const canvas = document.createElement('canvas');
    // The willReadFrequently option is a performance hint for the browser.
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) {
      // If canvas is not supported, we can't check, so we assume it's good.
      return { isGood: true, message: '' };
    }

    // Resize for performance. A smaller image is faster to process for quality checks.
    const MAX_WIDTH = 300;
    const scale = MAX_WIDTH / img.width;
    canvas.width = MAX_WIDTH;
    canvas.height = img.height * scale;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const laplacianData: number[] = [];
    let totalBrightness = 0;
    let darkPixels = 0;
    let brightPixels = 0;
    const pixelCount = data.length / 4;

    // Create a grayscale representation for blur detection
    const grayscaleData = new Uint8ClampedArray(pixelCount);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;

      if (brightness < 10) darkPixels++;
      if (brightness > 245) brightPixels++;
      
      const grayscale = r * 0.299 + g * 0.587 + b * 0.114;
      grayscaleData[i / 4] = grayscale;
    }

    // 3. Enhanced Brightness Check
    const avgBrightness = totalBrightness / pixelCount;
    if (avgBrightness < BRIGHTNESS_DARK_THRESHOLD) {
      const darkPercent = (darkPixels / pixelCount) * 100;
      if (darkPercent > CLIPPED_PERCENT_THRESHOLD) {
        return { isGood: false, message: 'Large parts of the image are completely black. Check for shadows or underexposure.' };
      }
      return { isGood: false, message: 'Image is too dark. Please use better lighting and try again.' };
    }
    if (avgBrightness > BRIGHTNESS_BRIGHT_THRESHOLD) {
        const brightPercent = (brightPixels / pixelCount) * 100;
        if (brightPercent > CLIPPED_PERCENT_THRESHOLD) {
            return { isGood: false, message: 'Image has overexposed areas that are pure white. Check for glare or direct light.' };
        }
      return { isGood: false, message: 'Image is too bright. Please avoid glare and try again.' };
    }
    
    // 4. Check for Blurriness using Laplacian variance
    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        const i = y * canvas.width + x;
        // The Laplacian operator is an edge detector, useful for finding sharpness
        const laplacian = 
          grayscaleData[i + canvas.width] + 
          grayscaleData[i - canvas.width] + 
          grayscaleData[i + 1] + 
          grayscaleData[i - 1] -
          4 * grayscaleData[i];
        
        laplacianData.push(laplacian);
      }
    }
    
    const blurVariance = getVariance(laplacianData);
    if (blurVariance < BLUR_THRESHOLD) {
      return { isGood: false, message: 'Image appears blurry. Please hold steady and try again.' };
    }

    return { isGood: true, message: '' };

  } catch (error) {
    console.error("Error checking image quality:", error);
    // If something goes wrong, assume the image is fine to not block the user.
    return { isGood: true, message: '' };
  }
}