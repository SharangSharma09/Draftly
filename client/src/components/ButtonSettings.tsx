import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ButtonSettingsProps {
  onSettingsChange: (settings: ButtonSettingsValues) => void;
  settings: ButtonSettingsValues;
}

export interface ButtonSettingsValues {
  buttonSize: 'small' | 'default' | 'large';
  iconSize: 'small' | 'default' | 'large';
  gridCols: number;
  useCompact: boolean;
  buttonVariant: 'action' | 'actionCompact' | 'actionWide';
}

export const ButtonSettings: React.FC<ButtonSettingsProps> = ({ 
  onSettingsChange,
  settings 
}) => {
  const updateSettings = (update: Partial<ButtonSettingsValues>) => {
    onSettingsChange({
      ...settings,
      ...update
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-800">Button Settings</h3>
        <Button 
          variant="ghost" 
          className="h-7 px-2 text-xs" 
          onClick={() => onSettingsChange({
            buttonSize: 'default',
            iconSize: 'default',
            gridCols: 2,
            useCompact: false,
            buttonVariant: 'action'
          })}
        >
          Reset
        </Button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label htmlFor="button-size" className="text-xs">Button Size</Label>
            <span className="text-xs text-gray-500">{settings.buttonSize}</span>
          </div>
          <Select
            value={settings.buttonSize}
            onValueChange={(value) => updateSettings({ 
              buttonSize: value as 'small' | 'default' | 'large' 
            })}
          >
            <SelectTrigger id="button-size" className="h-8">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label htmlFor="icon-size" className="text-xs">Icon Size</Label>
            <span className="text-xs text-gray-500">{settings.iconSize}</span>
          </div>
          <Select
            value={settings.iconSize}
            onValueChange={(value) => updateSettings({ 
              iconSize: value as 'small' | 'default' | 'large' 
            })}
          >
            <SelectTrigger id="icon-size" className="h-8">
              <SelectValue placeholder="Select icon size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label htmlFor="button-variant" className="text-xs">Button Layout</Label>
          </div>
          <Select
            value={settings.buttonVariant}
            onValueChange={(value) => updateSettings({ 
              buttonVariant: value as 'action' | 'actionCompact' | 'actionWide',
              // When switching to compact, ensure the grid is appropriate
              gridCols: value === 'actionWide' ? 1 : settings.gridCols
            })}
          >
            <SelectTrigger id="button-variant" className="h-8">
              <SelectValue placeholder="Select variant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="action">Stacked (Default)</SelectItem>
              <SelectItem value="actionCompact">Side-by-side</SelectItem>
              <SelectItem value="actionWide">Full Width</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label htmlFor="grid-columns" className="text-xs">Grid Columns</Label>
            <span className="text-xs text-gray-500">{settings.gridCols}</span>
          </div>
          <Slider
            id="grid-columns"
            min={1}
            max={3}
            step={1}
            value={[settings.gridCols]}
            onValueChange={(value) => updateSettings({ gridCols: value[0] })}
            disabled={settings.buttonVariant === 'actionWide'}
            className="py-1"
          />
        </div>
      </div>
    </div>
  );
};