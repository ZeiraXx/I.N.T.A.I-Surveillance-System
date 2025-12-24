import type { Target } from '@/types/dashboard';

interface TargetPanelProps {
  target: Target;
}

export function TargetPanel({ target }: TargetPanelProps) {
  const confidencePercent = Math.round(target.confidence * 100);
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-hud-accent text-xs font-mono font-bold tracking-wider border-b border-hud-border pb-2">
        SEARCHING
      </div>

      {/* Portrait */}
      <div className="relative">
        <div className="hud-portrait-frame">
          <img
            src={target.portraitUrl}
            alt="Target"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Corner ornaments */}
        <div className="corner-ornaments"></div>
      </div>

      {/* Target label */}
      <div className="text-center">
        <div className="text-hud-text-dim text-xs font-mono mb-1">
          {target.label || 'UNKNOWN SUBJECT'}
        </div>
      </div>

      {/* Confidence */}
      <div className="text-center">
        <div className="text-hud-accent text-4xl font-mono font-bold tracking-tight">
          MATCH: {confidencePercent}%
        </div>
        <div className="mt-2 h-1 bg-hud-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-hud-red via-yellow-500 to-hud-accent transition-all duration-300"
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
      </div>

      {/* Placeholder biometric data */}
      <div className="text-[10px] font-mono text-hud-text-dim/50 space-y-1 pt-4 border-t border-hud-border/30">
        <div>TRACE RATE: CONTINUOUS</div>
        <div>FACIAL NODES: 68</div>
        <div>MATCH ALGORITHM: v3.7.2</div>
      </div>
    </div>
  );
}


