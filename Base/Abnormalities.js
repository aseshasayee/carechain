import { 
  midpoint, 
  angleWithHorizontal, 
  angleWithVertical, 
  angleABC, 
  cobbAngle, 
  lengthBetweenPoints,
  normalizeVector,
  vector,
  lineIntersection,
} from './Core';

import { 
  drawLine, 
  drawVerticalLine,
  drawHorizontalLine,
  drawPerpendicular, 
  drawAngleArc, 
  drawAngleLabel, 
  drawCobbAngle,
  drawDashedLine
} from './Canvas';

import {
  handlePolygonTool,
  PolygonManager,
  handleAngleTool4Pt
} from './Generic_Tools';

import {
  calculateTrunkShift,
  calculateAVT
} from './Spine_Tools';

// STENOSIS MEASUREMENTS

export const STENOSIS_TYPES = {
  CENTRAL: {
    label: 'Central Canal Stenosis',
    description: 'Narrowing of the central spinal canal',
    color: 'red'
  },
  LATERAL: {
    label: 'Lateral Recess Stenosis',
    description: 'Narrowing of the lateral recess',
    color: 'orange'
  },
  FORAMINAL: {
    label: 'Foraminal Stenosis',
    description: 'Narrowing of the neural foramen',
    color: 'purple'
  },
  LIGAMENTUM: {
    label: 'Ligamentum Flavum Thickening',
    description: 'Thickening of ligamentum flavum',
    color: 'yellow'
  }
};

export const handleStenosisPolygon = (points, ctx, stenosisType = 'CENTRAL', isComplete = false) => {
  const config = STENOSIS_TYPES[stenosisType] || STENOSIS_TYPES['CENTRAL'];
  
  // Use the polygon tool with stenosis-specific styling
  const result = handlePolygonTool(points, ctx, isComplete);
  
  if (result && ctx) {
    // Add stenosis-specific labeling
    const centroid = calculatePolygonCentroid(points);
    
    // Draw stenosis type label
    ctx.fillStyle = config.color;
    ctx.font = "12px sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(config.label, centroid.x, centroid.y - 30);
    
    if (isComplete) {
      // Calculate and display stenosis severity based on area
      const severity = classifyStenosisSeverity(result.area);
      ctx.fillText(`Severity: ${severity}`, centroid.x, centroid.y + 20);
    }
  }
  
  return result ? {
    ...result,
    type: 'stenosis',
    stenosisType: stenosisType,
    severity: result.area ? classifyStenosisSeverity(result.area) : null
  } : null;
};

export const StenosisPolygonManager = {
  ...PolygonManager,
  stenosisType: 'CENTRAL',
  
  setStenosisType(type) {
    this.stenosisType = type;
  },
  
  addPoint(point, threshold = 15) {
    const result = PolygonManager.addPoint.call(this, point, threshold);
    if (result) {
      result.stenosisType = this.stenosisType;
    }
    return result;
  }
};

export const calculatePolygonCentroid = (points) => {
  if (points.length === 0) return { x: 0, y: 0 };
  
  const sum = points.reduce((acc, point) => ({
    x: acc.x + point.x,
    y: acc.y + point.y
  }), { x: 0, y: 0 });
  
  return {
    x: sum.x / points.length,
    y: sum.y / points.length
  };
};

export const classifyStenosisSeverity = (area) => {
  // Classification based on cross-sectional area (rough guidelines)
  if (area < 100) return 'Severe';
  if (area < 200) return 'Moderate';
  if (area < 300) return 'Mild';
  return 'Normal';
};

// SPONDYLOLISTHESIS MEASUREMENTS

export const SPONDYLOLISTHESIS_GRADES = {
  GRADE_I: { min: 0, max: 25, label: 'Grade I (0-25%)' },
  GRADE_II: { min: 25, max: 50, label: 'Grade II (25-50%)' },
  GRADE_III: { min: 50, max: 75, label: 'Grade III (50-75%)' },
  GRADE_IV: { min: 75, max: 100, label: 'Grade IV (75-100%)' },
  GRADE_V: { min: 100, max: Infinity, label: 'Grade V (>100%)' }
};

export const calculateSlipDistance = (uA, uP, bA, bP, ctx = null) => {
  // Find perpendicular from uP to lower line bA-bP
  const perpEnd = {
    x: uP.x - (bP.y - bA.y),
    y: uP.y + (bP.x - bA.x)
  };
  
  // Find intersection of perpendicular with lower line
  const intersection = lineIntersection(uP, perpEnd, bA, bP);
  
  if (!intersection) return 0;
  
  // Slip distance is distance between intersection and bP
  const slipDistance = lengthBetweenPoints(intersection, bP);
  
  if (ctx) {
    drawLine(ctx, uP, uA, 'blue', 3);
    drawLine(ctx, bA, intersection, 'blue', 3);
    drawLine(ctx, intersection, bP, 'green', 3);
    drawLine(ctx, uP, intersection, 'red', 1, [5, 5]);
    drawAngleLabel(ctx, { x: (intersection.x + bP.x) / 2, y: (intersection.y + bP.y) / 2 - 15 }, 
                   `Slip Distance: ${slipDistance.toFixed(1)}mm`, 'red');
  }
  
  return slipDistance;
};

