// App.js
import React, { useRef, useState } from 'react';
import { 
  handleLineTool,
  handleAngleTool2Pt,
  handleAngleTool3Pt,
  handleAngleTool4Pt,
  handleMultiLineTool,
  handleCircleTool,
  handleEllipseTool,
  handlePolygonTool,
  handlePencilTool,
  PolygonManager
} from './Generic_Tools';
 
import './App.css';
 
const TOOL_OPTIONS = [
  { key: 'line', label: 'Line (2)' },
  { key: 'angle2', label: 'Angle (2 pt)' },
  { key: 'angle3', label: 'Angle (3 pt)' },
  { key: 'angle4', label: 'Angle (4 pt)' },
  { key: 'multi', label: 'Multi-Line' },
  { key: 'circle', label: 'Circle' },
  { key: 'ellipse', label: 'Ellipse' },
  { key: 'polygon', label: 'Polygon' },
  { key: 'pencil', label: 'Pencil' }
];

const TOOL_HANDLERS = {
  line: handleLineTool,
  angle2: handleAngleTool2Pt,
  angle3: handleAngleTool3Pt,
  angle4: handleAngleTool4Pt,
  multi: handleMultiLineTool,
  circle: handleCircleTool,
  ellipse: handleEllipseTool,
  polygon: handlePolygonTool,
  pencil: handlePencilTool
};

export default function App() {
  const canvasRef = useRef();
  const [tool, setTool] = useState(null);
  const [points, setPoints] = useState([]);
  const [drawing, setDrawing] = useState(false);

  const getCtx = () => canvasRef.current.getContext('2d');

  const handleCanvasClick = (e) => {
      if (!tool) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      const ctx = getCtx();

      // Special handling for polygon tool with PolygonManager
      if (tool === 'polygon') {
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

      // Regular handling for other tools
      const newPoints = [...points, pt];
      setPoints(newPoints);

      // Don't show points for shapes like ellipse, circle, polygon, pencil
      const toolsWithoutMarkers = ['circle', 'ellipse', 'pencil'];
      if (tool !== 'pencil' && tool !== 'polygon') {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      const handler = TOOL_HANDLERS[tool];
      const result = handler(newPoints, ctx);

      // Reset for tools that finish on fixed point count
      const fixedPointCount = {
        line: 2,
        angle2: 2,
        angle3: 3,
        angle4: 4,
        circle: 2,
        ellipse: 2,
        polygon: null, // handled by PolygonManager
        pencil: null,  // free input
        multi: null    // continues until tool change
      };

      if (fixedPointCount[tool] && newPoints.length === fixedPointCount[tool]) {
        setPoints([]);
      }

      if (tool === 'multi' && newPoints.length >= 2) {
        // live draw only last segment
        const segCtx = getCtx();
        segCtx.beginPath();
        segCtx.moveTo(newPoints[newPoints.length - 2].x, newPoints[newPoints.length - 2].y);
        segCtx.lineTo(newPoints[newPoints.length - 1].x, newPoints[newPoints.length - 1].y);
        segCtx.strokeStyle = 'black';
        segCtx.lineWidth = 2;
        segCtx.stroke();
      }
  };

  const clearCanvas = () => {
    const ctx = getCtx();
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setPoints([]);
  };

  return (
    <div className="app">
      <div className="toolbar">
        {TOOL_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            className={tool === key ? 'active' : ''}
            onClick={() => { setTool(key); setPoints([]); }}>
            {label}
          </button>
        ))}
        <button onClick={clearCanvas} className="clear-btn">Clear</button>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        onClick={handleCanvasClick}
        className="canvas"
      />
    </div>
  );
}
