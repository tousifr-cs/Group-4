import React, { useState, useEffect } from 'react';
import { checkJobsExist, testFirestoreConnection, manuallyReadJobs } from '../services/firestore';
import { autoSeedDatabase } from '../utils/sampleData';
import './DebugPanel.css';

const DebugPanel: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<{
    exists: boolean;
    count: number;
    loading: boolean;
    error: string | null;
  }>({
    exists: false,
    count: 0,
    loading: true,
    error: null
  });

  const [connectionTest, setConnectionTest] = useState<{
    loading: boolean;
    result: string | null;
    error: string | null;
  }>({
    loading: false,
    result: null,
    error: null
  });

  const [showPanel, setShowPanel] = useState(false);

  const checkDatabase = async () => {
    setDbStatus(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await checkJobsExist();
      setDbStatus({
        exists: result.exists,
        count: result.count,
        loading: false,
        error: null
      });
    } catch (error) {
      setDbStatus({
        exists: false,
        count: 0,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const testConnection = async () => {
    setConnectionTest({ loading: true, result: null, error: null });
    try {
      const result = await testFirestoreConnection();
      if (result.success) {
        setConnectionTest({ loading: false, result: result.message || 'Connection successful', error: null });
      } else {
        setConnectionTest({ loading: false, result: null, error: result.error || 'Connection failed' });
      }
    } catch (error) {
      setConnectionTest({ 
        loading: false, 
        result: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  const addSampleJobs = () => {
    if (typeof (window as any).addSampleJobs === 'function') {
      (window as any).addSampleJobs();
    } else {
      alert('Sample jobs function not available. Please refresh the page.');
    }
  };

  const addTestJobs = () => {
    if (typeof (window as any).addTestJobs === 'function') {
      (window as any).addTestJobs(5);
    } else {
      alert('Test jobs function not available. Please refresh the page.');
    }
  };

  if (!showPanel) {
    return (
      <button 
        className="debug-toggle"
        onClick={() => setShowPanel(true)}
        title="Debug Database"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="debug-panel">
      <div className="debug-header">
        <h3>🐛 Database Debug Panel</h3>
        <button 
          className="debug-close"
          onClick={() => setShowPanel(false)}
        >
          ×
        </button>
      </div>
      
      <div className="debug-content">
        <div className="debug-section">
          <h4>Database Status</h4>
          {dbStatus.loading ? (
            <p>Checking database...</p>
          ) : (
            <div className="status-info">
              <p><strong>Jobs exist:</strong> {dbStatus.exists ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Job count:</strong> {dbStatus.count}</p>
              {dbStatus.error && (
                <p><strong>Error:</strong> <span className="error-text">{dbStatus.error}</span></p>
              )}
            </div>
          )}
          <button 
            className="debug-btn"
            onClick={checkDatabase}
            disabled={dbStatus.loading}
          >
            🔄 Refresh Status
          </button>
        </div>

        <div className="debug-section">
          <h4>Connection Test</h4>
          {connectionTest.loading ? (
            <p>Testing connection...</p>
          ) : (
            <div className="status-info">
              {connectionTest.result && (
                <p><strong>Result:</strong> <span className="success-text">✅ {connectionTest.result}</span></p>
              )}
              {connectionTest.error && (
                <p><strong>Error:</strong> <span className="error-text">❌ {connectionTest.error}</span></p>
              )}
            </div>
          )}
          <button 
            className="debug-btn"
            onClick={testConnection}
            disabled={connectionTest.loading}
          >
            🔌 Test Connection
          </button>
          <button 
            className="debug-btn"
            onClick={async () => {
              try {
                const result = await manuallyReadJobs();
                if (result.success) {
                  alert(`✅ ${result.message}`);
                } else {
                  alert(`❌ ${result.error || 'Failed to read jobs'}`);
                }
              } catch (err) {
                alert('Failed to read jobs. Please try again.');
              }
            }}
          >
            📖 Manually Read Jobs
          </button>
        </div>

        <div className="debug-section">
          <h4>Quick Actions</h4>
          <div className="action-buttons">
            <button 
              className="debug-btn primary"
              onClick={addTestJobs}
            >
              ➕ Add 5 Test Jobs
            </button>
            <button 
              className="debug-btn primary"
              onClick={addSampleJobs}
            >
              🚀 Add 100 Sample Jobs
            </button>
            <button 
              className="debug-btn primary"
              onClick={async () => {
                                  try {
                    const result = await autoSeedDatabase();
                    if (result.success) {
                      alert('Database seeded successfully! Refreshing page...');
                      window.location.reload();
                    } else {
                      const errorMessage = 'error' in result ? result.error : 'Unknown error';
                      alert(`Seeding failed: ${errorMessage}`);
                    }
                  } catch (err) {
                    alert('Seeding failed. Please try again.');
                  }
              }}
            >
              🌱 Auto-Seed Database
            </button>
          </div>
        </div>

        <div className="debug-section">
          <h4>Instructions</h4>
          <ol className="debug-instructions">
            <li>Check the database status above</li>
            <li>If no jobs exist, use the quick actions to add some</li>
            <li>Check browser console for progress updates</li>
            <li>Refresh the page after adding jobs</li>
          </ol>
        </div>

        <div className="debug-section">
          <h4>Console Commands</h4>
          <div className="console-commands">
            <code>addTestJobs(5)</code> - Add 5 test jobs
            <code>addSampleJobs()</code> - Add 100 sample jobs
            <code>addSampleJobsInBatches(20)</code> - Add in batches of 20
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
