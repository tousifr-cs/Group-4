import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addJob } from '../services/firestore';
import './PostJobModal.css';

interface PostJobModalProps {
  onClose: () => void;
}

const PostJobModal: React.FC<PostJobModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    responsibilities: '',
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: { min: '', max: '', currency: 'USD' },
    remote: false,
    benefits: '',
    contactEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'salaryMin' || name === 'salaryMax') {
      setFormData(prev => ({
        ...prev,
        salaryRange: {
          ...prev.salaryRange,
          [name === 'salaryMin' ? 'min' : 'max']: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to post a job');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        description: formData.description,
        requirements: formData.requirements.split(',').map(req => req.trim()).filter(req => req),
        responsibilities: formData.responsibilities.split(',').map(resp => resp.trim()).filter(resp => resp),
        jobType: formData.jobType as 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance',
        experienceLevel: formData.experienceLevel as 'entry' | 'mid' | 'senior' | 'lead' | 'executive',
        salaryRange: {
          min: parseInt(formData.salaryRange.min),
          max: parseInt(formData.salaryRange.max),
          currency: formData.salaryRange.currency
        },
        remote: formData.remote,
        benefits: formData.benefits.split(',').map(benefit => benefit.trim()).filter(benefit => benefit),
        contactEmail: formData.contactEmail,
        tags: [
          formData.experienceLevel,
          formData.jobType,
          formData.remote ? 'Remote' : 'On-site'
        ],
        isActive: true
      };

      await addJob(jobData);
      setSuccess(true);
      
      // Trigger a page refresh to show the new job at the top
      setTimeout(() => {
        window.location.reload();
      }, 3000); // Give user 3 seconds to see the success message
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Authentication Required</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <p>You must be logged in to post a job.</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header success-header">
            <div className="success-icon">✅</div>
            <h2>Job Posted Successfully!</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body success-body">
            <div className="success-message">
              <h3>🎉 Congratulations!</h3>
              <p>Your job posting has been successfully added to the job board.</p>
              <div className="success-details">
                <div className="detail-item">
                  <span className="detail-label">Job Title:</span>
                  <span className="detail-value">{formData.title}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Company:</span>
                  <span className="detail-value">{formData.company}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{formData.location}</span>
                </div>
              </div>
              <p className="success-note">
                <strong>Note:</strong> Your job will appear at the top of the job listings and is now visible to all job seekers.
              </p>
            </div>
            <div className="success-actions">
              <button 
                className="btn btn-primary"
                onClick={onClose}
              >
                View Job Listings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content post-job-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Post a New Job</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="post-job-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Job Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="company">Company *</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
                placeholder="e.g., TechCorp Inc."
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                placeholder="e.g., San Francisco, CA"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="contactEmail">Contact Email *</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                required
                placeholder="careers@company.com"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Job Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="requirements">Requirements (comma-separated) *</label>
              <input
                type="text"
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                required
                placeholder="e.g., React, Node.js, 5+ years experience"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="responsibilities">Responsibilities (comma-separated) *</label>
              <input
                type="text"
                id="responsibilities"
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleInputChange}
                required
                placeholder="e.g., Code reviews, mentoring, architecture"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="jobType">Job Type *</label>
              <select
                id="jobType"
                name="jobType"
                value={formData.jobType}
                onChange={handleInputChange}
                required
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="experienceLevel">Experience Level *</label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                required
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salaryMin">Salary Range (Min) *</label>
              <input
                type="number"
                id="salaryMin"
                name="salaryMin"
                value={formData.salaryRange.min}
                onChange={handleInputChange}
                required
                placeholder="50000"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="salaryMax">Salary Range (Max) *</label>
              <input
                type="number"
                id="salaryMax"
                name="salaryMax"
                value={formData.salaryRange.max}
                onChange={handleInputChange}
                required
                placeholder="100000"
                min="0"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="benefits">Benefits (comma-separated)</label>
            <input
              type="text"
              id="benefits"
              name="benefits"
              value={formData.benefits}
              onChange={handleInputChange}
              placeholder="e.g., Health insurance, 401k, Flexible PTO"
            />
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="remote"
                checked={formData.remote}
                onChange={handleInputChange}
              />
              Remote-friendly position
            </label>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Posting Job...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJobModal;
