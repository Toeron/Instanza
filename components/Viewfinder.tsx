
import React, { useRef, useEffect, useState } from 'react';
import { CaptionStyle, Language, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../types';

interface ViewfinderProps {
  onCapture: (base64: string, style: CaptionStyle, language: Language) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const Viewfinder: React.FC<ViewfinderProps> = ({ onCapture, language, onLanguageChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<CaptionStyle>('inspirerend');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);

  const t = TRANSLATIONS[language];

  const styles: CaptionStyle[] = [
    'luchtig', 'grappig', 'serieus', 'inspirerend',
    'filosofisch', 'literair', 'fortune cooky', 'positief'
  ];

  useEffect(() => {
    async function getDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
      } catch (err) {
        console.error("Device discovery failed:", err);
      }
    }
    getDevices();
  }, []);

  useEffect(() => {
    async function setupCamera() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (devices.length === 0) return;

      try {
        const deviceId = devices[currentDeviceIndex].deviceId;
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1920 },
            height: { ideal: 1920 }
          },
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playErr: any) {
            // Ignore AbortError caused by rapid switching or re-loads
            if (playErr.name !== 'AbortError') throw playErr;
          }
          setIsReady(true);
        }
      } catch (err) {
        console.error("Camera setup failure:", err);
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            try {
              await videoRef.current.play();
            } catch (playErr: any) {
              if (playErr.name !== 'AbortError') throw playErr;
            }
            setIsReady(true);
          }
        } catch (innerErr) {
          console.error("Final fallback failed", innerErr);
        }
      }
    }

    setupCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [devices, currentDeviceIndex]);

  const switchCamera = () => {
    if (devices.length <= 1) return;
    setIsReady(false);
    setCurrentDeviceIndex((prev) => (prev + 1) % devices.length);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !canvasRef.current) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const iw = img.width;
        const ih = img.height;
        const size = Math.min(iw, ih);
        const sx = (iw - size) / 2;
        const sy = (ih - size) / 2;

        canvas.width = 1500;
        canvas.height = 1500;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 1500, 1500);

        onCapture(canvas.toDataURL('image/jpeg', 0.95), selectedStyle, language);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const size = Math.min(vw, vh);
    const sx = (vw - size) / 2;
    const sy = (vh - size) / 2;

    canvas.width = 1500;
    canvas.height = 1500;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 1500, 1500);

    onCapture(canvas.toDataURL('image/jpeg', 0.95), selectedStyle, language);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black overflow-hidden pt-12">
      {/* Square Viewfinder */}
      <div className="relative w-[85vw] h-[85vw] max-w-[400px] max-h-[400px] bg-neutral-900 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.9)] border border-white/5 rounded-sm">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] contrast-[1.1] brightness-[1.05]"
        />

        {devices.length > 0 && (
          <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[8px] uppercase tracking-widest text-white font-bold border border-white/20">
            {t.cam} {currentDeviceIndex + 1}
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.4)_100%)]"></div>
      </div>

      {/* Language Selector */}
      <div className="mt-6 w-full max-w-md px-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 justify-start sm:justify-center pb-1">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all border ${language === lang.code
                  ? 'bg-white/20 text-white border-white/40'
                  : 'bg-transparent text-white/30 border-white/5 hover:text-white/60'
                }`}
            >
              <span>{lang.flag}</span>
              <span className="uppercase">{lang.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Style Selector */}
      <div className="mt-4 w-full max-w-md px-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 justify-start sm:justify-center pb-2">
          {styles.map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`px-4 py-2 rounded-full text-[9px] uppercase tracking-widest font-black transition-all whitespace-nowrap border ${selectedStyle === style
                  ? 'bg-white text-black border-white scale-105 shadow-lg'
                  : 'bg-white/5 text-white/40 border-white/10 hover:text-white/70'
                }`}
            >
              {t.styles[style]}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center gap-10">
        <button
          onClick={switchCamera}
          className="p-4 bg-white/5 border border-white/10 rounded-full active:scale-90 transition-all hover:bg-white/10"
          title="Switch Camera"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
        </button>

        <button
          onClick={capture}
          disabled={!isReady}
          className={`group relative w-20 h-20 rounded-full border-8 border-white/10 p-1.5 transition-all active:scale-95 ${!isReady ? 'opacity-20' : 'hover:border-white/20'}`}
          title="Capture Photo"
        >
          <div className="w-full h-full rounded-full bg-white shadow-2xl flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-red-600 shadow-inner group-active:scale-110 transition-transform"></div>
          </div>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-4 bg-white/5 border border-white/10 rounded-full active:scale-90 transition-all hover:bg-white/10"
          title="Upload Photo"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Viewfinder;
