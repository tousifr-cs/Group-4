import React from 'react';
import { JobFilters as JobFiltersType } from '../types/job';
import './JobFilters.css';

interface JobFiltersProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
}

const JobFilters: React.FC<JobFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (key: keyof JobFiltersType, value: string | boolean) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <aside className="job-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        <button 
          className="clear-filters"
          onClick={() => onFiltersChange({
            jobType: '',
            experienceLevel: '',
            salaryRange: '',
            remote: false
          })}
        >
          Clear All
        </button>
      </div>

      <div className="filter-section">
        <h4>Job Type</h4>
        <div className="filter-options">
          {['full-time', 'part-time', 'contract', 'internship', 'freelance'].map(type => (
            <label key={type} className="filter-option">
              <input
                type="radio"
                name="jobType"
                value={type}
                checked={filters.jobType === type}
                onChange={(e) => handleFilterChange('jobType', e.target.value)}
              />
              <span className="filter-label">{type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4>Experience Level</h4>
        <div className="filter-options">
          {['entry', 'mid', 'senior', 'lead', 'executive'].map(level => (
            <label key={level} className="filter-option">
              <input
                type="radio"
                name="experienceLevel"
                value={level}
                checked={filters.experienceLevel === level}
                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
              />
              <span className="filter-label">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4>Salary Range</h4>
        <div className="filter-options">
          {[
            { value: '0-50000', label: '$0 - $50k' },
            { value: '50000-100000', label: '$50k - $100k' },
            { value: '100000-150000', label: '$100k - $150k' },
            { value: '150000+', label: '$150k+' }
          ].map(range => (
            <label key={range.value} className="filter-option">
              <input
                type="radio"
                name="salaryRange"
                value={range.value}
                checked={filters.salaryRange === range.value}
                onChange={(e) => handleFilterChange('salaryRange', e.target.value)}
              />
              <span className="filter-label">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4>Work Arrangement</h4>
        <div className="filter-options">
          <label className="filter-option">
            <input
              type="checkbox"
              checked={filters.remote}
              onChange={(e) => handleFilterChange('remote', e.target.checked)}
            />
            <span className="filter-label">Remote</span>
          </label>
        </div>
      </div>

      <div className="filter-section">
        <h4>Quick Actions</h4>
        <div className="quick-actions">
          <button 
            className="quick-action-btn"
            onClick={() => onFiltersChange({
              ...filters,
              jobType: 'full-time',
              remote: true
            })}
          >
            Remote Full-time
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => onFiltersChange({
              ...filters,
              experienceLevel: 'entry'
            })}
          >
            Entry Level
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => onFiltersChange({
              ...filters,
              experienceLevel: 'senior'
            })}
          >
            Senior Positions
          </button>
        </div>
      </div>
    </aside>
  );
};

export default JobFilters;
