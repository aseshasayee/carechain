import { lineExtend } from './Canvas';
import { angleABC } from './Core';
import { calculateCompleteSpondylolisthesis } from './Abnormalities'

// Utilities

export const drawLines = (ctx, A, B) => {
    lineExtend(ctx, A, B, 'red', 2); 
  };

export const isAboveLine = (px, py, x1, y1, x2, y2) => {
  return (x2 - x1) * (py - y1) - (y2 - y1) * (px - x1) < 0;
};

const yAtX = (p1, p2, x) => {
  if (p2.x === p1.x) return (p1.y + p2.y) / 2; // vertical line case
  const slope = (p2.y - p1.y) / (p2.x - p1.x);
  return p1.y + slope * (x - p1.x);
};

// WEDGE OSTEOTOMY TOOL (PSO, SPO)

export const performWedgeOsteotomy = (canvas, image, points) => {
  if (points.length !== 3 || !image || !canvas) return;
  const ctx = canvas.getContext('2d');
  const [A, B, C] = points;

  // Redraw original image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  const upperData = tempCtx.createImageData(canvas.width, canvas.height);

  const CBx = B.x - C.x;
  const CBy = B.y - C.y;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      const isUpper = !isAboveLine(x, y, C.x, C.y, B.x, B.y);
      if (isUpper) {
        upperData.data[i] = imgData.data[i];
        upperData.data[i + 1] = imgData.data[i + 1];
        upperData.data[i + 2] = imgData.data[i + 2];
        upperData.data[i + 3] = imgData.data[i + 3];

        imgData.data[i] = 0;
        imgData.data[i + 1] = 0;
        imgData.data[i + 2] = 0;
        imgData.data[i + 3] = 0;
      }
    }
  }

  // Lower half
  ctx.putImageData(imgData, 0, 0);

  // Rotate upper half
  const upperOnlyCanvas = document.createElement('canvas');
  upperOnlyCanvas.width = canvas.width;
  upperOnlyCanvas.height = canvas.height;
  const upperOnlyCtx = upperOnlyCanvas.getContext('2d');
  upperOnlyCtx.putImageData(upperData, 0, 0);

  const originalAngle = Math.atan2(C.y - B.y, C.x - B.x);
  const targetAngle = Math.atan2(A.y - B.y, A.x - B.x);
  const rotation = targetAngle - originalAngle;

  ctx.save();
  ctx.translate(B.x, B.y);
  ctx.rotate(rotation);
  ctx.drawImage(upperOnlyCanvas, -B.x, -B.y);
  ctx.restore();

  drawLines(ctx, A, B);
  drawWedgeAngle(ctx, points);
};

export const WedgeAngle = (points) => {
  if (points.length !== 3) return null;
  const [A, B, C] = points;
  const angle = angleABC(A, B, C);
  return angle <= 180 ? angle : 360 - angle; // ensures acute angle
};

export const drawWedgeAngle = (ctx, points) => {
  const angle = WedgeAngle(points);
  if (angle === null) return;

  ctx.fillStyle = 'yellow';
  ctx.font = '18px sans-serif';
  const B = points[1]; // Hinge point
  ctx.fillText(`${angle.toFixed(1)}°`, B.x + 10, B.y + 20);
};

// RESECT OSTEOTOMY TOOL 

