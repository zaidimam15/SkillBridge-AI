require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Skill = require('../models/Skill');
const CareerRole = require('../models/CareerRole');
const LearningResource = require('../models/LearningResource');
const CapstoneProject = require('../models/CapstoneProject');
const Job = require('../models/Job');
const UserProgress = require('../models/UserProgress');

const connectDB = require('../config/database');

const skillsData = [
  { canonical: 'JavaScript', aliases: ['js', 'javascript', 'es6'], category: 'programming_language', marketDemand: 'very_high', difficulty: 'intermediate', estimatedLearningHours: 80 },
  { canonical: 'TypeScript', aliases: ['ts', 'typescript'], category: 'programming_language', marketDemand: 'very_high', difficulty: 'intermediate', estimatedLearningHours: 40 },
  { canonical: 'Python', aliases: ['py', 'python3'], category: 'programming_language', marketDemand: 'very_high', difficulty: 'beginner', estimatedLearningHours: 60 },
  { canonical: 'Java', aliases: ['java'], category: 'programming_language', marketDemand: 'high', difficulty: 'intermediate', estimatedLearningHours: 100 },
  { canonical: 'React', aliases: ['reactjs', 'react js', 'react.js'], category: 'framework', marketDemand: 'very_high', difficulty: 'intermediate', estimatedLearningHours: 50 },
  { canonical: 'Node.js', aliases: ['node', 'nodejs', 'node js'], category: 'framework', marketDemand: 'high', difficulty: 'intermediate', estimatedLearningHours: 40 },
  { canonical: 'MongoDB', aliases: ['mongo', 'mongodb'], category: 'database', marketDemand: 'high', difficulty: 'beginner', estimatedLearningHours: 20 },
  { canonical: 'PostgreSQL', aliases: ['postgres', 'postgresql'], category: 'database', marketDemand: 'high', difficulty: 'intermediate', estimatedLearningHours: 30 },
  { canonical: 'Docker', aliases: ['docker'], category: 'devops', marketDemand: 'very_high', difficulty: 'intermediate', estimatedLearningHours: 25 },
  { canonical: 'AWS', aliases: ['aws', 'amazon web services'], category: 'cloud', marketDemand: 'very_high', difficulty: 'advanced', estimatedLearningHours: 80 },
  { canonical: 'Git', aliases: ['git'], category: 'tool', marketDemand: 'very_high', difficulty: 'beginner', estimatedLearningHours: 10 },
  { canonical: 'REST API', aliases: ['rest', 'restful', 'rest api', 'restful api'], category: 'methodology', marketDemand: 'very_high', difficulty: 'intermediate', estimatedLearningHours: 15 },
  { canonical: 'SQL', aliases: ['sql'], category: 'database', marketDemand: 'very_high', difficulty: 'beginner', estimatedLearningHours: 30 },
  { canonical: 'Machine Learning', aliases: ['ml', 'machine learning'], category: 'other', marketDemand: 'very_high', difficulty: 'advanced', estimatedLearningHours: 120 },
  { canonical: 'Data Structures & Algorithms', aliases: ['dsa', 'data structures'], category: 'other', marketDemand: 'very_high', difficulty: 'advanced', estimatedLearningHours: 100 },
  { canonical: 'Kubernetes', aliases: ['k8s', 'kubernetes'], category: 'devops', marketDemand: 'high', difficulty: 'advanced', estimatedLearningHours: 50 },
  { canonical: 'CI/CD', aliases: ['cicd', 'ci/cd', 'github actions'], category: 'devops', marketDemand: 'high', difficulty: 'intermediate', estimatedLearningHours: 20 },
  { canonical: 'Express.js', aliases: ['express', 'expressjs'], category: 'framework', marketDemand: 'high', difficulty: 'beginner', estimatedLearningHours: 15 },
  { canonical: 'Vue.js', aliases: ['vue', 'vuejs'], category: 'framework', marketDemand: 'medium', difficulty: 'intermediate', estimatedLearningHours: 40 },
  { canonical: 'Django', aliases: ['django'], category: 'framework', marketDemand: 'high', difficulty: 'intermediate', estimatedLearningHours: 50 },
  { canonical: 'HTML', aliases: ['html', 'html5'], category: 'other', marketDemand: 'very_high', difficulty: 'beginner', estimatedLearningHours: 20 },
  { canonical: 'CSS', aliases: ['css', 'css3'], category: 'other', marketDemand: 'very_high', difficulty: 'beginner', estimatedLearningHours: 30 },
  { canonical: 'Tailwind CSS', aliases: ['tailwind', 'tailwindcss'], category: 'framework', marketDemand: 'high', difficulty: 'beginner', estimatedLearningHours: 10 },
  { canonical: 'scikit-learn', aliases: ['sklearn', 'scikit learn'], category: 'library', marketDemand: 'high', difficulty: 'intermediate', estimatedLearningHours: 40 },
  { canonical: 'pandas', aliases: ['pandas'], category: 'library', marketDemand: 'high', difficulty: 'beginner', estimatedLearningHours: 25 },
  { canonical: 'Redis', aliases: ['redis'], category: 'database', marketDemand: 'high', difficulty: 'intermediate', estimatedLearningHours: 15 },
  { canonical: 'Spring Boot', aliases: ['spring', 'spring boot', 'springboot'], category: 'framework', marketDemand: 'high', difficulty: 'advanced', estimatedLearningHours: 60 },
  { canonical: 'Next.js', aliases: ['nextjs', 'next js', 'next.js'], category: 'framework', marketDemand: 'high', difficulty: 'intermediate', estimatedLearningHours: 30 },
  { canonical: 'GraphQL', aliases: ['graphql'], category: 'methodology', marketDemand: 'medium', difficulty: 'intermediate', estimatedLearningHours: 20 },
  { canonical: 'Unit Testing', aliases: ['unit testing', 'jest', 'testing'], category: 'methodology', marketDemand: 'high', difficulty: 'intermediate', estimatedLearningHours: 20 },
  { canonical: 'System Design', aliases: ['system design'], category: 'other', marketDemand: 'very_high', difficulty: 'advanced', estimatedLearningHours: 80 },
  { canonical: 'Agile', aliases: ['agile', 'scrum'], category: 'methodology', marketDemand: 'high', difficulty: 'beginner', estimatedLearningHours: 10 },
];

