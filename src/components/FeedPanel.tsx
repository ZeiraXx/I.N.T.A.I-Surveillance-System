import { memo } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { OverlayBoxes } from './OverlayBoxes';
import type { Detection } from '@/types/dashboard';

interface FeedPanelProps {
  title: string;
  cameraId: string;
  cameraName: string;
  videoUrl: string;
  timestamp: string;
  detections: Detection[];
  feedType: 'live' | 'manipulated';
  showBoxes: boolean;
  highlightTarget: boolean;
  isOnline: boolean;
}

export const FeedPanel = memo(function FeedPanel({
  title,
  cameraId,
  cameraName,
  videoUrl,
  timestamp,
  detections,
  feedType,
  showBoxes,
  highlightTarget,
  isOnline,
}: FeedPanelProps) {
  const formattedTime = new Date(timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="hud-panel flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-hud-border bg-hud-panel/50">
        <div className="flex items-center gap-3">
          <span className="text-hud-accent font-mono font-bold text-sm tracking-wider">
            {title}
          </span>
          <span className="text-hud-text-dim text-xs font-mono">
            {cameraId} / {cameraName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-hud-red animate-pulse-slow' : 'bg-gray-600'}`} />
            <span className={`text-xs font-mono font-bold ${isOnline ? 'text-hud-red' : 'text-gray-600'}`}>
              {isOnline ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
          <span className="text-hud-text-dim text-xs font-mono">{formattedTime}</span>
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 relative bg-black overflow-hidden">
        <VideoPlayer url={videoUrl} />
        <OverlayBoxes
          detections={detections}
          feedType={feedType}
          showBoxes={showBoxes}
          highlightTarget={highlightTarget}
        />
        
        {!isOnline && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <div className="text-center">
              <div className="text-hud-red text-2xl font-mono font-bold mb-2 animate-pulse">
                SIGNAL LOST
              </div>
              <div className="text-hud-text-dim text-sm font-mono">
                RETRYING CONNECTION...
              </div>
            </div>
          </div>
        )}

        {/* Microtext overlay */}
        <div className="absolute bottom-2 left-2 text-[10px] font-mono text-hud-text-dim/50 pointer-events-none">
          REC MODE / {feedType.toUpperCase()}
        </div>
      </div>
    </div>
  );
});


