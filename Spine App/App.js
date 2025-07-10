// App.js
import React, { useRef, useState } from 'react';
import {
  // Spinopelvic Parameters
  calculatePI,
  calculatePT,
  calculateSS,
  calculateSpinopelvicParams,
  // Spinal Curvature Parameters - NEW UNIFIED SYSTEM
  calculateSpinalCurvatureAngle,
  getSpinalCurvatureOptions,
  getSpinalCurvatureOptionsByRegion,
  SPINAL_CURVATURE_TYPES,
  // Global Sagittal Parameters
  calculateSVA,
  calculateCSVA,
  calculateTPA,
  calculateSPA,
  calculateSSA,
  calculateT1SPi,
  calculateT9SPi,
  calculateODHA,
  calculateCBVA,
  // Coronal Parameters
  drawC7PL,
  drawCSVL,
  calculateTrunkShift,
  calculateRVAD,
  calculateAVT,
  calculatePO,
  // VBM Parameters
  VBM,
  handleOutlineDrag,
  getOutlineArea
} from './Spine_Tools';

import { 
  handlePolygonTool,
  PolygonManager
} from './Generic_Tools';

import './App.css';

// Get spinal curvature options dynamically
const spinalCurvatureOptions = getSpinalCurvatureOptions();

const TOOL_OPTIONS = [
  // Spinopelvic Parameters (4 points each)
  { key: 'pi', label: 'Pelvic Incidence (PI)', points: 4, description: 'Femoral heads (2) + S1 endplate (2)' },
  { key: 'pt', label: 'Pelvic Tilt (PT)', points: 4, description: 'Femoral heads (2) + S1 endplate (2)' },
  { key: 'ss', label: 'Sacral Slope (SS)', points: 2, description: 'S1 endplate (2)' },
  { key: 'spinopelvic', label: 'All Spinopelvic', points: 4, description: 'PI + PT + SS combined' },
  
  // NEW: Unified Spinal Curvature Parameters
  ...spinalCurvatureOptions.map(option => ({
    key: `spinal_${option.value}`,
    label: option.label,
    points: 4,
    description: `${option.region} measurement - 4 points for endplates`,
    spinalType: option.value
  })),
  
  // Global Sagittal Parameters (varying points)
  { key: 'sva', label: 'Sagittal Vertical Axis (SVA)', points: 2, description: 'C7 centroid + S1 posterosuperior' },
  { key: 'csva', label: 'Cervical SVA (cSVA)', points: 2, description: 'C2 centroid + C7 centroid' },
  { key: 'tpa', label: 'T1 Pelvic Angle (TPA)', points: 5, description: 'T1 centroid + Femoral heads (2) + S1 endplate (2)' },
  { key: 'spa', label: 'Spino-Pelvic Angle (SPA)', points: 5, description: 'C7 centroid + S1 endplate (2) + Femoral heads (2)' },
  { key: 'ssa', label: 'Spino-Sacral Angle (SSA)', points: 3, description: 'C7 centroid + S1 endplate (2)}'},
  { key: 't1spi', label: 'T1 Spinopelvic Inclination', points: 3, description: 'T1 centroid + Femoral heads (2)' },
  { key: 't9spi', label: 'T9 Spinopelvic Inclination', points: 3, description: 'T9 centroid + Femoral heads (2)' },
  { key: 'cbva', label: 'Chin Brow Vertical Angle (CBVA)', points: 2, description: 'Chin + Brow' },
  { key: 'odha', label: 'Odontoid - Hip Axis Angle (ODHA)', points: 2, description: 'Odontoid Tip + Femoral Heads (2)' },
  
  // Coronal Parameters
  { key: 'csvl', label: 'Coronal SVL (CSVL)', points: 2, description: 'S1 endplate (2)' },
  { key: 'c7pl', label: 'C7 Plumb Line', points: 1, description: 'C7 centroid' },
  { key: 'trunkshift', label: 'Trunk Shift', points: 3, description: 'C7 centroid + S1 endplate (2)' },
  { key: 'rvad', label: 'Rib Vertebral Angle Difference (RVAD)', points: 6, description: 'Rib left (2) + Rib right (2) + Apical Vertebral endplate (2)' },
  { key: 'avt', label: 'Apical Vertebral Translation (AVT)', points: 3, description: 'AV Centroid + S1 endplate (2)' },
  { key: 'po', label: 'Pelvic Obliquity', points: 2, description: 'Posterosuperior Iliac Spine (2)' },

  //VBM Parameters
  { key: 'vbm', label: 'Vertebral Body Metrics', points: 4, description: 'Corners of Vertebral body in Sagittal View (4)' },

  { key: 'stenosis', label: 'Stenosis Area'}
];

