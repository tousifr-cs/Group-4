import React from 'react';
import './JobSearch.css';

interface JobSearchProps {
  searchQuery: string;
  location: string;
  onSearchChange: (query: string) => void;
  onLocationChange: (location: string) => void;
}

const JobSearch: React.FC<JobSearchProps> = ({
  searchQuery,
  location,
  onSearchChange,
  onLocationChange
}) => {
  return (
    <section className="job-search">
      <div className="search-container">
        <div className="search-hero">
          <h2>Find Your Dream Job</h2>
          <p>Discover thousands of job opportunities with all the information you need</p>
        </div>
        
        <div className="search-form">
          <div className="search-inputs">
            <div className="search-field">
              <div className="search-icon">🔍</div>
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="search-field">
              <div className="search-icon">📍</div>
              <input
                type="text"
                placeholder="City, state, or remote"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                className="search-input"
              />
            </div>
            
            <button className="search-button">
              Search Jobs
            </button>
          </div>
          
          <div className="search-suggestions">
            <span className="suggestion-label">Popular:</span>
            <button 
              className="suggestion-tag"
              onClick={() => onSearchChange('Software Engineer')}
            >
              Software Engineer
            </button>
            <button 
              className="suggestion-tag"
              onClick={() => onSearchChange('Marketing')}
            >
              Marketing
            </button>
            <button 
              className="suggestion-tag"
              onClick={() => onSearchChange('Sales')}
            >
              Sales
            </button>
            <button 
              className="suggestion-tag"
              onClick={() => onSearchChange('Design')}
            >
              Design
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobSearch;