const careerRolesData = [
  {
    title: 'Full Stack Developer', slug: 'full-stack-developer',
    description: 'Develops both frontend and backend of web applications.',
    category: 'development', icon: 'Layers', color: '#6366f1',
    marketDemand: 'very_high',
    salaryRange: { min: 500000, max: 1800000, currency: 'INR', source: 'Seed Data — Not real-time' },
    coreSkills: [
      { skill: 'JavaScript', weight: 2.0, importance: 'must-have' },
      { skill: 'React', weight: 2.0, importance: 'must-have' },
      { skill: 'Node.js', weight: 2.0, importance: 'must-have' },
      { skill: 'Express.js', weight: 1.5, importance: 'must-have' },
      { skill: 'MongoDB', weight: 1.5, importance: 'must-have' },
      { skill: 'REST API', weight: 2.0, importance: 'must-have' },
      { skill: 'Git', weight: 1.5, importance: 'must-have' },
      { skill: 'HTML', weight: 1.0, importance: 'must-have' },
      { skill: 'CSS', weight: 1.0, importance: 'must-have' },
      { skill: 'SQL', weight: 1.0, importance: 'preferred' },
    ],
  },
  {
    title: 'Frontend Developer', slug: 'frontend-developer',
    description: 'Specializes in building user-facing web applications.',
    category: 'development', icon: 'Monitor', color: '#3b82f6',
    marketDemand: 'very_high',
    salaryRange: { min: 400000, max: 1500000, currency: 'INR', source: 'Seed Data — Not real-time' },
    coreSkills: [
      { skill: 'JavaScript', weight: 2.5, importance: 'must-have' },
      { skill: 'React', weight: 2.5, importance: 'must-have' },
      { skill: 'HTML', weight: 2.0, importance: 'must-have' },
      { skill: 'CSS', weight: 2.0, importance: 'must-have' },
      { skill: 'TypeScript', weight: 1.5, importance: 'preferred' },
      { skill: 'Git', weight: 1.5, importance: 'must-have' },
      { skill: 'REST API', weight: 1.5, importance: 'must-have' },
      { skill: 'Tailwind CSS', weight: 1.0, importance: 'preferred' },
    ],
  },
  {
    title: 'Backend Developer', slug: 'backend-developer',
    description: 'Builds server-side logic, APIs, and databases.',
    category: 'development', icon: 'Server', color: '#10b981',
    marketDemand: 'very_high',
    salaryRange: { min: 450000, max: 1600000, currency: 'INR', source: 'Seed Data — Not real-time' },
    coreSkills: [
      { skill: 'Node.js', weight: 2.0, importance: 'must-have' },
      { skill: 'Express.js', weight: 2.0, importance: 'must-have' },
      { skill: 'REST API', weight: 2.5, importance: 'must-have' },
      { skill: 'SQL', weight: 2.0, importance: 'must-have' },
      { skill: 'MongoDB', weight: 1.5, importance: 'preferred' },
      { skill: 'PostgreSQL', weight: 1.5, importance: 'preferred' },
      { skill: 'Git', weight: 1.5, importance: 'must-have' },
      { skill: 'Docker', weight: 1.5, importance: 'preferred' },
      { skill: 'Unit Testing', weight: 1.5, importance: 'preferred' },
    ],
  },
  {
    title: 'Data Scientist', slug: 'data-scientist',
    description: 'Applies statistical and ML techniques to extract insights from data.',
    category: 'data', icon: 'TrendingUp', color: '#f59e0b',
    marketDemand: 'very_high',
    salaryRange: { min: 600000, max: 2000000, currency: 'INR', source: 'Seed Data — Not real-time' },
    coreSkills: [
      { skill: 'Python', weight: 2.5, importance: 'must-have' },
      { skill: 'Machine Learning', weight: 2.5, importance: 'must-have' },
      { skill: 'scikit-learn', weight: 2.0, importance: 'must-have' },
      { skill: 'pandas', weight: 2.0, importance: 'must-have' },
      { skill: 'SQL', weight: 2.0, importance: 'must-have' },
      { skill: 'Data Structures & Algorithms', weight: 1.5, importance: 'preferred' },
    ],
  },
  {
    title: 'DevOps Engineer', slug: 'devops-engineer',
    description: 'Manages CI/CD pipelines, infrastructure, and deployment.',
    category: 'devops', icon: 'Cpu', color: '#ef4444',
    marketDemand: 'very_high',
    salaryRange: { min: 700000, max: 2200000, currency: 'INR', source: 'Seed Data — Not real-time' },
    coreSkills: [
      { skill: 'Docker', weight: 2.5, importance: 'must-have' },
      { skill: 'Kubernetes', weight: 2.5, importance: 'must-have' },
      { skill: 'CI/CD', weight: 2.5, importance: 'must-have' },
      { skill: 'AWS', weight: 2.0, importance: 'must-have' },
      { skill: 'Linux', weight: 2.0, importance: 'must-have' },
      { skill: 'Git', weight: 1.5, importance: 'must-have' },
    ],
  },
  {
    title: 'Machine Learning Engineer', slug: 'ml-engineer',
    description: 'Designs, builds, and deploys ML models in production.',
    category: 'data', icon: 'Brain', color: '#8b5cf6',
    marketDemand: 'very_high',
    salaryRange: { min: 800000, max: 2500000, currency: 'INR', source: 'Seed Data — Not real-time' },
    coreSkills: [
      { skill: 'Python', weight: 2.5, importance: 'must-have' },
      { skill: 'Machine Learning', weight: 2.5, importance: 'must-have' },
      { skill: 'scikit-learn', weight: 2.0, importance: 'must-have' },
      { skill: 'Docker', weight: 1.5, importance: 'preferred' },
      { skill: 'REST API', weight: 1.5, importance: 'preferred' },
      { skill: 'SQL', weight: 1.5, importance: 'preferred' },
    ],
  },
  {
    title: 'Cloud Engineer', slug: 'cloud-engineer',
    description: 'Designs and manages cloud infrastructure and services.',
    category: 'devops', icon: 'Cloud', color: '#06b6d4',
    marketDemand: 'very_high',
    salaryRange: { min: 700000, max: 2000000, currency: 'INR', source: 'Seed Data — Not real-time' },
    coreSkills: [
      { skill: 'AWS', weight: 2.5, importance: 'must-have' },
      { skill: 'Docker', weight: 2.0, importance: 'must-have' },
      { skill: 'Kubernetes', weight: 2.0, importance: 'must-have' },
      { skill: 'CI/CD', weight: 1.5, importance: 'must-have' },
    ],
  },
  {
    title: 'Data Analyst', slug: 'data-analyst',
    description: 'Analyzes and visualizes data to derive business insights.',
    category: 'data', icon: 'BarChart2', color: '#f97316',
    marketDemand: 'high',
    salaryRange: { min: 400000, max: 1200000, currency: 'INR', source: 'Seed Data — Not real-time' },
    coreSkills: [
      { skill: 'SQL', weight: 2.5, importance: 'must-have' },
      { skill: 'Python', weight: 2.0, importance: 'must-have' },
      { skill: 'pandas', weight: 2.0, importance: 'must-have' },
      { skill: 'Excel', weight: 1.5, importance: 'preferred' },
    ],
  },
];

