import { useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { FeedPanel } from './FeedPanel';
import { TargetPanel } from './TargetPanel';
import { MetaPanel } from './MetaPanel';
import { TopBarControls } from './TopBarControls';

export function DashboardPage() {
  const { data, isLoading, isError, dataMode } = useDashboard();
  const [showBoxes, setShowBoxes] = useState(true);
  const [highlightTarget, setHighlightTarget] = useState(true);
  const [showScanlines, setShowScanlines] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'side' | 'stack'>('side');

  // Disable bounding boxes in demo mode
  const effectiveShowBoxes = dataMode === 'demo' ? false : showBoxes;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hud-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-hud-accent text-2xl font-mono font-bold mb-2 animate-pulse">
            INITIALIZING SYSTEM...
          </div>
          <div className="text-hud-text-dim text-sm font-mono">
            Loading surveillance interface
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-hud-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-hud-red text-2xl font-mono font-bold mb-2">
            SYSTEM ERROR
          </div>
          <div className="text-hud-text-dim text-sm font-mono">
            Failed to establish connection
          </div>
        </div>
      </div>
    );
  }

  const isOnline = data.cameraMeta.status === 'online';

  return (
    <div className="min-h-screen bg-hud-bg text-hud-text p-4 relative">
      {/* Grid background */}
      <div className="grid-bg" />
      
      {/* Scanlines overlay */}
      {showScanlines && <div className="scanlines" />}

      {/* Top bar controls */}
      <TopBarControls
        showBoxes={effectiveShowBoxes}
        highlightTarget={highlightTarget}
        showScanlines={showScanlines}
        dataMode={dataMode}
        layoutMode={layoutMode}
        onToggleBoxes={() => setShowBoxes(!showBoxes)}
        onToggleHighlight={() => setHighlightTarget(!highlightTarget)}
        onToggleScanlines={() => setShowScanlines(!showScanlines)}
        onToggleLayout={() => setLayoutMode(layoutMode === 'side' ? 'stack' : 'side')}
        disableBboxToggle={dataMode === 'demo'}
        disableTargetToggle={dataMode === 'demo'}
        disableScanToggle={dataMode === 'demo'}
      />

      {/* Main header */}
      <div className="mb-6 flex items-center gap-6">
        <img
          src={`${import.meta.env.BASE_URL}twistcode_logo.png`}
          alt="Twistcode"
          className="w-48 h-20 object-contain"
        />
        <div>
          <h1 className="text-2xl font-mono font-bold text-hud-accent tracking-wider leading-tight">
            I.N.T.A.I Surveillance System
          </h1>
          <div className="text-xs font-mono text-hud-text-dim mt-2 tracking-wide">
            CCTV FEEDS / TARGET TRACKING / REAL-TIME ANALYSIS
          </div>
        </div>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-10 gap-4 h-[calc(100vh-140px)]">
        {/* Left column: Target + Meta */}
        <div className="col-span-2 space-y-4">
          {/* Target panel */}
          <div className="hud-panel p-4">
            <TargetPanel target={data.target} />
          </div>
          
          {/* Metadata panel */}
          <div className="hud-panel p-4 flex-1">
            <MetaPanel meta={data.cameraMeta} timestamp={data.timestamp} />
          </div>
        </div>

        {/* Feeds area */}
        <div className="col-span-8 h-full">
          {layoutMode === 'side' ? (
            <div className="grid grid-cols-2 gap-4 h-full">
              <FeedPanel
                title="LIVE FEED"
                cameraId={data.cameraMeta.cameraId}
                cameraName={data.cameraMeta.cameraName}
                videoUrl={data.feeds.live.url}
                timestamp={data.timestamp}
                detections={data.detections}
                feedType="live"
                showBoxes={effectiveShowBoxes}
                highlightTarget={highlightTarget}
                isOnline={isOnline}
              />
              <FeedPanel
                title="MANIPULATED FEED"
                cameraId={data.cameraMeta.cameraId}
                cameraName={data.cameraMeta.cameraName}
                videoUrl={data.feeds.manipulated.url}
                timestamp={data.timestamp}
                detections={data.detections}
                feedType="manipulated"
                showBoxes={effectiveShowBoxes}
                highlightTarget={highlightTarget}
                isOnline={isOnline}
              />
            </div>
          ) : (
            <div className="grid grid-rows-2 gap-4 h-full">
              <FeedPanel
                title="LIVE FEED"
                cameraId={data.cameraMeta.cameraId}
                cameraName={data.cameraMeta.cameraName}
                videoUrl={data.feeds.live.url}
                timestamp={data.timestamp}
                detections={data.detections}
                feedType="live"
                showBoxes={effectiveShowBoxes}
                highlightTarget={highlightTarget}
                isOnline={isOnline}
              />
              <FeedPanel
                title="MANIPULATED FEED"
                cameraId={data.cameraMeta.cameraId}
                cameraName={data.cameraMeta.cameraName}
                videoUrl={data.feeds.manipulated.url}
                timestamp={data.timestamp}
                detections={data.detections}
                feedType="manipulated"
                showBoxes={effectiveShowBoxes}
                highlightTarget={highlightTarget}
                isOnline={isOnline}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-2 left-4 text-[10px] font-mono text-hud-text-dim/50">
        SYSTEM v1.0.0
      </div>
    </div>
  );
}

