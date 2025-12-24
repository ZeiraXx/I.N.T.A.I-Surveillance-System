import type { DashboardState, Detection } from '@/types/dashboard';

// Generate a placeholder data URL for portrait (abstract silhouette)
function generatePlaceholderPortrait(): string {
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#1a1f26"/>
      <circle cx="100" cy="80" r="35" fill="#00ff9d" opacity="0.3"/>
      <path d="M 50 150 Q 100 120 150 150 L 150 200 L 50 200 Z" fill="#00ff9d" opacity="0.3"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Smoothly interpolate between values
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

class MockDataGenerator {
  private detectionTargets: Map<string, { current: Detection; target: Detection; startTime: number }> = new Map();
  private baseConfidence = 0.20;
  private lastToggleTime = Date.now();
  private isOnline = true;

  constructor() {
    // Initialize with some detections
    this.initializeDetections();
  }

  private initializeDetections() {
    const liveDetection: Detection = {
      id: 'd-live-1',
      feed: 'live',
      bbox: { x: 0.42, y: 0.18, w: 0.10, h: 0.22 },
      confidence: 0.78,
      isTarget: true,
    };

    const manipDetection: Detection = {
      id: 'd-manip-1',
      feed: 'manipulated',
      bbox: { x: 0.38, y: 0.20, w: 0.11, h: 0.23 },
      confidence: 0.72,
      isTarget: true,
    };

    // Add non-target detections
    const liveExtra: Detection = {
      id: 'd-live-2',
      feed: 'live',
      bbox: { x: 0.15, y: 0.45, w: 0.08, h: 0.18 },
      confidence: 0.65,
      isTarget: false,
    };

    const manipExtra: Detection = {
      id: 'd-manip-2',
      feed: 'manipulated',
      bbox: { x: 0.70, y: 0.35, w: 0.09, h: 0.20 },
      confidence: 0.58,
      isTarget: false,
    };

    this.detectionTargets.set(liveDetection.id, {
      current: liveDetection,
      target: this.generateRandomTarget(liveDetection),
      startTime: Date.now(),
    });

    this.detectionTargets.set(manipDetection.id, {
      current: manipDetection,
      target: this.generateRandomTarget(manipDetection),
      startTime: Date.now(),
    });

    this.detectionTargets.set(liveExtra.id, {
      current: liveExtra,
      target: this.generateRandomTarget(liveExtra),
      startTime: Date.now(),
    });

    this.detectionTargets.set(manipExtra.id, {
      current: manipExtra,
      target: this.generateRandomTarget(manipExtra),
      startTime: Date.now(),
    });
  }

  private generateRandomTarget(current: Detection): Detection {
    const maxMove = 0.15;
    return {
      ...current,
      bbox: {
        x: Math.max(0.05, Math.min(0.85, current.bbox.x + (Math.random() - 0.5) * maxMove)),
        y: Math.max(0.05, Math.min(0.75, current.bbox.y + (Math.random() - 0.5) * maxMove)),
        w: current.bbox.w + (Math.random() - 0.5) * 0.03,
        h: current.bbox.h + (Math.random() - 0.5) * 0.03,
      },
      confidence: Math.max(0.3, Math.min(0.95, current.confidence + (Math.random() - 0.5) * 0.2)),
    };
  }

  private updateDetections(): Detection[] {
    const now = Date.now();
    const detections: Detection[] = [];

    this.detectionTargets.forEach((state, id) => {
      const elapsed = now - state.startTime;
      const duration = 2000; // 2 seconds to reach target
      const t = Math.min(elapsed / duration, 1);

      // Lerp to target
      const current: Detection = {
        ...state.current,
        bbox: {
          x: lerp(state.current.bbox.x, state.target.bbox.x, t),
          y: lerp(state.current.bbox.y, state.target.bbox.y, t),
          w: lerp(state.current.bbox.w, state.target.bbox.w, t),
          h: lerp(state.current.bbox.h, state.target.bbox.h, t),
        },
        confidence: lerp(state.current.confidence, state.target.confidence, t),
      };

      // If reached target, generate new target
      if (t >= 1) {
        this.detectionTargets.set(id, {
          current,
          target: this.generateRandomTarget(current),
          startTime: now,
        });
      } else {
        this.detectionTargets.set(id, { ...state, current });
      }

      detections.push(current);
    });

    return detections;
  }

  generate(): DashboardState {
    const now = Date.now();
    
    // Occasionally toggle online/offline for 1-2 seconds
    if (now - this.lastToggleTime > 15000) {
      this.isOnline = false;
      this.lastToggleTime = now;
    } else if (!this.isOnline && now - this.lastToggleTime > 2000) {
      this.isOnline = true;
    }

    // Fluctuate confidence slightly
    this.baseConfidence = Math.max(
      0.15,
      Math.min(0.35, this.baseConfidence + (Math.random() - 0.5) * 0.05)
    );

    const liveUrl = import.meta.env.VITE_MOCK_LIVE_MP4_URL || '';
    const manipUrl = import.meta.env.VITE_MOCK_MANIP_MP4_URL || '';

    return {
      timestamp: new Date().toISOString(),
      feeds: {
        live: {
          type: 'mp4',
          url: liveUrl,
        },
        manipulated: {
          type: 'mp4',
          url: manipUrl,
        },
      },
      target: {
        portraitUrl: generatePlaceholderPortrait(),
        confidence: this.baseConfidence,
        label: 'UNKNOWN SUBJECT',
      },
      cameraMeta: {
        cameraId: 'R-39-F-003',
        cameraName: 'CAM 41A',
        location: 'Terminal 2 / Concourse F',
        status: this.isOnline ? 'online' : 'offline',
        latencyMs: Math.floor(80 + Math.random() * 40),
        fps: 30,
        resolution: '1920x1080',
        device: {
          model: 'AXIS Q3517-LVE',
          firmware: '11.6.92',
          ip: '10.0.12.44',
          codec: 'H.264',
          lens: 'f/1.4 3-9mm',
          irMode: 'Auto',
        },
      },
      detections: this.updateDetections(),
    };
  }
}

export const mockGenerator = new MockDataGenerator();


