import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Icon } from './Icon';

interface CameraCaptureProps {
  onSubmit: (base64Image: string) => void;
  onBack: () => void;
  isBarcode?: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onSubmit, onBack, isBarcode = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pinchStartDistance = useRef(0);
  const pinchStartZoom = useRef(1);

  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  // State for multi-camera and zoom support
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>(undefined);
  const [zoomCapabilities, setZoomCapabilities] = useState<{ min: number; max: number; step: number; } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function setupCamera() {
      // Clean up previous stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (isMounted) setIsCameraReady(false);
      
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');

        if (!isMounted) return;
        setVideoDevices(videoInputs);
        if (videoInputs.length === 0) {
          setError("No camera found on this device.");
          return;
        }

        const deviceIdToUse = currentDeviceId || videoInputs.find(d => d.label.toLowerCase().includes('back'))?.deviceId || videoInputs[0].deviceId;

        const constraints = { video: { deviceId: { exact: deviceIdToUse } } };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

        if (isMounted && videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => console.error("Video play failed:", err));
          streamRef.current = mediaStream;
          setIsCameraReady(true);
          
          const videoTrack = mediaStream.getVideoTracks()[0];
          if (videoTrack) {
            // FIX: The 'zoom' property is not part of the standard MediaTrackCapabilities/MediaTrackSettings types.
            // We cast to `any` to access this browser-specific feature for camera zoom, resolving the type errors.
            const capabilities = videoTrack.getCapabilities() as any;
            if (capabilities.zoom) {
              setZoomCapabilities({
                min: capabilities.zoom.min ?? 1,
                max: capabilities.zoom.max ?? 10,
                step: capabilities.zoom.step ?? 0.1,
              });
              setZoomLevel((videoTrack.getSettings() as any).zoom || 1);
            } else {
              setZoomCapabilities(null);
            }
          }
        } else {
          mediaStream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        if (isMounted) setError("Could not access camera. Please check permissions.");
      }
    }
    
    setupCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [currentDeviceId]);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current && !isCapturing) {
      setIsCapturing(true);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      setTimeout(() => {
        onSubmit(dataUrl);
        setIsCapturing(false);
      }, 300);
    }
  }, [onSubmit, isCapturing]);

  const handleSwitchCamera = () => {
    if (videoDevices.length > 1) {
      const currentIndex = videoDevices.findIndex(d => d.deviceId === currentDeviceId);
      const nextIndex = (currentIndex + 1) % videoDevices.length;
      setCurrentDeviceId(videoDevices[nextIndex].deviceId);
    }
  };

  const handleZoomChange = useCallback((newZoom: number) => {
    if (!streamRef.current || !zoomCapabilities) return;
    
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      const clampedZoom = Math.max(zoomCapabilities.min, Math.min(zoomCapabilities.max, newZoom));
      videoTrack.applyConstraints({ advanced: [{ zoom: clampedZoom }] })
        .then(() => setZoomLevel(clampedZoom))
        .catch(err => console.error("Zoom failed:", err));
    }
  }, [zoomCapabilities]);

  const handleTouchStart = (e: React.TouchEvent<HTMLVideoElement>) => {
    if (e.touches.length === 2 && zoomCapabilities) {
      e.preventDefault();
      pinchStartDistance.current = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
      pinchStartZoom.current = zoomLevel;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLVideoElement>) => {
    if (e.touches.length === 2 && zoomCapabilities) {
      e.preventDefault();
      const newPinchDistance = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
      const scale = newPinchDistance / pinchStartDistance.current;
      handleZoomChange(pinchStartZoom.current * scale);
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
    <>
      <style>{`
        @keyframes scan-line-animation {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan-line {
          animation: scan-line-animation 2s linear infinite alternate;
        }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #50C1AE;
            cursor: pointer;
            border-radius: 50%;
        }
      `}</style>
      <div className="p-4">
        <button onClick={onBack} className="absolute top-4 left-4 text-gray-500 hover:text-[#50C1AE] transition-colors z-20 bg-white/50 rounded-full p-1">
              <Icon name="back" />
        </button>
        <h2 className="text-xl font-bold text-center text-gray-800 mb-4">{isBarcode ? 'Scan Barcode' : 'Take Photo'}</h2>
        <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover" 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          />
          {!isCameraReady && <p className="text-white absolute">Starting camera...</p>}
          
          {videoDevices.length > 1 && (
            <button
                onClick={handleSwitchCamera}
                className="absolute top-2 right-2 z-20 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                aria-label="Switch Camera"
            >
                <Icon name="switchCamera" size={20} />
            </button>
          )}

          {isBarcode && isCameraReady && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-black/50 backdrop-blur-sm"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-black/50 backdrop-blur-sm"></div>
              <div className="absolute top-1/3 bottom-1/3 left-0 w-[12.5%] bg-black/50 backdrop-blur-sm"></div>
              <div className="absolute top-1/3 bottom-1/3 right-0 w-[12.5%] bg-black/50 backdrop-blur-sm"></div>
              <div className={`absolute top-1/3 left-[12.5%] right-[12.5%] bottom-1/3 transition-all duration-300 ease-in-out ${isCapturing ? 'scale-105' : 'scale-100'}`}>
                  <div className={`absolute inset-0 border-4 rounded-lg transition-colors duration-300 ${isCapturing ? 'border-green-400' : 'border-white/50'}`}></div>
                  <div className={`absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg transition-colors duration-300 ${isCapturing ? 'border-green-400' : 'border-white/70'}`}></div>
                  <div className={`absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg transition-colors duration-300 ${isCapturing ? 'border-green-400' : 'border-white/70'}`}></div>
                  <div className={`absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg transition-colors duration-300 ${isCapturing ? 'border-green-400' : 'border-white/70'}`}></div>
                  <div className={`absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 rounded-br-lg transition-colors duration-300 ${isCapturing ? 'border-green-400' : 'border-white/70'}`}></div>
                  {!isCapturing && (
                    <div className="absolute inset-0 overflow-hidden rounded-lg">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[#7FE5D2] rounded-full shadow-[0_0_15px_3px_rgba(127,229,210,0.7)] animate-scan-line" />
                    </div>
                  )}
              </div>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        {zoomCapabilities && (
            <div className="mt-2 px-1 flex items-center gap-2">
                <Icon name="search" size={16} className="text-gray-500 flex-shrink-0" />
                <input
                    type="range"
                    min={zoomCapabilities.min}
                    max={zoomCapabilities.max}
                    step={zoomCapabilities.step}
                    value={zoomLevel}
                    onChange={(e) => handleZoomChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    aria-label="Zoom control"
                />
                <Icon name="search" size={24} className="text-gray-500 flex-shrink-0" />
            </div>
        )}

        <button
          onClick={handleCapture}
          disabled={!isCameraReady || isCapturing}
          className="w-full mt-4 bg-[#7FE5D2] text-black font-bold py-3 px-4 rounded-lg hover:bg-[#65D1BC] transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Icon name="camera" />
          <span className="ml-2">{isCapturing ? 'Capturing...' : (isBarcode ? 'Scan' : 'Capture')}</span>
        </button>
      </div>
    </>
  );
};

export default CameraCapture;