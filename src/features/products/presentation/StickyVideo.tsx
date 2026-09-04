"use client";

import { useState, useEffect, useRef } from "react";
import { X, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/utils/utils";

interface StickyVideoProps {
  videoSrc: string;
  className?: string;
}

export const StickyVideo = ({ videoSrc, className }: StickyVideoProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Start checking if video can load - use requestIdleCallback to avoid blocking
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let idleCallbackId: number | null = null;

    const startVideoCheck = () => {
      // Delay slightly to avoid blocking initial render
      timer = setTimeout(() => {
        setShouldLoadVideo(true);
      }, 100);
    };

    // Use requestIdleCallback if available, otherwise use setTimeout
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleCallbackId = requestIdleCallback(startVideoCheck, { timeout: 2000 });
    } else {
      timer = setTimeout(startVideoCheck, 0);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (
        idleCallbackId &&
        typeof window !== "undefined" &&
        "cancelIdleCallback" in window
      ) {
        cancelIdleCallback(idleCallbackId);
      }
    };
  }, []);

  // Pre-check video when shouldLoadVideo becomes true
  useEffect(() => {
    if (shouldLoadVideo && !isVideoLoaded) {
      // Create a test video element to check if video can load
      const testVideo = document.createElement("video");
      testVideo.preload = "metadata";
      testVideo.muted = true;

      const handleCanPlay = () => {
        setIsVideoLoaded(true);
        testVideo.remove();
      };

      const handleError = () => {
        setIsVisible(false);
        testVideo.remove();
      };

      testVideo.addEventListener("canplay", handleCanPlay);
      testVideo.addEventListener("error", handleError);
      testVideo.src = videoSrc;

      return () => {
        testVideo.removeEventListener("canplay", handleCanPlay);
        testVideo.removeEventListener("error", handleError);
        testVideo.remove();
      };
    }
  }, [shouldLoadVideo, isVideoLoaded, videoSrc]);

  // Load video when lightbox opens
  useEffect(() => {
    if (isLightboxOpen) {
      setShouldLoadVideo(true);
    }
  }, [isLightboxOpen]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  const handleVideoClick = () => {
    setIsLightboxOpen(true);
  };

  // Don't show component until video is loaded
  if (!isVisible || !isVideoLoaded) {
    return null;
  }

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          "fixed left-6 top-1/2 -translate-y-1/2 z-50 w-20 cursor-pointer transition-all duration-300 hover:scale-105",
          className
        )}
        onClick={handleVideoClick}
      >
        <div className="relative rounded-lg overflow-hidden shadow-2xl bg-black">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-1 right-1 z-10 p-1 bg-black/70 hover:bg-black/90 rounded-full text-white transition-colors"
            aria-label="Close video"
          >
            <X className="h-3 w-3" />
          </button>

          {/* Video Player - Only load when shouldLoadVideo is true, and only show when loaded */}
          {shouldLoadVideo && isVideoLoaded ? (
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              className="w-full h-auto"
              onClick={(e) => {
                e.stopPropagation();
                handleVideoClick();
              }}
            >
              <source src={videoSrc} type="video/quicktime" />
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            // Show placeholder while loading or waiting
            <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
              <div
                className={cn(
                  "rounded-full bg-white/90 p-1.5 shadow-lg",
                  shouldLoadVideo && !isVideoLoaded && "animate-pulse"
                )}
              >
                <Play className="h-3 w-3 text-black fill-black" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogTitle className="sr-only">Video</DialogTitle>
        <DialogContent className="max-w-4xl w-[calc(100%-2rem)] p-4 md:p-6 bg-transparent border-none shadow-none">
          <div className="relative w-full aspect-[9/16] md:aspect-video bg-black/50 rounded-lg overflow-hidden">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-2 right-2 md:top-4 md:right-4 z-10 p-2 bg-black/70 hover:bg-black/90 rounded-full text-white transition-colors"
              aria-label="Close video"
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            {shouldLoadVideo && (
              <video
                autoPlay
                controls
                preload="metadata"
                className="w-full h-full object-contain"
                src={videoSrc}
              >
                <source src={videoSrc} type="video/quicktime" />
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
