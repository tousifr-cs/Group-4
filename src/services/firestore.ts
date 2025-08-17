import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
  setDoc,
  getDoc
} from "firebase/firestore";
import { db } from '../firebase';
import { Job } from '../types/job';

// Debug function to test Firestore connection
export const testFirestoreConnection = async () => {
  try {
    console.log('🔍 Testing Firestore connection...');
    console.log('Database instance:', db);
    
    const testCollection = collection(db, "test");
    console.log('Test collection reference created:', testCollection);
    
    return { success: true, message: 'Firestore connection successful' };
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Jobs Collection
export const addJob = async (jobData: Omit<Job, 'id' | 'postedDate'>) => {
  try {
    console.log('📝 Adding job to Firestore:', jobData.title);
    const docRef = await addDoc(collection(db, "jobs"), {
      ...jobData,
      postedDate: serverTimestamp(),
      isActive: true
    });
    console.log("✅ Job added with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("❌ Error adding job: ", e);
    throw e;
  }
};

// Get all jobs (for JobListings component)
export const getJobs = async (): Promise<Job[]> => {
  try {
    console.log('📋 Fetching jobs from Firestore...');
    const jobsCollection = collection(db, "jobs");
    console.log('Jobs collection reference:', jobsCollection);
    
    // Simplified query without orderBy to avoid index requirement
    const q = query(jobsCollection, where("isActive", "==", true));
    console.log('Query created:', q);
    
    const jobSnapshot = await getDocs(q);
    console.log(`📊 Query returned ${jobSnapshot.size} documents`);
    
    const jobList = jobSnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Document data:', { id: doc.id, ...data });
      return { id: doc.id, ...data } as Job;
    });
    
    // Sort jobs by postedDate in JavaScript (newest first)
    jobList.sort((a, b) => {
      let dateA: Date;
      let dateB: Date;
      
      // Handle Firestore timestamp or regular Date
      if (a.postedDate && typeof a.postedDate === 'object' && 'toDate' in a.postedDate) {
        dateA = (a.postedDate as any).toDate();
      } else {
        dateA = new Date(a.postedDate || 0);
      }
      
      if (b.postedDate && typeof b.postedDate === 'object' && 'toDate' in b.postedDate) {
        dateB = (b.postedDate as any).toDate();
      } else {
        dateB = new Date(b.postedDate || 0);
      }
      
      return dateB.getTime() - dateA.getTime(); // Descending order
    });
    
    console.log(`✅ Successfully processed ${jobList.length} jobs`);
    return jobList;
  } catch (e) {
    console.error("❌ Error getting jobs: ", e);
    throw e;
  }
};

// Get a specific job by ID
export const getJobById = async (jobId: string): Promise<Job | null> => {
  try {
    console.log('🔍 Firestore: Getting job by ID:', jobId);
    const jobDoc = doc(db, "jobs", jobId);
    const jobSnapshot = await getDoc(jobDoc);
    
    if (jobSnapshot.exists()) {
      const jobData = jobSnapshot.data();
      console.log('✅ Firestore: Job found:', jobData);
      return { id: jobSnapshot.id, ...jobData } as Job;
    } else {
      console.log('❌ Firestore: Job not found');
      return null;
    }
  } catch (e) {
    console.error("❌ Firestore: Error getting job by ID: ", e);
    throw e;
  }
};

// Seed the database with initial sample jobs if it's empty
export const seedDatabase = async () => {
  try {
    console.log('🌱 Checking if database needs seeding...');
    
    // Check if jobs exist
    const { exists, count } = await checkJobsExist();
    
    if (exists && count > 0) {
      console.log(`✅ Database already has ${count} jobs, no seeding needed`);
      return { success: true, message: `Database already has ${count} jobs` };
    }
    
    console.log('📝 Database is empty, seeding with sample jobs...');
    
    // Generate and add sample jobs
    const sampleJobs = generateSampleJobs();
    let addedCount = 0;
    
    for (const job of sampleJobs) {
      try {
        await addJob(job);
        addedCount++;
        console.log(`✅ Added job ${addedCount}/${sampleJobs.length}: ${job.title}`);
      } catch (error) {
        console.error(`❌ Failed to add job ${job.title}:`, error);
      }
    }
    
    console.log(`🎉 Successfully seeded database with ${addedCount} jobs`);
    return { success: true, message: `Added ${addedCount} sample jobs` };
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Generate sample jobs for seeding
const generateSampleJobs = () => {
  const companies = [
    'TechCorp Inc.', 'Global Solutions', 'Digital Hub', 'Design Studio', 'Innovation Labs',
    'Cloud Systems', 'Data Dynamics', 'Mobile First', 'Web Solutions', 'AI Innovations',
    'Blockchain Tech', 'Cyber Security', 'Green Energy', 'Health Tech', 'FinTech Solutions',
    'E-commerce Pro', 'Gaming Studio', 'EdTech Platform', 'Marketing Hub', 'Consulting Group'
  ];

  const locations = [
    'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA',
    'Denver, CO', 'Chicago, IL', 'Los Angeles, CA', 'Miami, FL', 'Portland, OR',
    'Remote', 'London, UK', 'Toronto, Canada', 'Berlin, Germany', 'Tokyo, Japan'
  ];

  const jobTitles = [
    // Engineering
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'DevOps Engineer', 'Data Engineer', 'Machine Learning Engineer', 'AI Engineer',
    'Mobile Developer', 'Game Developer', 'Embedded Systems Engineer', 'Cloud Engineer',
    
    // Design & UX
    'UX Designer', 'UI Designer', 'Product Designer', 'Graphic Designer',
    'Visual Designer', 'Interaction Designer', 'Motion Designer', 'Brand Designer',
    
    // Product & Management
    'Product Manager', 'Project Manager', 'Program Manager', 'Scrum Master',
    'Technical Product Manager', 'Product Owner', 'Business Analyst',
    
    // Data & Analytics
    'Data Scientist', 'Data Analyst', 'Business Intelligence Analyst', 'Data Architect',
    'Machine Learning Scientist', 'Research Scientist', 'Quantitative Analyst',
    
    // Marketing & Sales
    'Digital Marketing Manager', 'Content Marketing Specialist', 'SEO Specialist',
    'Growth Marketing Manager', 'Sales Development Representative', 'Account Executive',
    
    // Operations & Support
    'Customer Success Manager', 'Technical Support Engineer', 'Operations Manager',
    'Quality Assurance Engineer', 'Test Engineer', 'Site Reliability Engineer',
    
    // Creative & Content
    'Content Creator', 'Copywriter', 'Video Editor', 'Social Media Manager',
    'Community Manager', 'Technical Writer', 'Content Strategist'
  ];

  const experienceLevels = ['entry', 'mid', 'senior', 'lead', 'executive'];
  const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];

  const skills = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
    'React', 'Vue.js', 'Angular', 'Node.js', 'Django', 'Flask', 'Spring Boot',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'GraphQL',
    'Machine Learning', 'Deep Learning', 'Computer Vision', 'NLP', 'TensorFlow',
    'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Tableau',
    'Figma', 'Sketch', 'Adobe Creative Suite', 'InVision', 'Framer',
    'Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence', 'Notion',
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'CI/CD', 'Microservices'
  ];

  const benefits = [
    'Health insurance', 'Dental insurance', 'Vision insurance', '401k matching',
    'Stock options', 'Flexible PTO', 'Remote work', 'Home office stipend',
    'Professional development', 'Conference budget', 'Gym membership',
    'Free lunch', 'Snacks', 'Coffee', 'Team events', 'Holiday parties',
    'Flexible hours', 'Unlimited vacation', 'Parental leave', 'Childcare support'
  ];

  const sampleJobs = [];

  for (let i = 0; i < 50; i++) { // Generate 50 jobs for initial seeding
    const company = companies[Math.floor(Math.random() * companies.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const experienceLevel = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
    const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
    const remote = Math.random() > 0.5;
    
    // Generate salary based on experience level
    let minSalary, maxSalary;
    switch (experienceLevel) {
      case 'entry':
        minSalary = 40000 + Math.floor(Math.random() * 20000);
        maxSalary = minSalary + 15000 + Math.floor(Math.random() * 15000);
        break;
      case 'mid':
        minSalary = 70000 + Math.floor(Math.random() * 30000);
        maxSalary = minSalary + 25000 + Math.floor(Math.random() * 25000);
        break;
      case 'senior':
        minSalary = 100000 + Math.floor(Math.random() * 50000);
        maxSalary = minSalary + 40000 + Math.floor(Math.random() * 40000);
        break;
      case 'lead':
        minSalary = 130000 + Math.floor(Math.random() * 70000);
        maxSalary = minSalary + 60000 + Math.floor(Math.random() * 60000);
        break;
      case 'executive':
        minSalary = 180000 + Math.floor(Math.random() * 100000);
        maxSalary = minSalary + 80000 + Math.floor(Math.random() * 80000);
        break;
      default:
        minSalary = 60000;
        maxSalary = 120000;
    }

    // Generate random requirements and responsibilities
    const numRequirements = 3 + Math.floor(Math.random() * 4);
    const numResponsibilities = 3 + Math.floor(Math.random() * 4);
    const numBenefits = 3 + Math.floor(Math.random() * 6);
    
    const jobSkills = [...skills].sort(() => 0.5 - Math.random()).slice(0, numRequirements);
    const jobBenefits = [...benefits].sort(() => 0.5 - Math.random()).slice(0, numBenefits);

    const job = {
      title: title,
      company: company,
      location: location,
      description: `We are seeking a talented ${title} to join our dynamic team at ${company}. This is an exciting opportunity to work on cutting-edge projects and grow your career in a collaborative environment.`,
      requirements: jobSkills,
      responsibilities: [
        'Collaborate with cross-functional teams',
        'Develop high-quality solutions',
        'Participate in code reviews',
        'Contribute to technical decisions',
        'Mentor junior team members',
        'Stay updated with industry trends'
      ].slice(0, numResponsibilities),
      jobType: jobType as 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance',
      experienceLevel: experienceLevel as 'entry' | 'mid' | 'senior' | 'lead' | 'executive',
      salaryRange: { min: minSalary, max: maxSalary, currency: 'USD' },
      remote: remote,
      benefits: jobBenefits,
      contactEmail: `careers@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      tags: [experienceLevel, jobType, remote ? 'Remote' : 'On-site', ...jobSkills.slice(0, 3)],
      isActive: true
    };

    sampleJobs.push(job);
  }

  return sampleJobs;
};

// Simple function to manually test reading jobs
export const manuallyReadJobs = async () => {
  try {
    console.log('🔍 Manually reading jobs from Firestore...');
    
    const jobsCollection = collection(db, "jobs");
    console.log('📁 Jobs collection reference:', jobsCollection);
    
    // Try to read all documents without any filters first
    const allDocsSnapshot = await getDocs(jobsCollection);
    console.log(`📊 Found ${allDocsSnapshot.size} total documents in jobs collection`);
    
    if (allDocsSnapshot.empty) {
      console.log('📭 No documents found in jobs collection');
      return { success: false, message: 'No documents found', count: 0 };
    }
    
    // Show what documents exist
    allDocsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📄 Document ${doc.id}:`, {
        title: data.title,
        company: data.company,
        isActive: data.isActive,
        postedDate: data.postedDate
      });
    });
    
    // Now try the filtered query
    const filteredQuery = query(jobsCollection, where("isActive", "==", true));
    const filteredSnapshot = await getDocs(filteredQuery);
    console.log(`✅ Filtered query returned ${filteredSnapshot.size} active jobs`);
    
    return { 
      success: true, 
      message: `Found ${filteredSnapshot.size} active jobs out of ${allDocsSnapshot.size} total`,
      count: filteredSnapshot.size,
      totalCount: allDocsSnapshot.size
    };
    
  } catch (error) {
    console.error('❌ Error manually reading jobs:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Check if there are any jobs in the database
export const checkJobsExist = async (): Promise<{ exists: boolean; count: number }> => {
  try {
    console.log('🔍 Checking if jobs exist in database...');
    const jobsCollection = collection(db, "jobs");
    console.log('Jobs collection reference:', jobsCollection);

    const q = query(jobsCollection, where("isActive", "==", true), limit(1));
    console.log('Check query created:', q);

    const jobSnapshot = await getDocs(q);
    console.log(`Check query returned ${jobSnapshot.size} documents`);

    if (jobSnapshot.empty) {
      console.log('📭 No jobs found in database');
      return { exists: false, count: 0 };
    }

    // Get total count
    const allJobsQuery = query(jobsCollection, where("isActive", "==", true));
    const allJobsSnapshot = await getDocs(allJobsQuery);
    console.log(`📊 Total jobs in database: ${allJobsSnapshot.size}`);

    return { exists: true, count: allJobsSnapshot.size };
  } catch (e) {
    console.error("❌ Error checking jobs:", e);
    return { exists: false, count: 0 };
  }
};

export const subscribeToJobs = (callback: (jobs: Job[]) => void) => {
  try {
    console.log('📡 Setting up job subscription...');

    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, "jobs"),
      where("isActive", "==", true),
      limit(50)
    );

    console.log('🔍 Query created:', q);

    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        console.log(`📊 Received ${querySnapshot.size} jobs from Firestore`);
        const jobs: Job[] = [];
        
        querySnapshot.forEach((doc) => {
          try {
            const jobData = doc.data();
            console.log('📄 Processing job document:', doc.id, jobData.title);
            
            // Ensure postedDate is properly handled
            const job = {
              id: doc.id,
              ...jobData,
              postedDate: jobData.postedDate?.toDate?.() || new Date()
            } as Job;
            jobs.push(job);
          } catch (err) {
            console.error('❌ Error processing job document:', err, doc.id);
          }
        });
        
        // Sort jobs by postedDate in JavaScript (newest first)
        jobs.sort((a, b) => {
          let dateA: Date;
          let dateB: Date;
          
          // Handle Firestore timestamp or regular Date
          if (a.postedDate && typeof a.postedDate === 'object' && 'toDate' in a.postedDate) {
            dateA = (a.postedDate as any).toDate();
          } else {
            dateA = new Date(a.postedDate || 0);
          }
          
          if (b.postedDate && typeof b.postedDate === 'object' && 'toDate' in b.postedDate) {
            dateB = (b.postedDate as any).toDate();
          } else {
            dateB = new Date(b.postedDate || 0);
          }
          
          return dateB.getTime() - dateA.getTime(); // Descending order
        });
        
        console.log(`✅ Processed ${jobs.length} jobs successfully`);
        console.log('📋 Jobs:', jobs.map(j => ({ id: j.id, title: j.title, company: j.company })));
        callback(jobs);
      },
      (error) => {
        console.error('❌ Error in job subscription:', error);
        console.log('🔄 Trying fallback method...');
        
        // Fallback: try to get jobs without real-time updates
        getJobs().then(fallbackJobs => {
          console.log(`🔄 Fallback: loaded ${fallbackJobs.length} jobs`);
          callback(fallbackJobs);
        }).catch(fallbackError => {
          console.error('❌ Fallback also failed:', fallbackError);
          callback([]); // Return empty array
        });
      }
    );

    console.log('✅ Subscription set up successfully');
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up job subscription:', error);
    console.log('🔄 Trying fallback method...');
    
    // Fallback to one-time fetch
    getJobs().then(fallbackJobs => {
      console.log(`🔄 Fallback: loaded ${fallbackJobs.length} jobs`);
      callback(fallbackJobs);
    }).catch(fallbackError => {
      console.error('❌ Fallback failed:', fallbackError);
      callback([]); // Return empty array
    });

    // Return a no-op function since subscription failed
    return () => {};
  }
};

