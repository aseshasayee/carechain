import React, { useRef, useState, useEffect } from 'react';

import { 
  performWedgeOsteotomy, 
  performResection, 
  performOpenOsteotomy, 
  performCageSimulation, 
  performSpondylolisthesisCorrectionWithGap,
  drawScrew,
  rotateScrew,
  createScrewHandlers,
  handleRodTool,
  drawCage,
  createCageHandlers
 } from './Surgical_Tools';  

const App = () => {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [points, setPoints] = useState([]);
  const [osteotomyMode, setOsteotomyMode] = useState('wedge'); 
  const [activeMode, setActiveMode] = useState('osteotomy'); // 'osteotomy', 'rod', 'screw', 'cage'
  const [screws, setScrews] = useState([]);
  const [rodPoints, setRodPoints] = useState([]);
  const [cages, setCages] = useState([]);
  const [cageSimulationDone, setCageSimulationDone] = useState(false);
  const [placingCage, setPlacingCage] = useState(false);
  
  const pointRequirements = { wedge: 3, resect: 6, open: 6, cage: 6, listhesis: 4};
  const maxPoints = pointRequirements[osteotomyMode] || 0;

  const drawAll = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    
    // Draw osteotomy points
    drawPoints(ctx, points);
    
    // Draw screws
    screws.forEach(screw => drawScrew(ctx, screw));
    
    // Draw cages
    cages.forEach(cage => drawCage(ctx, cage));
    
    // Draw rod only if there are rod points
    if (rodPoints.length > 0) {
      drawRodPoints(ctx, rodPoints);
      if (rodPoints.length >= 2) {
        handleRodTool(rodPoints, ctx);
      }
    }
  };

  const handlers = createScrewHandlers(canvasRef, screws, drawAll);
  const cageHandlers = createCageHandlers(canvasRef, cages, drawAll);  

  const osteotomyLabels = {
    wedge: 'Wedge Osteotomy',
    resect: 'Resection',
    open: 'Open Osteotomy',
    cage: 'Cage Simulation/Spacer',
    listhesis: 'Spondylolisthesis Correction'
  };

  const drawPoints = (ctx, points) => {
    ctx.fillStyle = 'red';
    ctx.font = '16px sans-serif';
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    points.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillText(labels[idx] || `P${idx}`, pt.x + 8, pt.y - 8);
    });
  };

  const drawRodPoints = (ctx, points) => {
    ctx.fillStyle = 'blue';
    ctx.font = '14px sans-serif';
    points.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillText(`R${idx + 1}`, pt.x + 8, pt.y - 8);
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const img = new Image();
    img.onload = () => {
      setImage(img);
      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      // Don't call drawAll() here - let it render just the image initially
    };
    img.src = URL.createObjectURL(file);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeMode === 'rod') {
      setRodPoints(prev => [...prev, { x, y }]);
    } else if (activeMode === 'osteotomy') {
      if (points.length >= maxPoints) return;
      setPoints(prev => [...prev, { x, y }]);
    } else if (activeMode === 'cage' && placingCage) {
      // Place cage at clicked position
      const newCage = {
        x: x,
        y: y,
        width: 40,
        height: 15,
        angle: 0,
        selected: false
      };
      setCages(prev => [...prev, newCage]);
      setPlacingCage(false);
    }

    drawAll();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    drawAll();
    if (!canvas) return;

    // Add event listeners based on active mode
    if (activeMode === 'screw') {
      canvas.addEventListener('mousedown', handlers.handleMouseDown);
      canvas.addEventListener('mousemove', handlers.handleMouseMove);
      canvas.addEventListener('mouseup', handlers.handleMouseUp);
      window.addEventListener('keydown', handlers.handleKeyDown);
    } else if (activeMode === 'cage') {
      canvas.addEventListener('mousedown', cageHandlers.handleMouseDown);
      canvas.addEventListener('mousemove', cageHandlers.handleMouseMove);
      canvas.addEventListener('mouseup', cageHandlers.handleMouseUp);
      window.addEventListener('keydown', cageHandlers.handleKeyDown);
    }

    return () => {
      // Clean up all event listeners
      canvas.removeEventListener('mousedown', handlers.handleMouseDown);
      canvas.removeEventListener('mousemove', handlers.handleMouseMove);
      canvas.removeEventListener('mouseup', handlers.handleMouseUp);
      canvas.removeEventListener('mousedown', cageHandlers.handleMouseDown);
      canvas.removeEventListener('mousemove', cageHandlers.handleMouseMove);
      canvas.removeEventListener('mouseup', cageHandlers.handleMouseUp);
      window.removeEventListener('keydown', handlers.handleKeyDown);
      window.removeEventListener('keydown', cageHandlers.handleKeyDown);
    };
  }, [points, image, screws, rodPoints, cages, activeMode, placingCage]);

  const getInstructions = () => {
    if (activeMode === 'cage' && placingCage) {
      return 'Click to place cage at desired position';
    } else if (activeMode === 'rod') {
      return 'Click points to define rod path (minimum 2 points)';
    } else if (activeMode === 'screw') {
      return 'Click and drag to move screws, use arrow keys to rotate selected screw';
    } else if (activeMode === 'cage') {
      return 'Click and drag to move cages, use arrow keys to rotate selected cage';
    } else if (activeMode === 'osteotomy') {
      switch (osteotomyMode) {
        case 'wedge': return 'Click 3 points: A (below), B (hinge), C (above)';
        case 'resect': return 'Click 6 points: A B C D E F — AB (inferior cut), CD (mid), EF (superior cut)';
        case 'open': return 'Click 6 points: A B C D E F — CD (cut), AB (lower), EF (upper)';
        case 'cage': return 'Click 6 points: A B C D E F — AB (inferior cut), CD (mid), EF (superior cut)';
        case 'listhesis': return 'Click 4 points: A B C D — A - uA, B - uP, C - bA, D - bP';
        default: return 'Select an osteotomy mode';
      }
    }
    return 'Select a tool mode';
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Surgical Simulator</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          onChange={handleImageUpload} 
          accept="image/*"
          style={{ 
            padding: '8px', 
            border: '1px solid #ccc', 
            borderRadius: '4px',
            marginRight: '10px'
          }}
        />
        <span style={{ fontSize: '14px', color: '#666' }}>Upload X-ray or medical image</span>
      </div>

      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        onClick={handleCanvasClick} 
        style={{ 
          border: '2px solid #333', 
          borderRadius: '4px',
          cursor: 'crosshair',
          display: 'block',
          marginBottom: '20px'
        }} 
      />

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
          Instructions: {getInstructions()}
        </p>
        <p style={{ margin: '0', color: '#666' }}>
          Active Mode: <span style={{ fontWeight: 'bold', color: '#007bff' }}>
            {activeMode === 'rod' ? 'Rod Tool' : 
             activeMode === 'osteotomy' ? osteotomyLabels[osteotomyMode] : 
             activeMode === 'screw' ? 'Screw Tool' : 'Cage Tool'}
          </span>
          {activeMode === 'rod' && ` (${rodPoints.length} points)`}
          {activeMode === 'osteotomy' && ` (${points.length}/${maxPoints} points)`}
          {activeMode === 'cage' && placingCage && ' (Placing Mode)'}
        </p>
      </div>

      {/* Osteotomy Tools */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>Osteotomy Tools</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
          {Object.entries(osteotomyLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setOsteotomyMode(key);
                setActiveMode('osteotomy');
              }}
              style={{
                padding: '8px 16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: activeMode === 'osteotomy' && osteotomyMode === key ? '#007bff' : '#fff',
                color: activeMode === 'osteotomy' && osteotomyMode === key ? '#fff' : '#333',
                cursor: 'pointer'
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            if (osteotomyMode === 'wedge') {
              performWedgeOsteotomy(canvasRef.current, image, points);
            } else if (osteotomyMode === 'resect') {
              performResection(canvasRef.current, image, points);
            } else if (osteotomyMode === 'open') {
              performOpenOsteotomy(canvasRef.current, image, points);
            } else if (osteotomyMode === 'cage') {
              performCageSimulation(canvasRef.current, image, points);
              setCageSimulationDone(true);
            } else if (osteotomyMode === 'listhesis') {
              performSpondylolisthesisCorrectionWithGap(canvasRef.current, image, points);
            }
          }}
          disabled={activeMode !== 'osteotomy' || points.length < maxPoints}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: points.length >= maxPoints ? 'pointer' : 'not-allowed',
            opacity: points.length >= maxPoints ? 1 : 0.6,
            marginRight: '10px'
          }}
        >
          Perform Osteotomy
        </button>
        {cageSimulationDone && osteotomyMode === 'cage' && (
          <button
            onClick={() => {
              setActiveMode('cage');
              setPlacingCage(true);
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#fd7e14',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Place Cage
          </button>
        )}
      </div>

      {/* Surgical Tools */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>Surgical Tools</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={() => setActiveMode('rod')}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: activeMode === 'rod' ? '#17a2b8' : '#fff',
              color: activeMode === 'rod' ? '#fff' : '#333',
              cursor: 'pointer'
            }}
          >
            Rod Tool
          </button>
          <button
            onClick={() => setActiveMode('screw')}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: activeMode === 'screw' ? '#17a2b8' : '#fff',
              color: activeMode === 'screw' ? '#fff' : '#333',
              cursor: 'pointer'
            }}
          >
            Screw Tool
          </button>
          <button
            onClick={() => setActiveMode('cage')}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: activeMode === 'cage' ? '#17a2b8' : '#fff',
              color: activeMode === 'cage' ? '#fff' : '#333',
              cursor: 'pointer'
            }}
          >
            Cage Tool
          </button>
          <button
            onClick={() => {
              const newScrew = {
                x: 100,
                y: 100,
                length: 60,
                angle: 0,
                selected: false
              };
              setScrews(prev => [...prev, newScrew]);
              setActiveMode('screw');
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffc107',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            + Add Screw
          </button>
        </div>
      </div>

      {/* Reset Controls */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => {
            setPoints([]);
            setCageSimulationDone(false);
            setPlacingCage(false);
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset Osteotomy Points
        </button>
        <button
          onClick={() => setRodPoints([])}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Rod
        </button>
        <button
          onClick={() => setCages([])}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Cages
        </button>
        <button
          onClick={() => setScrews([])}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Screws
        </button>
      </div>
    </div>
  );
};

export default App;