const resourcesData = [
  { title: 'The Complete JavaScript Course 2024', provider: 'Udemy', skill: 'JavaScript', level: 'beginner', type: 'course', url: 'https://www.udemy.com', estimatedHours: 69, isFree: false, rating: 4.7 },
  { title: 'React - The Complete Guide', provider: 'Udemy', skill: 'React', level: 'intermediate', type: 'course', url: 'https://www.udemy.com', estimatedHours: 48, isFree: false, rating: 4.7 },
  { title: 'Python for Everybody Specialization', provider: 'Coursera', skill: 'Python', level: 'beginner', type: 'course', url: 'https://www.coursera.org', estimatedHours: 40, isFree: false, rating: 4.8 },
  { title: 'Docker Getting Started', provider: 'Docker Docs', skill: 'Docker', level: 'beginner', type: 'documentation', url: 'https://docs.docker.com/get-started/', estimatedHours: 8, isFree: true, rating: 4.5 },
  { title: 'AWS Cloud Practitioner Essentials', provider: 'AWS Training', skill: 'AWS', level: 'beginner', type: 'course', url: 'https://aws.amazon.com/training', estimatedHours: 15, isFree: true, rating: 4.6 },
  { title: 'Node.js Official Documentation', provider: 'Node.js', skill: 'Node.js', level: 'intermediate', type: 'documentation', url: 'https://nodejs.org/en/docs/', estimatedHours: 10, isFree: true, rating: 4.4 },
  { title: 'MongoDB University Free Courses', provider: 'MongoDB', skill: 'MongoDB', level: 'beginner', type: 'course', url: 'https://university.mongodb.com/', estimatedHours: 20, isFree: true, rating: 4.5 },
  { title: 'Kubernetes Tutorial for Beginners', provider: 'TechWorld with Nana (YouTube)', skill: 'Kubernetes', level: 'beginner', type: 'video', url: 'https://www.youtube.com', estimatedHours: 4, isFree: true, rating: 4.8 },
  { title: 'SQL Tutorial - Full Database Course', provider: 'freeCodeCamp (YouTube)', skill: 'SQL', level: 'beginner', type: 'video', url: 'https://www.youtube.com', estimatedHours: 4, isFree: true, rating: 4.7 },
  { title: 'Machine Learning Course', provider: 'Andrew Ng / Coursera', skill: 'Machine Learning', level: 'intermediate', type: 'course', url: 'https://www.coursera.org', estimatedHours: 60, isFree: false, rating: 4.9 },
  { title: 'TypeScript Handbook', provider: 'TypeScript Official', skill: 'TypeScript', level: 'intermediate', type: 'documentation', url: 'https://www.typescriptlang.org/docs/', estimatedHours: 12, isFree: true, rating: 4.6 },
  { title: 'GitHub Actions Documentation', provider: 'GitHub', skill: 'CI/CD', level: 'intermediate', type: 'documentation', url: 'https://docs.github.com/en/actions', estimatedHours: 8, isFree: true, rating: 4.5 },
  { title: 'Django for Beginners', provider: 'William S. Vincent', skill: 'Django', level: 'beginner', type: 'book', url: 'https://djangoforbeginners.com/', estimatedHours: 20, isFree: false, rating: 4.6 },
  { title: 'REST API Design Best Practices', provider: 'freeCodeCamp', skill: 'REST API', level: 'intermediate', type: 'article', url: 'https://www.freecodecamp.org', estimatedHours: 3, isFree: true, rating: 4.4 },
  { title: 'Data Structures and Algorithms Specialization', provider: 'UC San Diego / Coursera', skill: 'Data Structures & Algorithms', level: 'advanced', type: 'course', url: 'https://www.coursera.org', estimatedHours: 80, isFree: false, rating: 4.7 },
];