export const updateJob = async (jobId: string, newJobData: Partial<Job>) => {
  const jobRef = doc(db, "jobs", jobId);
  try {
    await updateDoc(jobRef, {
      ...newJobData,
      updatedAt: serverTimestamp()
    });
    console.log("Job updated successfully!");
  } catch (e) {
    console.error("Error updating job: ", e);
    throw e;
  }
};

export const deleteJob = async (jobId: string) => {
  try {
    // Soft delete - mark as inactive instead of actually deleting
    await updateDoc(doc(db, "jobs", jobId), {
      isActive: false,
      deletedAt: serverTimestamp()
    });
    console.log("Job deleted successfully!");
  } catch (e) {
    console.error("Error deleting job: ", e);
    throw e;
  }
};

// User Profile Management
export const createUserProfile = async (userId: string, profileData: {
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
}) => {
  try {
    console.log('👤 Firestore: Creating user profile for:', userId);
    const userDoc = doc(db, "users", userId);
    
    await setDoc(userDoc, {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("✅ Firestore: User profile created successfully");
    return userId;
  } catch (e) {
    console.error("❌ Firestore: Error creating user profile: ", e);
    throw e;
  }
};

export const getUserProfile = async (userId: string): Promise<{
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
} | null> => {
  try {
    console.log('👤 Firestore: Getting user profile for:', userId);
    const userDoc = doc(db, "users", userId);
    const userSnapshot = await getDoc(userDoc);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      console.log('✅ Firestore: User profile found:', userData);
      return { 
        id: userSnapshot.id, 
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        location: userData.location || '',
        bio: userData.bio || '',
        skills: userData.skills || [],
        experience: userData.experience || '',
        education: userData.education || '',
        resumeUrl: userData.resumeUrl || '',
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      };
    } else {
      console.log('❌ Firestore: User profile not found');
      return null;
    }
  } catch (e) {
    console.error("❌ Firestore: Error getting user profile: ", e);
    throw e;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<{
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  bio: string;
  skills: string[];
  experience: string;
  education: string;
  resumeUrl: string;
}>) => {
  try {
    console.log('👤 Firestore: Updating user profile for:', userId);
    const userDoc = doc(db, "users", userId);
    
    await updateDoc(userDoc, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log("✅ Firestore: User profile updated successfully");
    return userId;
  } catch (e) {
    console.error("❌ Firestore: Error updating user profile: ", e);
    throw e;
  }
};

// Job Applications Collection
export interface JobApplication {
  id?: string;
  jobId: string;
  userId: string;
  userEmail: string;
  userName: string;
  coverLetter?: string;
  cvUrl?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: any;
  updatedAt: any;
}

export const applyForJob = async (applicationData: Omit<JobApplication, 'id' | 'appliedAt' | 'updatedAt'>) => {
  try {
    console.log('📝 Firestore: Submitting application:', applicationData);
    const applicationsCollection = collection(db, "applications");
    console.log('📁 Firestore: Applications collection reference:', applicationsCollection);
    
    const docRef = await addDoc(applicationsCollection, {
      ...applicationData,
      appliedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'pending' // Add status field
    });
    console.log("✅ Firestore: Application submitted with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("❌ Firestore: Error submitting application: ", e);
    throw e;
  }
};

export const getUserApplications = async (userId: string): Promise<JobApplication[]> => {
  try {
    console.log('🔍 Firestore: Getting applications for user:', userId);
    const applicationsCollection = collection(db, "applications");
    console.log('📁 Firestore: Applications collection reference:', applicationsCollection);
    
    // Remove orderBy to avoid index requirement, we'll sort in JavaScript
    const q = query(
      applicationsCollection,
      where("userId", "==", userId)
    );
    console.log('🔍 Firestore: Query created:', q);
    
    const applicationSnapshot = await getDocs(q);
    console.log('📊 Firestore: Query returned', applicationSnapshot.size, 'documents');

    const applications = applicationSnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('📄 Firestore: Application document:', { id: doc.id, ...data });
      return { id: doc.id, ...data };
    }) as JobApplication[];

    // Sort by appliedAt in JavaScript (newest first)
    applications.sort((a, b) => {
      let dateA: Date;
      let dateB: Date;
      
      // Handle Firestore timestamp or regular Date
      if (a.appliedAt && typeof a.appliedAt === 'object' && 'toDate' in a.appliedAt) {
        dateA = (a.appliedAt as any).toDate();
      } else {
        dateA = new Date(a.appliedAt || 0);
      }
      
      if (b.appliedAt && typeof b.appliedAt === 'object' && 'toDate' in b.appliedAt) {
        dateB = (b.appliedAt as any).toDate();
      } else {
        dateB = new Date(b.appliedAt || 0);
      }
      
      return dateB.getTime() - dateA.getTime(); // Descending order
    });

    console.log('✅ Firestore: Returning applications:', applications);
    return applications;
  } catch (e) {
    console.error("❌ Firestore: Error getting applications: ", e);
    throw e;
  }
};

// Saved Jobs Collection
export interface SavedJob {
  id?: string;
  jobId: string;
  userId: string;
  userEmail: string;
  savedAt: any;
}

export const saveJob = async (savedJobData: Omit<SavedJob, 'id' | 'savedAt'>) => {
  try {
    console.log('🔖 Firestore: Saving job:', savedJobData);
    const savedJobsCollection = collection(db, "savedJobs");
    console.log('📁 Firestore: Saved jobs collection reference:', savedJobsCollection);
    
    // Check if job is already saved
    const existingSave = await checkIfJobSaved(savedJobData.jobId, savedJobData.userId);
    console.log('🔍 Firestore: Job already saved?', existingSave);
    
    if (existingSave) {
      throw new Error('Job is already saved');
    }

    const docRef = await addDoc(savedJobsCollection, {
      ...savedJobData,
      savedAt: serverTimestamp()
    });
    console.log("✅ Firestore: Job saved with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("❌ Firestore: Error saving job: ", e);
    throw e;
  }
};

export const unsaveJob = async (jobId: string, userId: string) => {
  try {
    const savedJobsCollection = collection(db, "savedJobs");
    const q = query(
      savedJobsCollection,
      where("jobId", "==", jobId),
      where("userId", "==", userId)
    );
    const savedJobSnapshot = await getDocs(q);

    if (!savedJobSnapshot.empty) {
      const savedJobDoc = savedJobSnapshot.docs[0];
      await deleteDoc(doc(db, "savedJobs", savedJobDoc.id));
      console.log("Job unsaved successfully");
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error unsaving job: ", e);
    throw e;
  }
};

export const checkIfJobSaved = async (jobId: string, userId: string): Promise<boolean> => {
  try {
    const savedJobsCollection = collection(db, "savedJobs");
    const q = query(
      savedJobsCollection,
      where("jobId", "==", jobId),
      where("userId", "==", userId)
    );
    const savedJobSnapshot = await getDocs(q);
    return !savedJobSnapshot.empty;
  } catch (e) {
    console.error("Error checking if job is saved: ", e);
    return false;
  }
};

export const getUserSavedJobs = async (userId: string): Promise<SavedJob[]> => {
  try {
    console.log('🔍 Firestore: Getting saved jobs for user:', userId);
    const savedJobsCollection = collection(db, "savedJobs");
    console.log('📁 Firestore: Saved jobs collection reference:', savedJobsCollection);
    
    // Remove orderBy to avoid index requirement, we'll sort in JavaScript
    const q = query(
      savedJobsCollection,
      where("userId", "==", userId)
    );
    console.log('🔍 Firestore: Query created:', q);
    
    const savedJobSnapshot = await getDocs(q);
    console.log('📊 Firestore: Query returned', savedJobSnapshot.size, 'documents');

    const savedJobs = savedJobSnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('📄 Firestore: Saved job document:', { id: doc.id, ...data });
      return { id: doc.id, ...data };
    }) as SavedJob[];

    // Sort by savedAt in JavaScript (newest first)
    savedJobs.sort((a, b) => {
      let dateA: Date;
      let dateB: Date;
      
      // Handle Firestore timestamp or regular Date
      if (a.savedAt && typeof a.savedAt === 'object' && 'toDate' in a.savedAt) {
        dateA = (a.savedAt as any).toDate();
      } else {
        dateA = new Date(a.savedAt || 0);
      }
      
      if (b.savedAt && typeof b.savedAt === 'object' && 'toDate' in b.savedAt) {
        dateB = (b.savedAt as any).toDate();
      } else {
        dateB = new Date(b.savedAt || 0);
      }
      
      return dateB.getTime() - dateA.getTime(); // Descending order
    });

    console.log('✅ Firestore: Returning saved jobs:', savedJobs);
    return savedJobs;
  } catch (e) {
    console.error("❌ Firestore: Error getting saved jobs: ", e);
    throw e;
  }
};

// Create sample applications for testing
export const createSampleApplication = async (userId: string, jobId: string) => {
  try {
    console.log('🧪 Firestore: Creating sample application for user:', userId, 'job:', jobId);
    const applicationsCollection = collection(db, "applications");
    
    const sampleApplication = {
      jobId,
      userId,
      userEmail: 'test@example.com',
      userName: 'Test User',
      coverLetter: 'This is a sample application for testing purposes.',
      status: 'pending' as const,
      appliedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(applicationsCollection, sampleApplication);
    console.log("✅ Firestore: Sample application created with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("❌ Firestore: Error creating sample application: ", e);
    throw e;
  }
};

// Create sample saved job for testing
export const createSampleSavedJob = async (userId: string, jobId: string) => {
  try {
    console.log('🧪 Firestore: Creating sample saved job for user:', userId, 'job:', jobId);
    const savedJobsCollection = collection(db, "savedJobs");
    
    const sampleSavedJob = {
      jobId,
      userId,
      userEmail: 'test@example.com',
      savedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(savedJobsCollection, sampleSavedJob);
    console.log("✅ Firestore: Sample saved job created with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("❌ Firestore: Error creating sample saved job: ", e);
    throw e;
  }
};

// Initialize collections if they don't exist
export const initializeCollections = async () => {
  try {
    console.log('🚀 Firestore: Initializing collections...');
    
    // Create a test document in each collection to ensure they exist
    const testData = {
      test: true,
      createdAt: serverTimestamp()
    };
    
    // Initialize applications collection
    try {
      const applicationsCollection = collection(db, "applications");
      await addDoc(applicationsCollection, testData);
      console.log('✅ Firestore: Applications collection initialized');
    } catch (e) {
      console.log('ℹ️ Firestore: Applications collection already exists');
    }
    
    // Initialize savedJobs collection
    try {
      const savedJobsCollection = collection(db, "savedJobs");
      await addDoc(savedJobsCollection, testData);
      console.log('✅ Firestore: Saved jobs collection initialized');
    } catch (e) {
      console.log('ℹ️ Firestore: Saved jobs collection already exists');
    }
    
    // Initialize users collection
    try {
      const usersCollection = collection(db, "users");
      await addDoc(usersCollection, testData);
      console.log('✅ Firestore: Users collection initialized');
    } catch (e) {
      console.log('ℹ️ Firestore: Users collection already exists');
    }
    
    console.log('🎉 Firestore: All collections initialized successfully');
  } catch (e) {
    console.error("❌ Firestore: Error initializing collections: ", e);
    throw e;
  }
};
