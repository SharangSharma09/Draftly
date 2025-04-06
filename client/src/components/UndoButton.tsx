import React from 'react';
import { Button } from '@/components/ui/button';

interface UndoButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const UndoButton: React.FC<UndoButtonProps> = ({ onClick, disabled }) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-white hover:bg-gray-100 
        text-gray-600 
        aspect-square h-10 w-10 p-0 
        flex items-center justify-center 
        rounded-md border border-gray-300
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-gray-400'}
      `}
      title="Undo"
      aria-label="Undo last change"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7v6h6"></path>
        <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
      </svg>
    </Button>
  );
};