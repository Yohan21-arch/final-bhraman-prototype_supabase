import test from "node:test";
import assert from "node:assert/strict";
import { zoomAt, clampCamera, fitState, DEFAULT_CAMERA } from "./map-camera.ts";

test("zoom preserves the geographic point under the gesture anchor", () => {
  const before = { x: -200, y: -100, zoom: 2 };
  const anchor = { x: 300, y: 400 };
  const after = zoomAt(before, anchor, 3, 800, 900);
  assert.equal((anchor.x - before.x) / before.zoom, (anchor.x - after.x) / after.zoom);
  assert.equal((anchor.y - before.y) / before.zoom, (anchor.y - after.y) / after.zoom);
});
test("camera limits prevent the map from being dragged out of reach", () => {
  assert.deepEqual(clampCamera({ x: 10000, y: -10000, zoom: 20 }, 800, 900), { x: 280, y: -4050, zoom: 5 });
  assert.deepEqual(clampCamera({ x: 0, y: 0, zoom: .1 }, 800, 900), DEFAULT_CAMERA);
});
test("state framing keeps the selected region above the mobile sheet", () => {
  const bounds: [number, number, number, number] = [250, 300, 180, 150];
  const desktop = fitState(bounds, 800, 900);
  const mobile = fitState(bounds, 800, 900, true);
  assert.ok(mobile.zoom <= desktop.zoom);
  assert.ok(Math.abs(375 * mobile.zoom + mobile.y - 900 * .34) < .001);
  assert.ok(Math.abs(340 * mobile.zoom + mobile.x - 400) < .001);
});

