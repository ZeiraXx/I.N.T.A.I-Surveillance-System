import type { CameraMeta } from '@/types/dashboard';

interface MetaPanelProps {
  meta: CameraMeta;
  timestamp: string;
}

export function MetaPanel({ meta, timestamp }: MetaPanelProps) {
  const formattedTime = new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-hud-accent text-xs font-mono font-bold tracking-wider border-b border-hud-border pb-2">
        CAMERA METADATA
      </div>

      {/* Metadata grid */}
      <div className="space-y-2 text-xs font-mono">
        <MetaRow label="CAMERA ID" value={meta.cameraId} />
        <MetaRow label="CAMERA NAME" value={meta.cameraName} />
        <MetaRow label="LOCATION" value={meta.location} />
        <MetaRow
          label="STATUS"
          value={meta.status.toUpperCase()}
          valueClass={meta.status === 'online' ? 'text-hud-accent' : 'text-hud-red'}
        />
        <MetaRow label="LATENCY" value={`${meta.latencyMs}ms`} />
        <MetaRow label="FPS" value={meta.fps.toString()} />
        <MetaRow label="RESOLUTION" value={meta.resolution} />
        <MetaRow label="TIMESTAMP" value={formattedTime} />
        
        {/* Device info */}
        <div className="pt-2 border-t border-hud-border/30">
          {Object.entries(meta.device).map(([key, value]) => (
            <MetaRow
              key={key}
              label={key.toUpperCase().replace(/_/g, ' ')}
              value={String(value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface MetaRowProps {
  label: string;
  value: string;
  valueClass?: string;
}

function MetaRow({ label, value, valueClass = 'text-hud-text' }: MetaRowProps) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="text-hud-text-dim text-[11px]">{label}</span>
      <span className={`${valueClass} font-bold text-right`}>{value}</span>
    </div>
  );
}


