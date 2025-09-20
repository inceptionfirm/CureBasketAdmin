import React, { useState, useEffect } from 'react';
import './DonutChart.css';

interface DonutChartProps {
  title: string;
  achieved: number;
  target: number;
  color?: string;
  size?: number;
  animated?: boolean;
  onDataFetch?: () => Promise<{ achieved: number; target: number }>;
}

const DonutChart: React.FC<DonutChartProps> = ({
  title,
  achieved: initialAchieved,
  target: initialTarget,
  color = '#10b981',
  size = 200,
  animated = true,
  onDataFetch
}) => {
  const [achieved, setAchieved] = useState(initialAchieved);
  const [target, setTarget] = useState(initialTarget);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (onDataFetch) {
      fetchData();
    }
  }, [onDataFetch]);

  const fetchData = async () => {
    if (!onDataFetch) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await onDataFetch();
      setAchieved(data.achieved);
      setTarget(data.target);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching donut chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  const percentage = target > 0 ? Math.min((achieved / target) * 100, 100) : 0;
  const circumference = 2 * Math.PI * (size / 2 - 30);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const radius = size / 2 - 30;
  const centerX = size / 2;
  const centerY = size / 2;

  // Generate gradient ID for unique gradients
  const gradientId = `donut-gradient-${Math.random().toString(36).substr(2, 9)}`;

  if (loading) {
    return (
      <div className="donut-chart-container">
        <div className="donut-chart-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="donut-chart-container">
        <div className="donut-chart-error">
          <p>{error}</p>
          <button onClick={fetchData} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="donut-chart-container">
      <h4 className="donut-chart-title">{title}</h4>
      
      {/* Progress indicator */}
      <div className="progress-indicator">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${color}, ${color}dd)`
            }}
          ></div>
        </div>
        <span className="progress-text">{percentage.toFixed(1)}% Complete</span>
      </div>
      
      <div className="donut-chart-wrapper">
        <svg width={size} height={size} className="donut-chart-svg">
          {/* Define gradient */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="50%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="0.6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="24"
            className="donut-chart-background"
          />
          
          {/* Progress circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="24"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={animated ? circumference : strokeDashoffset}
            strokeLinecap="round"
            className={`donut-chart-progress ${animated ? 'animated' : ''}`}
            style={{
              transition: animated ? 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              filter: 'url(#glow)'
            }}
          />
          
          {/* Center text */}
          <text
            x={centerX}
            y={centerY - 8}
            textAnchor="middle"
            className="donut-chart-center-text"
          >
            Completed
          </text>
          <text
            x={centerX}
            y={centerY + 20}
            textAnchor="middle"
            className="donut-chart-percentage"
          >
            {percentage.toFixed(2)}%
          </text>
          
          {/* Achievement badge */}
          {percentage >= 100 && (
            <g className="achievement-badge">
              <circle
                cx={centerX + radius * 0.7}
                cy={centerY - radius * 0.7}
                r="12"
                fill="#10b981"
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={centerX + radius * 0.7}
                y={centerY - radius * 0.7 + 4}
                textAnchor="middle"
                className="achievement-text"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                ✓
              </text>
            </g>
          )}
        </svg>
      </div>
      
      <div className="donut-chart-legend">
        <div className="donut-chart-legend-item">
          <div className="legend-color" style={{ backgroundColor: color }}></div>
          <span className="legend-label">Achieved</span>
          <span className="legend-value">{achieved.toLocaleString()}</span>
        </div>
        <div className="donut-chart-legend-item">
          <div className="legend-color" style={{ backgroundColor: '#e5e7eb' }}></div>
          <span className="legend-label">Target</span>
          <span className="legend-value">{target.toLocaleString()}</span>
        </div>
      </div>
      
      {onDataFetch && (
        <button onClick={fetchData} className="refresh-btn" disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      )}
    </div>
  );
};

export default DonutChart;
