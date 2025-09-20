import React, { useState } from 'react';
import { CategoryCardProps } from '../../types';
import './CategoryCard.css';

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onElementToggle }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  // Filter only active elements
  const activeElements = category.elements.filter(element => element.isActive);

  const handleElementClick = (elementId: number): void => {
    onElementToggle(elementId);
  };

  return (
    <div 
      className="category-card"
      style={{ 
        '--category-color': category.color,
        borderLeftColor: category.color 
      }}
    >
      <div 
        className="category-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="category-info">
          <span className="category-icon">{category.icon}</span>
          <div className="category-details">
            <h3 className="category-name">{category.name}</h3>
            <span className="element-count">
              {activeElements.length} active element{activeElements.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="category-actions">
          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="category-elements">
          {activeElements.length === 0 ? (
            <div className="no-elements">
              <p>No active elements in this category</p>
            </div>
          ) : (
            <div className="elements-list">
              {activeElements.map(element => (
                <div 
                  key={element.id}
                  className="element-item"
                  onClick={() => handleElementClick(element.id)}
                >
                  <div className="element-indicator" style={{ backgroundColor: category.color }}></div>
                  <span className="element-name">{element.name}</span>
                  <span className="element-status active">Active</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryCard;
