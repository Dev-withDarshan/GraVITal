import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { getTrend, getSemesterGPA } from '../utils/analytics';

export default function TrendCard({ semesters, onAddSemester }) {
  const activeSems = useMemo(() => semesters.filter(s => s.isIncluded !== false), [semesters]);

  const isEmpty = activeSems.length === 0;

  const displaySems = useMemo(() => {
    if (isEmpty) {
      return [
        { name: "Sem 1", gpa: 7.0 },
        { name: "Sem 2", gpa: 8.0 },
        { name: "Sem 3", gpa: 9.5 },
        { name: "Sem 4", gpa: 8.5 },
        { name: "Sem 5", gpa: 10.0 }
      ];
    }
    return activeSems.map((sem, i) => ({
      name: sem.name || `Sem ${i + 1}`,
      gpa: getSemesterGPA(sem)
    }));
  }, [activeSems, isEmpty]);

  const { minY, maxY } = useMemo(() => {
    if (isEmpty) return { minY: 0, maxY: 10 };
    const validGPAs = displaySems.map(s => s.gpa).filter(g => g > 0 && g <= 10);
    if (validGPAs.length === 0) return { minY: 0, maxY: 10 };
    const minG = Math.min(...validGPAs);
    const maxG = Math.max(...validGPAs);
    
    const calculatedMinY = minG >= 6.5 ? Math.max(6, minG - 0.5) : Math.max(0, minG - 0.5);
    const calculatedMaxY = Math.min(10, maxG + 0.3);
    
    return { minY: calculatedMinY, maxY: calculatedMaxY };
  }, [displaySems, isEmpty]);

  // Map to SVG coordinates: width 180, height 35.
  // Y: maxY -> 3px, minY -> 32px
  const points = useMemo(() => {
    const range = maxY - minY || 1;
    if (displaySems.length === 1) {
      const gpa = displaySems[0].gpa;
      const isMissing = gpa <= 0 || gpa > 10;
      const yVal = isMissing ? 32 : 32 - ((gpa - minY) / range) * 29;
      return [
        { x: 10, y: yVal, isMissing, gpa },
        { x: 170, y: yVal, isMissing, gpa }
      ];
    }
    return displaySems.map((s, idx) => {
      const isMissing = s.gpa <= 0 || s.gpa > 10;
      const yVal = isMissing ? 32 : 32 - ((s.gpa - minY) / range) * 29;
      return {
        x: 10 + (idx / (displaySems.length - 1)) * 160,
        y: yVal,
        isMissing,
        gpa: s.gpa
      };
    });
  }, [displaySems, minY, maxY]);

  const pathD = useMemo(() => {
    let d = "";
    let isStart = true;
    points.forEach((p) => {
      if (p.isMissing) {
        isStart = true;
      } else {
        d += `${isStart ? "M" : "L"} ${p.x} ${p.y} `;
        isStart = false;
      }
    });
    return d.trim();
  }, [points]);

  const isFlat = useMemo(() => {
    if (isEmpty) return false;
    const validGPAs = displaySems.map(s => s.gpa).filter(g => g > 0 && g <= 10);
    if (validGPAs.length <= 1) return true;
    const firstGPA = validGPAs[0];
    return validGPAs.every(g => g === firstGPA);
  }, [displaySems, isEmpty]);

  const trend = useMemo(() => {
    if (isEmpty) {
      return { label: "No Data", color: "#9ca3af", class: "trend-neutral" };
    }
    if (activeSems.length === 1) {
      return { label: "Only one semester available", color: "#9ca3af", class: "trend-neutral" };
    }
    return getTrend(semesters);
  }, [semesters, isEmpty, activeSems.length]);

  const trendDesc = useMemo(() => {
    if (isEmpty) return "Waiting for entries";
    if (activeSems.length === 1) return "Add more semesters to see trends";
    if (points[0] && points[0].isMissing) return "Start tracking from your first semester";
    if (isFlat) return "Stable CGPA across semesters";
    if (trend.label === "Improving") return "Positive Growth";
    if (trend.label === "Declining") return "Need to focus";
    return "Consistent Performance";
  }, [trend, isEmpty, isFlat, activeSems.length, points]);

  return (
    <div className="stat-card glass-panel" style={{ position: 'relative' }}>
      <div className="stat-card-header">
        <div className={`stat-icon-wrapper ${trend.label === "Declining" ? "trend-down-icon" : "trend-icon"} ${isEmpty ? 'opacity-50 grayscale' : ''}`}>
          {trend.label === "Declining" ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
        </div>
        <span className="stat-card-title">CGPA TREND</span>
      </div>

      <div className={`trend-graph-container ${isEmpty ? 'opacity-30' : ''}`}>
        <div className="y-axis-labels">
          <span>{maxY.toFixed(1)}</span>
          <span>{(minY + (maxY - minY) * 0.8).toFixed(1)}</span>
          <span>{(minY + (maxY - minY) * 0.6).toFixed(1)}</span>
          <span>{(minY + (maxY - minY) * 0.4).toFixed(1)}</span>
          <span>{(minY + (maxY - minY) * 0.2).toFixed(1)}</span>
          <span>{minY.toFixed(1)}</span>
        </div>
        <div className="graph-content-area">
          <svg className="trend-svg" width="100%" height="35" viewBox="0 0 180 35" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="3" x2="180" y2="3" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="8.8" x2="180" y2="8.8" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="14.6" x2="180" y2="14.6" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="20.4" x2="180" y2="20.4" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="26.2" x2="180" y2="26.2" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="32" x2="180" y2="32" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2 2" />

            {points && points.length >= 2 && pathD && pathD.trim() !== "" && (
              <path 
                d={pathD} 
                fill="none" 
                stroke={isEmpty ? "rgba(255,255,255,0.2)" : "url(#trendGradient)"} 
                strokeWidth="2.5" 
                strokeDasharray={isEmpty ? "4 4" : "none"}
                vectorEffect="non-scaling-stroke"
                className={isEmpty ? "" : "path animate-draw"}
                filter={!isEmpty ? "url(#glow)" : ""}
              />
            )}
            {!isEmpty && points && points.length >= 2 && points.map((p, i) => {
              const semData = displaySems[i] || displaySems[0];
              if (p.isMissing) {
                return (
                  <circle 
                    key={i} 
                    cx={p.x} 
                    cy={32} 
                    r="3" 
                    fill="transparent" 
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1.5"
                    style={{ cursor: 'pointer' }}
                  >
                    <title>No data for this semester</title>
                  </circle>
                );
              }
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  fill={i === points.length - 1 ? "#06b6d4" : "#8b5cf6"}
                  className="graph-point-glow"
                  style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                  onMouseOver={(e) => e.target.setAttribute('r', '5')}
                  onMouseOut={(e) => e.target.setAttribute('r', '3')}
                >
                  <title>{`${semData.name}: ${semData.gpa.toFixed(2)} CGPA`}</title>
                </circle>
              );
            })}
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <filter id="glow" filterUnits="userSpaceOnUse" x="-10" y="-10" width="200" height="55">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
          </svg>

          <div className="x-axis-labels">
            {displaySems.map((s, idx) => (
              <span key={idx}>{s.name}</span>
            ))}
          </div>
        </div>
      </div>

      {isEmpty && (
        <div style={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          textAlign: 'center',
          zIndex: 10
        }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#f3f4f6' }}>No data yet</p>
          <p style={{ margin: '2px 0 8px', fontSize: '10px', color: '#9ca3af', maxWidth: '160px', lineHeight: '1.4' }}>
            Add your first semester to see CGPA trends
          </p>
          {onAddSemester && (
            <button
              onClick={onAddSemester}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                color: '#e5e7eb',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backdropFilter: 'blur(4px)',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <Plus size={12} /> Add Semester
            </button>
          )}
        </div>
      )}

      <div className={`trend-footer ${isEmpty ? 'opacity-50' : ''}`}>
        <span className={`trend-badge ${trend.class}`} style={{ color: trend.color, borderColor: trend.color }}>
          {trend.label === "Declining" ? "↓ Declining" : trend.label}
        </span>
        <span className="stat-card-desc">{trendDesc}</span>
      </div>
    </div>
  );
}