const TOOL_HANDLERS = {
  // Spinopelvic Parameters
  pi: (points, ctx) => {
    if (points.length >= 4) {
      const result = calculatePI(points[0], points[1], points[2], points[3], ctx);
      return { result, message: `PI: ${result.toFixed(1)}°` };
    }
    return { result: null, message: 'Need 4 points: Femoral heads (2) + S1 endplate (2)' };
  },
  
  pt: (points, ctx) => {
    if (points.length >= 4) {
      const result = calculatePT(points[0], points[1], points[2], points[3], ctx);
      return { result, message: `PT: ${result.toFixed(1)}°` };
    }
    return { result: null, message: 'Need 4 points: Femoral heads (2) + S1 endplate (2)' };
  },
  
  ss: (points, ctx) => {
    if (points.length >= 2) {
      const result = calculateSS(points[0], points[1], ctx);
      return { result, message: `SS: ${result.toFixed(1)}°` };
    }
    return { result: null, message: 'Need 2 points: S1 endplate' };
  },
  
  spinopelvic: (points, ctx) => {
    if (points.length >= 4) {
      const result = calculateSpinopelvicParams(points[0], points[1], points[2], points[3], ctx);
      return { 
        result, 
        message: `PI: ${result.PI.toFixed(1)}°, PT: ${result.PT.toFixed(1)}°, SS: ${result.SS.toFixed(1)}°, Valid: ${result.validation}` 
      };
    }
    return { result: null, message: 'Need 4 points: Femoral heads (2) + S1 endplate (2)' };
  },
  
  // NEW: Unified Spinal Curvature Handler
  ...Object.fromEntries(
    spinalCurvatureOptions.map(option => [
      `spinal_${option.value}`,
      (points, ctx) => {
        if (points.length >= 4) {
          const result = calculateSpinalCurvatureAngle(points, ctx, option.value);
          if (result) {
            return { 
              result: result.angle, 
              message: `${result.measurement.abbreviation}: ${result.angle.toFixed(1)}°`,
              fullResult: result
            };
          }
        }
        return { 
          result: null, 
          message: `Need 4 points for ${option.label}: Upper endplate (2) + Lower endplate (2)` 
        };
      }
    ])
  ),
  
  // Global Sagittal Parameters
  sva: (points, ctx) => {
    if (points.length >= 2) {
      const result = calculateSVA(points[0], points[1], ctx);
      return { result, message: `SVA: ${result.toFixed(1)}mm` };
    }
    return { result: null, message: 'Need 2 points: C7 centroid + S1 posterosuperior' };
  },
  
  csva: (points, ctx) => {
    if (points.length >= 2) {
      const result = calculateCSVA(points[0], points[1], ctx);
      return { result, message: `cSVA: ${result.toFixed(1)}mm` };
    }
    return { result: null, message: 'Need 2 points: C2 centroid + C7 centroid' };
  },
  
  tpa: (points, ctx) => {
    if (points.length >= 5) {
      const result = calculateTPA(points[0], points[1], points[2], points[3], points[4], ctx);
      return { result, message: `TPA: ${result.toFixed(1)}°` };
    }
    return { result: null, message: 'Need 5 points: T1 centroid + Femoral heads (2) + S1 endplate (2)' };
  },
  
  spa: (points, ctx) => {
    if (points.length >= 5) {
      const result = calculateSPA(points[0], points[1], points[2], points[3], points[4], ctx);
      return { result, message: `SPA: ${result.toFixed(1)}°` };
    }
    return { result: null, message: 'Need 5 points: C7 centroid + S1 endplate (2) + Femoral heads (2)' };
  },
  
  ssa: (points, ctx) => {
    if (points.length >= 3) {
      const result = calculateSSA(points[0], points[1], points[2],ctx);
      return { result, message: `SSA: ${result.toFixed(1)}°` };
    }
    return { result: null, message: 'Need 3 points: C7 centroid + S1 endplate (2)' };
  },
  
  t1spi: (points, ctx) => {
    if (points.length >= 3) {
      const result = calculateT1SPi(points[0], points[1], points[2], ctx);
      return { result, message: `T1SPi: ${result.toFixed(1)}°` };
    }
    return { result: null, message: 'Need 3 points: T1 centroid + Femoral heads (2)' };
  },
  
  t9spi: (points, ctx) => {
    if (points.length >= 3) {
      const result = calculateT9SPi(points[0], points[1], points[2], ctx);
      return { result, message: `T9SPi: ${result.toFixed(1)}°` };
    }
    return { result: null, message: 'Need 3 points: T9 centroid + Femoral heads (2)' };
  },

  odha: (points, ctx) => {
    if (points.length >= 3) {
      const result = calculateODHA(points[0], points[1], points[2], ctx);
      return { result, message: `ODHA: ${result.toFixed(1)}°` };
    }
    return { result: null, message: 'Need 3 points: Odontoid Tip + Femoral heads (2)' };
  },

  cbva: (points, ctx) => {
    if (points.length >= 2) {
      const result = calculateCBVA(points[0], points[1], ctx);
      return { result, message: `CBVA: ${result.toFixed(1)}°` };
    }
    return { result: null, message: 'Need 2 points: Chin + Brow' };
  },

  // Coronal Parameters
  csvl: (points, ctx) => {
    if (points.length >= 2) {
      const result = drawCSVL(points[0], points[1], ctx);
      return { result, message: `CSVL drawn` };
    }
    return { result: null, message: 'Need 2 points: S1 endplate' };
  },

  c7pl: (points, ctx) => {
    if (points.length >= 1) {
      const result = drawC7PL(points[0], ctx);
      return { result, message: `C7PL drawn` };
    }
    return { result: null, message: 'Need 1 point: C7 Centroid' };
  },
  
  trunkshift: (points, ctx) => {
    if (points.length >= 3) {
      const result = calculateTrunkShift(points[0], points[1], points[2], ctx);
      return { result, message: `Trunk Shift: ${result.toFixed(1)}mm` };
    }
    return { result: null, message: 'Need 3 points: C7 centroid + S1 endplate (2)' };
  },

  rvad: (points, ctx) => {
    if (points.length >=6) {
      const result = calculateRVAD(points[0], points[1], points[2], points[3], points[4], points[5], ctx);
      return { result, message: `RVAD: ${result.toFixed(1)}°`};
    }
    return { result: null, message: 'Need 6 points: Left Rib (2) + Right Rib (2) + Apical Vertebra Endplate (2)' };
  },

  avt: (points, ctx) => {
    if (points.length >=3) {
      const result = calculateAVT(points[0], points[1], points[2], ctx);
      return { result, message: `AVT: ${result.toFixed(1)}mm` };
    }
    return { result: null, message: 'Need 3 points: AV Centroid + S1 endplate (2)' };
  },

  po: (points, ctx) => {
    if (points.length >= 2) {
      const result = calculatePO(points[0], points[1], ctx);
      return { result, message: `Pelvic Obliquity: ${result.toFixed(1)}°` };
    }
    return { result: null, message: 'Need 2 points: Posterosuperior Iliac Spine (2)' };
  },

  //VBM Parameters
  vbm: (points, ctx) => {
    if (points.length >= 4) {
      const result = VBM(points[0], points[1], points[2], points[3], ctx);
      return { 
        result, 
        message: `VBM: Anterior Height =${result.Aheight.toFixed(1)}mm, Posterior Height=${result.Pheight.toFixed(1)}mm, Wedge Angle=${result.Angle.angle.toFixed(1)}°`,
        fullResult: result
      };
    }
    return { result: null, message: 'Need 4 points: Corners of Vertebral body in Sagittal View (4)' };
  },

  stenosis: handlePolygonTool
}

