// 📐 Basic Geometry Utilities

export const midpoint = (a, b) => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});
 
export const vector = (a, b) => ({
  x: b.x - a.x,
  y: b.y - a.y,
});
 
export const normalizeVector = (v) => {
  const len = Math.hypot(v.x, v.y) || 1e-6;
  return { x: v.x / len, y: v.y / len };
};

export const dotProduct = (v1, v2) => v1.x * v2.x + v1.y * v2.y;

export const lengthBetweenPoints = (p1, p2) =>
  Math.hypot(p2.x - p1.x, p2.y - p1.y);

export const lengthPointToLine = (pt, [a, b]) => {
  const num = Math.abs((b.y - a.y) * pt.x - (b.x - a.x) * pt.y + b.x * a.y - b.y * a.x);
  const den = Math.hypot(b.y - a.y, b.x - a.x);
  return num / (den || 1e-6);
};

// 🧭 Angle Computations

// Angle between line AB and horizontal axis (0° = right)
export const angleWithHorizontal = (a, b) => {
  if (!a || !b) return 0;
  const dy = b.y - a.y;
  const dx = b.x - a.x;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

// Angle between line AB and vertical axis (0° = up)
export const angleWithVertical = (a, b) => {
  if (!a || !b) return 0;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return (Math.atan2(dx, dy) * 180) / Math.PI;
};

// ∠ABC - full internal angle at vertex B (in degrees)
export const angleABC = (a, b, c) => {
  const ab = vector(b, a);
  const cb = vector(b, c);
  return angleBetweenVectors(ab, cb) * (180 / Math.PI);
};

// ∠ABC forced acute (always ≤ 90°)
export const angleABCacute = (a, b, c) => {
  const angle = angleABC(a, b, c);
  return Math.min(angle, 180 - angle);
};

// Angle between two vectors (in radians)
export const angleBetweenVectors = (v1, v2) => {
  const dot = dotProduct(normalizeVector(v1), normalizeVector(v2));
  return Math.acos(Math.min(Math.max(dot, -1), 1));
};

// Acute angle between vectors (in degrees)
export const acuteAngle = (v1, v2) => {
  const rad = angleBetweenVectors(v1, v2);
  const deg = rad * (180 / Math.PI);
  return Math.min(deg, 180 - deg);
};

// Cobb angle: difference in inclination of two lines from horizontal
export const cobbAngle = (line1, line2) => {
  const a1 = angleWithHorizontal(line1[0], line1[1]);
  const a2 = angleWithHorizontal(line2[0], line2[1]);
  let diff = Math.abs(a1 - a2);
  if (diff > 180) diff = 360 - diff;
  return Math.min(diff, 180 - diff); // always acute
};
