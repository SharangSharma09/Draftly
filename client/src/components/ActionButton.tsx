import React from 'react';
import { Button } from '@/components/ui/button';
import { TransformAction } from '@/pages/TextTransformer';

interface ActionButtonProps {
  action: TransformAction;
  icon: string;
  color: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  used?: boolean;
  selected?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  action, 
  icon, 
  color, 
  label, 
  onClick, 
  disabled,
  used = false,
  selected = false
}) => {
  return (
    <Button
      variant="action"
      onClick={onClick}
      disabled={disabled}
      className={`p-0 h-auto relative ${used ? 'opacity-60' : ''} ${
        selected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
      }`}
      data-action={action}
    >
      {used && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25 rounded">
          <span className="material-icons text-white text-opacity-90">check_circle</span>
        </div>
      )}
      <span className={`material-icons ${color}`}>{icon}</span>
      <span className="mt-1 text-xs font-medium">{label}</span>
    </Button>
  );
};
