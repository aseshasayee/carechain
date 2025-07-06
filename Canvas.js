import {
  vector,
  midpoint,
  normalizeVector,
  angleABC,
  angleBetweenVectors,
} from './Core';
   
/*LINES*/

// Draw Line
export const drawLine = (ctx, a, b, color = 'black', width = 2) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
};

// Extended Line
export const lineExtend = (ctx, a, b, color = 'black', width = 2) => {
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  // Calculate the direction vector
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  // Prevent division by zero
  if (dx === 0 && dy === 0) return;

  // Normalize the direction vector
  const length = Math.hypot(dx, dy);
  const dirX = dx / length;
  const dirY = dy / length;

  // Extend far in both directions
  const extendLength = Math.max(canvasWidth, canvasHeight) * 2; // large enough to cover whole canvas

  // Calculate extended start and end points
  const extendedStart = {
    x: a.x - dirX * extendLength,
    y: a.y - dirY * extendLength
  };

  const extendedEnd = {
    x: a.x + dirX * extendLength,
    y: a.y + dirY * extendLength
  };

  // Draw the extended line
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(extendedStart.x, extendedStart.y);
  ctx.lineTo(extendedEnd.x, extendedEnd.y);
  ctx.stroke();
};

// Perpendicular Line
export const drawPerpendicular = (ctx, p1, p2, midPoint, color = 'blue') => {
  // Calculate direction vector of the line
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lineLength = Math.sqrt(dx * dx + dy * dy);
  
  if (lineLength === 0) return midPoint;
  
  // Calculate perpendicular vector (rotate 90 degrees)
  const perpDx = -dy / lineLength;
  const perpDy = dx / lineLength;
  
  // Get canvas dimensions
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  
  // Calculate a very long length to extend across canvas
  const maxLength = Math.max(canvasWidth, canvasHeight) * 2;
  
  // Calculate both ends of the perpendicular line
  const startPoint = {
    x: midPoint.x - perpDx * maxLength,
    y: midPoint.y - perpDy * maxLength
  };
  
  const endPoint = {
    x: midPoint.x + perpDx * maxLength,
    y: midPoint.y + perpDy * maxLength
  };
  
  // Draw the perpendicular line extending across canvas
  ctx.beginPath();
  ctx.moveTo(startPoint.x, startPoint.y);
  ctx.lineTo(endPoint.x, endPoint.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Return a point on the line for arc calculation (using a moderate distance)
  return {
    x: midPoint.x + perpDx * 50,
    y: midPoint.y + perpDy * 50
  };
};

// Vertical Line
export const drawVerticalLine = (ctx, x, height, color = 'red', width = 2) => {
  drawLine(ctx, { x, y: 0 }, { x, y: height }, color, width);
};

// Horizontal Line
export const drawHorizontalLine = (ctx, y, widthLength, color = 'red', lineWidth = 2) => {
  drawLine(ctx, { x: 0, y }, { x: widthLength, y }, color, lineWidth);
};

// Dashed Line
export const drawDashedLine = (ctx, a, b, dash = [5, 5], color = 'black', width = 1) => {
  ctx.setLineDash(dash);
  drawLine(ctx, a, b, color, width);
  ctx.setLineDash([]);
};

/*ANGLES*/

// Draw Angle Arc
export const drawAngleArc = (ctx, A, B, C, color = 'purple', r = 25, angleLabel = '') => {
  // Calculate vectors from B to A and B to C
  const vectorToA = { x: A.x - B.x, y: A.y - B.y };
  const vectorToC = { x: C.x - B.x, y: C.y - B.y };
  
  // Check for zero-length vectors
  const lengthToA = Math.sqrt(vectorToA.x * vectorToA.x + vectorToA.y * vectorToA.y);
  const lengthToC = Math.sqrt(vectorToC.x * vectorToC.x + vectorToC.y * vectorToC.y);
  
  if (lengthToA < 1e-6 || lengthToC < 1e-6) {
    return;
  }
  
  // Calculate start and end angles
  const startAngle = Math.atan2(vectorToA.y, vectorToA.x);
  const endAngle = Math.atan2(vectorToC.y, vectorToC.x);
  
  // Calculate the angle difference
  let angleDifference = endAngle - startAngle;
  
  // Normalize to [-π, π]
  while (angleDifference > Math.PI) {
    angleDifference -= 2 * Math.PI;
  }
  while (angleDifference < -Math.PI) {
    angleDifference += 2 * Math.PI;
  }
  
  // Since angleABC always returns the smaller angle (0° to 180°),
  // we need to draw the smaller arc. If |angleDifference| > π, 
  // we should draw the other direction to get the smaller arc.
  let drawAngleDiff = angleDifference;
  if (Math.abs(angleDifference) > Math.PI) {
    drawAngleDiff = angleDifference > 0 ? angleDifference - 2 * Math.PI : angleDifference + 2 * Math.PI;
  }
  
  // Draw the arc using the adjusted angle difference
  ctx.beginPath();
  ctx.arc(B.x, B.y, r, startAngle, startAngle + drawAngleDiff, drawAngleDiff < 0);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Add label if provided
  if (angleLabel !== null) {
    const labelAngle = startAngle + drawAngleDiff / 2;
    const labelX = B.x + (r + 15) * Math.cos(labelAngle);
    const labelY = B.y + (r + 15) * Math.sin(labelAngle);
    
    ctx.fillStyle = color;
    ctx.font = "13px sans-serif";
    ctx.fillText(angleLabel, labelX, labelY);
  }
};

// Angle Label
export const drawAngleLabel = (ctx, position, label, color = 'black') => {
  ctx.fillStyle = color;
  ctx.font = "14px sans-serif";
  ctx.fillText(label, position.x, position.y);
};

// Angle Arc
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

// Angle ABC
export const drawABC = (ctx, A, B, C, label = "Angle", color = "blue") => {
  drawLine(ctx, A, B, color, 2);
  drawLine(ctx, B, C, color, 2);
  const angle = angleABC(A, B, C);
  drawAngleArc(ctx, A, B, C, color, 25, `${label}: ${angle.toFixed(1)}°`);
  console.log("Angle:", angle); 
};

/*COBB*/

// Cobb Angle
export const drawCobbAngle = (ctx, line1, line2, color = 'blue') => {
  const [A1, A2] = line1;
  const [B1, B2] = line2;
  
  // Calculate midpoints
  const mid1 = midpoint(A1, A2);
  const mid2 = midpoint(B1, B2);
  
  // Draw perpendiculars from midpoints
  const perp1End = drawPerpendicular(ctx, A1, A2, mid1, color);
  const perp2End = drawPerpendicular(ctx, B1, B2, mid2, color);
  
  // Find intersection of perpendiculars for arc center
  const intersection = findLineIntersection(
    mid1, perp1End,
    mid2, perp2End
  );
  
  let angle = 0;
  
  if (intersection) {
    // Check if intersection is within reasonable bounds for arc display
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const margin = 200; // Allow some margin outside canvas
    
    const withinBounds = 
      intersection.x > -margin && intersection.x < canvasWidth + margin &&
      intersection.y > -margin && intersection.y < canvasHeight + margin;
    
    if (withinBounds) {
      // Draw arc at intersection
      angle = drawCobbArc(ctx, intersection, mid1, mid2, perp1End, perp2End, color);
    } else {
      // Intersection is too far - use alternative method
      angle = drawCobbAngleAlternative(ctx, line1, line2, color);
    }
  } else {
    // No intersection (parallel lines) - use alternative method
    angle = drawCobbAngleAlternative(ctx, line1, line2, color);
  }
  
  return angle;
};

// Cobb Arc
export const drawCobbArc = (ctx, center, mid1, mid2, perp1End, perp2End, color = 'blue') => {
  // Create vectors from center to perpendicular endpoints
  const v1 = { x: perp1End.x - center.x, y: perp1End.y - center.y };
  const v2 = { x: perp2End.x - center.x, y: perp2End.y - center.y };
  
  // Calculate angles
  const angle1 = Math.atan2(v1.y, v1.x);
  const angle2 = Math.atan2(v2.y, v2.x);
  
  // Calculate angle difference for the acute angle
  let angleDiff = angle2 - angle1;
  
  // Normalize to get acute angle
  while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
  while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
  
  // If obtuse, take the complementary angle
  if (Math.abs(angleDiff) > Math.PI / 2) {
    angleDiff = angleDiff > 0 ? angleDiff - Math.PI : angleDiff + Math.PI;
  }
  
  // Draw the arc
  const radius = 30;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, angle1, angle1 + angleDiff, angleDiff < 0);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Add angle label on the arc
  const midAngle = angle1 + angleDiff / 2;
  const labelX = center.x + (radius + 15) * Math.cos(midAngle);
  const labelY = center.y + (radius + 15) * Math.sin(midAngle);
  
  const angle = Math.abs(angleDiff * 180 / Math.PI);
  ctx.fillStyle = color;
  ctx.font = "12px sans-serif";
  ctx.fillText(`${angle.toFixed(1)}°`, labelX, labelY);
  return angle;
};

