import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserProfile, 
  updateUserProfile, 
  createUserProfile,
  getUserApplications, 
  getUserSavedJobs,
  getJobById,
  initializeCollections,
  createSampleApplication,
  createSampleSavedJob
} from '../services/firestore';
import { JobApplication, SavedJob } from '../types/job';
import './Profile.css';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills: string[];
  experience?: string;
  education?: string;
  resumeUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'applications' | 'saved'>('profile');
  const [profileData, setProfileData] = useState<UserProfile>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: [],
    experience: '',
    education: '',
    resumeUrl: ''
  });
  const [applications, setApplications] = useState<(JobApplication & { job?: any })[]>([]);
  const [savedJobs, setSavedJobs] = useState<(SavedJob & { job?: any })[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user && !profileLoaded) {
      loadUserProfile();
      initializeCollections(); // Initialize collections when profile loads
    }
  }, [user, profileLoaded]);

  // Load data when switching tabs
  useEffect(() => {
    if (user && profileLoaded) {
      if (activeTab === 'applications') {
        loadApplications();
      } else if (activeTab === 'saved') {
        loadSavedJobs();
      }
    }
  }, [activeTab, user, profileLoaded]);

  // Load initial data when profile is loaded
  useEffect(() => {
    if (user && profileLoaded) {
      // Load both applications and saved jobs initially
      loadApplications();
      loadSavedJobs();
    }
  }, [user, profileLoaded]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      console.log('👤 Loading user profile for:', user.uid);
      let profile = await getUserProfile(user.uid);
      
      if (!profile) {
        // Create new profile if none exists
        console.log('👤 No profile found, creating new one...');
        const newProfileData = {
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          phone: '',
          location: '',
          bio: '',
          skills: [],
          experience: '',
          education: '',
          resumeUrl: ''
        };
        
        try {
          await createUserProfile(user.uid, newProfileData);
          console.log('✅ New profile created successfully');
          profile = await getUserProfile(user.uid);
        } catch (createError) {
          console.error('❌ Error creating profile:', createError);
          setMessage({ type: 'error', text: 'Failed to create profile. Please try again.' });
          return;
        }
      }
      
      if (profile) {
        setProfileData({
          id: profile.id || user.uid,
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || user.email || '',
          phone: profile.phone || '',
          location: profile.location || '',
          bio: profile.bio || '',
          skills: profile.skills || [],
          experience: profile.experience || '',
          education: profile.education || '',
          resumeUrl: profile.resumeUrl || '',
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt
        });
        console.log('✅ Profile loaded:', profile);
        setMessage({ type: 'success', text: 'Profile loaded successfully!' });
      }
      setProfileLoaded(true);
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    }
  };

  const loadApplications = async () => {
    if (!user) return;
    
    console.log('🔄 Loading applications for user:', user.uid);
    setLoadingData(true);
    try {
      const userApplications = await getUserApplications(user.uid);
      console.log('📋 Raw applications from Firestore:', userApplications);
      
      if (userApplications.length === 0) {
        console.log('📋 No applications found for user');
        setApplications([]);
        setLoadingData(false);
        return;
      }
      
      // Fetch job details for each application
      const applicationsWithJobs = await Promise.all(
        userApplications.map(async (app) => {
          try {
            console.log(`🔍 Looking for job with ID: ${app.jobId}`);
            const job = await getJobById(app.jobId);
            console.log(`Job found for ${app.jobId}:`, job ? job.title : 'Not found');
            return { 
              ...app, 
              id: app.id || 'unknown',
              job: job
            };
          } catch (error) {
            console.error(`Error fetching job details for ${app.jobId}:`, error);
            return { 
              ...app, 
              id: app.id || 'unknown',
              job: undefined 
            };
          }
        })
      );
      
      console.log('✅ Final applications with job details:', applicationsWithJobs);
      setApplications(applicationsWithJobs);
    } catch (error) {
      console.error('❌ Error loading applications:', error);
      setMessage({ type: 'error', text: 'Failed to load applications: ' + error });
    } finally {
      setLoadingData(false);
    }
  };

  const loadSavedJobs = async () => {
    if (!user) return;
    
    console.log('🔄 Loading saved jobs for user:', user.uid);
    setLoadingData(true);
    try {
      const userSavedJobs = await getUserSavedJobs(user.uid);
      console.log('🔖 Raw saved jobs from Firestore:', userSavedJobs);
      
      if (userSavedJobs.length === 0) {
        console.log('🔖 No saved jobs found for user');
        setSavedJobs([]);
        setLoadingData(false);
        return;
      }
      
      // Fetch job details for each saved job
      const savedJobsWithDetails = await Promise.all(
        userSavedJobs.map(async (savedJob) => {
          try {
            console.log(`🔍 Looking for saved job with ID: ${savedJob.jobId}`);
            const job = await getJobById(savedJob.jobId);
            console.log(`Job found for ${savedJob.jobId}:`, job ? job.title : 'Not found');
            return { 
              ...savedJob, 
              id: savedJob.id || 'unknown',
              job: job
            };
          } catch (error) {
            console.error(`Error fetching job details for ${savedJob.jobId}:`, error);
            return { 
              ...savedJob, 
              id: savedJob.id || 'unknown',
              job: undefined 
            };
          }
        })
      );
      
      console.log('✅ Final saved jobs with details:', savedJobsWithDetails);
      setSavedJobs(savedJobsWithDetails);
    } catch (error) {
      console.error('❌ Error loading saved jobs:', error);
      setMessage({ type: 'error', text: 'Failed to load saved jobs: ' + error });
    } finally {
      setLoadingData(false);
    }
  };

  const handleRefreshData = async () => {
    if (activeTab === 'applications') {
      await loadApplications();
    } else if (activeTab === 'saved') {
      await loadSavedJobs();
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setMessage(null);

    try {
      console.log('💾 Saving profile for user:', user.uid);
      console.log('📝 Profile data to save:', profileData);
      
      // Update the user profile in Firestore
      await updateUserProfile(user.uid, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        location: profileData.location,
        bio: profileData.bio,
        skills: profileData.skills,
        experience: profileData.experience,
        education: profileData.education,
        resumeUrl: profileData.resumeUrl
      });
      
      console.log('✅ Profile updated successfully in Firestore');
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
      
      // Reload the profile to show updated data
      await loadUserProfile();
      
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setProfileData(prev => ({
      ...prev,
      skills
    }));
  };

  const triggerFileUpload = () => {
    // This function needs to be implemented to handle file uploads to Firebase Storage
    console.log('File upload functionality not fully implemented yet.');
    alert('File upload functionality not fully implemented yet.');
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    // This function needs to be implemented to handle actual file uploads to Firebase Storage
    console.log('Placeholder: Uploading CV to Firebase Storage');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload
    
    // Update profile with CV URL (placeholder for now)
    const cvUrl = `https://example.com/cv/${user.uid}/${file.name}`;
    setProfileData(prev => ({ ...prev, resumeUrl: cvUrl }));
    
    setMessage({ type: 'success', text: 'CV uploaded successfully!' });
  };

  const removeCv = () => {
    setProfileData(prev => ({ ...prev, resumeUrl: '' }));
    setMessage({ type: 'success', text: 'CV removed successfully!' });
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <h1>Please sign in to view your profile</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
          </div>
          <div className="profile-info">
            <h1>{user.displayName || 'Your Profile'}</h1>
            <p className="profile-email">{user.email}</p>
            {editing && (
              <div style={{ 
                background: '#fff3cd', 
                color: '#856404', 
                padding: '0.5rem', 
                borderRadius: '4px', 
                marginBottom: '1rem',
                border: '1px solid #ffeaa7'
              }}>
                ✏️ <strong>Editing Mode Active</strong> - You can now edit your profile
              </div>
            )}
            {!editing && (
              <button
                className="btn btn-primary"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            📝 Profile
          </button>
          <button
            className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            📋 Applications ({applications.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            🔖 Saved Jobs ({savedJobs.length})
          </button>
        </div>
        
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'profile' && (
            <>
              {/* Profile Sections */}
              <div className="profile-sections">
                {/* Personal Information */}
                <div className="profile-section">
                  <h2>Personal Information</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                        disabled={!editing}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleInputChange}
                        disabled={!editing}
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileData.email}
                        disabled={true}
                        placeholder="Your email address"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        disabled={!editing}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="location">Location</label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={profileData.location}
                        onChange={handleInputChange}
                        disabled={!editing}
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="profile-section">
                  <h2>Bio</h2>
                  <div className="form-group">
                    <label htmlFor="bio">About Me</label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      disabled={!editing}
                      placeholder="Tell us about yourself, your career goals, and what you're looking for..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="profile-section">
                  <h2>Skills</h2>
                  <div className="form-group">
                    <label htmlFor="skills">Skills (comma-separated)</label>
                    <input
                      type="text"
                      id="skills"
                      name="skills"
                      value={profileData.skills.join(', ')}
                      onChange={handleSkillsChange}
                      disabled={!editing}
                      placeholder="e.g., JavaScript, React, Python, Project Management"
                    />
                    <small className="form-hint">Separate skills with commas</small>
                  </div>
                </div>

                {/* Experience */}
                <div className="profile-section">
                  <h2>Experience</h2>
                  <div className="form-group">
                    <label htmlFor="experience">Work Experience</label>
                    <textarea
                      id="experience"
                      name="experience"
                      value={profileData.experience}
                      onChange={handleInputChange}
                      disabled={!editing}
                      placeholder="Describe your work experience, roles, and achievements..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Education */}
                <div className="profile-section">
                  <h2>Education</h2>
                  <div className="form-group">
                    <label htmlFor="education">Education & Certifications</label>
                    <textarea
                      id="education"
                      name="education"
                      value={profileData.education}
                      onChange={handleInputChange}
                      disabled={!editing}
                      placeholder="List your education, degrees, and certifications..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* CV Upload */}
                <div className="profile-section">
                  <h2>Resume/CV</h2>
                  <div className="cv-upload-section">
                    {profileData.resumeUrl ? (
                      <div className="cv-info">
                        <div className="cv-file">
                          <svg className="cv-icon" viewBox="0 0 24 24">
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" fill="currentColor"/>
                          </svg>
                          <span>CV uploaded</span>
                        </div>
                        <div className="cv-actions">
                          <button className="btn btn-secondary" onClick={triggerFileUpload}>
                            Replace CV
                          </button>
                          <button className="btn btn-danger" onClick={removeCv}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="cv-upload-area" onClick={triggerFileUpload}>
                        <svg className="upload-icon" viewBox="0 0 24 24">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                        </svg>
                        <p>Click to upload your CV</p>
                        <small>PDF, DOC, or DOCX (max 5MB)</small>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCvUpload}
                      style={{ display: 'none' }}
                    />
                    
                    {loading && (
                      <div className="upload-progress">
                        <div className="loading-spinner"></div>
                        <span>Uploading CV...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {editing && (
                <div className="profile-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setEditing(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>📋 My Applications</h2>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleRefreshData}
                  disabled={loadingData}
                >
                  {loadingData ? '🔄 Loading...' : '🔄 Refresh'}
                </button>
              </div>
              
              {loadingData ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't applied to any jobs yet.</p>
                  <p>Start browsing jobs and apply to positions that interest you!</p>
                </div>
              ) : (
                <div className="applications-list">
                  {applications.map((app) => (
                    <div key={app.id} className="application-card">
                      <div className="application-header">
                        <h3>{app.job?.title || `Application for Job ${app.jobId}`}</h3>
                        <span className={`status-badge ${app.status}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                      <div className="application-details">
                        <p><strong>Company:</strong> {app.job?.company || 'Company information not available'}</p>
                        <p><strong>Location:</strong> {app.job?.location || 'Location information not available'}</p>
                        <p><strong>Applied:</strong> {app.appliedAt?.toDate?.()?.toLocaleDateString() || 'Date not available'}</p>
                        <p><strong>Job ID:</strong> {app.jobId}</p>
                        {app.coverLetter && (
                          <p><strong>Cover Letter:</strong> {app.coverLetter}</p>
                        )}
                        {!app.job && (
                          <p className="warning-text">⚠️ Job details not found. The job may have been removed.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Jobs Tab */}
          {activeTab === 'saved' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>🔖 My Saved Jobs</h2>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleRefreshData}
                  disabled={loadingData}
                >
                  {loadingData ? '🔄 Loading...' : '🔄 Refresh'}
                </button>
              </div>
              
              {loadingData ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading saved jobs...</p>
                </div>
              ) : savedJobs.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't saved any jobs yet.</p>
                  <p>Click the bookmark icon on any job to save it for later!</p>
                </div>
              ) : (
                <div className="saved-jobs-list">
                  {savedJobs.map((savedJob) => (
                    <div key={savedJob.id} className="saved-job-card">
                      <div className="saved-job-header">
                        <h3>{savedJob.job?.title || `Saved Job ${savedJob.jobId}`}</h3>
                        <span className="saved-date">
                          Saved: {savedJob.savedAt?.toDate?.()?.toLocaleDateString() || 'Date not available'}
                        </span>
                      </div>
                      <div className="saved-job-details">
                        <p><strong>Company:</strong> {savedJob.job?.company || 'Company information not available'}</p>
                        <p><strong>Location:</strong> {savedJob.job?.location || 'Location information not available'}</p>
                        <p><strong>Job Type:</strong> {savedJob.job?.jobType || 'Type information not available'}</p>
                        <p><strong>Experience Level:</strong> {savedJob.job?.experienceLevel || 'Level information not available'}</p>
                        <p><strong>Job ID:</strong> {savedJob.jobId}</p>
                        {savedJob.job?.description && (
                          <p className="job-description">{savedJob.job.description}</p>
                        )}
                        {!savedJob.job && (
                          <p className="warning-text">⚠️ Job details not found. The job may have been removed.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
