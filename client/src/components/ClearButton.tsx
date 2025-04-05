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
      className="text-gray-500 hover:text-gray-700 min-w-[100px]"
    >
      <span className="material-icons text-sm">delete_outline</span>
      <span className="ml-1">Clear</span>
    </Button>
  );
};