import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store/useStore';

export function useCamera() {
  const [error, setError] = useState<Error | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { mediaSource, uploadUrl, isVideoUpload } = useStore();

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = mediaStream;

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
        }
      } catch (err) {
        console.error('Error accessing camera: ', err);
        if (!cancelled) setError(err as Error);
      }
    }

    if (mediaSource === 'camera') {
      setupCamera();
    } else if (mediaSource === 'upload' && uploadUrl) {
      stopCamera();

      if (videoRef.current) {
        videoRef.current.srcObject = null;
        if (isVideoUpload) {
          videoRef.current.src = uploadUrl;
          videoRef.current.loop = true;
          videoRef.current.play().catch(console.error);
        }
      }
    }

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [mediaSource, uploadUrl, isVideoUpload, stopCamera]);

  return { error, videoRef };
}
