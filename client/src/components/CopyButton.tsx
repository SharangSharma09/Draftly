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
      variant="copy"
      onClick={handleCopy}
      className={`flex-1 ${copied ? "active" : ""} bg-[#6668FF] text-white hover:bg-[#5557DF]`}
      disabled={!text.trim()}
    >
      <span>{copied ? "Copied!" : "Copy"}</span>
    </Button>
  );
};
