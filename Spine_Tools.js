// Import from core.js
import { 
  midpoint, 
  angleWithHorizontal, 
  angleWithVertical, 
  angleABC, 
  cobbAngle, 
  lengthPointToLine, 
  lengthBetweenPoints,
  lineIntersection
} from './Core';

// Import from canvas.js
import { 
  drawLine, 
  drawVerticalLine,
  drawHorizontalLine,
  drawPerpendicular, 
  drawAngleArc, 
  drawAngleLabel, 
  drawCobbAngle,
  lineExtend 
} from './Canvas';

import {
  handleAngleTool4Pt
} from './Generic_Tools';

// SPINOPELVIC PARAMETERS

export const calculatePI = (femoralHead1, femoralHead2, s1EndLeft, s1EndRight, ctx = null) => {
  // Step 1: Calculate midpoints
  const femoralCenter = midpoint(femoralHead1, femoralHead2);
  const s1Midpoint = midpoint(s1EndLeft, s1EndRight);
  
  // Step 2: Create perpendicular to S1 endplate at S1 midpoint
  // Vector along S1 endplate
  const s1Vector = { x: s1EndRight.x - s1EndLeft.x, y: s1EndRight.y - s1EndLeft.y };
  // Perpendicular vector (rotate 90 degrees)
  const perpVector = { x: -s1Vector.y, y: s1Vector.x };
  const perpPoint = { x: s1Midpoint.x + perpVector.x, y: s1Midpoint.y + perpVector.y };
  
  // Step 3: Calculate angle between femoral-S1 line and perpendicular
  const piAngle = angleABC(femoralCenter, s1Midpoint, perpPoint);
  
  // Step 4: Draw if context provided
  if (ctx) {
    // Draw femoral heads and connection
    drawLine(ctx, femoralHead1, femoralHead2, 'blue', 2);
    drawLine(ctx, femoralCenter, femoralCenter, 'red', 6); // Mark center
    
    // Draw S1 endplate
    drawLine(ctx, s1EndLeft, s1EndRight, 'blue', 2);
    drawLine(ctx, s1Midpoint, s1Midpoint, 'red', 6); // Mark midpoint
    
    // Draw line from femoral center to S1 midpoint
    drawLine(ctx, femoralCenter, s1Midpoint, 'green', 2);
    
    // Draw perpendicular to S1 endplate
    drawPerpendicular(ctx, s1EndLeft, s1EndRight, s1Midpoint);
    
    // Draw angle arc and label
    drawAngleArc(ctx, femoralCenter, s1Midpoint, perpPoint, 'red', 30, `PI: ${piAngle.toFixed(1)}°`);
  }
  
  return piAngle;
};

export const calculatePT = (femoralHead1, femoralHead2, s1EndLeft, s1EndRight, ctx = null) => {
  // Step 1: Calculate midpoints
  const femoralCenter = midpoint(femoralHead1, femoralHead2);
  const s1Midpoint = midpoint(s1EndLeft, s1EndRight);
  
  // Step 2: Calculate angle with vertical
  const ptAngle = angleWithVertical(femoralCenter, s1Midpoint);
  
  // Step 3: Draw if context provided
  if (ctx) {
    // Draw femoral heads and connection
    drawLine(ctx, femoralHead1, femoralHead2, 'blue', 2);
    drawLine(ctx, femoralCenter, femoralCenter, 'red', 6); // Mark center
    
    // Draw S1 endplate
    drawLine(ctx, s1EndLeft, s1EndRight, 'blue', 2);
    drawLine(ctx, s1Midpoint, s1Midpoint, 'red', 6); // Mark midpoint
    
    // Draw line from femoral center to S1 midpoint
    drawLine(ctx, femoralCenter, s1Midpoint, 'green', 2);
    
    // Draw vertical line at femoral center
    drawVerticalLine(ctx, femoralCenter.x, ctx.canvas.height);
    
    // Draw angle arc and label
    const verticalPoint = { x: femoralCenter.x, y: femoralCenter.y - 50 };
    drawAngleArc(ctx, verticalPoint, femoralCenter, s1Midpoint, 'red', 30, `PT: ${ptAngle.toFixed(1)}°`);
  }
  
  return ptAngle;
};

