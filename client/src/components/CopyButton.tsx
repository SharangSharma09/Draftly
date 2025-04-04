import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CopyButtonProps {
  text: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text.trim()) return;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text:', err);
    });
  };

  return (
    <Button
      variant="copy"
      onClick={handleCopy}
      className={`w-full ${copied ? 'active' : ''}`}
      disabled={!text.trim()}
    >
      <span className="material-icons text-sm">content_copy</span>
      <span>{copied ? 'Copied!' : 'Copy'}</span>
    </Button>
  );
};
