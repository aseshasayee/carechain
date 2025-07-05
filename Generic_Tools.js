import {
  vector,
  midpoint,
  angleABC,
  cobbAngle,
  normalizeVector,
  lengthBetweenPoints,
  angleWithHorizontal,
  angleWithVertical,
} from './Core';
  
import {
  drawLine,
  drawArc,
  drawPerpendicular,
  drawAngleArc,
  drawABC,
  drawAngleLabel,
  drawDashedLine,
  drawCobbAngle
} from './Canvas';

/**
 * Handle simple 2-point line drawing
 */
export const handleLineTool = (points, ctx) => {
  if (points.length !== 2) return null;
  drawLine(ctx, points[0], points[1], "black", 2);
  const length = lengthBetweenPoints(points[0], points[1]);
  drawAngleLabel(ctx, midpoint(points[0], points[1]), `${length.toFixed(1)} px`, "black");
  return { type: "line", length };
};

/**
 * Handle angle tool: 2-point version (with horizontal/vertical reference)
 */
export const handleAngleTool2Pt = (points, ctx) => {
  if (points.length !== 2) return null;
  const [p1, p2] = points;
  drawLine(ctx, p1, p2, "black", 2);

  // Dashed reference lines
  drawDashedLine(ctx, p1, { x: p2.x, y: p1.y }, [5, 5], "gray");
  drawDashedLine(ctx, p1, { x: p1.x, y: p2.y }, [5, 5], "gray");

  const angleH = angleWithHorizontal(p1, p2);
  const angleV = angleWithVertical(p1, p2);

  drawAngleLabel(ctx, midpoint(p1, p2), `H: ${angleH.toFixed(1)}°, V: ${angleV.toFixed(1)}°`, "blue");

  return {
    type: "angle2pt",
    angleHorizontal: angleH,
    angleVertical: angleV,
  };
};

/**
 * Handle angle tool: 3-point version (angle at middle point B)
 */
export const handleAngleTool3Pt = (points, ctx) => {
  if (points.length !== 3) return null;
  const [a, b, c] = points;
  drawABC(ctx, a, b, c, "Angle", "purple");
  const angle = angleABC(a, b, c);
  return { type: "angle3pt", angle };
};

/**
 * Handle 4-point angle tool (between two lines – Cobb angle)
 */
export const handleAngleTool4Pt = (points, ctx) => {
  if (points.length !== 4) return null;
  const [A1, A2, B1, B2] = points;
  drawLine(ctx, A1, A2, "orange", 2);
  drawLine(ctx, B1, B2, "orange", 2);
  drawCobbAngle(ctx, [A1, A2], [B1, B2]);

  const angle = cobbAngle([A1, A2], [B1, B2]);
  drawAngleLabel(
    ctx,
    midpoint(midpoint(A1, A2), midpoint(B1, B2)),
    `Cobb: ${angle.toFixed(1)}°`,
    "red"
  );

  return { type: "angle4pt", angle };
};

/**
 * Multi-line tool: connects N points in sequence
 */
export const handleMultiLineTool = (points, ctx) => {
  if (points.length < 2) return null;
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    drawLine(ctx, points[i], points[i + 1], "black", 2);
    totalLength += lengthBetweenPoints(points[i], points[i + 1]);
  }
  return { type: "multiline", segments: points.length - 1, totalLength };
};

/**
 * Draw a circle from center and edge point
 */
export const handleCircleTool = (points, ctx) => {
  if (points.length !== 2) return null;
  const [center, edge] = points;
  const radius = lengthBetweenPoints(center, edge);
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "green";
  ctx.lineWidth = 2;
  ctx.stroke();
  return { type: "circle", center, radius };
};

/**
 * Draw an ellipse from two opposite bounding box corners
 */
export const handleEllipseTool = (points, ctx) => {
  if (points.length !== 2) return null;
  const [p1, p2] = points;
  const rx = Math.abs(p2.x - p1.x) / 2;
  const ry = Math.abs(p2.y - p1.y) / 2;
  const center = midpoint(p1, p2);
  ctx.beginPath();
  ctx.ellipse(center.x, center.y, rx, ry, 0, 0, 2 * Math.PI);
  ctx.strokeStyle = "green";
  ctx.lineWidth = 2;
  ctx.stroke();
  return { type: "ellipse", center, rx, ry };
};

/**
 * Polygon tool: draw closed shape from >=3 points
 */
export const handlePolygonTool = (points, ctx) => {
  if (points.length < 3) return null;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((pt) => ctx.lineTo(pt.x, pt.y));
  ctx.closePath();
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.stroke();
  return { type: "polygon", vertices: points.length };
};

/**
 * Pencil tool: draw freehand strokes
 */
export const handlePencilTool = (points, ctx) => {
  if (points.length < 2) return null;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.forEach((pt) => ctx.lineTo(pt.x, pt.y));
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 1;
  ctx.stroke();
  return { type: "pencil", length: points.length - 1 };
};
