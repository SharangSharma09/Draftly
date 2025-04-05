import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface EmojiToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export const EmojiToggle: React.FC<EmojiToggleProps> = ({ 
  enabled, 
  onChange, 
  disabled = false 
}) => {
  return (
    <div className="flex items-center justify-between">
      <Label 
        htmlFor="emoji-toggle" 
        className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}
      >
        ADD EMOJIS
      </Label>
      <Switch 
        id="emoji-toggle" 
        checked={enabled}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};