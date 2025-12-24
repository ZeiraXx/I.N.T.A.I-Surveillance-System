import { z } from 'zod';

// Zod schemas for validation
export const FeedSchema = z.object({
  type: z.enum(['mp4', 'youtube']),
  url: z.string(),
});

export const TargetSchema = z.object({
  portraitUrl: z.string(),
  confidence: z.number().min(0).max(1),
  label: z.string().optional(),
});

export const CameraMetaSchema = z.object({
  cameraId: z.string(),
  cameraName: z.string(),
  location: z.string(),
  status: z.enum(['online', 'offline']),
  latencyMs: z.number(),
  fps: z.number(),
  resolution: z.string(),
  device: z.record(z.unknown()),
});

export const BoundingBoxSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0).max(1),
  h: z.number().min(0).max(1),
});

export const DetectionSchema = z.object({
  id: z.string(),
  feed: z.enum(['live', 'manipulated']),
  bbox: BoundingBoxSchema,
  confidence: z.number().min(0).max(1),
  isTarget: z.boolean(),
});

export const DashboardStateSchema = z.object({
  timestamp: z.string(),
  feeds: z.object({
    live: FeedSchema,
    manipulated: FeedSchema,
  }),
  target: TargetSchema,
  cameraMeta: CameraMetaSchema,
  detections: z.array(DetectionSchema),
});

// TypeScript types
export type Feed = z.infer<typeof FeedSchema>;
export type Target = z.infer<typeof TargetSchema>;
export type CameraMeta = z.infer<typeof CameraMetaSchema>;
export type BoundingBox = z.infer<typeof BoundingBoxSchema>;
export type Detection = z.infer<typeof DetectionSchema>;
export type DashboardState = z.infer<typeof DashboardStateSchema>;


