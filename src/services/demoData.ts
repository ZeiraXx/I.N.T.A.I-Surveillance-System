import type { DashboardState } from '@/types/dashboard';

class DemoDataGenerator {
  generate(): DashboardState {
    const now = Date.now();
    const baseUrl = import.meta.env.BASE_URL;
    
    // Confidence: always static at 93%
    const confidence = 0.93;

    // Latency: realistic random values that change every 3 seconds
    const latencySeed = Math.floor(now / 3000); // Changes every 3 seconds
    const latencyRandom = (Math.sin(latencySeed * 78.233) * 43758.5453) % 1;
    const latencyMs = Math.floor(42 + (Math.abs(latencyRandom) * 85)); // 42-127ms realistic range

    return {
      timestamp: new Date().toISOString(), // Always current timestamp (updates even after polling slows)
      feeds: {
        live: {
          type: 'youtube',
          url: 'https://www.youtube.com/embed/G8PIodyHClU?autoplay=1&loop=1&playlist=G8PIodyHClU&mute=1&controls=0&modestbranding=1&disablekb=1&iv_load_policy=3&rel=0&fs=0&playsinline=1&enablejsapi=1',
        },
        manipulated: {
          type: 'youtube',
          url: 'https://www.youtube.com/embed/PMCpqU7_Q5U?autoplay=1&loop=1&playlist=G8PIodyHClU&mute=1&controls=0&modestbranding=1&disablekb=1&iv_load_policy=3&rel=0&fs=0&playsinline=1&enablejsapi=1',
        },
      },
      target: {
        portraitUrl: `${baseUrl}VIP1.jpg`,
        confidence: confidence,
        label: 'VIP1',
      },
      cameraMeta: {
        cameraId: 'R-39-F-003',
        cameraName: 'CAM 41A',
        location: 'Terminal 2 / Concourse F',
        status: 'online',
        latencyMs: latencyMs, // Dynamic latency that changes every 3 seconds
        fps: 30,
        resolution: '1920x1080',
        device: {
          model: 'Demo Camera',
          firmware: '1.0.0',
          ip: 'localhost',
          codec: 'H.264',
          lens: 'Built-in',
          irMode: 'Auto',
        },
      },
      detections: [], // No detections in demo mode
    };
  }
}

export const demoGenerator = new DemoDataGenerator();

