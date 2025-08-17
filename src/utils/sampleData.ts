import { addJob } from '../services/firestore';
import { checkJobsExist } from '../services/firestore';

// Generate 100 diverse sample jobs
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

  for (let i = 0; i < 100; i++) {
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

export const addSampleJobs = async () => {
  const sampleJobs = generateSampleJobs();
  console.log(`Adding ${sampleJobs.length} sample jobs to Firestore...`);
  
  try {
    for (let i = 0; i < sampleJobs.length; i++) {
      const job = sampleJobs[i];
      await addJob(job);
      console.log(`[${i + 1}/100] Added: ${job.title} at ${job.company} - $${job.salaryRange.min.toLocaleString()}-${job.salaryRange.max.toLocaleString()}`);
      
      // Add a small delay to avoid overwhelming Firestore
      if (i < sampleJobs.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    console.log('✅ All 100 sample jobs added successfully!');
    return { success: true, count: sampleJobs.length };
  } catch (error) {
    console.error('❌ Error adding sample jobs:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Function to add jobs in batches (useful for large datasets)
export const addSampleJobsInBatches = async (batchSize: number = 10) => {
  const sampleJobs = generateSampleJobs();
  console.log(`Adding ${sampleJobs.length} sample jobs in batches of ${batchSize}...`);
  
  try {
    for (let i = 0; i < sampleJobs.length; i += batchSize) {
      const batch = sampleJobs.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(sampleJobs.length / batchSize)}...`);
      
      for (const job of batch) {
        await addJob(job);
        console.log(`Added: ${job.title} at ${job.company}`);
      }
      
      // Wait between batches
      if (i + batchSize < sampleJobs.length) {
        console.log('Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('✅ All sample jobs added successfully in batches!');
    return { success: true, count: sampleJobs.length };
  } catch (error) {
    console.error('❌ Error adding sample jobs in batches:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Function to add just a few jobs for testing
export const addTestJobs = async (count: number = 5) => {
  const sampleJobs = generateSampleJobs().slice(0, count);
  console.log(`Adding ${count} test jobs to Firestore...`);
  
  try {
    for (const job of sampleJobs) {
      await addJob(job);
      console.log(`Added: ${job.title} at ${job.company}`);
    }
    console.log(`✅ ${count} test jobs added successfully!`);
    return { success: true, count: sampleJobs.length };
  } catch (error) {
    console.error('❌ Error adding test jobs:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Function to automatically seed database if empty
export const autoSeedDatabase = async () => {
  try {
    console.log('🌱 Auto-seeding database...');
    
    // Check if jobs exist first
    const { exists, count } = await checkJobsExist();
    
    if (exists && count > 0) {
      console.log(`✅ Database already has ${count} jobs`);
      return { success: true, message: `Database already has ${count} jobs` };
    }
    
    console.log('📝 Database is empty, adding sample jobs...');
    const result = await addSampleJobs();
    
    if (result.success) {
      console.log('🎉 Database seeded successfully!');
      return { success: true, message: 'Database seeded with sample jobs' };
    } else {
      console.error('❌ Failed to seed database');
      return result;
    }
  } catch (error) {
    console.error('❌ Error in auto-seeding:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Make functions available in browser console
(window as any).addSampleJobs = addSampleJobs;
(window as any).addSampleJobsInBatches = addSampleJobsInBatches;
(window as any).addTestJobs = addTestJobs;
(window as any).autoSeedDatabase = autoSeedDatabase;