const capstoneProjectsData = [
  {
    title: 'Full Stack E-Commerce Application',
    description: 'Build a complete e-commerce platform with user authentication, product catalog, cart, and payment integration.',
    difficulty: 'intermediate', primarySkill: 'React',
    targetSkills: ['React', 'Node.js', 'MongoDB', 'REST API', 'Express.js'],
    technologies: ['React', 'Node.js', 'Express.js', 'MongoDB', 'JWT', 'Stripe'],
    estimatedHours: 40, category: 'fullstack',
    objectives: ['Implement user authentication with JWT', 'Build product CRUD operations', 'Create shopping cart with state management', 'Integrate payment gateway'],
    requiredFeatures: ['User registration/login', 'Product listing and filtering', 'Shopping cart', 'Order management', 'Admin dashboard'],
    apiEndpoints: ['GET /products', 'POST /auth/login', 'POST /cart/add', 'POST /orders'],
    learningOutcomes: ['React state management', 'REST API design', 'MongoDB schema design', 'Authentication implementation'],
  },
  {
    title: 'Docker-Containerized Node.js Microservice',
    description: 'Build and containerize a Node.js REST API with Docker, including Docker Compose for multi-container setup.',
    difficulty: 'intermediate', primarySkill: 'Docker',
    targetSkills: ['Docker', 'Node.js', 'REST API', 'CI/CD'],
    technologies: ['Docker', 'Node.js', 'Express.js', 'PostgreSQL', 'Docker Compose'],
    estimatedHours: 16, category: 'devops',
    objectives: ['Write a Dockerfile for Node.js app', 'Set up Docker Compose with database', 'Configure environment variables', 'Add health checks'],
    requiredFeatures: ['Dockerfile', 'docker-compose.yml', 'Multi-stage build', 'Volume mounting', 'Networking between containers'],
    learningOutcomes: ['Container concepts', 'Dockerfile best practices', 'Docker Compose', 'Production containerization'],
  },
  {
    title: 'Machine Learning Salary Predictor',
    description: 'Build an ML model to predict tech salaries based on experience, skills, and location using scikit-learn.',
    difficulty: 'intermediate', primarySkill: 'Machine Learning',
    targetSkills: ['Machine Learning', 'Python', 'scikit-learn', 'pandas', 'REST API'],
    technologies: ['Python', 'scikit-learn', 'pandas', 'Flask', 'NumPy'],
    estimatedHours: 30, category: 'ml',
    objectives: ['Clean and preprocess dataset', 'Train multiple ML models', 'Evaluate and select best model', 'Deploy as REST API'],
    requiredFeatures: ['Data preprocessing pipeline', 'Feature engineering', 'Model training and evaluation', 'Flask API endpoint', 'Prediction endpoint'],
    learningOutcomes: ['ML pipeline', 'Model evaluation metrics', 'Feature importance', 'Model deployment'],
  },
  {
    title: 'REST API with Node.js and PostgreSQL',
    description: 'Design and build a production-ready REST API following best practices including authentication, validation, and testing.',
    difficulty: 'beginner', primarySkill: 'REST API',
    targetSkills: ['REST API', 'Node.js', 'SQL', 'PostgreSQL', 'Unit Testing'],
    technologies: ['Node.js', 'Express.js', 'PostgreSQL', 'JWT', 'Jest'],
    estimatedHours: 20, category: 'api',
    objectives: ['Design RESTful endpoints', 'Implement CRUD operations', 'Add JWT authentication', 'Write unit tests'],
    requiredFeatures: ['CRUD endpoints', 'Input validation', 'Error handling', 'Authentication middleware', 'Pagination'],
    learningOutcomes: ['REST API design principles', 'SQL schema design', 'Middleware pattern', 'Testing REST APIs'],
  },
  {
    title: 'Data Analysis Dashboard with Python',
    description: 'Analyze a real-world dataset using Pandas and create an interactive dashboard with visualizations.',
    difficulty: 'beginner', primarySkill: 'pandas',
    targetSkills: ['Python', 'pandas', 'SQL', 'Data Analysis'],
    technologies: ['Python', 'Pandas', 'Matplotlib', 'Seaborn', 'Flask'],
    estimatedHours: 18, category: 'data',
    objectives: ['Load and clean dataset', 'Perform exploratory data analysis', 'Create visualizations', 'Build simple dashboard'],
    requiredFeatures: ['Data cleaning pipeline', 'Statistical analysis', 'Charts and graphs', 'Insight report'],
    learningOutcomes: ['Pandas data manipulation', 'EDA techniques', 'Data visualization', 'Python data ecosystem'],
  },
  {
    title: 'CI/CD Pipeline with GitHub Actions',
    description: 'Set up a complete CI/CD pipeline for a Node.js application with automated testing, linting, and deployment.',
    difficulty: 'advanced', primarySkill: 'CI/CD',
    targetSkills: ['CI/CD', 'Docker', 'Git', 'Unit Testing', 'AWS'],
    technologies: ['GitHub Actions', 'Docker', 'Node.js', 'Jest', 'AWS EC2'],
    estimatedHours: 12, category: 'devops',
    objectives: ['Create GitHub Actions workflow', 'Add automated testing stage', 'Build and push Docker image', 'Deploy to staging'],
    requiredFeatures: ['Lint and format check', 'Automated tests on PR', 'Docker build and push', 'Deployment workflow', 'Slack/email notification'],
    learningOutcomes: ['CI/CD concepts', 'GitHub Actions YAML syntax', 'Docker registry', 'Automated deployment'],
  },
];