export const calculateSS = (s1EndLeft, s1EndRight, ctx = null) => {
  // Step 1: Calculate angle with horizontal
  const ssAngle = angleWithHorizontal(s1EndRight, s1EndLeft);

  // Step 2: Draw if context provided
  if (ctx) {
    const s1Midpoint = midpoint(s1EndLeft, s1EndRight);

    // Draw S1 endplate
    drawLine(ctx, s1EndLeft, s1EndRight, 'blue', 2);

    // Mark midpoint
    drawLine(ctx, s1Midpoint, s1Midpoint, 'red', 6);

    // Draw horizontal line from midpoint
    drawHorizontalLine(ctx, s1Midpoint.y, ctx.canvas.width, 'orange', 2);

    // Draw angle arc and label
    const direction = s1EndRight.x > s1EndLeft.x ? 1 : -1;
    const horizontalPoint = {
      x: s1Midpoint.x + direction * 100,
      y: s1Midpoint.y
    };
    drawAngleArc(ctx, s1EndRight, s1Midpoint, horizontalPoint, 'red', 30, `SS: ${ssAngle.toFixed(1)}°`);
  }

  return ssAngle;
};

export const calculateSpinopelvicParams = (femoralHead1, femoralHead2, s1EndLeft, s1EndRight, ctx = null) => {
  const pi = calculatePI(femoralHead1, femoralHead2, s1EndLeft, s1EndRight, ctx);
  const pt = calculatePT(femoralHead1, femoralHead2, s1EndLeft, s1EndRight, ctx);
  const ss = calculateSS(s1EndLeft, s1EndRight, ctx);
  
  // Validation: PI should equal PT + SS
  const validation = Math.abs(pi - (pt + ss)) < 2; // Allow 2° tolerance
  
  return {
    PI: pi,
    PT: pt,
    SS: ss,
    validation: validation,
    difference: pi - (pt + ss)
  };
};

// SPINAL CURVATURE PARAMETERS

export const SPINAL_CURVATURE_TYPES = {
  // Cervical Region
  'CL_C2_C7': {
    label: 'Cervical Lordosis (C2-C7)',
    abbreviation: 'CL',
    region: 'Cervical',
    type: 'Lordosis'
  },
  'CL_C1_C7': {
    label: 'Cervical Lordosis (C1-C7)',
    abbreviation: 'CL',
    region: 'Cervical',
    type: 'Lordosis'
  },
  
  // Thoracic Region
  'TK_T1_T12': {
    label: 'Thoracic Kyphosis (T1-T12)',
    abbreviation: 'TK',
    region: 'Thoracic',
    type: 'Kyphosis'
  },
  'TK_T2_T12': {
    label: 'Thoracic Kyphosis (T2-T12)',
    abbreviation: 'TK',
    region: 'Thoracic',
    type: 'Kyphosis'
  },
  'UTK_T1_T5': {
    label: 'Upper Thoracic Kyphosis (T1-T5)',
    abbreviation: 'UTK',
    region: 'Upper Thoracic',
    type: 'Kyphosis'
  },
  'MTK_T5_T8': {
    label: 'Mid Thoracic Kyphosis (T5-T8)',
    abbreviation: 'MTK',
    region: 'Mid Thoracic',
    type: 'Kyphosis'
  },
  'LTK_T8_T12': {
    label: 'Lower Thoracic Kyphosis (T8-T12)',
    abbreviation: 'LTK',
    region: 'Lower Thoracic',
    type: 'Kyphosis'
  },
  
  // Thoracolumbar Region
  'TLK_T10_L2': {
    label: 'Thoracolumbar Kyphosis (T10-L2)',
    abbreviation: 'TLK',
    region: 'Thoracolumbar',
    type: 'Kyphosis'
  },
  
  // Lumbar Region
  'LL_L1_S1': {
    label: 'Lumbar Lordosis (L1-S1)',
    abbreviation: 'LL',
    region: 'Lumbar',
    type: 'Lordosis'
  },
  'LL_L1_L5': {
    label: 'Lumbar Lordosis (L1-L5)',
    abbreviation: 'LL',
    region: 'Lumbar',
    type: 'Lordosis'
  },
  'ULL_L1_L4': {
    label: 'Upper Lumbar Lordosis (L1-L4)',
    abbreviation: 'ULL',
    region: 'Upper Lumbar',
    type: 'Lordosis'
  },
  'LLL_L4_S1': {
    label: 'Lower Lumbar Lordosis (L4-S1)',
    abbreviation: 'LLL',
    region: 'Lower Lumbar',
    type: 'Lordosis'
  },
  
  // Lumbosacral Region
  'LSA_L5_S1': {
    label: 'Lumbosacral Angle (L5-S1)',
    abbreviation: 'LSA',
    region: 'Lumbosacral',
    type: 'Angle'
  },
  
  // Global Measurements
  'GL_C2_S1': {
    label: 'Global Lordosis (C2-S1)',
    abbreviation: 'GL',
    region: 'Global',
    type: 'Lordosis'
  },
  'GK_T1_S1': {
    label: 'Global Kyphosis (T1-S1)',
    abbreviation: 'GK',
    region: 'Global',
    type: 'Kyphosis'
  },
  
  // Custom/Segmental
  'CUSTOM': {
    label: 'Custom Segmental Angle',
    abbreviation: 'CSA',
    region: 'Custom',
    type: 'Angle'
  }
};

