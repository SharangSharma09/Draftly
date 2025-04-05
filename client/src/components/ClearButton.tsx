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
      className="text-gray-500 hover:text-gray-700 aspect-square h-10 w-10 p-0 flex items-center justify-center"
    >
      <span className="material-icons text-sm">delete_outline</span>
    </Button>
  );
};