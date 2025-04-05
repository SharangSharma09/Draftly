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
      className={`p-0 h-auto relative ${
        selected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
      }`}
      data-action={action}
    >
      <span className={`material-icons ${color}`}>{icon}</span>
      <span className="mt-1 text-xs font-medium">{label}</span>
    </Button>
  );
};
