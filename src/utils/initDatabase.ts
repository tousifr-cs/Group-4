import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp,
  getDocs,
  query,
  where,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';

// User Profile Schema
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
  createdAt: any;
  updatedAt: any;
}

// Job Application Schema
interface JobApplication {
  id?: string;
  jobId: string;
  userId: string;
  userEmail: string;
  userName: string;
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: any;
  updatedAt: any;
}

// Saved Job Schema
interface SavedJob {
  id?: string;
  jobId: string;
  userId: string;
  userEmail: string;
  savedAt: any;
}

// Sample user profiles
const sampleUsers: UserProfile[] = [
  {
    id: 'user1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    location: 'San Francisco, CA',
    bio: 'Experienced software engineer with 5+ years in web development',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
    experience: 'Senior Software Engineer at TechCorp (3 years), Full Stack Developer at StartupXYZ (2 years)',
    education: 'BS Computer Science, Stanford University',
    resumeUrl: 'https://example.com/resumes/john-doe.pdf',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: 'user2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-0456',
    location: 'New York, NY',
    bio: 'UX Designer passionate about creating user-centered digital experiences',
    skills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
    experience: 'Senior UX Designer at DesignStudio (4 years), UX Designer at CreativeAgency (2 years)',
    education: 'MS Human-Computer Interaction, NYU',
    resumeUrl: 'https://example.com/resumes/jane-smith.pdf',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: 'user3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@example.com',
    phone: '+1-555-0789',
    location: 'Austin, TX',
    bio: 'Data Scientist specializing in machine learning and analytics',
    skills: ['Python', 'R', 'TensorFlow', 'SQL', 'Machine Learning', 'Data Visualization'],
    experience: 'Data Scientist at DataCorp (3 years), Research Assistant at University (2 years)',
    education: 'PhD Statistics, University of Texas',
    resumeUrl: 'https://example.com/resumes/mike-johnson.pdf',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

// Sample job applications
const sampleApplications: Omit<JobApplication, 'id' | 'appliedAt' | 'updatedAt'>[] = [
  {
    jobId: 'job1',
    userId: 'user1',
    userEmail: 'john.doe@example.com',
    userName: 'John Doe',
    coverLetter: 'I am excited to apply for this position. With my 5+ years of experience in web development, I believe I can contribute significantly to your team.',
    status: 'pending'
  },
  {
    jobId: 'job2',
    userId: 'user1',
    userEmail: 'john.doe@example.com',
    userName: 'John Doe',
    coverLetter: 'This role aligns perfectly with my career goals. I have extensive experience with the technologies mentioned in the job description.',
    status: 'reviewed'
  },
  {
    jobId: 'job3',
    userId: 'user2',
    userEmail: 'jane.smith@example.com',
    userName: 'Jane Smith',
    coverLetter: 'As a UX designer with 6+ years of experience, I am passionate about creating intuitive and engaging user experiences.',
    status: 'accepted'
  },
  {
    jobId: 'job4',
    userId: 'user3',
    userEmail: 'mike.johnson@example.com',
    userName: 'Mike Johnson',
    coverLetter: 'My background in data science and machine learning makes me an ideal candidate for this position.',
    status: 'pending'
  }
];

// Sample saved jobs
const sampleSavedJobs: Omit<SavedJob, 'id' | 'savedAt'>[] = [
  {
    jobId: 'job1',
    userId: 'user1',
    userEmail: 'john.doe@example.com'
  },
  {
    jobId: 'job2',
    userId: 'user1',
    userEmail: 'john.doe@example.com'
  },
  {
    jobId: 'job3',
    userId: 'user2',
    userEmail: 'jane.smith@example.com'
  },
  {
    jobId: 'job5',
    userId: 'user3',
    userEmail: 'mike.johnson@example.com'
  }
];

// Get actual job IDs from the existing jobs collection
const getActualJobIds = async (): Promise<string[]> => {
  try {
    const jobsSnapshot = await getDocs(collection(db, 'jobs'));
    const jobIds = jobsSnapshot.docs.map(doc => doc.id);
    console.log('📋 Found actual job IDs:', jobIds);
    return jobIds;
  } catch (error) {
    console.error('❌ Error getting job IDs:', error);
    return [];
  }
};

// Initialize the database with all collections and sample data
export const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing Firestore database...');
    
    // Get actual job IDs first
    const actualJobIds = await getActualJobIds();
    if (actualJobIds.length === 0) {
      throw new Error('No jobs found in the jobs collection. Please add some jobs first.');
    }
    
    // 1. Create Users Collection
    console.log('👥 Creating users collection...');
    for (const user of sampleUsers) {
      const userDoc = doc(db, 'users', user.id);
      await setDoc(userDoc, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        skills: user.skills,
        experience: user.experience,
        education: user.education,
        resumeUrl: user.resumeUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Created user: ${user.firstName} ${user.lastName}`);
    }
    
    // 2. Create Applications Collection with actual job IDs
    console.log('📝 Creating applications collection...');
    const applicationsToCreate = sampleApplications.map((app, index) => ({
      ...app,
      jobId: actualJobIds[index % actualJobIds.length] // Use actual job IDs
    }));
    
    for (const app of applicationsToCreate) {
      await addDoc(collection(db, 'applications'), {
        ...app,
        appliedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log(`✅ Created ${applicationsToCreate.length} applications with actual job IDs`);
    
    // 3. Create Saved Jobs Collection with actual job IDs
    console.log('🔖 Creating saved jobs collection...');
    const savedJobsToCreate = sampleSavedJobs.map((savedJob, index) => ({
      ...savedJob,
      jobId: actualJobIds[index % actualJobIds.length] // Use actual job IDs
    }));
    
    for (const savedJob of savedJobsToCreate) {
      await addDoc(collection(db, 'savedJobs'), {
        ...savedJob,
        savedAt: serverTimestamp()
      });
    }
    console.log(`✅ Created ${savedJobsToCreate.length} saved jobs with actual job IDs`);
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('📊 Collections created:');
    console.log('   - users: User profiles with personal details');
    console.log('   - applications: Job applications with status tracking');
    console.log('   - savedJobs: Saved jobs for users');
    console.log('   - jobs: Job postings (already existed)');
    console.log(`📋 Used ${actualJobIds.length} actual job IDs from your jobs collection`);
    
    return { success: true, message: 'Database initialized successfully' };
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Check if collections exist
export const checkCollectionsExist = async () => {
  try {
    console.log('🔍 Checking if collections exist...');
    
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const applicationsSnapshot = await getDocs(collection(db, 'applications'));
    const savedJobsSnapshot = await getDocs(collection(db, 'savedJobs'));
    
    const result = {
      users: usersSnapshot.size > 0,
      applications: applicationsSnapshot.size > 0,
      savedJobs: savedJobsSnapshot.size > 0
    };
    
    console.log('📊 Collection status:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error checking collections:', error);
    return { users: false, applications: false, savedJobs: false };
  }
};

// Get sample data for display
export const getSampleData = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const applicationsSnapshot = await getDocs(collection(db, 'applications'));
    const savedJobsSnapshot = await getDocs(collection(db, 'savedJobs'));
    
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const applications = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const savedJobs = savedJobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return { users, applications, savedJobs };
  } catch (error) {
    console.error('❌ Error getting sample data:', error);
    return { users: [], applications: [], savedJobs: [] };
  }
};
