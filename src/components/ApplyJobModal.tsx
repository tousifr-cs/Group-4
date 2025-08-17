import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { applyForJob } from '../services/firestore';
import { Job } from '../types/job';
import './ApplyJobModal.css';

interface ApplyJobModalProps {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
}

const ApplyJobModal: React.FC<ApplyJobModalProps> = ({ job, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to apply for jobs');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await applyForJob({
        jobId: job.id,
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || user.email || 'Anonymous',
        coverLetter: coverLetter.trim() || undefined,
        status: 'pending'
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header success-header">
            <div className="success-icon">✅</div>
            <h2>Application Submitted!</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body success-body">
            <div className="success-message">
              <h3>Application Submitted Successfully</h3>
              <p>Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been submitted.</p>
              <div className="success-details">
                <div className="detail-item">
                  <span className="detail-label">Position:</span>
                  <span className="detail-value">{job.title}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Company:</span>
                  <span className="detail-value">{job.company}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">Pending Review</span>
                </div>
              </div>
              <p className="success-note">
                <strong>Next Steps:</strong> The employer will review your application and contact you if you're selected for an interview.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content apply-job-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Apply for {job.title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="job-summary">
            <h3>{job.title}</h3>
            <p className="company-name">{job.company}</p>
            <p className="location">
              {job.location}
              {job.remote && <span className="remote-badge">Remote</span>}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="apply-form">
            {error && (
              <div className="error-message" style={{ 
                background: '#f8d7da', 
                color: '#721c24', 
                padding: '0.75rem', 
                borderRadius: '4px', 
                marginBottom: '1rem',
                border: '1px solid #f5c6cb'
              }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="coverLetter">Cover Letter (Optional)</label>
              <textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the employer why you're interested in this position and why you'd be a great fit..."
                rows={5}
                maxLength={1000}
              />
              <small>{coverLetter.length}/1000 characters</small>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyJobModal;
