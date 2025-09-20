import React from 'react';
import './LineChart.css';

interface DataPoint {
  x: number;
  y: number;
  label: string;
}

interface LineChartProps {
  title: string;
  data: DataPoint[];
  color: string;
  height?: number;
  showDots?: boolean;
  showGrid?: boolean;
  animated?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  title,
  data,
  color,
  height = 200,
  showDots = true,
  showGrid = true,
  animated = true
}) => {
  if (data.length === 0) return null;

  // Calculate chart dimensions
  const padding = 20;
  const chartWidth = 300;
  const chartHeight = height - padding * 2;
  
  // Find min/max values
  const minX = Math.min(...data.map(d => d.x));
  const maxX = Math.max(...data.map(d => d.x));
  const minY = Math.min(...data.map(d => d.y));
  const maxY = Math.max(...data.map(d => d.y));
  
  // Scale data to chart coordinates
  const scaleX = (value: number) => 
    padding + ((value - minX) / (maxX - minX)) * (chartWidth - padding * 2);
  const scaleY = (value: number) => 
    padding + ((maxY - value) / (maxY - minY)) * (chartHeight - padding * 2);
  
  // Create path string for the line
  const pathData = data
    .map((point, index) => {
      const x = scaleX(point.x);
      const y = scaleY(point.y);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  
  // Create area path (for gradient fill)
  const areaData = `${pathData} L ${scaleX(data[data.length - 1].x)} ${chartHeight + padding} L ${scaleX(data[0].x)} ${chartHeight + padding} Z`;

  return (
    <div className="line-chart">
      <div className="line-chart-header">
        <h4 className="line-chart-title">{title}</h4>
      </div>
      
      <div className="line-chart-container">
        <svg
          width={chartWidth}
          height={height}
          viewBox={`0 0 ${chartWidth} ${height}`}
          className={`line-chart-svg ${animated ? 'animated' : ''}`}
        >
          {/* Grid lines */}
          {showGrid && (
            <g className="line-chart-grid">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                <g key={index}>
                  <line
                    x1={padding}
                    y1={padding + ratio * (chartHeight - padding * 2)}
                    x2={chartWidth - padding}
                    y2={padding + ratio * (chartHeight - padding * 2)}
                    stroke="var(--dashboard-border)"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  <line
                    x1={padding + ratio * (chartWidth - padding * 2)}
                    y1={padding}
                    x2={padding + ratio * (chartWidth - padding * 2)}
                    y2={chartHeight + padding}
                    stroke="var(--dashboard-border)"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                </g>
              ))}
            </g>
          )}
          
          {/* Area fill */}
          <path
            d={areaData}
            fill={`url(#gradient-${color.replace('#', '')})`}
            opacity="0.2"
            className={animated ? 'line-chart-area-animated' : ''}
          />
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={animated ? 'line-chart-line-animated' : ''}
          />
          
          {/* Data points */}
          {showDots && data.map((point, index) => {
            const x = scaleX(point.x);
            const y = scaleY(point.y);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={color}
                stroke="white"
                strokeWidth="2"
                className={animated ? 'line-chart-dot-animated' : ''}
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            );
          })}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Y-axis labels */}
        <div className="line-chart-y-labels">
          {[maxY, (maxY + minY) / 2, minY].map((value, index) => (
            <div key={index} className="line-chart-y-label">
              {Math.round(value)}
            </div>
          ))}
        </div>
        
        {/* X-axis labels */}
        <div className="line-chart-x-labels">
          {data.map((point, index) => (
            <div key={index} className="line-chart-x-label">
              {point.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LineChart;

