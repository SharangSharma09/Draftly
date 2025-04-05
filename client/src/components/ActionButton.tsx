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
  size?: 'default' | 'small' | 'large';
  iconSize?: 'default' | 'small' | 'large';
  variant?: 'action' | 'actionCompact' | 'actionWide';
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
  size = 'default',
  iconSize = 'default',
  variant = 'action'
}) => {
  // Size mappings
  const sizeClasses = {
    small: 'p-2',
    default: 'p-3',
    large: 'p-4'
  };
  
  const iconSizeClasses = {
    small: 'text-lg',
    default: 'text-xl',
    large: 'text-2xl'
  };
  
  const labelSizeClasses = {
    small: 'text-xs',
    default: 'text-xs',
    large: 'text-sm'
  };
  
  const getContent = () => {
    if (variant === 'actionCompact') {
      return (
        <>
          <span className={`material-icons ${color} ${iconSizeClasses[iconSize]}`}>{icon}</span>
          <span className={`${labelSizeClasses[size]} font-medium`}>{label}</span>
        </>
      );
    } else {
      return (
        <>
          <span className={`material-icons ${color} ${iconSizeClasses[iconSize]}`}>{icon}</span>
          <span className={`mt-1 ${labelSizeClasses[size]} font-medium`}>{label}</span>
        </>
      );
    }
  };
  
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className={`p-0 h-auto relative ${sizeClasses[size]} ${
        selected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
      }`}
      data-action={action}
      data-size={size}
    >
      {getContent()}
    </Button>
  );
};
