import React, { useState, useRef, useEffect } from 'react';

export interface TonePosition {
  formality: number; // 0 to 100, where 0 is casual and 100 is formal
  style: number;     // 0 to 100, where 0 is witty and 100 is persuasive
}

interface ToneSelectorProps {
  onChange: (position: TonePosition) => void;
  disabled?: boolean;
}

// Grid positions for snapping
const GRID_POSITIONS = [
  { x: 16.67, y: 16.67 }, // Top-left
  { x: 50, y: 16.67 },    // Top-center
  { x: 83.33, y: 16.67 }, // Top-right
  { x: 16.67, y: 50 },    // Middle-left
  { x: 50, y: 50 },       // Middle-center
  { x: 83.33, y: 50 },    // Middle-right
  { x: 16.67, y: 83.33 }, // Bottom-left
  { x: 50, y: 83.33 },    // Bottom-center
  { x: 83.33, y: 83.33 }, // Bottom-right
];

export const ToneSelector: React.FC<ToneSelectorProps> = ({ onChange, disabled = false }) => {
  const [position, setPosition] = useState<TonePosition>({ formality: 50, style: 50 });
  const gridRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    isDragging.current = true;
    updatePosition(e);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    snapToNearestGridPosition();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    updatePosition(e);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    isDragging.current = true;
    updatePositionTouch(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    updatePositionTouch(e);
    e.preventDefault(); // Prevent scrolling while dragging
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    snapToNearestGridPosition();
  };

  // Snap to the nearest grid position
  const snapToNearestGridPosition = () => {
    // Find the nearest grid position
    let nearestDistance = Infinity;
    let nearestPoint = GRID_POSITIONS[4]; // Default to center

    for (const point of GRID_POSITIONS) {
      const distance = Math.sqrt(
        Math.pow(point.x - position.formality, 2) + 
        Math.pow(point.y - position.style, 2)
      );
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPoint = point;
      }
    }

    // Set to the nearest point
    const newPosition = {
      formality: nearestPoint.x,
      style: nearestPoint.y,
    };
    
    setPosition(newPosition);
    onChange(newPosition);
  };

  const updatePosition = (e: React.MouseEvent) => {
    if (!gridRef.current) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    
    const newPosition = {
      formality: x,
      style: y,
    };
    
    setPosition(newPosition);
    onChange(newPosition);
  };

  const updatePositionTouch = (e: React.TouchEvent) => {
    if (!gridRef.current || !e.touches[0]) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
    
    const newPosition = {
      formality: x,
      style: y,
    };
    
    setPosition(newPosition);
    onChange(newPosition);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        snapToNearestGridPosition();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [position]); // Include position in dependencies for the snap function

  const getFormalityLabel = () => {
    if (position.formality < 30) return 'Casual';
    if (position.formality < 70) return 'Professional';
    return 'Formal';
  };

  const getStyleLabel = () => {
    if (position.style < 30) return 'Witty';
    if (position.style < 70) return 'Informative';
    return 'Persuasive';
  };

  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-xs text-gray-500">
        <span>Casual</span>
        <span>Formal</span>
      </div>
      <div
        ref={gridRef}
        className={`relative w-full h-48 border rounded-md bg-gradient-to-br from-blue-50 to-purple-50 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Create a 3x3 grid */}
        {/* Horizontal grid lines */}
        <div className="absolute w-full h-px bg-gray-200 top-1/3"></div>
        <div className="absolute w-full h-px bg-gray-200 top-2/3"></div>

        {/* Vertical grid lines */}
        <div className="absolute h-full w-px bg-gray-200 left-1/3"></div>
        <div className="absolute h-full w-px bg-gray-200 left-2/3"></div>

        {/* Grid blocks - for better visibility */}
        {GRID_POSITIONS.map((point, index) => (
          <div
            key={index}
            className="absolute h-2 w-2 rounded-full bg-gray-300"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}

        {/* Position indicator */}
        <div
          className={`absolute h-6 w-6 rounded-full bg-primary border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-white text-xs font-medium transition-all duration-150 ${disabled ? 'opacity-50' : 'opacity-100'}`}
          style={{
            left: `${position.formality}%`,
            top: `${position.style}%`,
          }}
        >
          <span className="material-icons text-sm">drag_indicator</span>
        </div>

        {/* Axis labels */}
        <div className="absolute -left-2 top-0 text-xs text-gray-500 transform -translate-y-full">Witty</div>
        <div className="absolute left-1/2 top-0 text-xs text-gray-500 transform -translate-x-1/2 -translate-y-full">Balanced</div>
        <div className="absolute -right-2 top-0 text-xs text-gray-500 transform -translate-y-full">Persuasive</div>
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-500">
        <span>Casual</span>
        <span>Professional</span>
        <span>Formal</span>
      </div>

      {/* Current tone indicator */}
      <div className="mt-3 text-center">
        <p className="text-sm text-gray-600">
          Selected Tone: <span className="font-medium">{getFormalityLabel()}</span> • <span className="font-medium">{getStyleLabel()}</span>
        </p>
      </div>
    </div>
  );
};