import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderGit2, Sparkles, Star, Code2, ExternalLink, 
  CheckCircle, PlayCircle, Layers, ShieldCheck, Tag,
  Loader2, ArrowRight
} from 'lucide-react';
import { projectAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function CapstonePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [startingProjectId, setStartingProjectId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allRes, userRes] = await Promise.allSettled([
        projectAPI.getAll(),
        isAuthenticated ? projectAPI.getUserProjects() : Promise.resolve({ data: { projects: [] } }),
      ]);

      if (allRes.status === 'fulfilled' && allRes.value.data?.success && allRes.value.data.projects?.length > 0) {
        setProjects(allRes.value.data.projects);
      } else {
        setProjects(defaultDemoProjects);
      }

      if (userRes.status === 'fulfilled' && userRes.value.data?.success) {
        setUserProjects(userRes.value.data.projects || []);
      }
    } catch (err) {
      console.warn('Using default capstone projects:', err);
      setProjects(defaultDemoProjects);
    } finally {
      setLoading(false);
    }
  };

  // Find if current user has already started this project
  const getStartedProject = (project) => {
    if (!userProjects || userProjects.length === 0) return null;
    return userProjects.find((up) => {
      const matchKey =
        (project.stableId && up.templateKey === project.stableId) ||
        (project._id && up.templateKey === project._id) ||
        (up.templateProject?._id && up.templateProject._id === project._id) ||
        (up.templateProject && up.templateProject === project._id) ||
        (up.title && project.title && up.title.toLowerCase() === project.title.toLowerCase());
      return Boolean(matchKey);
    });
  };

  const handleStartProject = async (project) => {
    if (!isAuthenticated) {
      toast.error('Please log in to start a capstone project.');
      navigate('/login');
      return;
    }

    const projectId = project.stableId || project._id;
    const title = project.title;

    // Check if user already started it locally
    const alreadyStarted = getStartedProject(project);
    if (alreadyStarted) {
      toast('Opening your active workspace...', { icon: '📂' });
      navigate(`/dashboard/projects/${alreadyStarted._id}`);
      return;
    }

    try {
      setStartingProjectId(projectId);
      const res = await projectAPI.start(projectId);

      if (res.data?.success && res.data?.project) {
        const createdProject = res.data.project;
        
        // Refresh local user projects list
        setUserProjects((prev) => [
          createdProject,
          ...prev.filter((p) => p._id !== createdProject._id),
        ]);

        if (res.data.alreadyStarted) {
          toast.success(`Project "${title}" is already in your workspace.`);
        } else {
          toast.success(`Project "${title}" started! Redirecting to workspace...`);
        }

        // Navigate to the real workspace details page
        navigate(`/dashboard/projects/${createdProject._id}`);
      } else {
        toast.error('Unable to initialize project workspace. Please try again.');
      }
    } catch (err) {
      console.error('Error starting capstone project:', err);
      const errorMsg =
        err.response?.data?.message ||
        'Failed to start project build. Please check your connection and try again.';
      toast.error(errorMsg);
    } finally {
      setStartingProjectId(null);
    }
  };

  const categories = ['all', 'fullstack', 'ai-ml', 'cloud-devops', 'cybersecurity'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <FolderGit2 className="w-7 h-7 text-primary-500" />
            Recommended Capstone Projects
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Build industry-level major projects tailored to your missing ATS skills to build a stellar portfolio.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects
          .filter(p => activeCategory === 'all' || p.category?.toLowerCase() === activeCategory.toLowerCase())
          .map((project, idx) => {
            const started = getStartedProject(project);
            const projectId = project.stableId || project._id || `proj-${idx + 1}`;
            const isStarting = startingProjectId === projectId;

            return (
              <div
                key={project._id || projectId}
                className="card p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-300 uppercase tracking-wider">
                      {project.category || 'Fullstack'}
                    </span>
                    <div className="flex items-center gap-2">
                      {started && (
                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {started.status} ({started.progress || 0}%)
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 capitalize">
                        Difficulty: {project.difficulty || 'Intermediate'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                    {project.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Targeted Missing Skills Addressed */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Skills Addressed
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {(project.skills || project.targetSkills || []).map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3 text-primary-500" />
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Features Bullet List */}
                  {(project.features || project.requiredFeatures) && (
                    <div className="pt-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Key Architecture Features
                      </label>
                      <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                        {(project.features || project.requiredFeatures).map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Footer CTA */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    ⏱️ Est. Effort: {project.estimatedHours || 25} Hours
                  </span>

                  {started ? (
                    <button
                      onClick={() => navigate(`/dashboard/projects/${started._id}`)}
                      className="btn text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      <FolderGit2 className="w-4 h-4" /> Open Workspace
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartProject(project)}
                      disabled={isStarting}
                      className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isStarting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Starting...
                        </>
                      ) : (
                        <>
                          <Code2 className="w-4 h-4" /> Start Build
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

const defaultDemoProjects = [
  {
    _id: 'proj-1',
    stableId: 'proj-1',
    category: 'fullstack',
    title: 'Microservices E-Commerce Platform with Docker & Redis',
    difficulty: 'Advanced',
    estimatedHours: 35,
    description: 'Build a production-grade microservices e-commerce system featuring containerized services, Redis caching, JWT auth, and Stripe payment webhooks.',
    skills: ['Docker', 'Node.js', 'Redis', 'React', 'MongoDB', 'Microservices'],
    features: [
      'Multi-container Docker Compose setup',
      'Redis cache layer for inventory counts',
      'Stripe checkout integration'
    ]
  },
  {
    _id: 'proj-2',
    stableId: 'proj-2',
    category: 'ai-ml',
    title: 'Automated Resume Parser & ATS Screener Engine',
    difficulty: 'Intermediate',
    estimatedHours: 25,
    description: 'Implement a Python NLP engine using spaCy and TF-IDF cosine similarity to score resumes against job requirements.',
    skills: ['Python', 'NLP', 'TF-IDF', 'spaCy', 'FastAPI'],
    features: [
      'Extract PDF/DOCX contact info & skills',
      'Calculate TF-IDF match percentage',
      'Interactive Streamlit UI'
    ]
  },
  {
    _id: 'proj-3',
    stableId: 'proj-3',
    category: 'cloud-devops',
    title: 'CI/CD Pipeline & Kubernetes Deployment Automation',
    difficulty: 'Advanced',
    estimatedHours: 30,
    description: 'Construct complete GitHub Actions CI/CD workflows for automated unit testing, Docker image creation, and deployment onto Kubernetes cluster.',
    skills: ['Kubernetes', 'Docker', 'GitHub Actions', 'AWS EC2', 'Terraform'],
    features: [
      'Automated testing pipeline',
      'Zero-downtime rolling updates',
      'Prometheus monitoring'
    ]
  },
  {
    _id: 'proj-4',
    stableId: 'proj-4',
    category: 'fullstack',
    title: 'Real-Time Collaborative Project Workspace',
    difficulty: 'Intermediate',
    estimatedHours: 20,
    description: 'Develop a Kanban-style collaborative workspace featuring WebSockets for live user cursor presence and updates.',
    skills: ['React', 'WebSockets', 'Node.js', 'Tailwind CSS', 'PostgreSQL'],
    features: [
      'Real-time document sync',
      'Role-based permissions',
      'Dark/Light UI theme toggle'
    ]
  }
];
