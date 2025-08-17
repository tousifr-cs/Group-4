import React, { useState, useEffect } from 'react';
import { Job } from '../types/job';
import { getJobs, checkJobsExist, saveJob, unsaveJob, checkIfJobSaved } from '../services/firestore';
import { autoSeedDatabase } from '../utils/sampleData';
import { useAuth } from '../contexts/AuthContext';
import ApplyJobModal from './ApplyJobModal';
import './JobListings.css';

interface JobListingsProps {
  searchQuery: string;
  location: string;
  filters: {
    jobType: string;
    experienceLevel: string;
    salaryRange: string;
    remote: boolean;
  };
}

const JobListings: React.FC<JobListingsProps> = ({ searchQuery, location, filters }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadJobs = async () => {
      try {
        console.log('🚀 Loading jobs from Firestore...');
        setLoading(true);
        setError(null);

        // First, check if jobs exist
        const { exists, count } = await checkJobsExist();
        console.log(`Database status: ${exists ? 'Has jobs' : 'Empty'}, Count: ${count}`);

        if (!exists) {
          console.log('🌱 No jobs found, seeding database...');
          setError('No jobs found. Seeding database with sample jobs...');
          
          try {
            const seedResult = await autoSeedDatabase();
            if (seedResult.success) {
              console.log('✅ Database seeded successfully, loading jobs...');
              // Now load the jobs
              const fetchedJobs = await getJobs();
              console.log(`📊 Loaded ${fetchedJobs.length} jobs after seeding`);
              await updateJobsWithSavedStatus(fetchedJobs);
              setError(null);
            } else {
              console.log('❌ Seeding failed');
              setError('Failed to seed database. Please try manually.');
            }
          } catch (seedError) {
            console.error('❌ Auto-seeding failed:', seedError);
            setError('Failed to seed database. Please try manually.');
          }
        } else {
          console.log('📋 Loading existing jobs...');
          const fetchedJobs = await getJobs();
          console.log(`📊 Loaded ${fetchedJobs.length} existing jobs`);
          await updateJobsWithSavedStatus(fetchedJobs);
        }
      } catch (error) {
        console.error('❌ Error loading jobs:', error);
        setError('Failed to load jobs. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [user]);

  // Update jobs with saved status
  const updateJobsWithSavedStatus = async (jobsList: Job[]) => {
    if (!user) {
      setJobs(jobsList);
      return;
    }

    try {
      const updatedJobs = await Promise.all(
        jobsList.map(async (job) => {
          const isSaved = await checkIfJobSaved(job.id, user.uid);
          return { ...job, isSaved };
        })
      );
      setJobs(updatedJobs);
    } catch (error) {
      console.error('Error updating jobs with saved status:', error);
      setJobs(jobsList);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Refreshing jobs...');
      
      const fetchedJobs = await getJobs();
      console.log(`📊 Refreshed: ${fetchedJobs.length} jobs`);
      await updateJobsWithSavedStatus(fetchedJobs);
    } catch (error) {
      console.error('❌ Error refreshing jobs:', error);
      setError('Failed to refresh jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    try {
      setError('Seeding database...');
      console.log('🌱 Manually seeding database...');
      
      const result = await autoSeedDatabase();
      if (result.success) {
        console.log('✅ Database seeded successfully');
        // Refresh jobs after seeding
        await handleRefresh();
      } else {
        const errorMessage = 'error' in result ? result.error : 'Unknown error';
        setError(`Seeding failed: ${errorMessage}`);
      }
    } catch (err) {
      console.error('❌ Manual seeding failed:', err);
      setError('Seeding failed. Please try again.');
    }
  };

  const handleApplyClick = (job: Job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleCloseModal = () => {
    setShowApplyModal(false);
    setSelectedJob(null);
  };

  const handleSaveJob = async (job: Job) => {
    if (!user) {
      setError('You must be logged in to save jobs.');
      return;
    }

    try {
      const isSaved = await checkIfJobSaved(job.id, user.uid);
      if (isSaved) {
        await unsaveJob(job.id, user.uid);
        console.log('Job unsaved:', job.id);
      } else {
        await saveJob({
          jobId: job.id,
          userId: user.uid,
          userEmail: user.email || ''
        });
        console.log('Job saved:', job.id);
      }
      
      // Refresh the job's saved status in the UI
      setJobs(prevJobs => 
        prevJobs.map(j => 
          j.id === job.id 
            ? { ...j, isSaved: !isSaved }
            : j
        )
      );
    } catch (err) {
      console.error('Error saving job:', err);
      setError('Failed to save job. Please try again.');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requirements.some(req => req.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLocation = location === '' || 
      job.location.toLowerCase().includes(location.toLowerCase());

    const matchesJobType = filters.jobType === '' || 
      job.jobType === filters.jobType;

    const matchesExperience = filters.experienceLevel === '' || 
      job.experienceLevel === filters.experienceLevel;

    const matchesRemote = !filters.remote || job.remote;

    return matchesSearch && matchesLocation && matchesJobType && matchesExperience && matchesRemote;
  });

  if (loading) {
    return (
      <div className="job-listings">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading jobs...</p>
          <small>This may take a moment if this is your first time loading jobs.</small>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-listings">
        <div className="error-container">
          <h3>⚠️ {error}</h3>
          {/* The original code had a section for jobsExist, but it's removed.
              If the intent was to show a message if no jobs were found after seeding,
              this section needs to be re-evaluated based on the new logic.
              For now, I'm removing the jobsExist check as it's no longer relevant
              to the simplified loading logic. */}
          <div className="error-help">
            <p><strong>To get started:</strong></p>
            <ol>
              <li>Click the "Auto-Seed Database" button below, OR</li>
              <li>Open your browser's Developer Tools (F12)</li>
              <li>Go to the Console tab</li>
              <li>Run: <code>autoSeedDatabase()</code> or <code>addSampleJobs()</code></li>
              <li>Wait for the jobs to be added</li>
              <li>Refresh this page</li>
            </ol>
            <button 
              className="btn btn-primary"
              onClick={handleSeedDatabase}
            >
              �� Auto-Seed Database
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleRefresh}
              style={{ marginLeft: '10px' }}
            >
              🔄 Refresh Jobs
            </button>
            <p><em>Note: Make sure you've updated your Firestore security rules to allow read/write access.</em></p>
          </div>
        </div>
      </div>
    );
  }

  if (filteredJobs.length === 0) {
    return (
      <div className="job-listings">
        <div className="no-jobs">
          <h3>No jobs match your criteria</h3>
          <p>Try adjusting your search criteria or filters.</p>
          <div className="job-stats">
            <p><strong>Total jobs available:</strong> {jobs.length}</p>
            <p><strong>Jobs after filtering:</strong> {filteredJobs.length}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="job-listings">
      <div className="jobs-header">
        <h2>Available Jobs ({filteredJobs.length})</h2>
        <small>Showing {filteredJobs.length} of {jobs.length} total jobs</small>
      </div>
      
      <div className="job-listings">
        {filteredJobs.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-header">
              <div>
                <h3 className="job-title">{job.title}</h3>
                <p className="job-company">{job.company}</p>
                <p className="job-location">
                  {job.location}
                  {job.remote && <span className="remote-badge">Remote</span>}
                </p>
              </div>
            </div>

            <p className="job-description">{job.description}</p>

            <div className="job-tags">
              {job.tags.slice(0, 5).map((tag, index) => (
                <span key={index} className="job-tag">
                  {tag}
                </span>
              ))}
            </div>

            <div className="job-meta">
              <div className="job-details">
                <span className="job-detail job-type">{job.jobType}</span>
                <span className="job-detail experience-level">{job.experienceLevel}</span>
              </div>

              <div className="job-actions">
                <button 
                  className={`save-btn ${job.isSaved ? 'saved' : ''}`}
                  onClick={() => handleSaveJob(job)}
                  title={job.isSaved ? 'Unsave Job' : 'Save Job'}
                >
                  {job.isSaved ? '💾' : '🔖'}
                </button>
                <button 
                  className="apply-btn"
                  onClick={() => handleApplyClick(job)}
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

             {showApplyModal && selectedJob && (
         <ApplyJobModal
           job={selectedJob}
           onClose={handleCloseModal}
           onSuccess={() => {
             console.log('Application submitted successfully');
           }}
         />
       )}
    </div>
  );
};

export default JobListings;
