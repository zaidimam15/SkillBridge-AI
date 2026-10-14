const Resume = require('../models/Resume');

// ============================================================
// CAREER DATABASE
// These are benchmark career profiles.
// User-specific matching is calculated dynamically.
// ============================================================

const CAREER_PATHS = [
    {
        slug: 'full-stack-developer',
        title: 'Full Stack Web Developer',
        category: 'Software Development',

        description:
            'Design and build scalable web applications using modern frontend, backend, database, and API technologies.',

        marketDemand: 'High Demand',

        salaryRange: {
            min: 8,
            max: 18,
            currency: 'INR',
            formatted: '₹8 - 18 LPA',
        },

        requiredSkills: [
            'React',
            'Node.js',
            'Express',
            'JavaScript',
            'MongoDB',
            'REST APIs',
            'Git',
        ],

        secondarySkills: [
            'TypeScript',
            'Docker',
            'Redis',
            'GraphQL',
            'Tailwind CSS',
        ],

        hiringCompanies: [
            'Amazon',
            'Flipkart',
            'Swiggy',
            'Zomato',
            'Microsoft',
            'Jio',
        ],
    },

    {
        slug: 'backend-engineer',
        title: 'Backend Systems Engineer',
        category: 'Systems & Infrastructure',

        description:
            'Build reliable APIs, backend services, database systems, distributed applications, and scalable server-side architectures.',

        marketDemand: 'High Demand',

        salaryRange: {
            min: 9,
            max: 22,
            currency: 'INR',
            formatted: '₹9 - 22 LPA',
        },

        requiredSkills: [
            'Node.js',
            'Express',
            'Python',
            'PostgreSQL',
            'SQL',
            'Docker',
            'REST APIs',
        ],

        secondarySkills: [
            'Redis',
            'AWS',
            'Kafka',
            'Kubernetes',
            'Microservices',
            'System Design',
        ],

        hiringCompanies: [
            'Google',
            'Uber',
            'Razorpay',
            'CRED',
            'Atlassian',
            'Microsoft',
        ],
    },

    {
        slug: 'ai-ml-engineer',
        title: 'AI / NLP Machine Learning Engineer',
        category: 'Artificial Intelligence',

        description:
            'Develop intelligent machine learning and NLP systems for document processing, text analysis, prediction, and AI-powered applications.',

        marketDemand: 'High Demand',

        salaryRange: {
            min: 10,
            max: 25,
            currency: 'INR',
            formatted: '₹10 - 25 LPA',
        },

        requiredSkills: [
            'Python',
            'NLP',
            'PyTorch',
            'scikit-learn',
            'TF-IDF',
            'FastAPI',
            'Pandas',
        ],

        secondarySkills: [
            'HuggingFace',
            'LangChain',
            'Vector DBs',
            'Docker',
            'ONNX',
        ],

        hiringCompanies: [
            'Microsoft AI',
            'NVIDIA',
            'Fractal AI',
            'Mu Sigma',
            'JPMorgan',
        ],
    },

    {
        slug: 'frontend-developer',
        title: 'Frontend Developer',
        category: 'Software Development',

        description:
            'Build responsive, accessible, interactive, and high-performance user interfaces using modern frontend technologies.',

        marketDemand: 'High Demand',

        salaryRange: {
            min: 5,
            max: 15,
            currency: 'INR',
            formatted: '₹5 - 15 LPA',
        },

        requiredSkills: [
            'HTML',
            'CSS',
            'JavaScript',
            'React',
            'Git',
        ],

        secondarySkills: [
            'TypeScript',
            'Tailwind CSS',
            'Redux',
            'Jest',
            'Next.js',
        ],

        hiringCompanies: [
            'Microsoft',
            'Amazon',
            'Adobe',
            'Flipkart',
            'Razorpay',
            'Swiggy',
        ],
    },

    {
        slug: 'devops-cloud-engineer',
        title: 'DevOps / Cloud Engineer',
        category: 'Cloud & Infrastructure',

        description:
            'Automate application deployment, infrastructure, monitoring, cloud environments, and reliable software delivery pipelines.',

        marketDemand: 'High Demand',

        salaryRange: {
            min: 7,
            max: 20,
            currency: 'INR',
            formatted: '₹7 - 20 LPA',
        },

        requiredSkills: [
            'Linux',
            'Git',
            'Docker',
            'CI/CD',
            'AWS',
        ],

        secondarySkills: [
            'Kubernetes',
            'Terraform',
            'Jenkins',
            'Azure',
            'GCP',
        ],

        hiringCompanies: [
            'Amazon',
            'Microsoft',
            'Google',
            'Accenture',
            'TCS',
            'Infosys',
        ],
    },

    {
        slug: 'data-analyst',
        title: 'Data Analyst',
        category: 'Data & Analytics',

        description:
            'Analyze business and technical data, create insights, build dashboards, and support data-driven decision making.',

        marketDemand: 'High Demand',

        salaryRange: {
            min: 5,
            max: 14,
            currency: 'INR',
            formatted: '₹5 - 14 LPA',
        },

        requiredSkills: [
            'Python',
            'SQL',
            'Pandas',
            'Excel',
        ],

        secondarySkills: [
            'Power BI',
            'Tableau',
            'NumPy',
            'Matplotlib',
            'Statistics',
        ],

        hiringCompanies: [
            'Deloitte',
            'Accenture',
            'Amazon',
            'Microsoft',
            'EY',
            'KPMG',
        ],
    },
];

