interface TopBarControlsProps {
  showBoxes: boolean;
  highlightTarget: boolean;
  showScanlines: boolean;
  dataMode: 'demo' | 'mock' | 'api';
  layoutMode: 'side' | 'stack';
  onToggleBoxes: () => void;
  onToggleHighlight: () => void;
  onToggleScanlines: () => void;
  onToggleLayout: () => void;
  disableBboxToggle?: boolean;
  disableTargetToggle?: boolean;
  disableScanToggle?: boolean;
}

export function TopBarControls({
  showBoxes,
  highlightTarget,
  showScanlines,
  dataMode,
  layoutMode,
  onToggleBoxes,
  onToggleHighlight,
  onToggleScanlines,
  onToggleLayout,
  disableBboxToggle = false,
  disableTargetToggle = false,
  disableScanToggle = false,
}: TopBarControlsProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
      {/* Mode indicator */}
      <div className="hud-panel px-3 py-2 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${dataMode === 'demo' ? 'bg-hud-accent' : 'bg-hud-cyan'}`} />
        <span className="text-xs font-mono text-hud-text-dim">
          {dataMode.toUpperCase()} MODE
        </span>
      </div>

      {/* Controls */}
      <div className="hud-panel px-2 py-2 flex items-center gap-2">
        <ToggleButton
          label="BBOX"
          active={showBoxes}
          onClick={onToggleBoxes}
          disabled={disableBboxToggle}
        />
        <ToggleButton
          label="TARGET"
          active={highlightTarget}
          onClick={onToggleHighlight}
          disabled={disableTargetToggle}
        />
        <ToggleButton
          label="SCAN"
          active={showScanlines}
          onClick={onToggleScanlines}
          disabled={disableScanToggle}
        />
        <ToggleButton
          label={layoutMode === 'side' ? 'SIDE' : 'STACK'}
          active={layoutMode === 'stack'}
          onClick={onToggleLayout}
        />
      </div>
    </div>
  );
}

interface ToggleButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function ToggleButton({ label, active, onClick, disabled = false }: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-3 py-1 text-[10px] font-mono font-bold tracking-wider
        border transition-all
        ${disabled
          ? 'bg-transparent border-hud-border/30 text-hud-text-dim/30 cursor-not-allowed'
          : active
            ? 'bg-hud-accent/20 border-hud-accent text-hud-accent'
            : 'bg-transparent border-hud-border text-hud-text-dim hover:border-hud-accent/50'
        }
      `}
    >
      {label}
    </button>
  );
}