export const calculateSpinalCurvatureAngle = (points, ctx, curveType = 'CUSTOM', customLabel = null) => {
  if (points.length !== 4) {
    console.error('Invalid points array. Expected 4 points.');
    return null;
  }
  
  const [A1, A2, B1, B2] = points;
  
  // Get measurement configuration
  const config = SPINAL_CURVATURE_TYPES[curveType] || SPINAL_CURVATURE_TYPES['CUSTOM'];
  const label = customLabel || config.label;
  
  // Use the generic angle calculation
  const genericResult = handleAngleTool4Pt(points, ctx);
  
  if (!genericResult) return null;
  
  // Add spinal-specific labeling
  if (ctx && label) {
    const midA = midpoint(A1, A2);
    const midB = midpoint(B1, B2);
    const labelPosition = {
      x: (midA.x + midB.x) / 2 + 30,
      y: (midA.y + midB.y) / 2 - 15
    };
    
    // Draw measurement label
    drawAngleLabel(ctx, labelPosition, `${config.abbreviation}: ${genericResult.angle.toFixed(1)}°`);
  }
  
  return {
    type: "spinal_curvature",
    angle: genericResult.angle,
    measurement: {
      label: label,
      abbreviation: config.abbreviation,
      region: config.region,
      curveType: config.type,
      value: genericResult.angle,
      unit: "degrees"
    }
  };
};

export const getSpinalCurvatureOptions = () => {
  return Object.entries(SPINAL_CURVATURE_TYPES).map(([key, config]) => ({
    value: key,
    label: config.label,
    abbreviation: config.abbreviation,
    region: config.region
  }));
};

export const getSpinalCurvatureOptionsByRegion = () => {
  const grouped = {};
  
  Object.entries(SPINAL_CURVATURE_TYPES).forEach(([key, config]) => {
    if (!grouped[config.region]) {
      grouped[config.region] = [];
    }
    grouped[config.region].push({
      value: key,
      label: config.label,
      abbreviation: config.abbreviation
    });
  });
  
  return grouped;
};

// GLOBAL SAGITTAL PARAMETERS

export const calculateSVA = (c7Centroid, s1Posterosuperior, ctx = null) => {
  // Step 1: Calculate horizontal distance (SVA)
  const svaDistance = Math.abs(c7Centroid.x - s1Posterosuperior.x);
  
  // Step 2: Draw if context provided
  if (ctx) {
    // Draw C7 plumb line (vertical from C7)
    drawVerticalLine(ctx, c7Centroid.x, ctx.canvas.height, 'blue', 2);
    
    // Draw horizontal distance line
    const horizontalEnd = { x: c7Centroid.x, y: s1Posterosuperior.y };
    drawLine(ctx, s1Posterosuperior, horizontalEnd, 'green', 2);
    
    // Label SVA
    const labelPoint = midpoint(s1Posterosuperior, horizontalEnd);
    labelPoint.y -= 20; // Adjust label position
    drawAngleLabel(ctx, labelPoint, `SVA: ${svaDistance.toFixed(1)}mm`, 'black');
  }
  
  return svaDistance;
};

