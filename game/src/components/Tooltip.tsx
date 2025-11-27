import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import './Tooltip.css';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  maxWidth?: number;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  maxWidth = 280,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Adjust position if tooltip would go off-screen
  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const triggerRect = triggerRef.current.getBoundingClientRect();

      let newPosition = position;

      // Check if tooltip goes off-screen and adjust
      if (position === 'top' && tooltipRect.top < 0) {
        newPosition = 'bottom';
      } else if (position === 'bottom' && tooltipRect.bottom > window.innerHeight) {
        newPosition = 'top';
      } else if (position === 'left' && tooltipRect.left < 0) {
        newPosition = 'right';
      } else if (position === 'right' && tooltipRect.right > window.innerWidth) {
        newPosition = 'left';
      }

      // Also check horizontal overflow for top/bottom positions
      if ((position === 'top' || position === 'bottom') &&
          (triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2 < 0 ||
           triggerRect.left + triggerRect.width / 2 + tooltipRect.width / 2 > window.innerWidth)) {
        // Let CSS handle the adjustment with transform
      }

      if (newPosition !== actualPosition) {
        setActualPosition(newPosition);
      }
    }
  }, [isVisible, position, actualPosition]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="tooltip-wrapper"
      ref={triggerRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && content && (
        <div
          ref={tooltipRef}
          className={`tooltip tooltip-${actualPosition}`}
          style={{ maxWidth }}
          role="tooltip"
        >
          <div className="tooltip-content">{content}</div>
          <div className="tooltip-arrow" />
        </div>
      )}
    </div>
  );
}

// Helper component for formatted tooltips with title and description
interface TooltipContentProps {
  title: string;
  description: string;
  details?: string[];
  warning?: string;
  cost?: string;
  reward?: string;
}

export function TooltipContent({
  title,
  description,
  details,
  warning,
  cost,
  reward,
}: TooltipContentProps) {
  return (
    <div className="tooltip-formatted">
      <div className="tooltip-title">{title}</div>
      <div className="tooltip-description">{description}</div>
      {details && details.length > 0 && (
        <ul className="tooltip-details">
          {details.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      )}
      {cost && <div className="tooltip-cost">Cost: {cost}</div>}
      {reward && <div className="tooltip-reward">Reward: {reward}</div>}
      {warning && <div className="tooltip-warning">{warning}</div>}
    </div>
  );
}
