import React, { useState, useRef, useEffect } from 'react';

export interface TonePosition {
  formality: number; // 0 to 100, where 0 is casual and 100 is formal
  style: number;     // 0 to 100, where 0 is witty and 100 is persuasive
}

interface ToneSelectorProps {
  onChange: (position: TonePosition) => void;
  disabled?: boolean;
}

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
      isDragging.current = false;
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  const getFormalityLabel = () => {
    if (position.formality < 25) return 'Casual';
    if (position.formality < 50) return 'Conversational';
    if (position.formality < 75) return 'Professional';
    return 'Formal';
  };

  const getStyleLabel = () => {
    if (position.style < 25) return 'Witty';
    if (position.style < 50) return 'Friendly';
    if (position.style < 75) return 'Informative';
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
        {/* X-axis grid lines */}
        <div className="absolute w-full h-px bg-gray-200 top-1/4"></div>
        <div className="absolute w-full h-px bg-gray-200 top-1/2"></div>
        <div className="absolute w-full h-px bg-gray-200 top-3/4"></div>

        {/* Y-axis grid lines */}
        <div className="absolute h-full w-px bg-gray-200 left-1/4"></div>
        <div className="absolute h-full w-px bg-gray-200 left-1/2"></div>
        <div className="absolute h-full w-px bg-gray-200 left-3/4"></div>

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
        <div className="absolute -left-1 top-0 text-xs text-gray-500 transform -translate-y-full">Witty</div>
        <div className="absolute -right-1 bottom-0 text-xs text-gray-500 transform translate-y-full text-right">Persuasive</div>
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-500">
        <span>Witty</span>
        <span>Persuasive</span>
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