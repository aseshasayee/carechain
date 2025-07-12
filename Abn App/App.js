import React, { useState, useRef, useEffect } from 'react';
import './App.css';

import {
  midpoint,
  lengthBetweenPoints,
  angleWithHorizontal,
  angleABC,
  lineIntersection
} from './Core';

import {
  drawLine,
  drawDashedLine,
  drawAngleLabel,
} from './Canvas';

import { 
  handlePolygonTool,
  PolygonManager,
  calculatePolygonArea
} from './Generic_Tools';

import {
  handleStenosisPolygon,
  StenosisPolygonManager,
  calculatePolygonCentroid,
  classifyStenosisSeverity,
  calculateSlipDistance,
  calculateSlipAngle,
  calculateSlipPercentage,
  classifySlipGrade,
  calculateCompleteSpondylolisthesis,
  STENOSIS_TYPES,
  SPONDYLOLISTHESIS_GRADES,
  calculateScoliosisAVT,
  calculateScoliosisCobbAngle,
  calculateScoliosisTrunkShift,
  getAbnormalityTypes,
  getAbnormalityConfig,
  classifyCobbSeverity,
  classifyTrunkShiftSeverity
} from './Abnormalities';

const TOOL_OPTIONS = [
    {key: 'cobb', label: "Cobb Angle", points: 4},
    {key: 'trunk_shift', label: "Trunk Shift", points: 3},
    {key: 'avt', label: "Apical vertebral translation (AVT)", points: 3},
    {key: 'stenosis', label: "Stenosis Area"},
    {key: 'listhesis', label: "Listhesis Parameters", points:4}
]

const TOOL_HANDLERS = {
    cobb: calculateScoliosisCobbAngle,
    trunk_shift: calculateScoliosisTrunkShift,
    avt: calculateScoliosisAVT,
    stenosis: handlePolygonTool,
    listhesis: calculateCompleteSpondylolisthesis
}

const TOOL_CATEGORIES = {
    'Scoliosis': TOOL_OPTIONS.filter(tool => ['cobb', 'trunk_shift', 'avt'].includes(tool.key)),
    'Stenosis': TOOL_OPTIONS.filter(tool => tool.key === 'stenosis'),
    'Spondylolisthesis': TOOL_OPTIONS.filter(tool => tool.key === 'listhesis')
}

export default function App() {
  const canvasRef = useRef();
  const [tool, setTool] = useState('');
  const [points, setPoints] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Scoliosis');
  const [message, setMessage] = useState('');
  const [results, setResults] = useState([]);

  const getCtx = () => canvasRef.current?.getContext('2d');

  const handleCanvasClick = (e) => {
    if (!tool) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const ctx = getCtx();

    const newPoints = [...points, pt];
    setPoints(newPoints);

    // Draw the current point
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();

    const selectedTool = TOOL_OPTIONS.find(opt => opt.key === tool);
    const handler = TOOL_HANDLERS[tool];

    // For stenosis (polygon), allow continuous clicking
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

    // For other tools, check if we have enough points
    if (selectedTool.points && newPoints.length >= selectedTool.points) {
      const result = handler(...newPoints.slice(0, selectedTool.points), ctx);
      setResults(prev => [...prev, result]);
      setMessage(`${selectedTool.label} calculated successfully!`);
      setPoints([]); // Reset points after calculation
    } else if (selectedTool.points) {
      setMessage(`${selectedTool.label}: ${newPoints.length}/${selectedTool.points} points selected`);
    }
  };

  const clearCanvas = () => {
    const ctx = getCtx();
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setPoints([]);
    setResults([]);
    setMessage('');
  };

  const resetCurrentTool = () => {
    setPoints([]);
    setMessage('');
  };

  const selectedTool = TOOL_OPTIONS.find(opt => opt.key === tool);
  const currentCategoryTools = TOOL_CATEGORIES[selectedCategory] || [];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Spine Abnormalities Measurement Tool</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onClick={handleCanvasClick}
          style={{ 
            border: '2px solid #333', 
            cursor: tool ? 'crosshair' : 'default',
            backgroundColor: '#f9f9f9'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>Category:</label>
        <select 
          value={selectedCategory} 
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setTool('');
            resetCurrentTool();
          }}
          style={{ marginRight: '20px', padding: '5px' }}
        >
          {Object.keys(TOOL_CATEGORIES).map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <label style={{ marginRight: '10px' }}>Tool:</label>
        <select 
          value={tool} 
          onChange={(e) => {
            setTool(e.target.value);
            resetCurrentTool();
          }}
          style={{ marginRight: '20px', padding: '5px' }}
        >
          <option value="">Select Tool</option>
          {currentCategoryTools.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>

        <button onClick={clearCanvas} style={{ marginRight: '10px', padding: '5px 10px' }}>
          Clear Canvas
        </button>
        <button onClick={resetCurrentTool} style={{ padding: '5px 10px' }}>
          Reset Tool
        </button>
      </div>

      {selectedTool && (
        <div style={{ 
          backgroundColor: '#e8f4f8', 
          padding: '15px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h3>{selectedTool.label}</h3>
          {selectedTool.points && (
            <p>Points Required: {selectedTool.points}</p>
          )}
          {tool === 'stenosis' && (
            <p>Click to add points to the polygon. Double-click to finish.</p>
          )}
        </div>
      )}

      {message && (
        <div style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          {message}
        </div>
      )}

      {results.length > 0 && (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          padding: '15px', 
          borderRadius: '5px'
        }}>
          <h3>Results:</h3>
          <ul>
            {results.map((result, index) => (
              <li key={index}>
                {result.type}: {JSON.stringify(result)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}