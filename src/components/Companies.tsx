import React from 'react';
import './Companies.css';

const Companies: React.FC = () => {
  return (
    <div className="companies-container">
      <div className="companies-content">
        <header className="page-header">
          <h1>Companies</h1>
          <p>Discover top companies and organizations</p>
        </header>
        
        <div className="companies-grid">
          <div className="company-card">
            <h3>Coming Soon</h3>
            <p>Company listings will be available here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Companies;
