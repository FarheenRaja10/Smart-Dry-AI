import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Icon } from './Icon';

interface VideoBatchCaptureProps {
  onSubmit: (base64Images: string[]) => void;
  onBack: () => void;
}

const VideoBatchCapture: React.FC<VideoBatchCaptureProps> = ({ onSubmit, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const framesRef = useRef<string[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }
    setIsCameraReady(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function setupCamera() {
      if (streamRef.current) return;
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        
        if (isMounted && videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Explicitly play the video, as autoplay can be unreliable.
          videoRef.current.play().catch(err => {
              console.error("Video play failed:", err);
              if (isMounted) setError("Could not start the camera video stream.");
          });
          streamRef.current = mediaStream;
          if(isMounted) setIsCameraReady(true);
        } else {
            // Component unmounted before stream was ready, stop tracks to release camera
            mediaStream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        if (isMounted) {
            setError("Could not access the camera. Please check permissions and try again.");
            stopCamera();
        }
      }
    }
    setupCamera();
    
    return () => {
        isMounted = false;
        stopCamera();
    };
  }, [stopCamera]);

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        const targetWidth = 640;
        const scale = targetWidth / video.videoWidth;
        canvas.width = targetWidth;
        canvas.height = video.videoHeight * scale;
        
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        framesRef.current.push(dataUrl);
        setFrameCount(prev => prev + 1);
    }
  }, []);

  const handleStartScan = () => {
    setIsScanning(true);
    framesRef.current = [];
    setFrameCount(0);
    intervalRef.current = window.setInterval(captureFrame, 1500);
  };
  
  const handleStopAndAnalyze = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsScanning(false);
    stopCamera();
    if(framesRef.current.length > 0) {
        onSubmit(framesRef.current);
    } else {
        onBack();
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <button onClick={onBack} className="absolute top-4 left-4 text-gray-500 hover:text-[#50C1AE] transition-colors">
            <Icon name="back" />
        </button>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <button onClick={onBack} className="absolute top-4 left-4 text-gray-500 hover:text-[#50C1AE] transition-colors z-20 bg-white/50 rounded-full p-1">
        <Icon name="back" />
      </button>
      <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Batch Video Scan</h2>
      <p className="text-sm text-center text-gray-600 mb-4">Pan slowly over your garments. Make sure each item is clearly visible.</p>

      <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        {!isCameraReady && <p className="text-white absolute">Starting camera...</p>}
        {isScanning && (
            <div className="absolute bottom-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-1.5"></div>
                REC
            </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {!isScanning ? (
        <button
            onClick={handleStartScan}
            disabled={!isCameraReady}
            className="w-full mt-4 bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center disabled:bg-gray-400"
        >
            <Icon name="video" />
            <span className="ml-2">Start Scanning</span>
        </button>
      ) : (
        <button
            onClick={handleStopAndAnalyze}
            className="w-full mt-4 bg-[#7FE5D2] text-black font-bold py-3 px-4 rounded-lg hover:bg-[#65D1BC] transition-colors flex items-center justify-center"
        >
            <Icon name="sparkles" />
            <span className="ml-2">Stop & Analyze ({frameCount} {frameCount === 1 ? 'frame' : 'frames'})</span>
        </button>
      )}
    </div>
  );
};

export default VideoBatchCapture;