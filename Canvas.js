import {
  vector,
  midpoint,
  normalizeVector,
  angleABC,
  angleBetweenVectors,
} from './Core';
  
// 🔹 Draw a solid line between two points
export const drawLine = (ctx, a, b, color = 'black', width = 2) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
};

// 🔹 Draw a perpendicular line through the center of line AB
export const drawPerpendicular = (ctx, a, b, center, color = 'blue') => {
  const base = vector(a, b);
  const perp = normalizeVector({ x: -base.y, y: base.x });

  const canvasHeight = ctx.canvas.height;
  const scale = canvasHeight * 2;

  const p1 = {
    x: center.x + perp.x * scale,
    y: center.y + perp.y * scale
  };
  const p2 = {
    x: center.x - perp.x * scale,
    y: center.y - perp.y * scale
  };

  drawLine(ctx, p1, p2, color, 1.5);
};

// 🔹 Draw an acute arc at ∠ABC
export const drawAngleArc = (ctx, A, B, C, color = 'purple', r = 25, angleLabel = null) => {
  const v1 = vector(B, A);
  const v2 = vector(B, C);
  const nv1 = normalizeVector(v1);
  const nv2 = normalizeVector(v2);

  let startAngle = Math.atan2(nv1.y, nv1.x);
  let endAngle = Math.atan2(nv2.y, nv2.x);

  let delta = endAngle - startAngle;
  delta = ((delta + 2 * Math.PI) % (2 * Math.PI)); // Normalize to [0, 2π]
  let clockwise = delta < 0 || delta > Math.PI; // Compute clockwise without reassignment

  ctx.beginPath();
  ctx.arc(B.x, B.y, r, startAngle, endAngle, clockwise);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Optional label
  if (angleLabel !== null) {
    const mid = (startAngle + endAngle) / 2;
    const lx = B.x + (r + 15) * Math.cos(mid);
    const ly = B.y + (r + 15) * Math.sin(mid);
    ctx.fillStyle = color;
    ctx.font = "13px sans-serif";
    ctx.fillText(angleLabel, lx, ly);
  }
};

// 🔹 Cobb angle helper: draws perpendiculars
export const drawCobbAngle = (ctx, line1, line2, color = 'orange') => {
  const mid1 = midpoint(line1[0], line1[1]);
  const mid2 = midpoint(line2[0], line2[1]);
  drawPerpendicular(ctx, line1[0], line1[1], mid1, color);
  drawPerpendicular(ctx, line2[0], line2[1], mid2, color);
};

// 🔹 Full vertical reference line (e.g., SVA)
export const drawVerticalLine = (ctx, x, height, color = 'red', width = 2) => {
  drawLine(ctx, { x, y: 0 }, { x, y: height }, color, width);
};

// 🔹 Dashed line utility
export const drawDashedLine = (ctx, a, b, dash = [5, 5], color = 'black', width = 1) => {
  ctx.setLineDash(dash);
  drawLine(ctx, a, b, color, width);
  ctx.setLineDash([]);
};

// 🔹 Label (e.g., angle value or radius)
export const drawAngleLabel = (ctx, position, label, color = 'black') => {
  ctx.fillStyle = color;
  ctx.font = "14px sans-serif";
  ctx.fillText(label, position.x, position.y);
};

// 🔹 Draw general angle arc between 2 vectors (for PI, PT, etc.)
export const drawArc = (ctx, center, v1, v2, radius, color, label, angle) => {
  const nv1 = normalizeVector(v1);
  const nv2 = normalizeVector(v2);

  let a1 = Math.atan2(nv1.y, nv1.x);
  let a2 = Math.atan2(nv2.y, nv2.x);

  let delta = a2 - a1;
  delta = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;

  if (Math.abs(delta) > Math.PI / 2) {
    delta = -Math.sign(delta) * (Math.PI - Math.abs(delta));
  }

  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, a1, a1 + delta, delta < 0);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Label at midpoint of arc
  const midAngle = a1 + delta / 2;
  const lx = center.x + (radius + 15) * Math.cos(midAngle);
  const ly = center.y + (radius + 15) * Math.sin(midAngle);
  ctx.fillStyle = color;
  ctx.font = "13px sans-serif";
  ctx.fillText(`${label}: ${Math.round(angle)}°`, lx, ly);
};

// 🔹 Full ∠ABC visualization
export const drawABC = (ctx, A, B, C, label = "Angle", color = "blue") => {
  drawLine(ctx, A, B, color, 2);
  drawLine(ctx, B, C, color, 2);
  const angle = angleABC(A, B, C);
  drawAngleArc(ctx, A, B, C, color, 25, `${label}: ${angle.toFixed(1)}°`);
};