export const performResection = (canvas, image, points) => {
  if (!canvas || !image || points.length !== 6) return;
  const ctx = canvas.getContext('2d');
  const [A, B, C, D, E, F] = points;

  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0);
  const imgData = ctx.getImageData(0, 0, width, height);

  const upperCanvas = document.createElement('canvas');
  const lowerCanvas = document.createElement('canvas');
  upperCanvas.width = lowerCanvas.width = width;
  upperCanvas.height = lowerCanvas.height = height;

  const upperCtx = upperCanvas.getContext('2d');
  const lowerCtx = lowerCanvas.getContext('2d');
  const upperData = upperCtx.createImageData(width, height);
  const lowerData = lowerCtx.createImageData(width, height);

  // Line functions
  const yEFat = (x) => yAtX(E, F, x);
  const yABat = (x) => yAtX(A, B, x);
  const yCDat = (x) => yAtX(C, D, x);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const yEF = yEFat(x);
      const yAB = yABat(x);

      if (y < yEF) {
        // upper region
        upperData.data[i + 0] = imgData.data[i + 0];
        upperData.data[i + 1] = imgData.data[i + 1];
        upperData.data[i + 2] = imgData.data[i + 2];
        upperData.data[i + 3] = imgData.data[i + 3];
      } else if (y > yAB) {
        // lower region
        lowerData.data[i + 0] = imgData.data[i + 0];
        lowerData.data[i + 1] = imgData.data[i + 1];
        lowerData.data[i + 2] = imgData.data[i + 2];
        lowerData.data[i + 3] = imgData.data[i + 3];
      }
    }
  }

  const finData = ctx.createImageData(width, height);

  // --- Draw Upper Part ---
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const yEF = yEFat(x);
      const yCD = yCDat(x);
      const dy = Math.round(yCD - yEF);
      const targetY = y + dy;
      const j = (targetY * width + x) * 4;

      if (targetY >= 0 && targetY < height && upperData.data[i + 3] > 0) {
        finData.data[j + 0] = upperData.data[i + 0];
        finData.data[j + 1] = upperData.data[i + 1];
        finData.data[j + 2] = upperData.data[i + 2];
        finData.data[j + 3] = upperData.data[i + 3];
      }
    }
  }

  // --- Draw Lower Part ---
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const yAB = yABat(x);
      const yCD = yCDat(x);
      const dy = Math.round(yCD - yAB);
      const targetY = y + dy;
      const j = (targetY * width + x) * 4;

      if (targetY >= 0 && targetY < height && lowerData.data[i + 3] > 0) {
        finData.data[j + 0] = lowerData.data[i + 0];
        finData.data[j + 1] = lowerData.data[i + 1];
        finData.data[j + 2] = lowerData.data[i + 2];
        finData.data[j + 3] = lowerData.data[i + 3];
      }
    }
  }
  ctx.putImageData(finData, 0, 0);
    drawLines(ctx, C, D);
};

// OPEN OSTEOTOMY TOOL

export const performOpenOsteotomy = (canvas, image, points) => {
  if (!canvas || !image || points.length !== 6) return;

  const ctx = canvas.getContext('2d');
  const [A, B, C, D, E, F] = points;
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0);
  const originalData = ctx.getImageData(0, 0, width, height);
  ctx.clearRect(0, 0, width, height);

  const upperData = ctx.createImageData(width, height);
  const lowerData = ctx.createImageData(width, height);
  const finalImageData = ctx.createImageData(width, height);

  const yCDat = (x) => yAtX(C, D, x);

  // Split image at CD
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const yCD = yCDat(x);

      if (y < yCD) {
        upperData.data[i + 0] = originalData.data[i + 0];
        upperData.data[i + 1] = originalData.data[i + 1];
        upperData.data[i + 2] = originalData.data[i + 2];
        upperData.data[i + 3] = originalData.data[i + 3];
      } else {
        lowerData.data[i + 0] = originalData.data[i + 0];
        lowerData.data[i + 1] = originalData.data[i + 1];
        lowerData.data[i + 2] = originalData.data[i + 2];
        lowerData.data[i + 3] = originalData.data[i + 3];
      }
    }
  }

  // Rotation helpers
  const toVec = (p1, p2) => ({ x: p2.x - p1.x, y: p2.y - p1.y });
  const midpoint = (p1, p2) => ({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });
  const angleBetween = (v1, v2) =>
    Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);

  const rotateAndTranslateSmooth = (srcData, from1, from2, to1, to2) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');

    // Put source image onto temp canvas
    tempCtx.putImageData(srcData, 0, 0);

    const srcCenter = midpoint(from1, from2);
    const dstCenter = midpoint(to1, to2);
    const angle = angleBetween(toVec(from1, from2), toVec(to1, to2));

    // Create a new off-screen canvas for result
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = width;
    resultCanvas.height = height;
    const resultCtx = resultCanvas.getContext('2d');

    // Apply transform to rotate and align src → dst
    resultCtx.setTransform(
      Math.cos(angle),
      Math.sin(angle),
      -Math.sin(angle),
      Math.cos(angle),
      dstCenter.x - srcCenter.x * Math.cos(angle) + srcCenter.y * Math.sin(angle),
      dstCenter.y - srcCenter.x * Math.sin(angle) - srcCenter.y * Math.cos(angle)
    );

    resultCtx.drawImage(tempCanvas, 0, 0);

    return resultCtx.getImageData(0, 0, width, height);
  };

  // Process each half
  const upperTransformed = rotateAndTranslateSmooth(upperData, C, D, E, F);
  const lowerTransformed = rotateAndTranslateSmooth(lowerData, C, D, A, B);

  // Merge into final image
  for (let i = 0; i < finalImageData.data.length; i += 4) {
    finalImageData.data[i + 0] = upperTransformed.data[i + 0] || lowerTransformed.data[i + 0];
    finalImageData.data[i + 1] = upperTransformed.data[i + 1] || lowerTransformed.data[i + 1];
    finalImageData.data[i + 2] = upperTransformed.data[i + 2] || lowerTransformed.data[i + 2];
    finalImageData.data[i + 3] = upperTransformed.data[i + 3] || lowerTransformed.data[i + 3];
  }

  ctx.putImageData(finalImageData, 0, 0);

  // Optional: draw alignment lines
  drawLines(ctx, A, B);
  drawLines(ctx, E, F);
};

