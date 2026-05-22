import React, { useMemo } from 'react';
import { GraduationCap } from 'lucide-react';

export default function CreditsCard({ credits }) {
  const displayCredits = useMemo(() => {
    return credits > 0 ? credits : 66.5; // Mockup default
  }, [credits]);

  return (
    <div className="stat-card glass-panel">
      <div className="stat-card-top-area">
        <div className="stat-card-header">
          <div className="stat-icon-wrapper"><GraduationCap size={20} /></div>
          <span className="stat-card-title">TOTAL CREDITS</span>
        </div>
        <div className="stat-card-value">{displayCredits}</div>
        <div className="stat-card-desc">Credits Completed</div>
      </div>
    </div>
  );
}
