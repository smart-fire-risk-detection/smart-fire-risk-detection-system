import React from 'react';

interface BackgroundPatternProps {
  className?: string;
  patternSize?: number;
  patternColor?: string;
  patternOpacity?: number;
}

export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({
  className = '',
  patternSize = 20,
  patternColor = 'rgba(52, 211, 153, 0.1)',
  patternOpacity = 0.1
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      style={{
        backgroundImage: `
          radial-gradient(${patternColor} ${patternSize / 10}px, transparent ${patternSize / 5}px),
          radial-gradient(${patternColor} ${patternSize / 10}px, transparent ${patternSize / 5}px)
        `,
        backgroundSize: `${patternSize * 4}px ${patternSize * 4}px`,
        backgroundPosition: `0 0, ${patternSize * 2}px ${patternSize * 2}px`,
        opacity: patternOpacity
      }}
    />
  );
};

export const BackgroundGradient: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      style={{
        background: `
          radial-gradient(circle at 20% 30%, rgba(52, 211, 153, 0.08) 0%, rgba(10, 10, 10, 0) 70%),
          radial-gradient(circle at 80% 20%, rgba(23, 112, 232, 0.07) 0%, rgba(10, 10, 10, 0) 70%),
          radial-gradient(circle at 50% 70%, rgba(225, 29, 72, 0.05) 0%, rgba(10, 10, 10, 0) 60%),
          radial-gradient(circle at 10% 80%, rgba(250, 204, 21, 0.06) 0%, rgba(10, 10, 10, 0) 50%)
        `
      }}
    />
  );
};

// A component that creates a subtle grid pattern
export const GridPattern: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        backgroundPosition: '0 0',
        opacity: 0.3
      }}
    />
  );
};