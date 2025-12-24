import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  url: string;
  onError?: () => void;
}

// YouTube IFrame API types
interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  getPlayerState: () => number;
  destroy: () => void;
}

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, config: {
        videoId: string;
        playerVars?: Record<string, any>;
        events?: {
          onStateChange?: (event: { data: number }) => void;
          onReady?: (event: any) => void;
        };
      }) => YouTubePlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export function VideoPlayer({ url, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerIdRef = useRef(`yt-player-${Math.random().toString(36).substr(2, 9)}`);
  const [hasError, setHasError] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [isStream, setIsStream] = useState(false);
  const [isYouTube, setIsYouTube] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!url) return;

    // Detect video type
    const isMjpegStream = url.includes('/api/video/');
    const isYoutube = url.includes('youtube.com/embed') || url.includes('youtube-nocookie.com/embed') || url.includes('youtu.be');
    
    setIsStream(isMjpegStream);
    setIsYouTube(isYoutube);
    setHasError(false);
    setNeedsInteraction(false);
    setShowVideo(false);

    // For YouTube, show after 1 second delay with connecting animation
    let timer: ReturnType<typeof setTimeout> | null = null;
    let loopTimer: ReturnType<typeof setTimeout> | null = null;
    
    if (isYoutube) {
      // Extract video ID from URL
      const videoIdMatch = url.match(/(?:embed\/|v=)([^?&]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : '';
      
      const initializePlayer = () => {
        if (!window.YT || !window.YT.Player || !videoId || !playerContainerRef.current) return;
        
        try {
          const player = new window.YT.Player(playerIdRef.current, {
            videoId: videoId,
            playerVars: {
              autoplay: 1,
              // No loop - we'll handle looping manually to show connecting animation
              mute: 1,
              controls: 0,
              modestbranding: 1,
              disablekb: 1,
              iv_load_policy: 3,
              rel: 0,
              fs: 0,
              playsinline: 1,
              enablejsapi: 1,
            },
            events: {
              onReady: () => {
                // Player is ready, start playing
                if (playerRef.current) {
                  playerRef.current.playVideo();
                }
              },
              onStateChange: (event: { data: number }) => {
                // When video ends (state = 0), show connecting animation then restart
                if (event.data === window.YT.PlayerState.ENDED) {
                  setShowVideo(false);
                  // After 1 second, show video again and restart
                  loopTimer = setTimeout(() => {
                    setShowVideo(true);
                    if (playerRef.current) {
                      // Restart the video
                      playerRef.current.playVideo();
                    }
                  }, 1000);
                }
              },
            },
          });
          playerRef.current = player;
        } catch (error) {
          console.error('Failed to initialize YouTube player:', error);
          // Fallback to regular iframe
          setShowVideo(true);
        }
      };
      
      // Show after 1 second delay initially
      timer = setTimeout(() => {
        setShowVideo(true);
        // Initialize player after delay
        if (window.YT && window.YT.Player) {
          initializePlayer();
        } else {
          // Wait for API to load
          const checkAPI = setInterval(() => {
            if (window.YT && window.YT.Player) {
              clearInterval(checkAPI);
              initializePlayer();
            }
          }, 100);
          
          return () => {
            clearInterval(checkAPI);
          };
        }
      }, 1000);
      
      return () => {
        if (timer) clearTimeout(timer);
        if (loopTimer) clearTimeout(loopTimer);
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch (e) {
            // Ignore destroy errors
          }
          playerRef.current = null;
        }
      };
    } else {
      setShowVideo(true);
    }

    // Cleanup for non-YouTube videos
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
    } else if (!isYoutube) {
      // For MP4 files, use video tag
      const video = videoRef.current;
      if (!video) {
        return;
      }

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
      ) : isYouTube ? (
        // YouTube embed - use iframe (non-interactive, no UI elements)
        <>
          {/* Connecting animation - shown before video */}
          {!showVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-30">
              <div className="text-center">
                <div className="text-hud-accent text-xl font-mono font-bold mb-4 animate-pulse">
                  CONNECTING...
                </div>
                <div className="flex justify-center gap-2">
                  <div className="w-2 h-2 bg-hud-accent rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1s' }}></div>
                  <div className="w-2 h-2 bg-hud-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1s' }}></div>
                  <div className="w-2 h-2 bg-hud-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1s' }}></div>
                </div>
                <div className="text-hud-text-dim text-xs font-mono mt-4">
                  Establishing video stream
                </div>
              </div>
            </div>
          )}
          <div 
            className="absolute inset-0 w-full h-full bg-black overflow-hidden" 
            style={{ 
              opacity: showVideo ? 1 : 0, 
              transition: 'opacity 0.3s',
              pointerEvents: 'none' // Disable all interactions
            }}
          >
          {/* YouTube player container - API will create iframe here */}
          <div
            ref={playerContainerRef}
            id={playerIdRef.current}
            className="absolute inset-0 w-full h-full"
            style={{ 
              pointerEvents: 'none',
              transform: 'scale(1.1)',
              transformOrigin: 'center center',
              width: '110%',
              height: '110%',
              left: '-5%',
              top: '-5%'
            }}
          />
          {/* Fallback iframe if API not available */}
          {!playerRef.current && (
            <iframe
              ref={iframeRef}
              src={url}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen={false}
              frameBorder="0"
              title="YouTube video player"
              style={{ 
                pointerEvents: 'none',
                transform: 'scale(1.1)',
                transformOrigin: 'center center',
                width: '110%',
                height: '110%',
                left: '-5%',
                top: '-5%'
              }}
            />
          )}
          {/* Overlays to hide YouTube UI elements */}
          {/* Top-left: YouTube logo area */}
          <div 
            className="absolute top-0 left-0 z-20 pointer-events-none"
            style={{
              width: '120px',
              height: '60px',
              background: 'linear-gradient(to bottom right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)'
            }}
          />
          {/* Bottom-right: Controls area */}
          <div 
            className="absolute bottom-0 right-0 z-20 pointer-events-none"
            style={{
              width: '200px',
              height: '80px',
              background: 'linear-gradient(to top left, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)'
            }}
          />
          {/* Top-right: Menu/Share buttons */}
          <div 
            className="absolute top-0 right-0 z-20 pointer-events-none"
            style={{
              width: '150px',
              height: '60px',
              background: 'linear-gradient(to bottom left, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)'
            }}
          />
          {/* Bottom-left: Title/info area */}
          <div 
            className="absolute bottom-0 left-0 z-20 pointer-events-none"
            style={{
              width: '300px',
              height: '60px',
              background: 'linear-gradient(to top right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)'
            }}
          />
        </div>
        </>
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
          preload="auto"
        />
      )}
      {needsInteraction && !isStream && !isYouTube && (
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

