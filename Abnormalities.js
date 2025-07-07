// Import from Core.js
import { 
  midpoint, 
  angleWithHorizontal, 
  angleWithVertical, 
  angleABC, 
  cobbAngle, 
  lengthBetweenPoints,
  normalizeVector,
  vector
} from './Core';

// Import from Canvas.js
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

// Import from Generic_Tools.js
import {
  handlePolygonTool,
  PolygonManager
} from './Generic_Tools';

// Import from Spine_Tools.js
import {
  calculateTrunkShift,
  handleAngleTool4Pt
} from './Spine_Tools';

// =============================================================================
// STENOSIS MEASUREMENTS
// =============================================================================

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

const calculatePolygonCentroid = (points) => {
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

const classifyStenosisSeverity = (area) => {
  // Classification based on cross-sectional area (rough guidelines)
  if (area < 100) return 'Severe';
  if (area < 200) return 'Moderate';
  if (area < 300) return 'Mild';
  return 'Normal';
};

// =============================================================================
// SPONDYLOLISTHESIS MEASUREMENTS
// =============================================================================

export const SPONDYLOLISTHESIS_GRADES = {
  GRADE_I: { min: 0, max: 25, label: 'Grade I (0-25%)' },
  GRADE_II: { min: 25, max: 50, label: 'Grade II (25-50%)' },
  GRADE_III: { min: 50, max: 75, label: 'Grade III (50-75%)' },
  GRADE_IV: { min: 75, max: 100, label: 'Grade IV (75-100%)' },
  GRADE_V: { min: 100, max: Infinity, label: 'Grade V (>100%)' }
};

export const calculateSlipDistance = (upperVertPosterior, upperVertAnterior, lowerVertPosterior, lowerVertAnterior, ctx = null) => {
  // Calculate the posterior edges alignment
  const slipDistance = Math.abs(upperVertPosterior.x - lowerVertPosterior.x);
  
  if (ctx) {
    // Draw vertebral body outlines
    drawLine(ctx, upperVertPosterior, upperVertAnterior, 'blue', 3);
    drawLine(ctx, lowerVertPosterior, lowerVertAnterior, 'blue', 3);
    
    // Draw slip measurement line
    const measurementY = (upperVertPosterior.y + lowerVertPosterior.y) / 2;
    const measurementStart = { x: upperVertPosterior.x, y: measurementY };
    const measurementEnd = { x: lowerVertPosterior.x, y: measurementY };
    
    drawLine(ctx, measurementStart, measurementEnd, 'red', 2);
    drawDashedLine(ctx, upperVertPosterior, measurementStart, [5, 5], 'red');
    drawDashedLine(ctx, lowerVertPosterior, measurementEnd, [5, 5], 'red');
    
    // Label slip distance
    const labelPoint = midpoint(measurementStart, measurementEnd);
    labelPoint.y -= 15;
    drawAngleLabel(ctx, labelPoint, `Slip Distance: ${slipDistance.toFixed(1)}mm`, 'red');
  }
  
  return slipDistance;
};

export const calculateSlipAngle = (upperVertPosterior, upperVertAnterior, lowerVertPosterior, lowerVertAnterior, ctx = null) => {
  // Calculate the angle between the two vertebral body endplates
  const slipAngle = handleAngleTool4Pt([upperVertPosterior, upperVertAnterior, lowerVertPosterior, lowerVertAnterior], ctx);
  
  if (ctx && slipAngle) {
    // Additional labeling for slip angle
    const midUpper = midpoint(upperVertPosterior, upperVertAnterior);
    const midLower = midpoint(lowerVertPosterior, lowerVertAnterior);
    const labelPoint = midpoint(midUpper, midLower);
    labelPoint.x += 30;
    
    drawAngleLabel(ctx, labelPoint, `Slip Angle: ${slipAngle.angle.toFixed(1)}°`, 'purple');
  }
  
  return slipAngle ? slipAngle.angle : null;
};

export const calculateSlipPercentage = (upperVertPosterior, upperVertAnterior, lowerVertPosterior, lowerVertAnterior, ctx = null) => {
  // Calculate slip distance
  const slipDistance = Math.abs(upperVertPosterior.x - lowerVertPosterior.x);
  
  // Calculate the AP diameter of the lower vertebral body
  const lowerVertAP = lengthBetweenPoints(lowerVertPosterior, lowerVertAnterior);
  
  // Calculate slip percentage
  const slipPercentage = (slipDistance / lowerVertAP) * 100;
  
  // Determine grade
  const grade = classifySlipGrade(slipPercentage);
  
  if (ctx) {
    // Draw vertebral bodies
    drawLine(ctx, upperVertPosterior, upperVertAnterior, 'blue', 3);
    drawLine(ctx, lowerVertPosterior, lowerVertAnterior, 'blue', 3);
    
    // Draw AP diameter measurement
    const midLowerY = (lowerVertPosterior.y + lowerVertAnterior.y) / 2;
    const apStart = { x: lowerVertPosterior.x, y: midLowerY };
    const apEnd = { x: lowerVertAnterior.x, y: midLowerY };
    
    drawLine(ctx, apStart, apEnd, 'green', 2);
    drawDashedLine(ctx, lowerVertPosterior, apStart, [3, 3], 'green');
    drawDashedLine(ctx, lowerVertAnterior, apEnd, [3, 3], 'green');
    
    // Draw slip distance
    const slipY = upperVertPosterior.y;
    const slipStart = { x: upperVertPosterior.x, y: slipY };
    const slipEnd = { x: lowerVertPosterior.x, y: slipY };
    
    drawLine(ctx, slipStart, slipEnd, 'red', 2);
    drawDashedLine(ctx, upperVertPosterior, slipStart, [5, 5], 'red');
    drawDashedLine(ctx, lowerVertPosterior, slipEnd, [5, 5], 'red');
    
    // Label measurements
    const apLabelPoint = midpoint(apStart, apEnd);
    apLabelPoint.y += 20;
    drawAngleLabel(ctx, apLabelPoint, `AP: ${lowerVertAP.toFixed(1)}mm`, 'green');
    
    const slipLabelPoint = midpoint(slipStart, slipEnd);
    slipLabelPoint.y -= 15;
    drawAngleLabel(ctx, slipLabelPoint, `${slipPercentage.toFixed(1)}% - ${grade.label}`, 'red');
  }
  
  return {
    slipDistance: slipDistance,
    apDiameter: lowerVertAP,
    slipPercentage: slipPercentage,
    grade: grade
  };
};

export const calculateCompleteSpondylolisthesis = (upperVertPosterior, upperVertAnterior, lowerVertPosterior, lowerVertAnterior, ctx = null) => {
  const slipDistance = calculateSlipDistance(upperVertPosterior, upperVertAnterior, lowerVertPosterior, lowerVertAnterior, ctx);
  const slipAngle = calculateSlipAngle(upperVertPosterior, upperVertAnterior, lowerVertPosterior, lowerVertAnterior, ctx);
  const slipData = calculateSlipPercentage(upperVertPosterior, upperVertAnterior, lowerVertPosterior, lowerVertAnterior, ctx);
  
  return {
    type: 'spondylolisthesis',
    slipDistance: slipDistance,
    slipAngle: slipAngle,
    slipPercentage: slipData.slipPercentage,
    apDiameter: slipData.apDiameter,
    grade: slipData.grade
  };
};

const classifySlipGrade = (percentage) => {
  for (const [key, grade] of Object.entries(SPONDYLOLISTHESIS_GRADES)) {
    if (percentage >= grade.min && percentage < grade.max) {
      return grade;
    }
  }
  return SPONDYLOLISTHESIS_GRADES.GRADE_V; // Default to Grade V if >100%
};

// =============================================================================
// SCOLIOSIS MEASUREMENTS
// =============================================================================

export const SCOLIOSIS_CURVE_TYPES = {
  THORACIC: {
    label: 'Thoracic Curve',
    color: 'blue',
    description: 'Primary thoracic scoliotic curve'
  },
  LUMBAR: {
    label: 'Lumbar Curve',
    color: 'green', 
    description: 'Primary lumbar scoliotic curve'
  },
  THORACOLUMBAR: {
    label: 'Thoracolumbar Curve',
    color: 'orange',
    description: 'Thoracolumbar junction curve'
  },
  DOUBLE_MAJOR: {
    label: 'Double Major Curve',
    color: 'purple',
    description: 'Two major curves of similar magnitude'
  }
};

export const calculateScoliosisCobbAngle = (upperEndP1, upperEndP2, lowerEndP1, lowerEndP2, ctx = null, curveType = 'THORACIC') => {
  // Use the existing Cobb angle calculation
  const cobbResult = handleAngleTool4Pt([upperEndP1, upperEndP2, lowerEndP1, lowerEndP2], ctx);
  
  if (ctx && cobbResult) {
    const config = SCOLIOSIS_CURVE_TYPES[curveType] || SCOLIOSIS_CURVE_TYPES['THORACIC'];
    
    // Additional scoliosis-specific labeling
    const midUpper = midpoint(upperEndP1, upperEndP2);
    const midLower = midpoint(lowerEndP1, lowerEndP2);
    const labelPoint = midpoint(midUpper, midLower);
    labelPoint.x += 40;
    
    drawAngleLabel(ctx, labelPoint, `${config.label}: ${cobbResult.angle.toFixed(1)}°`, config.color);
    
    // Add severity classification
    const severity = classifyCobbSeverity(cobbResult.angle);
    labelPoint.y += 20;
    drawAngleLabel(ctx, labelPoint, `Severity: ${severity}`, config.color);
  }
  
  return cobbResult ? {
    ...cobbResult,
    type: 'scoliosis_cobb',
    curveType: curveType,
    severity: classifyCobbSeverity(cobbResult.angle)
  } : null;
};

export const calculateScoliosisTrunkShift = (c7Centroid, s1EndLeft, s1EndRight, ctx = null) => {
  // Use the existing trunk shift calculation
  const trunkShift = calculateTrunkShift(c7Centroid, s1EndLeft, s1EndRight, ctx);
  
  if (ctx) {
    // Additional scoliosis-specific labeling
    const labelPoint = { ...c7Centroid };
    labelPoint.y -= 40;
    drawAngleLabel(ctx, labelPoint, `Scoliosis Trunk Shift: ${trunkShift.toFixed(1)}mm`, 'red');
    
    // Add severity classification
    const severity = classifyTrunkShiftSeverity(trunkShift);
    labelPoint.y += 20;
    drawAngleLabel(ctx, labelPoint, `Severity: ${severity}`, 'red');
  }
  
  return {
    type: 'scoliosis_trunk_shift',
    trunkShift: trunkShift,
    severity: classifyTrunkShiftSeverity(trunkShift)
  };
};

export const calculateAPT = (anteriorVertebralLine1, anteriorVertebralLine2, posteriorVertebralLine1, posteriorVertebralLine2, ctx = null) => {
  // Calculate the angle between anterior and posterior vertebral lines
  // This represents the apical vertebral translation/rotation
  const aptAngle = handleAngleTool4Pt([anteriorVertebralLine1, anteriorVertebralLine2, posteriorVertebralLine1, posteriorVertebralLine2], ctx);
  
  if (ctx && aptAngle) {
    // Draw additional visualization for APT
    const midAnterior = midpoint(anteriorVertebralLine1, anteriorVertebralLine2);
    const midPosterior = midpoint(posteriorVertebralLine1, posteriorVertebralLine2);
    
    // Draw connection between anterior and posterior lines
    drawDashedLine(ctx, midAnterior, midPosterior, [5, 5], 'gray');
    
    // Label APT
    const labelPoint = midpoint(midAnterior, midPosterior);
    labelPoint.x += 30;
    drawAngleLabel(ctx, labelPoint, `APT: ${aptAngle.angle.toFixed(1)}°`, 'purple');
  }
  
  return aptAngle ? {
    ...aptAngle,
    type: 'scoliosis_apt'
  } : null;
};

export const calculateCompleteScoliosis = (upperEndP1, upperEndP2, lowerEndP1, lowerEndP2, c7Centroid, s1EndLeft, s1EndRight, ctx = null, curveType = 'THORACIC') => {
  const cobbAngle = calculateScoliosisCobbAngle(upperEndP1, upperEndP2, lowerEndP1, lowerEndP2, ctx, curveType);
  const trunkShift = calculateScoliosisTrunkShift(c7Centroid, s1EndLeft, s1EndRight, ctx);
  
  return {
    type: 'scoliosis_complete',
    cobbAngle: cobbAngle,
    trunkShift: trunkShift,
    curveType: curveType
  };
};

const classifyCobbSeverity = (angle) => {
  if (angle < 10) return 'Normal';
  if (angle < 25) return 'Mild';
  if (angle < 40) return 'Moderate';
  if (angle < 50) return 'Severe';
  return 'Very Severe';
};

const classifyTrunkShiftSeverity = (shift) => {
  if (shift < 10) return 'Minimal';
  if (shift < 20) return 'Mild';
  if (shift < 30) return 'Moderate';
  return 'Severe';
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const getAbnormalityTypes = () => {
  return {
    stenosis: Object.keys(STENOSIS_TYPES),
    spondylolisthesis: Object.keys(SPONDYLOLISTHESIS_GRADES),
    scoliosis: Object.keys(SCOLIOSIS_CURVE_TYPES)
  };
};

export const getAbnormalityConfig = (type, subtype) => {
  switch (type) {
    case 'stenosis':
      return STENOSIS_TYPES[subtype];
    case 'spondylolisthesis':
      return SPONDYLOLISTHESIS_GRADES[subtype];
    case 'scoliosis':
      return SCOLIOSIS_CURVE_TYPES[subtype];
    default:
      return null;
  }
};