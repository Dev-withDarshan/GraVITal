import React, { useState, useEffect } from 'react';

export default function AnimatedNumber({ value, decimals = 2, className = '', style = {} }) {
  const [displayValue, setDisplayValue] = useState(parseFloat(value) || 0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const targetValue = parseFloat(value) || 0;
    if (displayValue === targetValue) return;

    setIsUpdating(true);
    let startTimestamp = null;
    const duration = 500; // ms
    const initialValue = displayValue;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      const currentVal = initialValue + (targetValue - initialValue) * easeProgress;
      setDisplayValue(currentVal);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValue);
        // Remove glow after a short delay
        setTimeout(() => setIsUpdating(false), 300);
      }
    };

    window.requestAnimationFrame(step);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const updateClass = isUpdating 
    ? (parseFloat(value) > displayValue ? 'value-increase' : 'value-decrease') 
    : '';

  return (
    <span className={`${className} animate-number ${updateClass}`} style={style}>
      {displayValue.toFixed(decimals)}
    </span>
  );
}