export const calculateCSVA = (c2Centroid, c7Centroid, ctx = null) => {
  // Step 1: Calculate horizontal distance (cSVA)
  const csvaDistance = Math.abs(c2Centroid.x - c7Centroid.x);
  
  // Step 2: Draw if context provided
  if (ctx) {
    // Draw C2 plumb line (vertical from C2)
    drawVerticalLine(ctx, c2Centroid.x, ctx.canvas.height, 'blue', 2);
    
    // Draw C7 centroid
    drawLine(ctx, c7Centroid, c7Centroid, 'red', 6);
    
    // Draw horizontal distance line
    const horizontalEnd = { x: c2Centroid.x, y: c7Centroid.y };
    drawLine(ctx, c7Centroid, horizontalEnd, 'green', 2);
    
    // Label cSVA
    const labelPoint = midpoint(c7Centroid, horizontalEnd);
    labelPoint.y -= 20; // Adjust label position
    drawAngleLabel(ctx, labelPoint, `CSVA: ${csvaDistance.toFixed(1)}mm`, 'black');
  }
  
  return csvaDistance;
};

export const calculateTPA = (t1Centroid, femoralHead1, femoralHead2, s1EndLeft, s1EndRight, ctx = null) => {
  // Step 1: Calculate midpoints
  const femoralCenter = midpoint(femoralHead1, femoralHead2);
  const s1Midpoint = midpoint(s1EndLeft, s1EndRight);
  
  // Step 2: Calculate angle ABC
  const tpaAngle = angleABC(t1Centroid, femoralCenter, s1Midpoint);
  
  // Step 3: Draw if context provided
  if (ctx) {
    // Draw connection lines
    drawLine(ctx, t1Centroid, femoralCenter, 'blue', 2);
    drawLine(ctx, femoralCenter, s1Midpoint, 'blue', 2);
    
    // Mark points
    drawLine(ctx, femoralHead1, femoralHead2, 'black', 2);
    drawLine(ctx, s1EndLeft, s1EndRight, 'black', 2);
    
    // Draw angle arc and label
    drawAngleArc(ctx, t1Centroid, femoralCenter, s1Midpoint, 'red',30,`TPA: ${tpaAngle.toFixed(1)}°`);
  }
  
  return tpaAngle;
};

export const calculateSPA = (c7Centroid, s1EndLeft, s1EndRight, femoralHead1, femoralHead2, ctx = null) => {
  // Step 1: Calculate midpoints
  const s1Midpoint = midpoint(s1EndLeft, s1EndRight);
  const femoralCenter = midpoint(femoralHead1, femoralHead2);
  
  // Step 2: Calculate angle ABC
  const spaAngle = angleABC(c7Centroid, s1Midpoint, femoralCenter);
  
  // Step 3: Draw if context provided
  if (ctx) {
    // Draw connection lines
    drawLine(ctx, c7Centroid, s1Midpoint, 'blue', 2);
    drawLine(ctx, s1Midpoint, femoralCenter, 'blue', 2);
    
    // Mark points
    drawLine(ctx, s1EndLeft, s1EndRight, 'black', 2);
    drawLine(ctx, femoralHead1, femoralHead2, 'black', 2);
    
    // Draw angle arc and label
    drawAngleArc(ctx, c7Centroid, s1Midpoint, femoralCenter, 'red', 30, `SPA: ${spaAngle.toFixed(1)}°`);
  }
  
  return spaAngle;
};

export const calculateSSA = (c7Centroid, s1EndLeft, s1EndRight, ctx = null) => {
  // Step 1: Calculate S1 midpoint
  const s1Midpoint = midpoint(s1EndLeft, s1EndRight);
  
  // Step 2: Calculate angle ABC
  const ssaAngle = angleABC(c7Centroid, s1Midpoint, s1EndLeft);
  
  // Step 3: Draw if context provided
  if (ctx) {
    // Draw connection lines
    drawLine(ctx, c7Centroid, s1Midpoint, 'blue', 2);
    lineExtend(ctx, s1Midpoint, s1EndLeft, 'blue', 2);
    
    // Mark points
    drawLine(ctx, s1EndLeft, s1EndRight, 'black', 2);
    // Draw angle arc and label
    drawAngleArc(ctx, c7Centroid, s1Midpoint, s1EndLeft, 'red', 30, `SSA: ${ssaAngle.toFixed(1)}°`);
  }
  
  return ssaAngle;
};