export const calculateSlipAngle = (uA, uP, bA, bP, ctx = null) => {
  // Calculate angle between upper and lower plates
  const upperVector = { x: uA.x - uP.x, y: uA.y - uP.y };
  const lowerVector = { x: bA.x - bP.x, y: bA.y - bP.y };
  
  const dot = upperVector.x * lowerVector.x + upperVector.y * lowerVector.y;
  const mag1 = Math.hypot(upperVector.x, upperVector.y);
  const mag2 = Math.hypot(lowerVector.x, lowerVector.y);
  
  const angle = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2)))) * 180 / Math.PI;
  
  if (ctx) {
    const midUpper = { x: (uA.x + uP.x) / 2, y: (uA.y + uP.y) / 2 };
    const midLower = { x: (bA.x + bP.x) / 2, y: (bA.y + bP.y) / 2 };
    drawAngleLabel(ctx, { x: (midUpper.x + midLower.x) / 2 + 30, y: (midUpper.y + midLower.y) / 2 }, 
                   `Slip Angle: ${angle.toFixed(1)}°`, 'purple');
  }
  
  return angle;
};

export const calculateSlipPercentage = (uA, uP, bA, bP, ctx = null) => {
  const slipDistance = calculateSlipDistance(uA, uP, bA, bP, ctx);
  const lowerPlateLength = lengthBetweenPoints(bP, bA);
  const slipPercentage = (slipDistance / lowerPlateLength) * 100;
  const grade = classifySlipGrade(slipPercentage);
  
  if (ctx) {
    drawAngleLabel(ctx, { x: (bP.x + bA.x) / 2, y: (bP.y + bA.y) / 2 + 20 }, 
                   `${slipPercentage.toFixed(1)}% - ${grade.label}`, 'green');
  }
  
  return {
    slipDistance,
    plateLength: lowerPlateLength,
    slipPercentage,
    grade
  };
};

export const calculateCompleteSpondylolisthesis = (uA, uP, bA, bP, ctx = null) => {
  const slipDistance = calculateSlipDistance(uA, uP, bA, bP, ctx);
  const slipAngle = calculateSlipAngle(uA, uP, bA, bP, ctx);
  const slipData = calculateSlipPercentage(uA, uP, bA, bP, ctx);
  
  return {
    type: 'spondylolisthesis',
    slipDistance,
    slipAngle,
    slipPercentage: slipData.slipPercentage,
    plateLength: slipData.plateLength,
    grade: slipData.grade
  };
};

export const classifySlipGrade = (percentage) => {
  for (const grade of Object.values(SPONDYLOLISTHESIS_GRADES)) {
    if (percentage >= grade.min && percentage < grade.max) {
      return grade;
    }
  }
  return SPONDYLOLISTHESIS_GRADES.GRADE_V;
};

// SCOLIOSIS MEASUREMENTS

export const calculateScoliosisCobbAngle = (uA, uP, bA, bP, ctx = null) => {
  
  const points = [uA, uP, bA, bP];
  const genericResult = handleAngleTool4Pt(points,ctx);
  if (ctx) {
    const midA = midpoint(uA, uP);
    const midB = midpoint(bA, bP);
    const labelPosition = {
      x: (midA.x + midB.x) / 2 + 30,
      y: (midA.y + midB.y) / 2 - 15
    };
    drawAngleLabel(ctx, labelPosition, `Cobb Angle: ${genericResult.angle.toFixed(1)}°`);
  }
  return drawCobbAngle(ctx, [uA, uP], [bA, bP]);
};

export const calculateScoliosisTrunkShift = (c7Centroid, s1EndLeft, s1EndRight, ctx = null) => {
  return calculateTrunkShift(c7Centroid, s1EndLeft, s1EndRight, ctx);
};

export const calculateScoliosisAVT = (AVCentroid, s1EndLeft, s1EndRight, ctx = null) => {
  return calculateAVT(AVCentroid, s1EndLeft, s1EndRight, ctx);
};

// UTILITY FUNCTIONS

export const getAbnormalityTypes = () => {
  return {
    stenosis: Object.keys(STENOSIS_TYPES),
    spondylolisthesis: Object.keys(SPONDYLOLISTHESIS_GRADES)
  };
};

export const getAbnormalityConfig = (type, subtype) => {
  switch (type) {
    case 'stenosis':
      return STENOSIS_TYPES[subtype];
    case 'spondylolisthesis':
      return SPONDYLOLISTHESIS_GRADES[subtype];
    default:
      return null;
  }
};