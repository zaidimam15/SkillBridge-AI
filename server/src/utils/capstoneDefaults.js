const defaultRecommendedProjects = [
  {
    stableId: 'proj-1',
    category: 'fullstack',
    title: 'Microservices E-Commerce Platform with Docker & Redis',
    difficulty: 'Advanced',
    estimatedHours: 35,
    primarySkill: 'Docker',
    description: 'Build a production-grade microservices e-commerce system featuring containerized services, Redis caching, JWT auth, and Stripe payment webhooks.',
    skills: ['Docker', 'Node.js', 'Redis', 'React', 'MongoDB', 'Microservices'],
    targetSkills: ['Docker', 'Node.js', 'Redis', 'React', 'MongoDB', 'Microservices'],
    technologies: ['Docker', 'Node.js', 'Express.js', 'Redis', 'React', 'MongoDB', 'Stripe'],
    requiredFeatures: [
      'Multi-container Docker Compose setup',
      'Redis cache layer for inventory counts',
      'Stripe checkout integration and webhooks',
      'Decoupled Auth, Product, and Order microservices'
    ],
    features: [
      'Multi-container Docker Compose setup',
      'Redis cache layer for inventory counts',
      'Stripe checkout integration'
    ],
    objectives: [
      'Design modular microservice architecture with API Gateway routing',
      'Implement distributed caching for sub-10ms inventory lookups',
      'Deploy containerized services using Docker Compose with health checks',
      'Secure internal and external endpoints using JWT and rate limiters'
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Architecture Blueprint & Container Setup',
        description: 'Configure multi-container Docker Compose with isolated networks for services, Redis, and MongoDB.'
      },
      {
        id: 'm2',
        title: 'Authentication Service & JWT Security',
        description: 'Implement token issuance, refresh tokens, role-based access control, and route guards.'
      },
      {
        id: 'm3',
        title: 'Product Catalog & Redis Caching Layer',
        description: 'Build product CRUD endpoints with cache-aside pattern and TTL invalidation for rapid access.'
      },
      {
        id: 'm4',
        title: 'Order Processing & Stripe Payment Gateway',
        description: 'Handle cart checkout, stock verification, idempotency keys, and asynchronous payment webhooks.'
      },
      {
        id: 'm5',
        title: 'Integration Testing & Deployment Verification',
        description: 'Verify cross-service communication, error recovery, and end-to-end integration workflows.'
      }
    ]
  },
  {
    stableId: 'proj-2',
    category: 'ai-ml',
    title: 'Automated Resume Parser & ATS Screener Engine',
    difficulty: 'Intermediate',
    estimatedHours: 25,
    primarySkill: 'Python',
    description: 'Implement a Python NLP engine using spaCy and TF-IDF cosine similarity to score resumes against job requirements.',
    skills: ['Python', 'NLP', 'TF-IDF', 'spaCy', 'FastAPI'],
    targetSkills: ['Python', 'NLP', 'TF-IDF', 'spaCy', 'FastAPI'],
    technologies: ['Python', 'FastAPI', 'spaCy', 'scikit-learn', 'TF-IDF', 'PyPDF2'],
    requiredFeatures: [
      'Extract PDF/DOCX contact info & skills',
      'Calculate TF-IDF match percentage',
      'Interactive Streamlit or FastAPI UI',
      'Keyword density and formatting breakdown'
    ],
    features: [
      'Extract PDF/DOCX contact info & skills',
      'Calculate TF-IDF match percentage',
      'Interactive Streamlit UI'
    ],
    objectives: [
      'Parse unstructured resume files into structured applicant profiles',
      'Train and utilize spaCy custom entity recognition patterns for skills',
      'Compute cosine similarity metrics between resumes and job postings',
      'Generate actionable gap reports highlighting missing keywords'
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Document Ingestion Pipeline',
        description: 'Extract raw text, sections, emails, and phone numbers from PDF and DOCX files with formatting cleanup.'
      },
      {
        id: 'm2',
        title: 'spaCy Entity Recognition & Skill Extractor',
        description: 'Configure named entity matching for tech stacks, frameworks, education, and years of experience.'
      },
      {
        id: 'm3',
        title: 'TF-IDF Vectorizer & Similarity Scorer',
        description: 'Implement TF-IDF vectorization and cosine similarity scoring against target job descriptions.'
      },
      {
        id: 'm4',
        title: 'REST API & Diagnostic Breakdown',
        description: 'Expose endpoints for file upload, async processing, matched vs missing skills, and score breakdown.'
      },
      {
        id: 'm5',
        title: 'Accuracy Benchmarking & Edge-Case Testing',
        description: 'Test scoring reliability against diverse resume templates, two-column layouts, and non-standard fonts.'
      }
    ]
  },
  {
    stableId: 'proj-3',
    category: 'cloud-devops',
    title: 'CI/CD Pipeline & Kubernetes Deployment Automation',
    difficulty: 'Advanced',
    estimatedHours: 30,
    primarySkill: 'Kubernetes',
    description: 'Construct complete GitHub Actions CI/CD workflows for automated unit testing, Docker image creation, and deployment onto Kubernetes cluster.',
    skills: ['Kubernetes', 'Docker', 'GitHub Actions', 'AWS EC2', 'Terraform'],
    targetSkills: ['Kubernetes', 'Docker', 'GitHub Actions', 'AWS EC2', 'Terraform'],
    technologies: ['Kubernetes', 'Docker', 'GitHub Actions', 'Helm', 'AWS EC2', 'Prometheus'],
    requiredFeatures: [
      'Automated testing pipeline',
      'Zero-downtime rolling updates',
      'Prometheus monitoring',
      'Infrastructure as code provisioning'
    ],
    features: [
      'Automated testing pipeline',
      'Zero-downtime rolling updates',
      'Prometheus monitoring'
    ],
    objectives: [
      'Automate linting, unit testing, and security scanning on pull requests',
      'Build and push tagged container images to a secure container registry',
      'Deploy application manifests onto Kubernetes with zero-downtime rolling updates',
      'Set up Prometheus monitoring and health check probes for automated self-healing'
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Containerization & Multi-Stage Dockerfile',
        description: 'Create multi-stage Docker build files optimized for size, security, and non-root execution.'
      },
      {
        id: 'm2',
        title: 'GitHub Actions Continuous Integration',
        description: 'Automate lint checks, unit tests, code coverage reporting, and container registry publishing.'
      },
      {
        id: 'm3',
        title: 'Kubernetes Cluster Manifests & Helm Charts',
        description: 'Author Declarative Deployments, Services, Ingress configs, and ConfigMaps for multi-tier workloads.'
      },
      {
        id: 'm4',
        title: 'Continuous Deployment & Rolling Updates',
        description: 'Configure automated cluster deployments with zero-downtime rolling updates and rollback safety.'
      },
      {
        id: 'm5',
        title: 'Observability, Health Probes & Monitoring',
        description: 'Configure liveness/readiness probes and Prometheus metrics endpoints for container health tracking.'
      }
    ]
  },
  {
    stableId: 'proj-4',
    category: 'fullstack',
    title: 'Real-Time Collaborative Project Workspace',
    difficulty: 'Intermediate',
    estimatedHours: 20,
    primarySkill: 'React',
    description: 'Develop a Kanban-style collaborative workspace featuring WebSockets for live user cursor presence and updates.',
    skills: ['React', 'WebSockets', 'Node.js', 'Tailwind CSS', 'PostgreSQL'],
    targetSkills: ['React', 'WebSockets', 'Node.js', 'Tailwind CSS', 'PostgreSQL'],
    technologies: ['React', 'WebSockets', 'Socket.io', 'Node.js', 'Tailwind CSS', 'PostgreSQL', 'Express.js'],
    requiredFeatures: [
      'Real-time document sync',
      'Role-based permissions',
      'Dark/Light UI theme toggle',
      'Live presence indicators and collaborative board state'
    ],
    features: [
      'Real-time document sync',
      'Role-based permissions',
      'Dark/Light UI theme toggle'
    ],
    objectives: [
      'Build dynamic drag-and-drop Kanban interface for project tasks',
      'Implement bi-directional WebSocket events for real-time collaboration',
      'Handle concurrent updates, room disconnections, and state sync',
      'Persist workspace board states with audit histories and user roles'
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Workspace Entities & Database Modeling',
        description: 'Design schemas for boards, lists, tasks, team members, and real-time activity logs.'
      },
      {
        id: 'm2',
        title: 'WebSocket Server & Room Management',
        description: 'Implement Socket.io room joins, presence broadcasting, heartbeats, and graceful disconnection.'
      },
      {
        id: 'm3',
        title: 'Interactive Frontend Kanban Board',
        description: 'Develop responsive drag-and-drop task cards with optimistic UI state and status columns.'
      },
      {
        id: 'm4',
        title: 'Live Presence & Collaborative Sync',
        description: 'Broadcast active collaborator avatars, live card edits, and avoid collision with lock indicators.'
      },
      {
        id: 'm5',
        title: 'State Reconciliation & Offline Fallback',
        description: 'Implement reconnect state resynchronization, debounced server persistence, and audit log tracking.'
      }
    ]
  }
];

module.exports = { defaultRecommendedProjects };
