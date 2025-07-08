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

//Line Tool
export const handleLineTool = (points, ctx) => {
  if (points.length !== 2) return null;
  drawLine(ctx, points[0], points[1], "black", 2);
  const length = lengthBetweenPoints(points[0], points[1]);
  drawAngleLabel(ctx, midpoint(points[0], points[1]), `${length.toFixed(1)} px`, "black");
  return { type: "line", length };
};

// Angle2
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

//Angle3
export const handleAngleTool3Pt = (points, ctx) => {
  if (points.length !== 3) return null;
  const [a, b, c] = points;
  drawABC(ctx, a, b, c, "Angle", "purple");
  const angle = angleABC(a, b, c);
  return { type: "angle3pt", angle };
};

//Angle4
export const handleAngleTool4Pt = (points, ctx) => {
  if (points.length !== 4) return null;
  const [A1, A2, B1, B2] = points;
  
  // Draw the original lines
  drawLine(ctx, A1, A2, "orange", 2);
  drawLine(ctx, B1, B2, "orange", 2);
  
  // Draw the Cobb angle visualization (this will handle the angle calculation and display)
  const angle = drawCobbAngle(ctx, [A1, A2], [B1, B2]);
  
  return { type: "angle4pt", angle };
};

//Multi-Line Tool
export const handleMultiLineTool = (points, ctx) => {
  if (points.length < 2) return null;
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    drawLine(ctx, points[i], points[i + 1], "black", 2);
    totalLength += lengthBetweenPoints(points[i], points[i + 1]);
  }
  return { type: "multiline", segments: points.length - 1, totalLength };
};

// Circle Tool
export const handleCircleTool = (points, ctx) => {
  if (points.length !== 2) return null;
  const [center, edge] = points;
  const radius = lengthBetweenPoints(center, edge);
  const area = Math.PI * radius * radius;
  
  // Draw the circle
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "green";
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw radius line
  ctx.beginPath();
  ctx.moveTo(center.x, center.y);
  ctx.lineTo(edge.x, edge.y);
  ctx.strokeStyle = "green";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Draw center point
  ctx.beginPath();
  ctx.arc(center.x, center.y, 3, 0, 2 * Math.PI);
  ctx.fillStyle = "green";
  ctx.fill();
  
  // Calculate label position (outside the circle)
  const labelDistance = radius + 20;
  const angle = Math.atan2(edge.y - center.y, edge.x - center.x);
  const labelX = center.x + labelDistance * Math.cos(angle);
  const labelY = center.y + labelDistance * Math.sin(angle);
  
  // Draw background for better readability
  const text = `R: ${radius.toFixed(1)} | A: ${area.toFixed(1)}`;
  ctx.font = "14px sans-serif";
  const textWidth = ctx.measureText(text).width;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(labelX - textWidth/2 - 5, labelY - 18, textWidth + 10, 25);
  
  ctx.strokeStyle = "green";
  ctx.lineWidth = 1;
  ctx.strokeRect(labelX - textWidth/2 - 5, labelY - 18, textWidth + 10, 25);
  
  // Draw the text
  ctx.fillStyle = "green";
  ctx.textAlign = 'center';
  ctx.fillText(text, labelX, labelY - 2);
  ctx.textAlign = 'left'; // Reset text alignment
  
  return { 
    type: "circle", 
    center, 
    radius: parseFloat(radius.toFixed(1)), 
    area: parseFloat(area.toFixed(1)) 
  };
};

// Ellipse Tool
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

// Polygon Tool
export const handlePolygonTool = (points, ctx, isComplete = false) => {
  if (points.length < 2) return null;
  
  // Draw the polygon outline
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  
  if (isComplete && points.length >= 3) {
    ctx.closePath();
    ctx.fillStyle = "rgba(0, 100, 255, 0.1)";
    ctx.fill();
  }
  
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Show area if complete
  if (isComplete && points.length >= 3) {
    const area = calculatePolygonArea(points);
    
    ctx.fillStyle = "blue";
    ctx.font = "14px sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(`Area: ${area.toFixed(1)}`, points[0].x, points[0].y - 15);
  }
  
  // Show first point as red dot (draw last to ensure visibility)
  ctx.beginPath();
  ctx.arc(points[0].x, points[0].y, 5, 0, 2 * Math.PI);
  ctx.fillStyle = "red";
  ctx.fill();
  
  return isComplete ? { area: calculatePolygonArea(points) } : null;
};

export const PolygonManager = {
  currentPolygon: [],
  isDrawing: false,
  
  addPoint(point, threshold = 15) {
    if (!this.isDrawing) {
      this.currentPolygon = [point];
      this.isDrawing = true;
      return { action: 'start', points: this.currentPolygon };
    }
    
    // Check if clicking near first point to close (need 3+ points)
    if (this.currentPolygon.length >= 3) {
      const firstPoint = this.currentPolygon[0];
      const distance = Math.sqrt(
        (point.x - firstPoint.x) ** 2 + (point.y - firstPoint.y) ** 2
      );
      
      if (distance < threshold) {
        this.isDrawing = false;
        const completed = [...this.currentPolygon];
        this.currentPolygon = [];
        return { action: 'complete', points: completed };
      }
    }
    
    this.currentPolygon.push(point);
    return { action: 'continue', points: this.currentPolygon };
  },
  
  reset() {
    this.currentPolygon = [];
    this.isDrawing = false;
  }
};

export const calculatePolygonArea = (points) => {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y - points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
};

// Pencil Tool
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