const jobsData = [
  {
    title: 'Full Stack Developer',
    company: 'TechCorp India',
    location: 'Bangalore, India',
    jobType: 'full-time',
    experience: { min: 0, max: 2 },
    description: `We are looking for a talented Full Stack Developer to join our team.

Requirements:
- Strong proficiency in JavaScript and TypeScript
- Experience with React.js for frontend development
- Experience with Node.js and Express.js for backend
- Knowledge of MongoDB or PostgreSQL
- Familiarity with REST API development
- Experience with Git version control
- Understanding of HTML, CSS, Tailwind CSS

Preferred:
- Experience with Docker and CI/CD pipelines
- Knowledge of AWS or GCP
- Experience with unit testing (Jest)

Responsibilities:
- Develop and maintain full-stack web applications
- Collaborate with design team on UI/UX implementation
- Write clean, maintainable code with tests
- Participate in code reviews`,
    status: 'active',
  },
  {
    title: 'Backend Developer (Node.js)',
    company: 'StartupXYZ',
    location: 'Remote',
    jobType: 'full-time',
    experience: { min: 1, max: 3 },
    description: `Join our backend team to build scalable microservices.

Requirements:
- Proficiency in Node.js and Express.js
- Strong knowledge of REST API design
- Experience with PostgreSQL or MySQL
- Familiarity with Docker
- Knowledge of JWT authentication
- Git proficiency

Preferred:
- Experience with AWS services (EC2, S3, Lambda)
- Knowledge of Redis for caching
- CI/CD experience
- Unit testing with Jest or Mocha`,
    status: 'active',
  },
  {
    title: 'Data Scientist - ML Engineer',
    company: 'DataDriven Solutions',
    location: 'Hyderabad, India',
    jobType: 'full-time',
    experience: { min: 0, max: 2 },
    description: `We need a passionate Data Scientist to work on ML projects.

Requirements:
- Strong Python programming skills
- Experience with Machine Learning (scikit-learn, pandas, NumPy)
- Knowledge of SQL for data querying
- Familiarity with Jupyter Notebooks
- Basic statistics and probability

Preferred:
- Experience with TensorFlow or PyTorch
- Data visualization skills (Matplotlib, Seaborn)
- REST API development for model deployment
- Docker for ML model containerization`,
    status: 'active',
  },
  {
    title: 'DevOps Engineer',
    company: 'CloudFirst Tech',
    location: 'Pune, India',
    jobType: 'full-time',
    experience: { min: 1, max: 4 },
    description: `Looking for a DevOps Engineer to strengthen our infrastructure team.

Requirements:
- Strong experience with Docker and Kubernetes
- Hands-on CI/CD pipeline setup (Jenkins, GitHub Actions)
- Cloud experience with AWS (EC2, S3, EKS, Lambda)
- Linux administration
- Git and version control

Preferred:
- Terraform for infrastructure as code
- Ansible for configuration management
- Monitoring tools (Prometheus, Grafana)
- Security best practices`,
    status: 'active',
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting database seed...');

    // Clear existing data (demo data)
    await Promise.all([
      Skill.deleteMany({}),
      CareerRole.deleteMany({}),
      LearningResource.deleteMany({}),
      CapstoneProject.deleteMany({}),
    ]);

    // Create skills
    await Skill.insertMany(skillsData);
    console.log(`✅ ${skillsData.length} skills seeded`);

    // Create career roles
    await CareerRole.insertMany(careerRolesData);
    console.log(`✅ ${careerRolesData.length} career roles seeded`);

    // Create learning resources
    await LearningResource.insertMany(resourcesData);
    console.log(`✅ ${resourcesData.length} learning resources seeded`);

    // Create capstone projects
    await CapstoneProject.insertMany(capstoneProjectsData);
    console.log(`✅ ${capstoneProjectsData.length} capstone projects seeded`);

    // Create demo users
    const adminExists = await User.findOne({ email: 'admin@skillbridge.ai' });
    if (!adminExists) {
      const superAdmin = await User.create({
        name: 'SkillBridge Admin',
        email: 'admin@skillbridge.ai',
        password: 'Admin@123',
        role: 'super_admin',
        isVerified: true,
        adminProfile: { institution: 'SkillBridge AI', designation: 'Super Admin' },
      });

      const tpAdmin = await User.create({
        name: 'T&P Coordinator',
        email: 'tp@skillbridge.ai',
        password: 'TnP@123',
        role: 'tp_admin',
        isVerified: true,
        adminProfile: { institution: 'Demo College', department: 'Training & Placement', designation: 'T&P Officer' },
      });

      const recruiter = await User.create({
        name: 'HR Manager',
        email: 'recruiter@techcorp.ai',
        password: 'Recruiter@123',
        role: 'recruiter',
        isVerified: true,
        recruiterProfile: { company: 'TechCorp India', designation: 'HR Manager', industry: 'Software' },
      });

      const student = await User.create({
        name: 'Arjun Sharma',
        email: 'student@demo.com',
        password: 'Student@123',
        role: 'student',
        isVerified: true,
        studentProfile: {
          college: 'Demo Engineering College',
          department: 'Computer Science',
          batch: '2024',
          degree: 'B.Tech',
          phone: '+91 9876543210',
          skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python', 'Git', 'HTML', 'CSS'],
          careerInterests: ['Full Stack Developer', 'Backend Developer'],
          github: 'https://github.com/arjun-demo',
          linkedin: 'https://linkedin.com/in/arjun-demo',
        },
      });

      await UserProgress.create({ user: student._id });

      // Create demo jobs (attached to recruiter)
      for (const jobData of jobsData) {
        const jdRes = { parsedRequirements: { normalizedSkills: [], allSkills: [] } };
        await Job.create({
          ...jobData,
          createdBy: recruiter._id,
          parsedRequirements: jdRes.parsedRequirements,
        });
      }

      console.log('✅ Demo users created:');
      console.log('   Super Admin: admin@skillbridge.ai / Admin@123');
      console.log('   T&P Admin:   tp@skillbridge.ai / TnP@123');
      console.log('   Recruiter:   recruiter@techcorp.ai / Recruiter@123');
      console.log('   Student:     student@demo.com / Student@123');
      console.log(`✅ ${jobsData.length} demo jobs created`);
    } else {
      console.log('ℹ️  Demo users already exist, skipping user creation');
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('📌 Note: All data is clearly marked as demo/seed data.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
