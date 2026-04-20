'use client';

import { useState, useRef } from 'react';
import {
  Camera,
  Video,
  Upload,
  StopCircle,
  Webcam,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function CapturePanel() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const {
    mediaSource,
    setMediaSource,
    setUploadUrl,
    setIsVideoUpload,
  } = useStore();

  /* ─── Photo ─── */
  const takePhoto = () => {
    const canvas = document.getElementById(
      'ascii-output-canvas'
    ) as HTMLCanvasElement | null;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `ascii-art-${Date.now()}.png`;
    a.click();
  };

  /* ─── Record ─── */
  const toggleRecording = () => {
    const canvas = document.getElementById(
      'ascii-output-canvas'
    ) as HTMLCanvasElement | null;
    if (!canvas) return;

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ascii-video-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  /* ─── Upload ─── */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const url = URL.createObjectURL(file);
    setIsVideoUpload(isVideo);
    setUploadUrl(url);
    setMediaSource('upload');
  };

  /* ─── Back to Camera ─── */
  const switchToCamera = () => {
    setUploadUrl(null);
    setIsVideoUpload(false);
    setMediaSource('camera');
  };

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#0a0a0a]/85 backdrop-blur-lg px-5 py-3 rounded-full border border-[#222] shadow-[0_4px_30px_rgba(0,0,0,0.6)] z-50">
      {/* Camera button — show only when viewing uploads */}
      {mediaSource === 'upload' && (
        <ActionButton
          title="Back to Camera"
          onClick={switchToCamera}
          className="text-cyan-400 hover:border-cyan-400 hover:bg-cyan-400/10"
        >
          <Webcam size={18} />
        </ActionButton>
      )}

      {/* Screenshot */}
      <ActionButton title="Take Photo" onClick={takePhoto}>
        <Camera size={18} />
      </ActionButton>

      {/* Record */}
      <button
        onClick={toggleRecording}
        className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
          isRecording
            ? 'bg-red-500/15 border-red-500 text-red-500 animate-pulse shadow-[0_0_20px_rgba(255,0,0,0.2)]'
            : 'bg-[#151515] border-[#333] text-gray-400 hover:border-green-500 hover:text-green-500 hover:shadow-[0_0_15px_rgba(0,255,0,0.15)]'
        }`}
        title={isRecording ? 'Stop Recording' : 'Record Video'}
      >
        {isRecording ? <StopCircle size={22} /> : <Video size={22} />}
      </button>

      {/* Upload */}
      <label
        className="w-11 h-11 rounded-full bg-[#151515] text-gray-400 flex items-center justify-center border border-[#333] hover:border-green-500 hover:text-green-500 hover:shadow-[0_0_15px_rgba(0,255,0,0.15)] transition-all cursor-pointer"
        title="Upload Media"
      >
        <Upload size={18} />
        <input
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </label>
    </div>
  );
}

/* ─── helper ─── */
function ActionButton({
  children,
  title,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-11 h-11 rounded-full bg-[#151515] flex items-center justify-center border border-[#333] hover:border-green-500 hover:text-green-500 hover:shadow-[0_0_15px_rgba(0,255,0,0.15)] transition-all text-gray-400 ${className}`}
    >
      {children}
    </button>
  );
}
