import { ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';

let segmenterInstance: ImageSegmenter | null = null;
let isInitializing = false;
let currentRunningMode: 'IMAGE' | 'VIDEO' = 'VIDEO';

export async function initializeSegmenter(
  mode: 'IMAGE' | 'VIDEO' = 'VIDEO'
): Promise<ImageSegmenter | null> {
  // If already initialised with the correct mode, return immediately
  if (segmenterInstance && currentRunningMode === mode) {
    return segmenterInstance;
  }

  // If initialised but we need a different mode, switch it
  if (segmenterInstance && currentRunningMode !== mode) {
    try {
      await segmenterInstance.setOptions({ runningMode: mode });
      currentRunningMode = mode;
      return segmenterInstance;
    } catch {
      // If switching fails, recreate
      segmenterInstance = null;
    }
  }

  if (isInitializing) {
    while (isInitializing) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return segmenterInstance;
  }

  try {
    isInitializing = true;
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
    );

    segmenterInstance = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
        delegate: 'GPU',
      },
      runningMode: mode,
      outputCategoryMask: true,
      outputConfidenceMasks: false,
    });

    currentRunningMode = mode;
    isInitializing = false;
    return segmenterInstance;
  } catch (err) {
    console.error('Failed to initialize Segmenter:', err);
    isInitializing = false;
    return null;
  }
}
