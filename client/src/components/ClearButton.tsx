import React from 'react';
import { Button } from '@/components/ui/button';

interface ClearButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const ClearButton: React.FC<ClearButtonProps> = ({ onClick, disabled }) => {
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
      title="Clear"
      aria-label="Clear text"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18"></path>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    </Button>
  );
};