import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  url: string;
  onError?: () => void;
}

export function VideoPlayer({ url, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [hasError, setHasError] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [isStream, setIsStream] = useState(false);

  useEffect(() => {
    if (!url) return;

    // Detect if this is an MJPEG stream (from backend camera) or MP4 file
    const isMjpegStream = url.includes('/api/video/');
    setIsStream(isMjpegStream);
    setHasError(false);
    setNeedsInteraction(false);

    if (isMjpegStream) {
      // For MJPEG streams, use img tag - no special handling needed
      const img = imgRef.current;
      if (img) {
        const handleImageError = () => {
          setHasError(true);
          onError?.();
        };
        img.addEventListener('error', handleImageError);
        return () => {
          img.removeEventListener('error', handleImageError);
        };
      }
    } else {
      // For MP4 files, use video tag
      const video = videoRef.current;
      if (!video) return;

    const handleError = () => {
      setHasError(true);
      onError?.();
    };

    const handleCanPlay = async () => {
      try {
        await video.play();
      } catch (error) {
        // Autoplay was blocked
        if (error instanceof Error && error.name === 'NotAllowedError') {
          setNeedsInteraction(true);
        }
      }
    };

    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
    };
    }
  }, [url, onError]);

  const handleClick = async () => {
    if (needsInteraction && videoRef.current) {
      try {
        await videoRef.current.play();
        setNeedsInteraction(false);
      } catch (error) {
        console.error('Failed to play video:', error);
      }
    }
  };

  if (!url) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-hud-panel">
        <div className="text-center">
          <div className="text-hud-red text-xl font-mono mb-2">NO SIGNAL</div>
          <div className="text-hud-text-dim text-sm font-mono">
            PROVIDE VIDEO URL
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-hud-panel">
        <div className="text-center">
          <div className="text-hud-red text-xl font-mono mb-2">PLAYBACK ERROR</div>
          <div className="text-hud-text-dim text-sm font-mono">
            Failed to load video stream
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isStream ? (
        // MJPEG stream from backend camera - use img tag
        <img
          ref={imgRef}
          src={url}
          className="absolute inset-0 w-full h-full object-contain bg-black"
          alt="Live camera feed"
        />
      ) : (
        // MP4 file - use video tag
      <video
        ref={videoRef}
        src={url}
        className="absolute inset-0 w-full h-full object-contain bg-black"
        muted
        autoPlay
        playsInline
        loop
      />
      )}
      {needsInteraction && !isStream && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/70 cursor-pointer z-10"
          onClick={handleClick}
        >
          <div className="text-center">
            <div className="text-hud-accent text-xl font-mono mb-2">
              CLICK TO START
            </div>
            <div className="text-hud-text-dim text-sm font-mono">
              Interaction required for playback
            </div>
          </div>
        </div>
      )}
    </>
  );
}

