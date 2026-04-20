'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useStore } from '@/store/useStore';
import { initializeSegmenter } from '@/utils/segmenter';
import type { AsciiParams } from '@/workers/ascii.worker';

export default function ASCIIViewer() {
  const { videoRef } = useCamera();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestRef = useRef<number | null>(null);
  const fpsRef = useRef({ frames: 0, lastTime: performance.now(), value: 0 });
  const [fps, setFps] = useState(0);

  // MediaPipe helper canvas
  const segCanvas = useRef<HTMLCanvasElement | null>(null);
  const segCtx = useRef<CanvasRenderingContext2D | null>(null);

  const {
    mode, density, fontSize, characterSet,
    isColorMode, contrast, exposure, vibrance, saturation, darkIntensity,
    useAiBackgroundRemoval,
    mediaSource, uploadUrl, isVideoUpload,
  } = useStore();

  const imgRef = useRef<HTMLImageElement | null>(null);

  // ---------- worker lifecycle ----------
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/ascii.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'RENDERED' && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const bitmap: ImageBitmap = e.data.imageBitmap;
          if (
            canvasRef.current.width !== bitmap.width ||
            canvasRef.current.height !== bitmap.height
          ) {
            canvasRef.current.width = bitmap.width;
            canvasRef.current.height = bitmap.height;
          }
          ctx.drawImage(bitmap, 0, 0);
          bitmap.close();
        }
      }
    };

    workerRef.current.postMessage({ type: 'INIT', width: 1280, height: 720 });

    segCanvas.current = document.createElement('canvas');
    segCtx.current = segCanvas.current.getContext('2d', {
      willReadFrequently: true,
    });

    return () => {
      workerRef.current?.terminate();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // ---------- push params to worker ----------
  useEffect(() => {
    if (workerRef.current) {
      const p: AsciiParams = {
        mode, density, fontSize, characterSet,
        isColorMode, contrast, exposure, vibrance, saturation, darkIntensity,
      };
      workerRef.current.postMessage({ type: 'SET_PARAMS', params: p });
    }
  }, [mode, density, fontSize, characterSet, isColorMode, contrast, exposure, vibrance, saturation, darkIntensity]);

  // ---------- main render loop ----------
  const renderLoop = useCallback(
    async (time: number) => {
      // FPS counter
      fpsRef.current.frames++;
      if (time - fpsRef.current.lastTime >= 1000) {
        fpsRef.current.value = fpsRef.current.frames;
        setFps(fpsRef.current.frames);
        fpsRef.current.frames = 0;
        fpsRef.current.lastTime = time;
      }

      const video = videoRef.current;
      const img = imgRef.current;
      const isSrcImage =
        mediaSource === 'upload' &&
        !isVideoUpload &&
        img &&
        img.complete &&
        img.naturalWidth > 0;
      const isSrcVideo =
        video && video.readyState >= 2 && video.videoWidth > 0;

      if (
        (isSrcVideo || isSrcImage) &&
        workerRef.current &&
        segCanvas.current &&
        segCtx.current
      ) {
        const vw = isSrcImage ? img!.naturalWidth : video!.videoWidth;
        const vh = isSrcImage ? img!.naturalHeight : video!.videoHeight;

        if (segCanvas.current.width !== vw) segCanvas.current.width = vw;
        if (segCanvas.current.height !== vh) segCanvas.current.height = vh;

        segCtx.current.drawImage(
          isSrcImage ? img! : video!,
          0,
          0,
          vw,
          vh
        );

        // AI segmentation
        if (useAiBackgroundRemoval) {
          try {
            const runMode = isSrcImage ? 'IMAGE' : 'VIDEO';
            const segmenter = await initializeSegmenter(runMode);
            if (segmenter) {
              const result = isSrcImage
                ? segmenter.segment(img!)
                : segmenter.segmentForVideo(video!, performance.now());

              if (result.categoryMask) {
                const mask = result.categoryMask.getAsUint8Array();
                const imgData = segCtx.current.getImageData(0, 0, vw, vh);
                const d = imgData.data;
                for (let i = 0; i < mask.length; i++) {
                  if (mask[i] === 0) {
                    const o = i * 4;
                    d[o] = 0;
                    d[o + 1] = 0;
                    d[o + 2] = 0;
                  }
                }
                segCtx.current.putImageData(imgData, 0, 0);
              }
            }
          } catch (err) {
            console.warn('Segmentation error:', err);
          }
        }

        try {
          const bmp = await createImageBitmap(segCanvas.current);
          workerRef.current.postMessage(
            { type: 'FRAME', imageBitmap: bmp, width: vw, height: vh },
            [bmp]
          );
        } catch {
          // frame dropped — non-critical
        }
      }

      requestRef.current = requestAnimationFrame(renderLoop);
    },
    [videoRef, useAiBackgroundRemoval, mediaSource, isVideoUpload]
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [renderLoop]);

  // Handle image upload ref
  const onImgLoad = useCallback((el: HTMLImageElement | null) => {
    imgRef.current = el;
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden rounded-lg border border-zinc-800 shadow-[0_0_30px_rgba(0,255,0,0.08)]">
      {/* Hidden source video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden"
      />

      {/* Hidden source image for uploads */}
      {mediaSource === 'upload' && !isVideoUpload && uploadUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={onImgLoad}
          src={uploadUrl}
          crossOrigin="anonymous"
          className="hidden"
          alt="Upload source"
        />
      )}

      {/* Output canvas */}
      <canvas
        ref={canvasRef}
        id="ascii-output-canvas"
        className="max-w-full max-h-full object-contain"
      />

      {/* HUD overlay */}
      <div className="absolute top-3 left-3 text-[10px] font-mono text-green-500/60 select-none pointer-events-none leading-relaxed">
        <span>[SYS: ACTIVE]</span>
        {useAiBackgroundRemoval && (
          <>
            <br />
            <span>[AI_SEG: ON]</span>
          </>
        )}
      </div>

      {/* FPS counter */}
      <div className="absolute top-3 right-3 text-[10px] font-mono text-green-500/60 select-none pointer-events-none tabular-nums">
        {fps} FPS
      </div>

      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 1px, black 1px, black 2px)',
        }}
      />
    </div>
  );
}