// CAGE SIMULATION TOOL

export const performCageSimulation = (canvas, image, points) => {
  if (!canvas || !image || points.length !== 6) return;

  const ctx = canvas.getContext('2d');
  const [A, B, C, D, E, F] = points;
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0);
  const originalData = ctx.getImageData(0, 0, width, height);
  ctx.clearRect(0, 0, width, height);

  const upperData = ctx.createImageData(width, height);
  const finalImageData = ctx.createImageData(width, height);

  const yCDat = (x) => yAtX(C, D, x);

  // Split image: keep lower half in originalData, upper half in upperData
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const yCD = yCDat(x);

      if (y < yCD) {
        upperData.data[i + 0] = originalData.data[i + 0];
        upperData.data[i + 1] = originalData.data[i + 1];
        upperData.data[i + 2] = originalData.data[i + 2];
        upperData.data[i + 3] = originalData.data[i + 3];
      } else {
        // Copy original data into final result directly (lower stays)
        finalImageData.data[i + 0] = originalData.data[i + 0];
        finalImageData.data[i + 1] = originalData.data[i + 1];
        finalImageData.data[i + 2] = originalData.data[i + 2];
        finalImageData.data[i + 3] = originalData.data[i + 3];
      }
    }
  }

  // Helpers
  const toVec = (p1, p2) => ({ x: p2.x - p1.x, y: p2.y - p1.y });
  const midpoint = (p1, p2) => ({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });
  const angleBetween = (v1, v2) =>
    Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);

  const rotateAndTranslateSmooth = (srcData, from1, from2, to1, to2) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(srcData, 0, 0);

    const srcCenter = midpoint(from1, from2);
    const dstCenter = midpoint(to1, to2);
    const angle = angleBetween(toVec(from1, from2), toVec(to1, to2));

    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = width;
    resultCanvas.height = height;
    const resultCtx = resultCanvas.getContext('2d');

    resultCtx.setTransform(
      Math.cos(angle),
      Math.sin(angle),
      -Math.sin(angle),
      Math.cos(angle),
      dstCenter.x - srcCenter.x * Math.cos(angle) + srcCenter.y * Math.sin(angle),
      dstCenter.y - srcCenter.x * Math.sin(angle) - srcCenter.y * Math.cos(angle)
    );

    resultCtx.drawImage(tempCanvas, 0, 0);
    return resultCtx.getImageData(0, 0, width, height);
  };

  // Transform only upper half (CD → EF)
  const upperTransformed = rotateAndTranslateSmooth(upperData, C, D, E, F);

  // Merge transformed upper part into final image
  for (let i = 0; i < finalImageData.data.length; i += 4) {
    if (upperTransformed.data[i + 3] > 0) {
      finalImageData.data[i + 0] = upperTransformed.data[i + 0];
      finalImageData.data[i + 1] = upperTransformed.data[i + 1];
      finalImageData.data[i + 2] = upperTransformed.data[i + 2];
      finalImageData.data[i + 3] = upperTransformed.data[i + 3];
    }
  }

  ctx.putImageData(finalImageData, 0, 0);

  // Optional: draw lines for visual confirmation
  drawLines(ctx, C, D);
  drawLines(ctx, E, F);
};

// LISTHESIS CORRECTION TOOL

