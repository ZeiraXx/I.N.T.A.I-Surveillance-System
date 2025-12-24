import { memo, useEffect, useRef } from 'react';
import type { Detection } from '@/types/dashboard';

interface OverlayBoxesProps {
  detections: Detection[];
  feedType: 'live' | 'manipulated';
  showBoxes: boolean;
  highlightTarget: boolean;
}

export const OverlayBoxes = memo(function OverlayBoxes({
  detections,
  feedType,
  showBoxes,
  highlightTarget,
}: OverlayBoxesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!showBoxes) return;

    // Filter detections for this feed
    const feedDetections = detections.filter((d) => d.feed === feedType);

    // Draw each detection
    feedDetections.forEach((detection) => {
      const { bbox, isTarget, confidence } = detection;
      
      // Convert normalized coordinates to pixel coordinates
      const x = bbox.x * canvas.width;
      const y = bbox.y * canvas.height;
      const w = bbox.w * canvas.width;
      const h = bbox.h * canvas.height;

      // Choose color based on whether it's the target
      const color = isTarget && highlightTarget ? '#ff0040' : '#00ff9d';
      const lineWidth = isTarget && highlightTarget ? 3 : 2;

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(x, y, w, h);

      // Draw corner markers
      const cornerLength = 10;
      ctx.beginPath();
      // Top-left
      ctx.moveTo(x, y + cornerLength);
      ctx.lineTo(x, y);
      ctx.lineTo(x + cornerLength, y);
      // Top-right
      ctx.moveTo(x + w - cornerLength, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + cornerLength);
      // Bottom-left
      ctx.moveTo(x, y + h - cornerLength);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + cornerLength, y + h);
      // Bottom-right
      ctx.moveTo(x + w - cornerLength, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h - cornerLength);
      ctx.stroke();

      // Draw confidence label
      const label = `${Math.round(confidence * 100)}%`;
      ctx.font = '12px monospace';
      ctx.fillStyle = color;
      
      // Draw background for text
      const textMetrics = ctx.measureText(label);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x, y - 18, textMetrics.width + 8, 16);
      
      // Draw text
      ctx.fillStyle = color;
      ctx.fillText(label, x + 4, y - 6);

      // Add "TARGET" label if it's the target
      if (isTarget && highlightTarget) {
        const targetLabel = 'TARGET';
        const targetMetrics = ctx.measureText(targetLabel);
        ctx.fillStyle = 'rgba(255, 0, 64, 0.9)';
        ctx.fillRect(x, y + h + 2, targetMetrics.width + 8, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(targetLabel, x + 4, y + h + 14);
      }
    });
  }, [detections, feedType, showBoxes, highlightTarget]);

  return (
    <canvas
      ref={canvasRef}
      width={1920}
      height={1080}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
});


