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
  useEmoji?: boolean;
  rotation?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  action, 
  icon, 
  color, 
  label, 
  onClick, 
  disabled,
  used = false,
  selected = false,
  useEmoji = false,
  rotation
}) => {
  // Style for rotation if specified
  const rotationStyle = rotation ? { transform: `rotate(${rotation})` } : {};
  
  return (
    <Button
      variant="action"
      onClick={onClick}
      disabled={disabled}
      className={`px-0 py-3 h-auto relative ${
        selected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
      }`}
      data-action={action}
    >
      {useEmoji ? (
        <span className="text-2xl mb-1" style={rotationStyle}>{icon}</span>
      ) : (
        <span className={`material-icons ${color}`} style={rotationStyle}>{icon}</span>
      )}
      <span className="mt-1 text-xs font-medium">{label}</span>
    </Button>
  );
};
