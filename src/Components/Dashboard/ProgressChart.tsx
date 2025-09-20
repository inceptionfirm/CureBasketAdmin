import React from 'react';
import './ProgressChart.css';

interface ProgressChartProps {
  title: string;
  value: number;
  max: number;
  color: string;
  showPercentage?: boolean;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  title,
  value,
  max,
  color,
  showPercentage = true,
  size = 'medium',
  animated = true
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizeClasses = {
    small: 'progress-chart-small',
    medium: 'progress-chart-medium',
    large: 'progress-chart-large'
  };

  return (
    <div className={`progress-chart ${sizeClasses[size]}`}>
      <div className="progress-chart-header">
        <h4 className="progress-chart-title">{title}</h4>
        {showPercentage && (
          <span className="progress-chart-percentage">{Math.round(percentage)}%</span>
        )}
      </div>
      
      <div className="progress-chart-container">
        <div className="progress-chart-track">
          <div 
            className={`progress-chart-fill ${animated ? 'animated' : ''}`}
            style={{
              width: `${percentage}%`,
              backgroundColor: color
            }}
          />
        </div>
        
        <div className="progress-chart-labels">
          <span className="progress-chart-value">{value}</span>
          <span className="progress-chart-max">/ {max}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;

