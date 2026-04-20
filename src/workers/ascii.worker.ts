// Web Worker for ASCII Art Generation
// Uses OffscreenCanvas for rendering — runs entirely off the main thread.

export type AsciiParams = {
  mode: 'brightness' | 'sequential';
  density: number;
  fontSize: number;
  characterSet: string;
  isColorMode: boolean;
  contrast: number;
  exposure: number;
  vibrance: number;
  saturation: number;
  darkIntensity: number;
};

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let params: AsciiParams | null = null;
let seqIndex = 0;

// Cached sampling canvas — reused across frames to avoid GC pressure
let sampleCanvas: OffscreenCanvas | null = null;
let sampleCtx: OffscreenCanvasRenderingContext2D | null = null;
let lastSampleW = 0;
let lastSampleH = 0;

self.onmessage = function (e: MessageEvent) {
  const data = e.data;

  if (data.type === 'INIT') {
    canvas = new OffscreenCanvas(data.width || 1280, data.height || 720);
    ctx = canvas.getContext('2d', { alpha: false }) as OffscreenCanvasRenderingContext2D;
  } else if (data.type === 'SET_PARAMS') {
    params = data.params;
  } else if (data.type === 'FRAME' && ctx && params) {
    processFrame(data.imageBitmap, data.width, data.height);
  }
};

function adjustColor(
  r: number,
  g: number,
  b: number,
  exposure: number,
  contrast: number,
  saturation: number,
  vibrance: number
): [number, number, number] {
  // 1. Exposure
  r *= exposure;
  g *= exposure;
  b *= exposure;

  // 2. Contrast — pivot around 128
  if (contrast !== 1) {
    r = 128 + (r - 128) * contrast;
    g = 128 + (g - 128) * contrast;
    b = 128 + (b - 128) * contrast;
  }

  // 3. Saturation — lerp towards luminance
  const avg = 0.299 * r + 0.587 * g + 0.114 * b;
  if (saturation !== 1) {
    r = avg + (r - avg) * saturation;
    g = avg + (g - avg) * saturation;
    b = avg + (b - avg) * saturation;
  }

  // 4. Vibrance — boost muted colours more
  if (vibrance !== 1) {
    const maxC = Math.max(r, g, b);
    const amt = ((255 - maxC) / 255) * (vibrance - 1);
    r += (r - avg) * amt;
    g += (g - avg) * amt;
    b += (b - avg) * amt;
  }

  return [
    Math.max(0, Math.min(255, r)) | 0,
    Math.max(0, Math.min(255, g)) | 0,
    Math.max(0, Math.min(255, b)) | 0,
  ];
}

function processFrame(
  imageBitmap: ImageBitmap,
  width: number,
  height: number
) {
  if (!ctx || !canvas || !params) return;

  // Resize output canvas to match source
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const step = Math.max(2, Math.floor(params.density));
  const w = Math.ceil(width / step);
  const h = Math.ceil(height / step);

  // Reuse sampling canvas if dimensions match, else recreate
  if (!sampleCanvas || lastSampleW !== w || lastSampleH !== h) {
    sampleCanvas = new OffscreenCanvas(w, h);
    sampleCtx = sampleCanvas.getContext('2d', {
      willReadFrequently: true,
    })!;
    lastSampleW = w;
    lastSampleH = h;
  }

  sampleCtx!.drawImage(imageBitmap, 0, 0, w, h);
  const frameData = sampleCtx!.getImageData(0, 0, w, h).data;

  // Clear output
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  ctx.textBaseline = 'top';
  ctx.font = `bold ${params.fontSize}px monospace`;

  const charset =
    params.characterSet.length > 0 ? params.characterSet : ' ';
  const clen = charset.length;
  const { exposure, contrast, saturation, vibrance, darkIntensity, isColorMode, mode } = params;

  let dataIndex = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const rawR = frameData[dataIndex];
      const rawG = frameData[dataIndex + 1];
      const rawB = frameData[dataIndex + 2];

      // Skip near-black pixels (background from segmenter or naturally dark)
      // Using threshold of 8 instead of strict === 0 for downscaled boundary artefacts
      if (rawR < 8 && rawG < 8 && rawB < 8) {
        dataIndex += 4;
        continue;
      }

      const [r, g, b] = adjustColor(
        rawR, rawG, rawB,
        exposure, contrast, saturation, vibrance
      );

      // Luminance 0..1
      const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Dark-intensity threshold — cull dim pixels
      if (luma < darkIntensity) {
        dataIndex += 4;
        continue;
      }

      let ch: string;
      if (mode === 'brightness') {
        const idx = Math.min(clen - 1, Math.floor(luma * (clen - 1)));
        ch = charset[idx];
      } else {
        ch = charset[seqIndex % clen];
        seqIndex++;
      }

      if (ch !== ' ') {
        if (isColorMode) {
          ctx.fillStyle = `rgb(${r},${g},${b})`;
        } else {
          // Green monochrome with luminance-based alpha
          const green = Math.min(255, (luma * 255 * 1.4) | 0);
          ctx.fillStyle = `rgb(0,${green},0)`;
        }
        ctx.fillText(ch, x * step, y * step);
      }

      dataIndex += 4;
    }
  }

  // Transfer rendered frame back to main thread
  const outBitmap = canvas.transferToImageBitmap();
  (self as unknown as Worker).postMessage(
    { type: 'RENDERED', imageBitmap: outBitmap },
    [outBitmap] as unknown as Transferable[]
  );

  imageBitmap.close();
}
