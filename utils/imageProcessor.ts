
export async function createPolaroid(
  imageSrc: string,
  caption: string
): Promise<string> {
  // Ensure fonts are actually loaded and ready
  try {
    await Promise.all([
      document.fonts.load('1em Doto'),
      document.fonts.load('1em "Reenie Beanie"'),
      document.fonts.ready
    ]);
  } catch (e) {
    console.warn("Font loading timeout or error:", e);
  }

  const loadAsset = async (url: string): Promise<HTMLImageElement | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Asset load failed for ${url}: ${response.status}`);
        return null;
      }
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject();
        img.src = URL.createObjectURL(blob);
      });
    } catch (e) {
      console.error(`Error loading asset ${url}:`, e);
      return null;
    }
  };

  const loadPhoto = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject();
      img.src = src;
    });
  };

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return imageSrc;

  try {
    const [frameImg, photoImg] = await Promise.all([
      loadAsset('./polaroid.png').catch(() => null),
      loadPhoto(imageSrc)
    ]);

    const hasFrame = !!frameImg;
    const W = hasFrame && frameImg ? frameImg.naturalWidth : 1200;
    const H = hasFrame && frameImg ? frameImg.naturalHeight : 1480;

    canvas.width = W;
    canvas.height = H;

    /**
     * CALIBRATED DIMENSIONS
     * Based on the polaroid.png asset, we use precise values to ensure
     * the photo fills the transparent area with zero gaps.
     */
    const sideMargin = W * 0.040;
    const topMargin = H * 0.040;
    const photoWidth = W * 0.92;
    const photoHeight = W * 0.92; // 1:1 Aspect ratio

    // 1. Draw the Base Paper
    ctx.fillStyle = '#fdfdfd';
    ctx.fillRect(0, 0, W, H);

    // 2. Draw the Photo
    try {
      ctx.save();
      // Vintage Analog Filter Pipeline
      ctx.filter = 'contrast(1.06) brightness(1.02) saturate(0.85) sepia(0.08) blur(0.2px)';
      ctx.drawImage(photoImg, sideMargin, topMargin, photoWidth, photoHeight);
      ctx.restore();
    } catch (e) {
      console.error("Error drawing photo:", e);
    }

    // 2b. Internal Vignette
    ctx.save();
    const grad = ctx.createRadialGradient(W / 2, topMargin + photoHeight / 2, 0, W / 2, topMargin + photoHeight / 2, photoHeight * 0.8);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = grad;
    ctx.fillRect(sideMargin, topMargin, photoWidth, photoHeight);
    ctx.restore();

    // 3. Apply the Frame
    if (hasFrame && frameImg) {
      ctx.drawImage(frameImg, 0, 0, W, H);
      if (frameImg.src.startsWith('blob:')) URL.revokeObjectURL(frameImg.src);
    } else {
      console.warn("Drawing fallback frame border");
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = sideMargin;
      ctx.strokeRect(sideMargin / 2, sideMargin / 2, W - sideMargin, H - sideMargin);
    }

    // 4. Side Date Stamp
    try {
      const now = new Date();
      const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

      ctx.save();
      ctx.fillStyle = '#cc1b42';
      const stampSize = Math.floor(W * 0.021);
      ctx.font = `900 ${stampSize}px Doto, sans-serif`;
      ctx.globalAlpha = 0.5;

      /**
       * PRECISION POSITIONING:
       * X: Centered in the 4% right border area. Adjusted -7px per user request to move further left.
       * Y: Positioned in the upper corner of the photo height area.
       */
      const stampX = (W * 0.98) - 7;
      const stampY = topMargin + (photoHeight * 0.22);

      ctx.translate(stampX, stampY);
      ctx.rotate(Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(dateStr, 0, 0);
      ctx.restore();
    } catch (e) {
      console.error("Error drawing date stamp:", e);
    }

    // 5. Handwritten Caption
    try {
      ctx.save();
      ctx.fillStyle = '#1d4ed8';
      ctx.globalAlpha = 0.85;
      // Reenie Beanie is a thinner font, so we bump the size slightly for readability
      const fontSize = Math.floor(W * 0.065);
      ctx.font = `400 ${fontSize}px "Reenie Beanie", cursive`;
      ctx.textAlign = 'center';

      const centerX = W / 2;
      const bottomAreaStart = topMargin + photoHeight;
      const bottomAreaHeight = H - bottomAreaStart;
      const captionY = bottomAreaStart + (bottomAreaHeight * 0.45);

      const cleanCaption = (caption || "").replace(/["]+/g, '');
      const words = cleanCaption.split(' ');
      let currentLine = '';
      const lines = [];
      const maxWidth = W * 0.82;

      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
          lines.push(currentLine.trim());
          currentLine = words[n] + ' ';
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine.trim());

      let startY = captionY - ((lines.length - 1) * fontSize * 0.5);
      for (const line of lines) {
        const tilt = (Math.random() - 0.5) * 0.02; // Reenie Beanie looks better with a bit more jitter
        ctx.save();
        ctx.translate(centerX, startY);
        ctx.rotate(tilt);
        ctx.fillText(line, 0, 0);
        ctx.restore();
        startY += fontSize * 1.1;
      }
      ctx.restore();
    } catch (e) {
      console.error("Error drawing caption:", e);
    }

    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (err) {
    console.error("Processor error:", err);
    return imageSrc;
  }
}