export const calculateT1SPi = (t1Centroid, femoralHead1, femoralHead2, ctx = null) => {
  // Step 1: Calculate femoral center
  const femoralCenter = midpoint(femoralHead1, femoralHead2);
  
  // Step 2: Calculate angle with vertical
  const t1spiAngle = angleWithVertical(t1Centroid, femoralCenter);
  
  // Step 3: Draw if context provided
  if (ctx) {
    // Draw line from T1 to femoral center
    drawLine(ctx, t1Centroid, femoralCenter, 'blue', 2);
    
    // Draw vertical line at femoral center
    drawVerticalLine(ctx, femoralCenter.x, ctx.canvas.height, 'orange', 2);
    
    // Mark points
    drawLine(ctx, femoralHead1, femoralHead2, 'black', 2);
    
    // Draw angle arc and label
    const verticalPoint = { x: femoralCenter.x, y: femoralCenter.y - 50 };
    drawAngleArc(ctx, t1Centroid, femoralCenter, verticalPoint,'red', 30, `T1SPi: ${t1spiAngle.toFixed(1)}°`);
  }
  
  return t1spiAngle;
};

export const calculateT9SPi = (t9Centroid, femoralHead1, femoralHead2, ctx = null) => {
  // Step 1: Calculate femoral center
  const femoralCenter = midpoint(femoralHead1, femoralHead2);
  
  // Step 2: Calculate angle with vertical
  const t9spiAngle = angleWithVertical(t9Centroid, femoralCenter);
  
  // Step 3: Draw if context provided
  if (ctx) {
    // Draw line from T9 to femoral center
    drawLine(ctx, t9Centroid, femoralCenter, 'blue', 2);
    
    // Draw vertical line at femoral center
    drawVerticalLine(ctx, femoralCenter.x, ctx.canvas.height, 'orange', 2);
    
    // Mark points
    drawLine(ctx, femoralHead1, femoralHead2, 'black', 2);
    
    // Draw angle arc and label
    const verticalPoint = { x: femoralCenter.x, y: femoralCenter.y - 50 };
    drawAngleArc(ctx, t9Centroid, femoralCenter, verticalPoint, 'red',30, `T9SPi: ${t9spiAngle.toFixed(1)}°`);
  }
  
  return t9spiAngle;
};

export const calculateODHA = (odontoidTip, femoralHead1, femoralHead2, ctx = null) => {
  // Step 1: Calculate femoral center
  const femoralCenter = midpoint(femoralHead1, femoralHead2);
  
  // Step 2: Calculate angle with vertical
  const ODHA = angleWithVertical(odontoidTip, femoralCenter);
  
  // Step 3: Draw if context provided
  if (ctx) {
    // Draw line from T9 to femoral center
    drawLine(ctx, odontoidTip, femoralCenter, 'blue', 2);
    
    // Draw vertical line at femoral center
    drawVerticalLine(ctx, femoralCenter.x, ctx.canvas.height, 'orange', 2);
    
    // Mark points
    drawLine(ctx, femoralHead1, femoralHead2, 'black', 2);
    
    // Draw angle arc and label
    const verticalPoint = { x: femoralCenter.x, y: femoralCenter.y - 50 };
    drawAngleArc(ctx, odontoidTip, femoralCenter, verticalPoint, 'red',30, `OD-HA: ${ODHA.toFixed(1)}°`);
  }
  
  return ODHA;
};

export const calculateCBVA = (chin, brow, ctx = null) => {
  const CBVA = angleWithVertical(chin, brow);
  if (ctx) {
    // Draw line from chin to brow
    drawLine(ctx, chin, brow, 'blue', 2);
    
    // Draw vertical line at brow
    drawVerticalLine(ctx, chin.x, ctx.canvas.height, 'orange', 2);
    
    // Draw angle arc and label
    const verticalPoint = { x: chin.x, y: chin.y - 50 };
    drawAngleArc(ctx, brow, chin, verticalPoint, 'red', 30, `CBVA: ${CBVA.toFixed(1)}°`);
  }
  return CBVA;
}

