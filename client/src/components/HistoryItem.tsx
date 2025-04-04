import React from 'react';
import { HistoryEntry } from '@/pages/TextTransformer';

interface HistoryItemProps {
  entry: HistoryEntry;
  timeAgo: string;
  onClick: () => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ entry, timeAgo, onClick }) => {
  // Map action to color class
  const getActionColor = (action: string) => {
    switch (action) {
      case 'summarize': return 'text-primary';
      case 'paraphrase': return 'text-accent';
      case 'formalize': return 'text-secondary';
      case 'simplify': return 'text-success';
      case 'bullets': return 'text-warning';
      case 'expand': return 'text-error';
      default: return 'text-primary';
    }
  };

  // Capitalize the first letter of the action
  const formatAction = (action: string) => {
    return action.charAt(0).toUpperCase() + action.slice(1);
  };

  return (
    <div 
      className="p-2 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <span className={`text-xs font-medium ${getActionColor(entry.action)}`}>
          {formatAction(entry.action)}
        </span>
        <span className="text-xs text-gray-500">{timeAgo}</span>
      </div>
      <p className="text-xs text-gray-700 mt-1 truncate">{entry.text}</p>
    </div>
  );
};
