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
    <div className="flex items-center space-x-2">
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <Switch 
            id="emoji-toggle" 
            checked={enabled}
            onCheckedChange={onChange}
            disabled={disabled}
          />
          <Label 
            htmlFor="emoji-toggle" 
            className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}
          >
            Add Emojis
          </Label>
        </div>
        <p className="text-xs text-gray-500 mt-1 ml-10">
          Adds minimal, contextual emojis to enhance readability
        </p>
      </div>
    </div>
  );
};