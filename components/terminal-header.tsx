'use client';

import { useEffect, useState } from 'react';

interface TerminalHeaderProps {
  text: string;
  typingSpeed?: number;
}

export function TerminalHeader({ text, typingSpeed = 50 }: TerminalHeaderProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, typingSpeed]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="font-mono text-brand-primary">
      <span>{displayedText}</span>
      {showCursor && <span className="animate-terminal-blink">▊</span>}
    </div>
  );
}
