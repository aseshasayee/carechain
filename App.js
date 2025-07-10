import React, { useRef, useState, useEffect } from 'react';

import { 
  performWedgeOsteotomy, 
  performResection, 
  performOpenOsteotomy, 
  performCageSimulation, 
  performSpondylolisthesisCorrectionWithGap,
  drawScrew,
  rotateScrew,
  createScrewHandlers
 } from './Surgical_Tools';  

const App = () => {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [points, setPoints] = useState([]);
  const [mode, setMode] = useState('wedge'); 
  const [screws, setScrews] = useState([{x:200, y: 200, length: 60, angle:0, selected:false}]);
  const pointRequirements = { wedge: 3, resect: 6, open: 6, cage: 6, listhesis: 4};
  const maxPoints = pointRequirements[mode] || 0;

  const drawAll = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    drawPoints(ctx, points);        // <- Draw labeled points
    screws.forEach(screw => drawScrew(ctx, screw));  // <- Draw all screws
  };

  const handlers = createScrewHandlers(canvasRef, screws, drawAll);  

  const modeLabels = {
    wedge: 'Wedge Osteotomy',
    resect: 'Resection',
    open: 'Open Osteotomy',
    cage: 'Cage Simulation',
    listhesis: 'Spondylolisthesis Correction'
  };

  const drawPoints = (ctx, points) => {
    ctx.fillStyle = 'red';
    ctx.font = '16px sans-serif';
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    points.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillText(labels[idx] || `P${idx}`, pt.x + 8, pt.y - 8);
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
      drawAll();
    };
    img.src = URL.createObjectURL(file);
  };

  const handleCanvasClick = (e) => {
    if (points.length >= maxPoints) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPoints = [...points, { x, y }];
    setPoints(newPoints);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPoints(newPoints);
    drawAll(); // Let the effect handle this if needed
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    drawAll()
    if (!canvas) return;

    canvas.addEventListener('mousedown', handlers.handleMouseDown);
    canvas.addEventListener('mousemove', handlers.handleMouseMove);
    canvas.addEventListener('mouseup', handlers.handleMouseUp);
    window.addEventListener('keydown', handlers.handleKeyDown);

    return () => {
      canvas.removeEventListener('mousedown', handlers.handleMouseDown);
      canvas.removeEventListener('mousemove', handlers.handleMouseMove);
      canvas.removeEventListener('mouseup', handlers.handleMouseUp);
      window.removeEventListener('keydown', handlers.handleKeyDown);
    };
  }, [points, image, screws]);

  return (
    <div>
      <h2>Surgical Simulator</h2>
      <input type="file" onChange={handleImageUpload} accept="image/*" /><br />
      <canvas ref={canvasRef} width = {800} height = {600} onClick={handleCanvasClick} style={{ border: '1px solid black' }} />
      <p>
        {
          mode === 'wedge'
            ? 'Click 3 points: A (below), B (hinge), C (above)'
            : mode === 'resect'
              ? 'Click 6 points: A B C D E F — AB (inferior cut), CD (mid), EF (superior cut)'
              : mode === 'open'
              ? 'Click 6 points: A B C D E F — CD (cut), AB (lower), EF (upper)'
              : mode === 'cage'
              ? 'Click 6 points: A B C D E F — AB (inferior cut), CD (mid), EF (superior cut)'
              : 'Click 4 points: A B C D — A - uA, B - uP, C - bA, D - bP'
        }
      </p>
      <p>Mode: {modeLabels[mode]}</p>
      <p>{points.length} / {maxPoints} points selected</p>

      <button onClick={() => setMode('wedge')}>Wedge Mode</button>
      <button onClick={() => setMode('resect')}>Resect Mode</button>
      <button onClick={() => setMode('open')}>Open Mode</button>
      <button onClick={() => setMode('cage')}>Cage Simulation</button>
      <button onClick={() => setMode('listhesis')}>Spondylolisthesis Correction</button>
      <button onClick={() => {
        const newScrew = {
          x: 100,       // default position
          y: 100,
          length: 60,   // or whatever you want
          angle: 0,
          selected: false
        };
        setScrews(prev => [...prev, newScrew]);
      }}>+ Add Screw</button>
      <button
        onClick={() => {
          if (mode === 'wedge') {
            performWedgeOsteotomy(canvasRef.current, image, points);
          } else if (mode == 'resect') {
            performResection(canvasRef.current, image, points);
          } else if (mode == 'open') {
            performOpenOsteotomy(canvasRef.current, image, points);
          } else if (mode == 'cage') {
            performCageSimulation(canvasRef.current, image, points);
          } else if (mode == 'listhesis') {
            performSpondylolisthesisCorrectionWithGap(canvasRef.current, image, points);
          }
        }}
      >
        Perform {modeLabels[mode] || 'Action'}
      </button>
      <button onClick={() => setPoints([])}>Reset Points</button>
    </div>
  );
};

export default App;
