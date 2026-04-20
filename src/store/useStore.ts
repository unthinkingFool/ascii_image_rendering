import { create } from 'zustand';

export type AsciiMode = 'brightness' | 'sequential';

export interface Preset {
  name: string;
  settings: Partial<AsciiState>;
}

export const PRESETS: Preset[] = [
  {
    name: 'Matrix',
    settings: {
      mode: 'sequential',
      characterSet: 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ012345789Z',
      isColorMode: false,
      fontSize: 14,
      density: 14,
      exposure: 1.2,
      vibrance: 1,
      saturation: 1,
      darkIntensity: 0.15,
    },
  },
  {
    name: 'Dense',
    settings: {
      mode: 'brightness',
      characterSet: ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
      isColorMode: true,
      fontSize: 6,
      density: 5,
      exposure: 1.1,
      vibrance: 1.4,
      saturation: 1.2,
      darkIntensity: 0.05,
    },
  },
  {
    name: 'Minimal',
    settings: {
      mode: 'brightness',
      characterSet: ' .+#@',
      isColorMode: false,
      fontSize: 18,
      density: 18,
      exposure: 1,
      vibrance: 1,
      saturation: 1,
      darkIntensity: 0.2,
    },
  },
  {
    name: 'Code',
    settings: {
      mode: 'sequential',
      characterSet: 'function render(ctx){const ascii=pixel.map(c=>String.fromCharCode(c));return ascii.join("");}',
      isColorMode: true,
      fontSize: 11,
      density: 10,
      exposure: 1.3,
      vibrance: 1.6,
      saturation: 1.3,
      darkIntensity: 0.1,
    },
  },
  {
    name: 'Emoji',
    settings: {
      mode: 'brightness',
      characterSet: ' ·•●◉◎⊙⊚⦿⊛',
      isColorMode: true,
      fontSize: 12,
      density: 12,
      exposure: 1.1,
      vibrance: 1.5,
      saturation: 1.4,
      darkIntensity: 0.08,
    },
  },
];

interface AsciiState {
  // Rendering Modes
  mode: AsciiMode;
  setMode: (mode: AsciiMode) => void;

  // ASCII Settings
  density: number;
  setDensity: (density: number) => void;

  fontSize: number;
  setFontSize: (fontSize: number) => void;

  characterSet: string;
  setCharacterSet: (characterSet: string) => void;

  // Image Processing Settings
  isColorMode: boolean;
  setIsColorMode: (isColorMode: boolean) => void;

  contrast: number;
  setContrast: (contrast: number) => void;

  exposure: number;
  setExposure: (exposure: number) => void;

  vibrance: number;
  setVibrance: (vibrance: number) => void;

  saturation: number;
  setSaturation: (saturation: number) => void;

  darkIntensity: number;
  setDarkIntensity: (darkIntensity: number) => void;

  // AI Settings
  useAiBackgroundRemoval: boolean;
  setUseAiBackgroundRemoval: (use: boolean) => void;

  // Media Source Settings
  mediaSource: 'camera' | 'upload';
  setMediaSource: (source: 'camera' | 'upload') => void;

  uploadUrl: string | null;
  setUploadUrl: (url: string | null) => void;

  isVideoUpload: boolean;
  setIsVideoUpload: (isVideo: boolean) => void;

  // Presets
  applyPreset: (preset: Preset) => void;
}

const DEFAULT_CHARSET = ' .:=+*#%@';

export const useStore = create<AsciiState>((set) => ({
  mode: 'brightness',
  setMode: (mode) => set({ mode }),

  density: 10,
  setDensity: (density) => set({ density }),

  fontSize: 12,
  setFontSize: (fontSize) => set({ fontSize }),

  characterSet: DEFAULT_CHARSET,
  setCharacterSet: (characterSet) => set({ characterSet }),

  isColorMode: true,
  setIsColorMode: (isColorMode) => set({ isColorMode }),

  contrast: 1,
  setContrast: (contrast) => set({ contrast }),

  exposure: 1,
  setExposure: (exposure) => set({ exposure }),

  vibrance: 1,
  setVibrance: (vibrance) => set({ vibrance }),

  saturation: 1,
  setSaturation: (saturation) => set({ saturation }),

  darkIntensity: 0.1,
  setDarkIntensity: (darkIntensity) => set({ darkIntensity }),

  useAiBackgroundRemoval: false,
  setUseAiBackgroundRemoval: (useAiBackgroundRemoval) =>
    set({ useAiBackgroundRemoval }),

  mediaSource: 'camera',
  setMediaSource: (mediaSource) => set({ mediaSource }),

  uploadUrl: null,
  setUploadUrl: (uploadUrl) => set({ uploadUrl }),

  isVideoUpload: false,
  setIsVideoUpload: (isVideoUpload) => set({ isVideoUpload }),

  applyPreset: (preset) => set({ ...preset.settings }),
}));
