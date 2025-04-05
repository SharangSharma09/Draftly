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
      className="text-white bg-[#F95252] hover:bg-[#E84242] aspect-square h-10 w-10 p-0 flex items-center justify-center rounded-md border-0"
    >
      <span className="material-icons" style={{ fontSize: '1.2rem' }}>delete</span>
    </Button>
  );
};