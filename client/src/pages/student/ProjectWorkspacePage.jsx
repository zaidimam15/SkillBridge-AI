import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FolderGit2,
  CheckCircle2,
  Circle,
  Clock,
  Tag,
  Github,
  Globe,
  Save,
  Sparkles,
  Layers,
  AlertCircle,
  ExternalLink,
  Code2,
  Check,
  ChevronRight,
  Info,
  Play,
  RotateCcw
} from 'lucide-react';
import { projectAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ProjectWorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingMilestone, setUpdatingMilestone] = useState(null);
  const [savingDetails, setSavingDetails] = useState(false);

  // Form states for repo/demo/notes
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await projectAPI.getUserProjectById(id);
      if (res.data?.success && res.data?.project) {
        const p = res.data.project;
        setProject(p);
        setGithubRepoUrl(p.githubRepoUrl || '');
        setLiveDemoUrl(p.liveDemoUrl || '');
        setNotes(p.notes || '');
      } else {
        toast.error('Could not load project workspace.');
        navigate('/dashboard/projects');
      }
    } catch (err) {
      console.error('Fetch project details error:', err);
      toast.error(err.response?.data?.message || 'Failed to load project details.');
      navigate('/dashboard/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMilestone = async (milestoneId, currentCompleted) => {
    try {
      setUpdatingMilestone(milestoneId);
      const res = await projectAPI.toggleMilestone(id, milestoneId, !currentCompleted);
      if (res.data?.success && res.data?.project) {
        setProject(res.data.project);
        const action = !currentCompleted ? 'completed' : 'marked incomplete';
        toast.success(`Milestone ${action}! Progress updated to ${res.data.project.progress}%.`);
      }
    } catch (err) {
      console.error('Milestone update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update milestone.');
    } finally {
      setUpdatingMilestone(null);
    }
  };

  const handleSaveDeliverables = async (e) => {
    e.preventDefault();
    try {
      setSavingDetails(true);
      const res = await projectAPI.updateUserProject(id, {
        githubRepoUrl,
        liveDemoUrl,
        notes,
      });
      if (res.data?.success && res.data?.project) {
        setProject(res.data.project);
        toast.success('Project details & deliverables saved successfully!');
      }
    } catch (err) {
      console.error('Save deliverables error:', err);
      toast.error(err.response?.data?.message || 'Failed to save project deliverables.');
    } finally {
      setSavingDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-36 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="skeleton h-96 lg:col-span-2 rounded-2xl" />
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!project) return null;

  const completedMilestonesCount = project.milestones?.filter((m) => m.completed).length || 0;
  const totalMilestonesCount = project.milestones?.length || 0;
  const progressPercent = project.progress || 0;

  // Next milestone to focus on
  const nextMilestone = project.milestones?.find((m) => !m.completed);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'In Progress':
        return 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/20';
      case 'Testing':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <Link
          to="/dashboard/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-500 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Recommended Capstone Projects
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-300 uppercase tracking-wider">
                {project.category}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                Difficulty: {project.difficulty}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusBadgeClass(project.status)}`}>
                Status: {project.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <FolderGit2 className="w-8 h-8 text-primary-500 shrink-0" />
              {project.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
              <span>
                📅 Started: {new Date(project.startedAt || project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span>•</span>
              <span>⏱️ Est. Effort: {project.estimatedHours || 25} Hours</span>
            </p>
          </div>
        </div>
      </div>

      {/* Progress & Next Step Banner */}
      <div className="card p-6 bg-gradient-to-br from-slate-900/90 to-slate-950 border-primary-500/20 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-primary-400">
                Workspace Build Progress
              </span>
              <div className="text-2xl font-black mt-0.5">
                {progressPercent}% Completed
              </div>
            </div>
            <div className="text-sm font-semibold text-slate-300">
              {completedMilestonesCount} of {totalMilestonesCount} Milestones Done
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="bg-gradient-to-r from-primary-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Next Recommended Step */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-amber-300">Recommended Next Step: </span>
              {nextMilestone ? (
                <span className="text-slate-200">
                  Work on <strong className="text-white">"{nextMilestone.title}"</strong> — {nextMilestone.description}
                </span>
              ) : (
                <span className="text-emerald-300">
                  🎉 All milestones completed! Review your repository and showcase your project in your portfolio.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Milestones & Project Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Milestones Checklist (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-500" />
                  Milestone Implementation Checklist
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Check off each completed phase to update your persistent build progress.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {project.milestones?.map((milestone, index) => {
                const isUpdating = updatingMilestone === milestone.id;
                return (
                  <div
                    key={milestone.id || index}
                    onClick={() => !isUpdating && handleToggleMilestone(milestone.id, milestone.completed)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 group select-none ${
                      milestone.completed
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                        : 'bg-slate-50 dark:bg-slate-850/60 border-slate-200 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-600'
                    }`}
                  >
                    <button
                      type="button"
                      disabled={isUpdating}
                      className={`mt-0.5 shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        milestone.completed
                          ? 'bg-emerald-500 text-white'
                          : 'border-2 border-slate-300 dark:border-slate-600 group-hover:border-primary-500'
                      }`}
                    >
                      {milestone.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-sm font-bold ${
                          milestone.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          Phase {index + 1}: {milestone.title}
                        </h4>
                        {milestone.completed && (
                          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {milestone.description}
                      </p>
                      {milestone.completedAt && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                          ✓ Finished on {new Date(milestone.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project Architecture & Requirements */}
          <div className="card p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              Architecture & Key Requirements
            </h2>

            <div className="space-y-4 pt-1">
              {project.features && project.features.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Key Architectural Features
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                    {project.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.requirements && project.requirements.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Implementation Objectives
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {project.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Project Metadata, Tech Stack & Deliverables (1 col) */}
        <div className="space-y-6">
          {/* Tech Stack & Skills */}
          <div className="card p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary-500" />
              Technology Stack
            </h3>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {(project.technologies || project.skills)?.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 flex items-center gap-1"
                >
                  <Tag className="w-3 h-3 text-primary-500" />
                  {tech}
                </span>
              ))}
            </div>

            {project.description && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Project Summary
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {project.description}
                </p>
              </div>
            )}
          </div>

          {/* Deliverables / Source Code Tracking Form */}
          <div className="card p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Github className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                Build Deliverables
              </h3>
            </div>

            {/* Truthful GitHub Integration Notice */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Info className="w-4 h-4 text-amber-500 shrink-0" />
                <span>External Integration Status</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {project.githubRepoUrl ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ GitHub repository connected.
                  </span>
                ) : (
                  <span>
                    No automated external GitHub runner is linked. You develop your code locally or in GitHub, and link your repository URL below.
                  </span>
                )}
              </p>
            </div>

            <form onSubmit={handleSaveDeliverables} className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  GitHub Repository URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://github.com/your-username/my-capstone-repo"
                    value={githubRepoUrl}
                    onChange={(e) => setGithubRepoUrl(e.target.value)}
                    className="input w-full text-xs pl-8 py-2"
                  />
                  <Github className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                {githubRepoUrl && (
                  <a
                    href={githubRepoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary-500 hover:underline mt-1"
                  >
                    Open repository <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Live Deployment / Demo URL (Optional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://my-app.vercel.app"
                    value={liveDemoUrl}
                    onChange={(e) => setLiveDemoUrl(e.target.value)}
                    className="input w-full text-xs pl-8 py-2"
                  />
                  <Globe className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Personal Build Notes & Architecture Decisions
                </label>
                <textarea
                  rows={3}
                  placeholder="Record your Docker network ports, API endpoints, schema notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input w-full text-xs p-2.5"
                />
              </div>

              <button
                type="submit"
                disabled={savingDetails}
                className="btn-primary w-full text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {savingDetails ? 'Saving...' : 'Save Workspace Changes'}
              </button>
            </form>
          </div>

          {/* Quick Guide: How to build */}
          <div className="card p-5 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs space-y-2 text-slate-600 dark:text-slate-400">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-primary-500" />
              Build Guide: Next Steps
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-[11px]">
              <li>Create a new local repository or clone a starter boilerplate.</li>
              <li>Complete Phase 1 setup and check the box above.</li>
              <li>Implement core services following the architecture checklist.</li>
              <li>Paste your GitHub repo URL to track your deliverables.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
