import * as d3Geo from "d3-geo";
import type { GeoCoordinates } from "@/types";

export const MAP_WIDTH = 800;
export const MAP_HEIGHT = 900;

// Standard India Mercator Projection calibrated with official Survey of India boundary GeoJSON
// Fitted exactly inside [35, 25] to [MAP_WIDTH - 35, MAP_HEIGHT - 35]
export const standardProjection = d3Geo
  .geoMercator()
  .scale(1430.9776239550113)
  .translate([-1667.9700513655803, 1028.726569085957])
  .center([0, 0]);

export function projectCoordinates(lng: number, lat: number): { x: number; y: number } {
  const coords = standardProjection([lng, lat]);
  if (!coords) {
    return { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 };
  }
  return { x: coords[0], y: coords[1] };
}

export function invertCoordinates(x: number, y: number): GeoCoordinates | null {
  const coords = standardProjection.invert?.([x, y]);
  if (!coords || isNaN(coords[0]) || isNaN(coords[1])) {
    return null;
  }
  return { lng: Number(coords[0].toFixed(4)), lat: Number(coords[1].toFixed(4)) };
}
