export interface MapCamera { x: number; y: number; zoom: number }
export const DEFAULT_CAMERA: MapCamera = { x: 0, y: 0, zoom: 1 };
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 5;
export function clampCamera(camera: MapCamera, width: number, height: number): MapCamera {
  const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, camera.zoom));
  // Keep part of India reachable while allowing southern/island states above the sheet.
  const marginX = width * 0.35;
  const marginY = height * 0.5;
  return {
    zoom,
    x: Math.max(width * (1 - zoom) - marginX, Math.min(marginX, camera.x)),
    y: Math.max(height * (1 - zoom) - marginY, Math.min(marginY, camera.y)),
  };
}
export function zoomAt(camera: MapCamera, point: { x: number; y: number }, zoom: number, width: number, height: number): MapCamera {
  const target = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
  const ratio = target / camera.zoom;
  return clampCamera({ zoom: target, x: point.x - (point.x - camera.x) * ratio, y: point.y - (point.y - camera.y) * ratio }, width, height);
}
export function fitState(bbox: [number, number, number, number], width: number, height: number, mobile = false): MapCamera {
  const [x, y, w, h] = bbox;
  const zoom = Math.min(3.4, Math.max(1.2, Math.min(width / (w + 120), height * (mobile ? 0.55 : 0.8) / (h + 120))));
  return clampCamera({ zoom, x: width / 2 - (x + w / 2) * zoom, y: height * (mobile ? 0.34 : 0.48) - (y + h / 2) * zoom }, width, height);
}
export interface MapViewState {
  clusterIds?: string[];
  camera: MapCamera;
  showLabels: boolean;
  showPins: boolean;
  focusedStateId: string;
}
export const DEFAULT_MAP_VIEW: MapViewState = { camera: DEFAULT_CAMERA, showLabels: true, showPins: true, focusedStateId: "rajasthan" };

