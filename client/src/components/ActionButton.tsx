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
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  action, 
  icon, 
  color, 
  label, 
  onClick, 
  disabled 
}) => {
  return (
    <Button
      variant="action"
      onClick={onClick}
      disabled={disabled}
      className="p-0 h-auto"
      data-action={action}
    >
      <span className={`material-icons ${color}`}>{icon}</span>
      <span className="mt-1 text-xs font-medium">{label}</span>
    </Button>
  );
};
