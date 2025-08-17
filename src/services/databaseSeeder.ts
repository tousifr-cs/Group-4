import { addJob, checkJobsExist } from './firestore';

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
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'DevOps Engineer', 'Data Engineer', 'Machine Learning Engineer', 'AI Engineer',
    'Mobile Developer', 'Game Developer', 'UX Designer', 'UI Designer', 'Product Designer',
    'Product Manager', 'Project Manager', 'Data Scientist', 'Data Analyst', 'Marketing Manager'
  ];

  const experienceLevels = ['entry', 'mid', 'senior', 'lead', 'executive'];
  const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];

  const skills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'AWS', 'Docker', 'MongoDB',
    'Machine Learning', 'Data Analysis', 'UI/UX Design', 'Product Management'
  ];

  const benefits = [
    'Health insurance', '401k matching', 'Stock options', 'Flexible PTO', 'Remote work',
    'Professional development', 'Gym membership', 'Free lunch'
  ];

  const sampleJobs = [];

  for (let i = 0; i < 25; i++) { // Generate 25 jobs for initial seeding
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

    const jobSkills = [...skills].sort(() => 0.5 - Math.random()).slice(0, 3);
    const jobBenefits = [...benefits].sort(() => 0.5 - Math.random()).slice(0, 4);

    const job = {
      title: title,
      company: company,
      location: location,
      description: `We are seeking a talented ${title} to join our dynamic team at ${company}. This is an exciting opportunity to work on cutting-edge projects and grow your career in a collaborative environment.`,
      requirements: jobSkills,
      responsibilities: [
        'Collaborate with cross-functional teams',
        'Develop high-quality solutions',
        'Participate in code reviews'
      ],
      jobType: jobType as 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance',
      experienceLevel: experienceLevel as 'entry' | 'mid' | 'senior' | 'lead' | 'executive',
      salaryRange: { min: minSalary, max: maxSalary, currency: 'USD' },
      remote: remote,
      benefits: jobBenefits,
      contactEmail: `careers@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      tags: [experienceLevel, jobType, remote ? 'Remote' : 'On-site', ...jobSkills.slice(0, 2)],
      isActive: true
    };

    sampleJobs.push(job);
  }

  return sampleJobs;
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
        
        // Small delay to avoid overwhelming Firestore
        await new Promise(resolve => setTimeout(resolve, 100));
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

// Make available in browser console
(window as any).seedDatabase = seedDatabase;