// CORONAL PARAMETERS

export const drawC7PL = (c7Centroid, ctx = null) => {
  if (ctx) {
    drawVerticalLine(ctx, c7Centroid.x, ctx.canvas.height, 'blue', 2);
  }
};

export const drawCSVL = (s1EndLeft, s1EndRight, ctx = null) => {
  const s1Midpoint = midpoint(s1EndLeft, s1EndRight);

  if (ctx) {
    drawLine(ctx, s1EndLeft, s1EndRight, 'blue', 2);
    drawVerticalLine(ctx, s1Midpoint.x, ctx.canvas.height, 'green', 2);
  }
};

export const calculateTrunkShift = (c7Centroid, s1EndLeft, s1EndRight, ctx = null) => {
  const s1Midpoint = midpoint(s1EndLeft, s1EndRight);

  const trunkShift = Math.abs(c7Centroid.x - s1Midpoint.x);

  if (ctx) {

    drawC7PL(c7Centroid, ctx);
    drawCSVL(s1EndLeft, s1EndRight, ctx);

    const horizontalStart = { x: c7Centroid.x, y: c7Centroid.y };
    const horizontalEnd = { x: s1Midpoint.x, y: c7Centroid.y };
    drawLine(ctx, horizontalStart, horizontalEnd, 'red', 2);
    drawLine(ctx, s1EndLeft, s1EndRight, 'black', 2);

    const labelPoint = {...c7Centroid};
    labelPoint.y -= 20; 
    drawAngleLabel(ctx, labelPoint, `TrunkShift: ${trunkShift.toFixed(1)}mm`, 'black');
  }

  return trunkShift;
};

export const calculateRVAD = (leftRibP1, leftRibP2, rightRibP1, rightRibP2, apicalEndplateP1, apicalEndplateP2, ctx = null) => {
  // Calculate angles with respect to horizontal
  const leftRibAngle = angleWithHorizontal(leftRibP1, leftRibP2);
  const rightRibAngle = angleWithHorizontal(rightRibP1, rightRibP2);
  
  // Calculate perpendicular angle to apical endplate
  const apicalEndplateAngle = angleWithHorizontal(apicalEndplateP1, apicalEndplateP2);
  const perpAngle = apicalEndplateAngle + 90; // Perpendicular is 90 degrees offset
  
  // Calculate angles between each rib line and the perpendicular
  const angle1 = Math.abs(leftRibAngle - perpAngle);
  const angle2 = Math.abs(rightRibAngle - perpAngle);
  
  // Normalize angles to be between 0 and 90 degrees
  const normalizedAngle1 = Math.min(angle1, 180 - angle1);
  const normalizedAngle2 = Math.min(angle2, 180 - angle2);
  
  // Calculate RVAD (absolute difference)
  const rvad = Math.abs(normalizedAngle1 - normalizedAngle2);
  
  // Draw if context provided
  if (ctx) {
    // Draw left rib line
    lineExtend(ctx, leftRibP1, leftRibP2, 'blue', 2);
    
    // Draw right rib line
    lineExtend(ctx, rightRibP1, rightRibP2, 'red', 2);
    
    // Draw apical vertebra endplate line
    drawLine(ctx, apicalEndplateP1, apicalEndplateP2, 'green', 2);
    
    // Draw perpendicular to apical endplate
    const apicalMidpoint = midpoint(apicalEndplateP1, apicalEndplateP2);
    drawPerpendicular(ctx, apicalEndplateP1, apicalEndplateP2, apicalMidpoint, 'purple');
    
    // Create perpendicular line points for angle drawing
    const perpDirection = {
      x: -(apicalEndplateP2.y - apicalEndplateP1.y),
      y: (apicalEndplateP2.x - apicalEndplateP1.x)
    };
    
    // Normalize perpendicular direction
    const perpLength = Math.sqrt(perpDirection.x * perpDirection.x + perpDirection.y * perpDirection.y);
    const perpUnit = {
      x: perpDirection.x / perpLength,
      y: perpDirection.y / perpLength
    };
    
    // Create perpendicular line points
    const perpP1 = {
      x: apicalMidpoint.x - perpUnit.x * 50,
      y: apicalMidpoint.y - perpUnit.y * 50
    };
    const perpP2 = {
      x: apicalMidpoint.x + perpUnit.x * 50,
      y: apicalMidpoint.y + perpUnit.y * 50
    };
    const leftIntersection = lineIntersection(leftRibP1, leftRibP2, perpP1, perpP2);
    const rightIntersection = lineIntersection(rightRibP1, rightRibP2, perpP1, perpP2);
    
    // Draw angle arcs
    drawAngleArc(ctx, leftRibP1, leftIntersection, perpP1, 'orange', 30, `${normalizedAngle1.toFixed(1)}°`);
    drawAngleArc(ctx, rightRibP1, rightIntersection, perpP2, 'cyan', 30, `${normalizedAngle2.toFixed(1)}°`);
  }
  
  return rvad;
};