// Find Intersection
export const findLineIntersection = (p1, p2, p3, p4) => {
  const x1 = p1.x, y1 = p1.y;
  const x2 = p2.x, y2 = p2.y;
  const x3 = p3.x, y3 = p3.y;
  const x4 = p4.x, y4 = p4.y;
  
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  
  if (Math.abs(denom) < 1e-10) return null; // Lines are parallel
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  
  return {
    x: x1 + t * (x2 - x1),
    y: y1 + t * (y2 - y1)
  };
};

// Cobb Angle Alternative
export const drawCobbAngleAlternative = (ctx, line1, line2, color = 'blue') => {
  const [A1, A2] = line1;
  const [B1, B2] = line2;
  
  // Calculate direction vectors
  const v1 = { x: A2.x - A1.x, y: A2.y - A1.y };
  const v2 = { x: B2.x - B1.x, y: B2.y - B1.y };
  
  // Calculate perpendicular vectors (rotate 90 degrees)
  const perp1 = { x: -v1.y, y: v1.x };
  const perp2 = { x: -v2.y, y: v2.x };
  
  // Calculate angle between perpendiculars
  const dot = perp1.x * perp2.x + perp1.y * perp2.y;
  const mag1 = Math.sqrt(perp1.x * perp1.x + perp1.y * perp1.y);
  const mag2 = Math.sqrt(perp2.x * perp2.x + perp2.y * perp2.y);
  
  if (mag1 === 0 || mag2 === 0) return 0;
  
  const cosAngle = dot / (mag1 * mag2);
  const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI;
  const finalAngle = angle > 90 ? 180 - angle : angle;
  
  // Draw angle label at center of canvas or midpoint between line midpoints
  const mid1 = midpoint(A1, A2);
  const mid2 = midpoint(B1, B2);
  const labelCenter = midpoint(mid1, mid2);
  
  // Add a background rectangle for better visibility
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillRect(labelCenter.x - 40, labelCenter.y - 15, 80, 25);
  
  ctx.strokeStyle = color;
  ctx.strokeRect(labelCenter.x - 40, labelCenter.y - 15, 80, 25);
  
  // Draw the angle text
  ctx.fillStyle = color;
  ctx.font = "14px sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText(`Cobb: ${finalAngle.toFixed(1)}°`, labelCenter.x, labelCenter.y + 5);
  ctx.textAlign = 'left'; // Reset text alignment
  
  return finalAngle;
};