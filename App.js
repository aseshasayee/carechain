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
  // Coronal Parameters
  drawC7PL,
  drawCSVL,
  calculateTrunkShift,
  calculateRVAD,
} from './Spine_Tools';

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
  
  // Coronal Parameters
  { key: 'csvl', label: 'Coronal SVL (CSVL)', points: 2, description: 'S1 endplate (2)' },
  { key: 'c7pl', label: 'C7 Plumb Line', points: 1, description: 'C7 centroid' },
  { key: 'trunkshift', label: 'Trunk Shift', points: 3, description: 'C7 centroid + S1 endplate (2)' },
  { key: 'rvad', label: 'Rib Vertebral Angle Difference (RVAD)', points: 6, description: 'Rib left (2) + Rib right (2) + Apical Vertebral endplate (2)' },
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
  }
}

const TOOL_CATEGORIES = {
  'Spinopelvic': TOOL_OPTIONS.filter(tool => ['pi', 'pt', 'ss', 'spinopelvic'].includes(tool.key)),
  'Spinal Curvature': TOOL_OPTIONS.filter(tool => tool.key.startsWith('spinal_')),
  'Global Sagittal': TOOL_OPTIONS.filter(tool => ['sva', 'csva', 'tpa', 'spa', 'ssa', 't1spi', 't9spi'].includes(tool.key)),
  'Coronal': TOOL_OPTIONS.filter(tool => ['c7pl', 'csvl', 'trunkshift','rvad'].includes(tool.key))
};

export default function App() {
  const canvasRef = useRef();
  const [tool, setTool] = useState(null);
  const [points, setPoints] = useState([]);
  const [message, setMessage] = useState('');
  const [results, setResults] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('Spinal Curvature');

  const getCtx = () => canvasRef.current.getContext('2d');

  const handleCanvasClick = (e) => {
    if (!tool) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const ctx = getCtx();
    
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
      // Tool is complete, could auto-reset or keep points for reference
      // setPoints([]); // Uncomment to auto-reset after completion
    }
  };

  const clearCanvas = () => {
    const ctx = getCtx();
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setPoints([]);
    setMessage('');
    setResults({});
  };

  const resetCurrentTool = () => {
    setPoints([]);
    setMessage('');
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
        className="canvas"
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