const TOOL_CATEGORIES = {
  'Spinopelvic': TOOL_OPTIONS.filter(tool => ['pi', 'pt', 'ss', 'spinopelvic'].includes(tool.key)),
  'Spinal Curvature': TOOL_OPTIONS.filter(tool => tool.key.startsWith('spinal_')),
  'Global Sagittal': TOOL_OPTIONS.filter(tool => ['sva', 'csva', 'tpa', 'spa', 'ssa', 't1spi', 't9spi','cbva','odha'].includes(tool.key)),
  'Coronal': TOOL_OPTIONS.filter(tool => ['c7pl', 'csvl', 'trunkshift','rvad','avt','po'].includes(tool.key)),
  'VBM': TOOL_OPTIONS.filter(tool => tool.key === 'vbm'),
  'Abnormalities': TOOL_OPTIONS.filter(tool => tool.key === 'stenosis')
};

const drawVertebralOutline = (ctx, outline) => {
  if (!outline || outline.length < 4) return;
  
  console.log('Drawing vertebral outline:', outline); // DEBUG
  
  // Draw the outline
  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(outline[0].x, outline[0].y);
  for (let i = 1; i < outline.length; i++) {
    ctx.lineTo(outline[i].x, outline[i].y);
  }
  ctx.closePath();
  ctx.stroke();
  
  // Draw drag handles
  ctx.fillStyle = 'orange';
  outline.forEach((point, index) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add index labels
    ctx.fillStyle = 'black';
    ctx.font = '10px Arial';
    ctx.fillText((index + 1).toString(), point.x + 8, point.y - 8);
    ctx.fillStyle = 'orange';
  });
};
export default function App() {
  const canvasRef = useRef();
  const [tool, setTool] = useState(null);
  const [points, setPoints] = useState([]);
  const [message, setMessage] = useState('');
  const [results, setResults] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('Spinal Curvature');

  // VBM-specific state
  const [vertebralOutline, setVertebralOutline] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const getCtx = () => canvasRef.current.getContext('2d');

  const handleCanvasClick = (e) => {
    if (!tool) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const ctx = getCtx();
    
    // Handle vertebral outline dragging if it exists and we're using VBM tool
    if (tool === 'vbm' && vertebralOutline && !isDragging) {
      // Check if click is near a drag handle
      for (let i = 0; i < vertebralOutline.length; i++) {
        const handle = vertebralOutline[i];
        const distance = Math.sqrt(Math.pow(pt.x - handle.x, 2) + Math.pow(pt.y - handle.y, 2));
        if (distance <= 8) { // 8px tolerance for drag handles
          setDragIndex(i);
          setIsDragging(true);
          return; // Don't add new points when starting to drag
        }
      }
    }

          if (tool === 'stenosis') {
            const result = PolygonManager.addPoint(pt);
            
            if (result.action === 'start') {
              // For first point, just draw the red dot
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = "red";
              ctx.fill();
            } else if (result.action === 'continue') {
              handlePolygonTool(result.points, ctx, false);
            } else if (result.action === 'complete') {
              handlePolygonTool(result.points, ctx, true);
            }
            
            return;
          }
    
    const newPoints = [...points, pt];
    setPoints(newPoints);
    
    // Draw point marker
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add point number label
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillText(newPoints.length.toString(), pt.x + 6, pt.y - 6);
    
    const handler = TOOL_HANDLERS[tool];
    if (handler) {
      const result = handler(newPoints, ctx);
      setMessage(result.message);
      
      if (result.result !== null) {
        setResults(prev => ({
          ...prev,
          [tool]: result.fullResult || result.result
        }));
      }
    }
    
    // Get the expected point count for this tool
    const toolConfig = TOOL_OPTIONS.find(opt => opt.key === tool);
    if (toolConfig && newPoints.length === toolConfig.points) {
      // Special handling for VBM tool - create vertebral outline
      if (tool === 'vbm' && newPoints.length === 4) {
        const outlinePoints = [...newPoints]; // Create copy
        setVertebralOutline(outlinePoints);
        drawVertebralOutline(ctx, outlinePoints);
        setMessage(message + " | Drag orange handles to adjust vertebral outline");
      }
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging || !vertebralOutline || tool !== 'vbm') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    
    // Update the dragged point
    const updatedOutline = [...vertebralOutline];
    updatedOutline[dragIndex] = pt;
    setVertebralOutline(updatedOutline);
    
    // Redraw everything
    const ctx = getCtx();
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Redraw the original 4 points
    points.forEach((point, index) => {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.fillText((index + 1).toString(), point.x + 6, point.y - 6);
    });
    
    // Redraw VBM measurements with updated outline
    const result = VBM(updatedOutline[0], updatedOutline[1], updatedOutline[2], updatedOutline[3], ctx);
    
    // Draw the updated outline
    drawVertebralOutline(ctx, updatedOutline);
    
    // Show current measurements
    const area = getOutlineArea(updatedOutline);
    setMessage(`VBM: AH=${result.Aheight.toFixed(1)}mm, PH=${result.Pheight.toFixed(1)}mm, Angle=${result.Angle.angle.toFixed(1)}°, Area=${area.toFixed(1)}mm²`);
  };

  const handleCanvasMouseUp = () => {
    if (isDragging && vertebralOutline && tool === 'vbm') {
      // Update the points array to match the final outline
      setPoints([...vertebralOutline]);
      
      // Recalculate VBM with final positions
      const ctx = getCtx();
      const result = VBM(vertebralOutline[0], vertebralOutline[1], vertebralOutline[2], vertebralOutline[3], ctx);
      const area = getOutlineArea(vertebralOutline);
      
      setResults(prev => ({
        ...prev,
        vbm: {
          ...result,
          area: area
        }
      }));
      
      setMessage(`VBM Complete: AH=${result.Aheight.toFixed(1)}mm, PH=${result.Pheight.toFixed(1)}mm, Angle=${result.Angle.angle.toFixed(1)}°, Area=${area.toFixed(1)}mm²`);
    }
    
    setIsDragging(false);
    setDragIndex(null);
  };

  const clearCanvas = () => {
    const ctx = getCtx();
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setPoints([]);
    setMessage('');
    setResults({});
    setVertebralOutline(null); // Clear VBM outline
    setIsDragging(false);
    setDragIndex(null);
  };

  const resetCurrentTool = () => {
    setPoints([]);
    setMessage('');
    if (tool === 'vbm') {
      setVertebralOutline(null);
      setIsDragging(false);
      setDragIndex(null);
    }
  };

  const selectedTool = TOOL_OPTIONS.find(opt => opt.key === tool);
  const currentCategoryTools = TOOL_CATEGORIES[selectedCategory] || [];

  return (
    <div className="app">
      <div className="toolbar">
        {/* Category Selection */}

        <div className="category-tabs">
          {Object.keys(TOOL_CATEGORIES).map(category => (
            <button
              key={category}
              className={selectedCategory === category ? 'active-tab' : 'tab'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tool Buttons for Selected Category */}
        <div className="tool-buttons">
          {currentCategoryTools.map(({ key, label, points: requiredPoints, description }) => (
            <button
              key={key}
              className={tool === key ? 'active' : ''}
              onClick={() => { 
                setTool(key); 
                setPoints([]); 
                setMessage(''); 
              }}
              title={description}
            >
              {label} ({requiredPoints}pt)
            </button>
          ))}
        </div>
        
        <div className="control-buttons">
          <button onClick={resetCurrentTool} className="reset-btn">
            Reset Points
          </button>
          <button onClick={clearCanvas} className="clear-btn">
            Clear All
          </button>
        </div>
      </div>

      <div className="info-panel">
        {selectedTool && (
          <div className="tool-info">
            <h3>{selectedTool.label}</h3>
            <p><strong>Required:</strong> {selectedTool.description}</p>
            <p><strong>Points:</strong> {points.length}/{selectedTool.points}</p>
            {message && <p><strong>Result:</strong> {message}</p>}
            {selectedTool.spinalType && (
              <p><strong>Type:</strong> {SPINAL_CURVATURE_TYPES[selectedTool.spinalType]?.region} {SPINAL_CURVATURE_TYPES[selectedTool.spinalType]?.type}</p>
            )}
          </div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        className="canvas"
        style = {{cursor: isDragging? 'grabbing':'default'}}
      />
      
      {Object.keys(results).length > 0 && (
        <div className="results-panel">
          <h3>Results Summary</h3>
          {Object.entries(results).map(([toolKey, result]) => (
            <div key={toolKey} className="result-item">
              <strong>{TOOL_OPTIONS.find(opt => opt.key === toolKey)?.label}:</strong>
              {typeof result === 'object' && result.measurement ? (
                <div>
                  <div>{result.measurement.abbreviation}: {result.angle.toFixed(1)}°</div>
                  <div><em>{result.measurement.region} {result.measurement.curveType}</em></div>
                </div>
              ) : typeof result === 'object' ? 
                JSON.stringify(result, null, 2) : 
                result
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 