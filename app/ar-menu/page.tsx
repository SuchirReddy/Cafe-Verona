"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, AlertCircle, Maximize, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ARMenuPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    startCamera();

    return () => {
      // Cleanup: stop the camera stream when unmounting
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser does not support camera access.");
      }

      // Try to get the rear camera if available
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setError(err.message || "Failed to access the camera. Please check permissions.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent pt-safe">
        <Link href="/menu" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2">
          <Camera size={16} /> AR Menu Beta
        </div>
        <div className="w-10 h-10"></div> {/* Spacer for centering */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-gray-900 flex items-center justify-center overflow-hidden">
        
        {error ? (
          <div className="bg-red-500/20 border border-red-500 text-white p-6 rounded-2xl max-w-sm text-center backdrop-blur-md">
            <AlertCircle className="mx-auto mb-3" size={32} />
            <p>{error}</p>
            <button 
              onClick={startCamera}
              className="mt-4 bg-white text-red-600 px-4 py-2 rounded-lg font-bold text-sm w-full"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Camera Feed */}
            <video 
              ref={videoRef} 
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
            />

            {/* AR Overlay UI */}
            {isStreaming && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Simulated 3D Tracking Box */}
                <div className="relative w-64 h-64 border-2 border-dashed border-white/50 rounded-3xl flex items-center justify-center">
                  <div className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-gold rounded-tl-lg"></div>
                  <div className="absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 border-gold rounded-tr-lg"></div>
                  <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 border-gold rounded-bl-lg"></div>
                  <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-gold rounded-br-lg"></div>
                  
                  {/* Floating Content */}
                  <div className="bg-black/60 backdrop-blur-md text-white p-4 rounded-xl text-center shadow-2xl shadow-black/50 pointer-events-auto transform transition-transform hover:scale-105 cursor-pointer">
                    <Maximize className="mx-auto mb-2 text-gold opacity-80" size={24} />
                    <p className="font-bold text-lg mb-1 font-serif">Signature Latte</p>
                    <p className="text-xs text-gray-300">AR view – 3D model of dish would appear here.</p>
                  </div>
                </div>

                {/* Scanning Instruction */}
                <div className="absolute bottom-10 left-0 right-0 text-center">
                  <p className="bg-black/50 backdrop-blur-md text-white inline-block px-6 py-3 rounded-full text-sm font-medium tracking-wide">
                    Point camera at a flat surface to place item
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