// ============================================================
// NORMALIZE SKILL
// ============================================================

const normalizeSkill = (skill) => {
    return String(skill || '')
        .trim()
        .toLowerCase()
        .replace(/[._-]/g, ' ')
        .replace(/[()[\]{},]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

// ============================================================
// SKILL ALIASES
// Converts different names of the same technology
// into one canonical skill.
// ============================================================

const SKILL_ALIASES = {
    // React
    react: 'react',
    reactjs: 'react',
    'react js': 'react',
    'react.js': 'react',

    // Node
    node: 'node.js',
    nodejs: 'node.js',
    'node js': 'node.js',
    'node.js': 'node.js',

    // Express
    express: 'express',
    expressjs: 'express',
    'express js': 'express',
    'express.js': 'express',

    // JavaScript
    javascript: 'javascript',
    js: 'javascript',
    'java script': 'javascript',

    // TypeScript
    typescript: 'typescript',
    ts: 'typescript',
    'type script': 'typescript',

    // MongoDB
    mongodb: 'mongodb',
    mongo: 'mongodb',
    'mongo db': 'mongodb',

    // PostgreSQL
    postgres: 'postgresql',
    postgresql: 'postgresql',
    'postgre sql': 'postgresql',
    'postgres sql': 'postgresql',

    // SQL
    sql: 'sql',

    // REST
    rest: 'rest apis',
    'rest api': 'rest apis',
    'rest apis': 'rest apis',
    'restful api': 'rest apis',
    'restful apis': 'rest apis',

    // CSS
    css: 'css',
    'cascading style sheets': 'css',

    // HTML
    html: 'html',
    'html5': 'html',
    'hypertext markup language': 'html',

    // Tailwind
    tailwind: 'tailwind css',
    tailwindcss: 'tailwind css',
    'tailwind css': 'tailwind css',

    // Machine Learning
    ml: 'machine learning',
    'machine learning': 'machine learning',

    // NLP
    nlp: 'nlp',
    'natural language processing': 'nlp',

    // Scikit Learn
    'scikit learn': 'scikit learn',
    'scikit-learn': 'scikit learn',
    sklearn: 'scikit learn',

    // TF-IDF
    tfidf: 'tf idf',
    'tf idf': 'tf idf',
    'tf-idf': 'tf idf',

    // FastAPI
    fastapi: 'fastapi',
    'fast api': 'fastapi',

    // Vector databases
    'vector db': 'vector dbs',
    'vector dbs': 'vector dbs',
    'vector database': 'vector dbs',
    'vector databases': 'vector dbs',

    // HuggingFace
    huggingface: 'huggingface',
    'hugging face': 'huggingface',

    // CI/CD
    cicd: 'ci cd',
    'ci cd': 'ci cd',
    'ci/cd': 'ci cd',
    'continuous integration': 'ci cd',
    'continuous deployment': 'ci cd',

    // AWS
    aws: 'aws',
    'amazon web services': 'aws',

    // Kubernetes
    k8s: 'kubernetes',
    kubernetes: 'kubernetes',

    // Git
    git: 'git',
    github: 'git',
    'git version control': 'git',

    // Docker
    docker: 'docker',

    // Redis
    redis: 'redis',

    // GraphQL
    graphql: 'graphql',
    'graph ql': 'graphql',

    // Redux
    redux: 'redux',
    'redux toolkit': 'redux',

    // Jest
    jest: 'jest',

    // Pandas
    pandas: 'pandas',

    // NumPy
    numpy: 'numpy',
    'num py': 'numpy',

    // Matplotlib
    matplotlib: 'matplotlib',

    // Excel
    excel: 'excel',
    'microsoft excel': 'excel',

    // Power BI
    'power bi': 'power bi',
    powerbi: 'power bi',

    // Tableau
    tableau: 'tableau',

    // Statistics
    statistics: 'statistics',
    statistical: 'statistics',

    // Azure
    azure: 'azure',
    'microsoft azure': 'azure',

    // GCP
    gcp: 'gcp',
    'google cloud': 'gcp',
    'google cloud platform': 'gcp',

    // Terraform
    terraform: 'terraform',

    // Jenkins
    jenkins: 'jenkins',

    // Linux
    linux: 'linux',

    // Python
    python: 'python',

    // PyTorch
    pytorch: 'pytorch',
    'py torch': 'pytorch',

    // Next.js
    nextjs: 'next.js',
    'next js': 'next.js',
    'next.js': 'next.js',

    // Kafka
    kafka: 'kafka',
    apachekafka: 'kafka',
    'apache kafka': 'kafka',

    // Microservices
    microservices: 'microservices',
    'micro services': 'microservices',

    // System Design
    'system design': 'system design',
    systemsdesign: 'system design',

    // ONNX
    onnx: 'onnx',

    // LangChain
    langchain: 'langchain',
    'lang chain': 'langchain',
};

// ============================================================
// CANONICAL SKILL
// ============================================================

const canonicalSkill = (skill) => {
    const normalized = normalizeSkill(skill);

    return SKILL_ALIASES[normalized] || normalized;
};

// ============================================================
// EXTRACT SKILLS RECURSIVELY
//
// Handles:
//
// skills: []
// skills: {}
// skills: { frontend: [], backend: [] }
// normalizedSkills: []
// technicalSkills: []
// frameworks: []
// programmingLanguages: []
// databases: []
// tools: []
// ============================================================

const extractSkillsFromValue = (value, output, depth = 0) => {
    if (
        value === null ||
        value === undefined ||
        depth > 8
    ) {
        return;
    }

    // ----------------------------------------------------------
    // String
    // ----------------------------------------------------------
    if (typeof value === 'string') {
        let cleaned = value.trim();

        if (!cleaned) return;

        // Strip category labels with colons e.g. "Frontend & UI: React.js, Bootstrap, Tailwind CSS" -> "React.js, Bootstrap, Tailwind CSS"
        if (cleaned.includes(':')) {
            const parts = cleaned.split(':');
            if (parts.length >= 2) {
                cleaned = parts.slice(1).join(':').trim();
            }
        }

        // Split by common skill separators if present e.g. "React / Redux, Node.js"
        const subSkills = cleaned.split(/[,|\/\n\t]+/);

        subSkills.forEach((sub) => {
            const trimmed = sub.trim().replace(/^[-•*●▪]\s*/, '');
            if (trimmed && trimmed.length >= 2 && trimmed.length <= 80) {
                output.push(trimmed);
            }
        });

        return;
    }

    // ----------------------------------------------------------
    // Array
    // ----------------------------------------------------------
    if (Array.isArray(value)) {
        value.forEach((item) => {
            extractSkillsFromValue(
                item,
                output,
                depth + 1
            );
        });

        return;
    }

    // ----------------------------------------------------------
    // Object
    // ----------------------------------------------------------
    if (typeof value === 'object') {
        Object.entries(value).forEach(
            ([key, val]) => {
                if (
                    typeof val === 'boolean' ||
                    typeof val === 'number'
                ) {
                    if (val) {
                        output.push(key);
                    }

                    return;
                }

                if (typeof val === 'string') {
                    if (
                        key &&
                        key.toLowerCase() !== 'name' &&
                        key.toLowerCase() !== 'skill'
                    ) {
                        output.push(key);
                    }

                    extractSkillsFromValue(val, output, depth + 1);

                    return;
                }

                if (
                    val &&
                    typeof val === 'object'
                ) {
                    if (val.name) {
                        output.push(val.name);
                    }

                    if (val.skill) {
                        output.push(val.skill);
                    }

                    if (val.technology) {
                        output.push(val.technology);
                    }

                    if (val.technologies) {
                        extractSkillsFromValue(
                            val.technologies,
                            output,
                            depth + 1
                        );
                    }

                    if (val.skills) {
                        extractSkillsFromValue(
                            val.skills,
                            output,
                            depth + 1
                        );
                    }

                    Object.entries(val).forEach(
                        ([nestedKey, nestedValue]) => {
                            if (
                                nestedKey !== 'name' &&
                                nestedKey !== 'skill' &&
                                nestedKey !== 'technology' &&
                                nestedKey !== 'technologies' &&
                                nestedKey !== 'skills'
                            ) {
                                extractSkillsFromValue(
                                    nestedValue,
                                    output,
                                    depth + 1
                                );
                            }
                        }
                    );
                }
            }
        );
    }
};

// ============================================================
// GET USER SKILLS FROM PARSED RESUME
// ============================================================

const getUserSkills = (resume) => {
    const rawSkills = [];

    const parsedData =
        resume?.parsedData || {};

    // Main skill fields
    const skillFields = [
        'skills',
        'normalizedSkills',
        'technicalSkills',
        'programmingLanguages',
        'frameworks',
        'libraries',
        'tools',
        'databases',
        'technologies',
        'webTechnologies',
        'backendTechnologies',
        'frontendTechnologies',
        'cloudTechnologies',
        'devopsTools',
        'projects',
        'experience',
    ];

    skillFields.forEach((field) => {
        extractSkillsFromValue(
            parsedData[field],
            rawSkills
        );
    });

    if (parsedData.sections) {
        extractSkillsFromValue(
            parsedData.sections.skills,
            rawSkills
        );

        extractSkillsFromValue(
            parsedData.sections.technicalSkills,
            rawSkills
        );
    }

    // Canonicalize + remove duplicates.
    const canonicalSkills = [
        ...new Set(
            rawSkills
                .map(canonicalSkill)
                .filter(
                    (skill) =>
                        skill &&
                        skill.length >= 2 &&
                        skill.length <= 80
                )
        ),
    ];

    return canonicalSkills;
};

// ============================================================
// CHECK WHETHER USER HAS A SKILL
// ============================================================

const hasSkill = (
    userSkills = [],
    requiredSkill
) => {
    const required = canonicalSkill(requiredSkill);

    if (!required) {
        return false;
    }

    return userSkills.some((userSkill) => {
        const current = canonicalSkill(userSkill);

        // 1. Exact canonical match
        if (current === required) {
            return true;
        }

        // 2. Direct normalized match
        const normUser = normalizeSkill(userSkill);
        const normReq = normalizeSkill(requiredSkill);
        if (normUser === normReq) {
            return true;
        }

        // 3. Controlled token list match (excluding known distinct composite skills like React Native)
        if (current !== 'react native' && normUser !== 'react native') {
            const currentTokens = normUser.split(/[\s,\/:-]+/);
            if (
                currentTokens.includes(normReq) ||
                currentTokens.includes(required)
            ) {
                return true;
            }
        }

        return false;
    });
};

// ============================================================
// CALCULATE CAREER MATCH
//
// 80% = mandatory/core skills
// 20% = secondary/bonus skills
// ============================================================

const calculateCareerMatch = (
    career,
    userSkills
) => {
    const requiredSkills =
        career.requiredSkills || [];

    const secondarySkills =
        career.secondarySkills || [];

    // ----------------------------------------------------------
    // Required skills
    // ----------------------------------------------------------

    const matchedRequiredSkills =
        requiredSkills.filter(
            (skill) =>
                hasSkill(
                    userSkills,
                    skill
                )
        );

    const missingRequiredSkills =
        requiredSkills.filter(
            (skill) =>
                !hasSkill(
                    userSkills,
                    skill
                )
        );

    // ----------------------------------------------------------
    // Secondary skills
    // ----------------------------------------------------------

    const matchedSecondarySkills =
        secondarySkills.filter(
            (skill) =>
                hasSkill(
                    userSkills,
                    skill
                )
        );

    const missingSecondarySkills =
        secondarySkills.filter(
            (skill) =>
                !hasSkill(
                    userSkills,
                    skill
                )
        );

    // ----------------------------------------------------------
    // Scores
    // ----------------------------------------------------------

    const requiredScore =
        requiredSkills.length > 0
            ? (
                matchedRequiredSkills.length /
                requiredSkills.length
            ) * 80
            : 0;

    const secondaryScore =
        secondarySkills.length > 0
            ? (
                matchedSecondarySkills.length /
                secondarySkills.length
            ) * 20
            : 0;

    const matchPercentage =
        Math.min(
            100,
            Math.round(
                requiredScore +
                secondaryScore
            )
        );

    // ----------------------------------------------------------
    // Match label
    // ----------------------------------------------------------

    let matchLabel =
        'Needs Upskilling';

    if (matchPercentage >= 80) {
        matchLabel = 'Excellent Match';
    } else if (matchPercentage >= 60) {
        matchLabel = 'Strong Match';
    } else if (matchPercentage >= 40) {
        matchLabel = 'Moderate Match';
    }

    // ----------------------------------------------------------
    // Personalized learning recommendations
    // ----------------------------------------------------------

    const recommendedLearningSkills = [
        ...missingRequiredSkills,
        ...missingSecondarySkills,
    ];

    return {
        ...career,

        // Match information
        matchPercentage,
        matchLabel,
        careerReadiness: matchPercentage,

        // Required skill analysis
        matchedRequiredSkills,
        missingRequiredSkills,

        // Secondary skill analysis
        matchedSecondarySkills,
        missingSecondarySkills,

        // Counts
        matchedRequiredCount:
            matchedRequiredSkills.length,

        requiredSkillCount:
            requiredSkills.length,

        matchedSecondaryCount:
            matchedSecondarySkills.length,

        secondarySkillCount:
            secondarySkills.length,

        // Total skills
        totalMatchedSkills:
            matchedRequiredSkills.length +
            matchedSecondarySkills.length,

        totalCareerSkills:
            requiredSkills.length +
            secondarySkills.length,

        // Skills the user should learn
        recommendedLearningSkills: [
            ...new Set(
                recommendedLearningSkills
            ),
        ],
    };
};

// ============================================================
// GET /api/careers
//
// Returns personalized career recommendations
// based on the CURRENT USER'S latest parsed resume.
//
// Every user gets a separate calculation.
//
// User A resume:
// React, Node.js, MongoDB
//
// User B resume:
// Python, Pandas, NLP
//
// Their career percentages and missing skills
// will therefore be different.
// ============================================================

const getCareerPathways = async (
    req,
    res,
    next
) => {
    try {
        // --------------------------------------------------------
        // Find the current user's latest successfully
        // parsed resume.
        // --------------------------------------------------------

        const resume =
            await Resume.findOne({
                user: req.user._id,
                isDeleted: false,
                parseStatus: 'completed',
            })
                .sort({
                    isLatest: -1,
                    createdAt: -1,
                })
                .select(
                    'parsedData parseStatus createdAt updatedAt'
                );

        // --------------------------------------------------------
        // No parsed resume
        // --------------------------------------------------------

        if (!resume) {
            return res.status(200).json({
                success: true,
                hasResume: false,

                message:
                    'Upload and successfully parse a resume to receive personalized career recommendations.',

                careers: [],
                userSkills: [],
                roadmapSkills: [],
                count: 0,
            });
        }

        // --------------------------------------------------------
        // Extract user's skills
        // --------------------------------------------------------

        const userSkills =
            getUserSkills(resume);

        // --------------------------------------------------------
        // Calculate every career independently
        // --------------------------------------------------------

        const careers =
            CAREER_PATHS
                .map((career) =>
                    calculateCareerMatch(
                        career,
                        userSkills
                    )
                )
                .sort(
                    (a, b) =>
                        b.matchPercentage -
                        a.matchPercentage
                );

        // --------------------------------------------------------
        // Best career
        // --------------------------------------------------------

        const bestCareer =
            careers.length > 0
                ? careers[0]
                : null;

        // --------------------------------------------------------
        // Recommended learning skills
        //
        // Combine missing skills from the user's
        // strongest career recommendation.
        // --------------------------------------------------------

        const recommendedLearningSkills =
            bestCareer
                ? bestCareer.recommendedLearningSkills
                : [];

        // --------------------------------------------------------
        // Response
        // --------------------------------------------------------

        return res.status(200).json({
            success: true,

            hasResume: true,

            resumeId: resume._id,

            resumeParsedAt:
                resume.updatedAt ||
                resume.createdAt,

            // Current user's detected skills
            userSkills,

            // Number of detected skills
            userSkillCount:
                userSkills.length,

            // All personalized careers
            careers,

            // Best matching career
            bestCareer,

            // Skills recommended for learning
            recommendedLearningSkills,

            count: careers.length,
        });
    } catch (error) {
        console.error(
            'Get career pathways error:',
            error
        );

        next(error);
    }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    getCareerPathways,
};