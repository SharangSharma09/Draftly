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
  flip?: 'horizontal' | 'vertical' | 'both';
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
  rotation,
  flip
}) => {
  // Create style object based on rotation and flip properties
  const createTransformStyle = () => {
    let transform = '';
    
    // Add rotation if specified
    if (rotation) {
      transform += `rotate(${rotation})`;
    }
    
    // Add flip if specified
    if (flip) {
      const scaleX = flip === 'horizontal' || flip === 'both' ? -1 : 1;
      const scaleY = flip === 'vertical' || flip === 'both' ? -1 : 1;
      
      if (transform) {
        transform += ` scale(${scaleX}, ${scaleY})`;
      } else {
        transform = `scale(${scaleX}, ${scaleY})`;
      }
    }
    
    return transform ? { transform } : {};
  };
  
  const transformStyle = createTransformStyle();
  
  return (
    <Button
      variant="action"
      onClick={onClick}
      disabled={disabled}
      className={`px-0 py-3 h-auto relative rounded-xl ${
        selected ? 'ring-2 ring-[#6668FF] ring-offset-0' : ''
      }`}
      data-action={action}
    >
      {useEmoji ? (
        <span className="text-2xl mb-1" style={transformStyle}>{icon}</span>
      ) : (
        <span className={`material-icons ${color}`} style={transformStyle}>{icon}</span>
      )}
      <span className="mt-1 text-xs font-medium">{label}</span>
    </Button>
  );
};
