import React, { useState, useEffect } from 'react';
import { initializeDatabase, checkCollectionsExist, getSampleData } from '../utils/initDatabase';
import './AdminPanel.css';

const AdminPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [collectionsStatus, setCollectionsStatus] = useState<{
    users: boolean;
    applications: boolean;
    savedJobs: boolean;
  } | null>(null);
  const [sampleData, setSampleData] = useState<{
    users: any[];
    applications: any[];
    savedJobs: any[];
  } | null>(null);

  useEffect(() => {
    checkCollections();
  }, []);

  const checkCollections = async () => {
    try {
      const status = await checkCollectionsExist();
      setCollectionsStatus(status);
    } catch (error) {
      console.error('Error checking collections:', error);
    }
  };

  const handleInitializeDatabase = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const result = await initializeDatabase();
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Database initialized successfully' });
        await checkCollections();
        await loadSampleData();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to initialize database' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while initializing the database' });
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = async () => {
    try {
      const data = await getSampleData();
      setSampleData(data);
    } catch (error) {
      console.error('Error loading sample data:', error);
    }
  };

  const handleViewData = async () => {
    await loadSampleData();
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🔧 Firestore Database Admin Panel</h1>
        <p>Initialize and manage your Firestore collections</p>
      </div>

      <div className="admin-content">
        {/* Database Initialization */}
        <div className="admin-section">
          <h2>🚀 Database Initialization</h2>
          <p>Click the button below to create all necessary collections and sample data:</p>
          
          <button
            className="btn btn-primary"
            onClick={handleInitializeDatabase}
            disabled={loading}
          >
            {loading ? '🔄 Initializing...' : '🚀 Initialize Database'}
          </button>

          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
        </div>

        {/* Collections Status */}
        <div className="admin-section">
          <h2>📊 Collections Status</h2>
          <div className="collections-grid">
            <div className={`collection-status ${collectionsStatus?.users ? 'exists' : 'missing'}`}>
              <h3>👥 Users Collection</h3>
              <p>{collectionsStatus?.users ? '✅ Exists' : '❌ Missing'}</p>
            </div>
            <div className={`collection-status ${collectionsStatus?.applications ? 'exists' : 'missing'}`}>
              <h3>📝 Applications Collection</h3>
              <p>{collectionsStatus?.applications ? '✅ Exists' : '❌ Missing'}</p>
            </div>
            <div className={`collection-status ${collectionsStatus?.savedJobs ? 'exists' : 'missing'}`}>
              <h3>🔖 Saved Jobs Collection</h3>
              <p>{collectionsStatus?.savedJobs ? '✅ Exists' : '❌ Missing'}</p>
            </div>
          </div>
          
          <button
            className="btn btn-secondary"
            onClick={checkCollections}
            style={{ marginTop: '1rem' }}
          >
            🔄 Refresh Status
          </button>
        </div>

        {/* Sample Data Viewer */}
        <div className="admin-section">
          <h2>📋 Sample Data Viewer</h2>
          <p>View the data that was created in your collections:</p>
          
          <button
            className="btn btn-secondary"
            onClick={handleViewData}
            style={{ marginBottom: '1rem' }}
          >
            👁️ View Sample Data
          </button>

          {sampleData && (
            <div className="data-viewer">
              {/* Users Data */}
              <div className="data-section">
                <h3>👥 Users ({sampleData.users.length})</h3>
                <div className="data-grid">
                  {sampleData.users.map((user: any) => (
                    <div key={user.id} className="data-card">
                      <h4>{user.firstName} {user.lastName}</h4>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Location:</strong> {user.location}</p>
                      <p><strong>Skills:</strong> {user.skills?.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Applications Data */}
              <div className="data-section">
                <h3>📝 Applications ({sampleData.applications.length})</h3>
                <div className="data-grid">
                  {sampleData.applications.map((app: any) => (
                    <div key={app.id} className="data-card">
                      <h4>Application by {app.userName}</h4>
                      <p><strong>Job ID:</strong> {app.jobId}</p>
                      <p><strong>Status:</strong> <span className={`status-${app.status}`}>{app.status}</span></p>
                      <p><strong>Email:</strong> {app.userEmail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved Jobs Data */}
              <div className="data-section">
                <h3>🔖 Saved Jobs ({sampleData.savedJobs.length})</h3>
                <div className="data-grid">
                  {sampleData.savedJobs.map((savedJob: any) => (
                    <div key={savedJob.id} className="data-card">
                      <h4>Saved Job</h4>
                      <p><strong>Job ID:</strong> {savedJob.jobId}</p>
                      <p><strong>User:</strong> {savedJob.userEmail}</p>
                      <p><strong>Saved:</strong> {savedJob.savedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Schema Information */}
        <div className="admin-section">
          <h2>📚 Collection Schemas</h2>
          <div className="schemas-grid">
            <div className="schema-card">
              <h3>👥 Users Collection</h3>
              <div className="schema-fields">
                <p><code>firstName</code> - string (required)</p>
                <p><code>lastName</code> - string (required)</p>
                <p><code>email</code> - string (required)</p>
                <p><code>phone</code> - string (optional)</p>
                <p><code>location</code> - string (optional)</p>
                <p><code>bio</code> - string (optional)</p>
                <p><code>skills</code> - array of strings</p>
                <p><code>experience</code> - string (optional)</p>
                <p><code>education</code> - string (optional)</p>
                <p><code>resumeUrl</code> - string (optional)</p>
                <p><code>createdAt</code> - timestamp</p>
                <p><code>updatedAt</code> - timestamp</p>
              </div>
            </div>

            <div className="schema-card">
              <h3>📝 Applications Collection</h3>
              <div className="schema-fields">
                <p><code>jobId</code> - string (required)</p>
                <p><code>userId</code> - string (required)</p>
                <p><code>userEmail</code> - string (required)</p>
                <p><code>userName</code> - string (required)</p>
                <p><code>coverLetter</code> - string (optional)</p>
                <p><code>status</code> - string: 'pending' | 'reviewed' | 'accepted' | 'rejected'</p>
                <p><code>appliedAt</code> - timestamp</p>
                <p><code>updatedAt</code> - timestamp</p>
              </div>
            </div>

            <div className="schema-card">
              <h3>🔖 Saved Jobs Collection</h3>
              <div className="schema-fields">
                <p><code>jobId</code> - string (required)</p>
                <p><code>userId</code> - string (required)</p>
                <p><code>userEmail</code> - string (required)</p>
                <p><code>savedAt</code> - timestamp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
