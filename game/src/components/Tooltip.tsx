import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import './Tooltip.css';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  /** @deprecated Position is now automatically determined based on cursor location */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
  maxWidth?: number;
}

interface TooltipPosition {
  x: number;
  y: number;
  placement: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Determines the optimal tooltip placement based on cursor position.
 * The tooltip is placed in the opposite quadrant from where the cursor is,
 * ensuring maximum visibility.
 *
 * @param mouseX - Cursor X position
 * @param mouseY - Cursor Y position
 * @returns The placement direction for the tooltip
 */
function getQuadrantPlacement(mouseX: number, mouseY: number): TooltipPosition['placement'] {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const isInRightHalf = mouseX > viewportWidth / 2;
  const isInBottomHalf = mouseY > viewportHeight / 2;

  // Place tooltip in the opposite quadrant from cursor
  if (isInRightHalf && isInBottomHalf) {
    return 'top-left';
  } else if (isInRightHalf && !isInBottomHalf) {
    return 'bottom-left';
  } else if (!isInRightHalf && isInBottomHalf) {
    return 'top-right';
  } else {
    return 'bottom-right';
  }
}

/**
 * Calculate the final tooltip position with viewport boundary clamping.
 * Ensures the tooltip never extends outside the visible viewport.
 */
function calculateTooltipPosition(
  mouseX: number,
  mouseY: number,
  tooltipWidth: number,
  tooltipHeight: number,
  placement: TooltipPosition['placement']
): { left: number; top: number } {
  const CURSOR_OFFSET = 16; // Distance from cursor to tooltip
  const VIEWPORT_PADDING = 8; // Minimum distance from viewport edge

  let left: number;
  let top: number;

  // Calculate initial position based on placement
  switch (placement) {
    case 'top-left':
      left = mouseX - tooltipWidth - CURSOR_OFFSET;
      top = mouseY - tooltipHeight - CURSOR_OFFSET;
      break;
    case 'top-right':
      left = mouseX + CURSOR_OFFSET;
      top = mouseY - tooltipHeight - CURSOR_OFFSET;
      break;
    case 'bottom-left':
      left = mouseX - tooltipWidth - CURSOR_OFFSET;
      top = mouseY + CURSOR_OFFSET;
      break;
    case 'bottom-right':
    default:
      left = mouseX + CURSOR_OFFSET;
      top = mouseY + CURSOR_OFFSET;
      break;
  }

  // Clamp to viewport boundaries
  const maxLeft = window.innerWidth - tooltipWidth - VIEWPORT_PADDING;
  const maxTop = window.innerHeight - tooltipHeight - VIEWPORT_PADDING;

  left = Math.max(VIEWPORT_PADDING, Math.min(left, maxLeft));
  top = Math.max(VIEWPORT_PADDING, Math.min(top, maxTop));

  return { left, top };
}

export function Tooltip({
  content,
  children,
  position: _position = 'auto', // Kept for API compatibility but no longer used
  delay = 200,
  maxWidth = 420,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    showTooltip();
  }, [showTooltip]);

  // Calculate tooltip position when visible and we have dimensions
  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const placement = getQuadrantPlacement(mousePos.x, mousePos.y);
      const { left, top } = calculateTooltipPosition(
        mousePos.x,
        mousePos.y,
        tooltipRect.width,
        tooltipRect.height,
        placement
      );

      setTooltipStyle({
        left: `${left}px`,
        top: `${top}px`,
        maxWidth: `${maxWidth}px`,
      });
    }
  }, [isVisible, mousePos, maxWidth]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Create the tooltip element to be portaled
  const tooltipElement = isVisible && content ? (
    <div
      ref={tooltipRef}
      className="tooltip tooltip-portal"
      style={tooltipStyle}
      role="tooltip"
    >
      <div className="tooltip-content">{content}</div>
    </div>
  ) : null;

  return (
    <>
      <div
        className="tooltip-wrapper"
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={hideTooltip}
        onMouseMove={handleMouseMove}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>
      {/* Portal the tooltip to document.body to escape overflow constraints */}
      {tooltipElement && createPortal(tooltipElement, document.body)}
    </>
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