export const performSpondylolisthesisCorrectionWithGap = (canvas, image, points, gap = 20) => {
  if (!canvas || !image || points.length !== 4) return;

  const ctx = canvas.getContext('2d');
  const [A, B, C, D] = points;
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0);
  const originalData = ctx.getImageData(0, 0, width, height);
  ctx.clearRect(0, 0, width, height);

  const upperData = ctx.createImageData(width, height);
  const finalImageData = ctx.createImageData(width, height);

  const yABat = (x) => yAtX(A, B, x);

  // Split image
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const yAB = yABat(x);

      if (y < yAB) {
        upperData.data[i + 0] = originalData.data[i + 0];
        upperData.data[i + 1] = originalData.data[i + 1];
        upperData.data[i + 2] = originalData.data[i + 2];
        upperData.data[i + 3] = originalData.data[i + 3];
      } else {
        finalImageData.data[i + 0] = originalData.data[i + 0];
        finalImageData.data[i + 1] = originalData.data[i + 1];
        finalImageData.data[i + 2] = originalData.data[i + 2];
        finalImageData.data[i + 3] = originalData.data[i + 3];
      }
    }
  }

  // Rotation + translation
  const toVec = (p1, p2) => ({ x: p2.x - p1.x, y: p2.y - p1.y });
  const midpoint = (p1, p2) => ({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });
  const angleBetween = (v1, v2) =>
    Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);

  const rotateTranslateAndGap = (srcData, from1, from2, to1, to2, gapOffset) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(srcData, 0, 0);

    const srcCenter = midpoint(from1, from2);
    const dstCenter = midpoint(to1, to2);

    const angle = angleBetween(toVec(from1, from2), toVec(to1, to2));

    // Apply rotation and vertical offset (for disc gap)
    const offsetX = dstCenter.x - (srcCenter.x * Math.cos(angle) - srcCenter.y * Math.sin(angle));
    const offsetY = dstCenter.y - (srcCenter.x * Math.sin(angle) + srcCenter.y * Math.cos(angle)) - gapOffset;

    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = width;
    resultCanvas.height = height;
    const resultCtx = resultCanvas.getContext('2d');

    resultCtx.setTransform(
      Math.cos(angle),
      Math.sin(angle),
      -Math.sin(angle),
      Math.cos(angle),
      offsetX,
      offsetY
    );

    resultCtx.drawImage(tempCanvas, 0, 0);
    return resultCtx.getImageData(0, 0, width, height);
  };

  const upperTransformed = rotateTranslateAndGap(upperData, A, B, C, D, gap);

  // Merge
  for (let i = 0; i < finalImageData.data.length; i += 4) {
    if (upperTransformed.data[i + 3] > 0) {
      finalImageData.data[i + 0] = upperTransformed.data[i + 0];
      finalImageData.data[i + 1] = upperTransformed.data[i + 1];
      finalImageData.data[i + 2] = upperTransformed.data[i + 2];
      finalImageData.data[i + 3] = upperTransformed.data[i + 3];
    }
  }

  ctx.putImageData(finalImageData, 0, 0);

  // Optionally calculate pre-op slip
  //calculateCompleteSpondylolisthesis(A, B, C, D, ctx);
};

// SCREW PLACEMENT 

export const drawScrew = (ctx, screw) => {
  const { x, y, length, angle, selected } = screw;
  const dx = (length / 2) * Math.cos(angle);
  const dy = (length / 2) * Math.sin(angle);

  ctx.strokeStyle = selected ? 'red' : 'blue';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - dx, y - dy);
  ctx.lineTo(x + dx, y + dy);
  ctx.stroke();

  // Screw head
  ctx.beginPath();
  ctx.arc(x - dx, y - dy, 5, 0, 2 * Math.PI);
  ctx.fillStyle = 'black';
  ctx.fill();
};

export const rotateScrew = (screw, deltaAngle) => {
  screw.angle += deltaAngle;
};

// screwHandlers.js
export const createScrewHandlers = (canvasRef, screws, drawAll) => {
  let draggingIndex = null;

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    screws.forEach((screw, i) => {
      if (Math.hypot(x - screw.x, y - screw.y) < 15) {
        draggingIndex = i;
        screw.selected = true;
      }
    });
  };

  const handleMouseMove = (e) => {
    if (draggingIndex !== null) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      screws[draggingIndex].x = x;
      screws[draggingIndex].y = y;
      drawAll();
    }
  };

  const handleMouseUp = () => {
    if (draggingIndex !== null) {
      screws[draggingIndex].selected = false;
      draggingIndex = null;
      drawAll();
    }
  };

  const handleKeyDown = (e) => {
    screws.forEach((screw) => {
      if (screw.selected) {
        if (e.key === 'ArrowLeft') screw.angle -= 0.1;
        if (e.key === 'ArrowRight') screw.angle += 0.1;
        drawAll();
      }
    });
  };

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleKeyDown
  };
};

