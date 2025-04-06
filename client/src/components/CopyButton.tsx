import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  text: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text.trim()) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text:", err);
      });
  };

  return (
    <Button
      variant="outline"
      onClick={handleCopy}
      className={`
        bg-[#6668FF] hover:bg-[#5557DF] 
        text-white 
        aspect-square h-10 w-10 p-0 
        flex items-center justify-center 
        rounded-md border-0
        ${copied ? "active bg-green-500" : ""}
        ${!text.trim() ? "opacity-40 cursor-not-allowed" : ""}
      `}
      disabled={!text.trim()}
      title={copied ? "Copied!" : "Copy text"}
      aria-label={copied ? "Copied!" : "Copy text"}
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5"></path>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      )}
    </Button>
  );
};