export const calculateAVT = (AVCentroid, s1EndLeft, s1EndRight, ctx = null) => {
  const s1Midpoint = midpoint(s1EndLeft, s1EndRight);
  
  const AVT = Math.abs(AVCentroid.x - s1Midpoint.x);
  if (ctx) {
    drawVerticalLine(ctx, s1Midpoint.x, ctx.canvas.height, 'blue', 2);
    
    const horizontalEnd = { x: s1Midpoint.x, y: AVCentroid.y };
    drawLine(ctx, AVCentroid, horizontalEnd, 'green', 2);

    const labelPoint = midpoint(AVCentroid, horizontalEnd);
    labelPoint.y -= 20; 
    drawAngleLabel(ctx, labelPoint, `AVT: ${AVT.toFixed(1)}mm`, 'black');
  }
  
  return AVT;
}

export const calculatePO = (PSISLeft, PSISRight, ctx = null) => {

  const PO = angleWithHorizontal(PSISLeft, PSISRight);
  if (ctx) {
    drawLine(ctx, PSISLeft, PSISRight, 'blue', 2);

    drawHorizontalLine(ctx, PSISLeft.y, ctx.canvas.width, 'orange', 2);

    const horizontalpoint = { x: PSISLeft.x + 50, y: PSISLeft.y };
    drawAngleArc(ctx, PSISRight, PSISLeft, horizontalpoint, 'red', 30, `PO: ${PO.toFixed(1)}°`);
  }
  return PO;
}

// VERTEBRAL BODY METRICS (VBM)

export const VBM = (uA, uP, bA, bP, ctx = null) => {
  const Aheight = lengthBetweenPoints(uA, bA);
  const Pheight = lengthBetweenPoints(uP, bP);
  const Angle = handleAngleTool4Pt([uA, uP, bA, bP], ctx);
  
  if (ctx) {
    drawLine(ctx, uA, bA, 'blue', 2);
    drawLine(ctx, uP, bP, 'blue', 2);
    drawAngleLabel(ctx, midpoint(uA, bA), `AH: ${Aheight.toFixed(1)}mm`, 'black');
    drawAngleLabel(ctx, midpoint(uP, bP), `PH: ${Pheight.toFixed(1)}mm`, 'black');
    drawAngleLabel(ctx, midpoint(uA, uP), `Wedge Angle: ${Angle.angle.toFixed(1)}°`, 'black');
    
    // NEW: Draw initial outline with handles
    drawVertebralOutline(ctx, [uA, uP, bP, bA]);
  }
  
  return { Aheight, Pheight, Angle };
};

const drawVertebralOutline = (ctx, points) => {
  // Draw the outline
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.forEach(point => ctx.lineTo(point.x, point.y));
  ctx.closePath();
  
  ctx.strokeStyle = "orange";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 165, 0, 0.1)";
  ctx.fill();
  
  // Draw draggable handles
  points.forEach((point, i) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
};

export const handleOutlineDrag = (points, mouseX, mouseY, isDragging, dragIndex) => {
  if (isDragging && dragIndex !== null) {
    points[dragIndex] = { x: mouseX, y: mouseY };
    return true;
  }
  
  // Check if mouse is over a handle
  for (let i = 0; i < points.length; i++) {
    const dist = Math.sqrt((mouseX - points[i].x) ** 2 + (mouseY - points[i].y) ** 2);
    if (dist < 10) {
      return i; // Return handle index
    }
  }
  return null;
};

export const getOutlineArea = (points) => {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y - points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
};


