/**
 * The only thing this module needs from a camera. Structural rather than THREE.Camera so the
 * NDC→pixel arithmetic can be tested without importing Three.js into jsdom — and so this file
 * never becomes a second reason for Three.js to be in a chunk.
 */
export interface ProjectingCamera {
  /** World point → normalised device coordinates, each axis in [-1, 1]. */
  project(x: number, y: number, z: number): { x: number; y: number };
}

/**
 * A node's position in CSS pixels from the canvas top-left, so an SVG lead line can point at it.
 *
 * The Y flip is the whole reason this is a named function rather than two inline expressions:
 * NDC runs +Y up from the centre, CSS runs +Y down from the top. Getting that backwards produces
 * lead lines that are subtly, symmetrically wrong — they land on the right nodes when the rack is
 * centred and drift apart as it is not, which reads as a spacing bug rather than a sign flip.
 */
export function projectToScreen(
  x: number, y: number, z: number,
  camera: ProjectingCamera,
  width: number, height: number,
): { x: number; y: number } {
  const ndc = camera.project(x, y, z);
  return {
    x: (ndc.x + 1) * 0.5 * width,
    y: (1 - ndc.y) * 0.5 * height,
  };
}
