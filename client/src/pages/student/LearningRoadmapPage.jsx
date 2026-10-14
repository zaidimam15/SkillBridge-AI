import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  BookOpen,
  ExternalLink,
  Sparkles,
  ArrowRight,
  PlayCircle,
  Layers,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { roadmapAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function LearningRoadmapPage() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [updatingSkill, setUpdatingSkill] = useState(null);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  // ============================================================
  // FETCH ROADMAP
  // ============================================================
  const fetchRoadmap = async () => {
    try {
      setLoading(true);

      const res = await roadmapAPI.get();

      console.log('Roadmap API response:', res.data);

      if (res.data?.success) {
        const progress = res.data.progress || {};

        const skillProgress = Array.isArray(progress.skillProgress)
          ? progress.skillProgress
          : [];

        // Convert backend skillProgress into frontend roadmap items
        const items = skillProgress.map((item, index) => ({
          stage: index + 1,
          skill: item.skill,
          status: item.status || 'pending',
          priority: item.priority || 'high',
          estimatedHours: item.estimatedHours || 12,
          description:
            item.description ||
            `Master ${item.skill} concepts, best practices, and practical implementation.`,

          // Dynamic learning resources from backend
          resources: Array.isArray(item.resources)
            ? item.resources
            : [],

          startedAt: item.startedAt,
          completedAt: item.completedAt,
          hoursSpent: item.hoursSpent || 0,
          notes: item.notes || '',
          _id: item._id,
        }));

        setRoadmap({
          targetRole: progress.targetRole || 'Full Stack Developer',
          items,
        });
      } else {
        setRoadmap({
          targetRole: 'Full Stack Developer',
          items: [],
        });
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);

      toast.error('Failed to load your roadmap.');

      setRoadmap({
        targetRole: 'Full Stack Developer',
        items: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UPDATE STATUS
  // ============================================================
  const handleStatusChange = async (skillName, newStatus) => {
    try {
      setUpdatingSkill(skillName);

      await roadmapAPI.updateStatus(skillName, newStatus);

      setRoadmap((prev) => {
        if (!prev) return prev;

        const updatedItems = prev.items.map((item) =>
          item.skill === skillName
            ? {
              ...item,
              status: newStatus,

              startedAt:
                newStatus === 'in_progress' && !item.startedAt
                  ? new Date().toISOString()
                  : item.startedAt,

              completedAt:
                newStatus === 'completed'
                  ? new Date().toISOString()
                  : undefined,
            }
            : item
        );

        return {
          ...prev,
          items: updatedItems,
        };
      });

      toast.success(
        `"${skillName}" marked as ${newStatus.replace('_', ' ')}.`
      );
    } catch (err) {
      console.error('Status update error:', err);

      toast.error(
        err?.response?.data?.message ||
        'Failed to update skill status.'
      );
    } finally {
      setUpdatingSkill(null);
    }
  };

  // ============================================================
  // CALCULATIONS
  // ============================================================
  const items = roadmap?.items || [];

  const totalSkills = items.length;

  const completedSkills = items.filter(
    (item) => item.status === 'completed'
  ).length;

  const inProgressSkills = items.filter(
    (item) => item.status === 'in_progress'
  ).length;

  const pendingSkills = items.filter(
    (item) => item.status === 'pending'
  ).length;

  const progressPercent =
    totalSkills > 0
      ? Math.round((completedSkills / totalSkills) * 100)
      : 0;

  const filteredItems = items.filter(
    (item) =>
      selectedFilter === 'all' ||
      item.status === selectedFilter
  );

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Loading your learning roadmap...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================
  return (
    <div className="space-y-8 animate-fade-in">

      {/* ======================================================
          HEADER
      ====================================================== */}
      <div className="card bg-gradient-to-r from-primary-900 via-slate-900 to-indigo-950 text-white p-8 relative overflow-hidden">

        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">

          <div className="space-y-3">

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/30 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Personalized Career Plan
            </span>

            <h1 className="text-3xl font-extrabold tracking-tight">
              {roadmap?.targetRole || 'Full Stack Developer'} Learning Roadmap
            </h1>

            <p className="text-slate-300 text-sm max-w-xl">
              Step-by-step learning plan generated from your ATS
              skill-gap analysis. Learn the missing skills and track
              your progress.
            </p>

            <div className="flex items-center gap-3 pt-2">

              <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-xs">
                <span className="font-bold text-white">
                  {totalSkills}
                </span>{' '}
                Total Skills
              </div>

              <button
                onClick={fetchRoadmap}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-xs flex items-center gap-2 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>

            </div>
          </div>

          {/* Completion */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 text-center border border-white/10 min-w-[210px]">

            <div className="text-4xl font-black text-primary-400">
              {progressPercent}%
            </div>

            <p className="text-xs text-slate-300 mt-1">
              Roadmap Completion
            </p>

            <div className="w-full bg-white/20 h-2.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-400 to-emerald-400 h-full transition-all duration-700"
                style={{
                  width: `${progressPercent}%`,
                }}
              />
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              {completedSkills} of {totalSkills} skills completed
            </p>

          </div>

        </div>
      </div>

      {/* ======================================================
          EMPTY STATE
      ====================================================== */}
      {totalSkills === 0 ? (

        <div className="card p-12 text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center">
            <Layers className="w-8 h-8 text-primary-500" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-5">
            Your roadmap is empty
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Go to Skill Gap Analysis and add your missing skills
            to your learning roadmap.
          </p>

          <button
            onClick={fetchRoadmap}
            className="btn-primary mt-5 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Roadmap
          </button>

        </div>

      ) : (

        <>
          {/* ==================================================
              PROGRESS CARDS
          ================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Pending */}
            <div className="card p-5 flex items-center gap-4">

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
                <Clock className="w-6 h-6" />
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pending Skills
                </p>

                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {pendingSkills} Skills
                </p>
              </div>

            </div>

            {/* In Progress */}
            <div className="card p-5 flex items-center gap-4">

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500">
                <BookOpen className="w-6 h-6" />
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  In Progress
                </p>

                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {inProgressSkills} Skills
                </p>
              </div>

            </div>

            {/* Completed */}
            <div className="card p-5 flex items-center gap-4">

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Completed Skills
                </p>

                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {completedSkills} Skills
                </p>
              </div>

            </div>

          </div>

          {/* ==================================================
              STATS BAR
          ================================================== */}
          <div className="card p-5">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Your Learning Journey
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {totalSkills} skills are currently in your roadmap.
                </p>
              </div>

              <div className="flex items-center gap-5 text-xs flex-wrap">

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  Pending: <strong>{pendingSkills}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  In Progress: <strong>{inProgressSkills}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Completed: <strong>{completedSkills}</strong>
                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              STAGES / MODULES
          ================================================== */}
          <div className="space-y-6">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary-500" />

                Learning Stages & Modules

                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">
                  {filteredItems.length}
                </span>
              </h2>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">

                <div className="flex items-center gap-1 mr-1 text-slate-400">
                  <Filter className="w-3.5 h-3.5" />
                </div>

                {[
                  'all',
                  'pending',
                  'in_progress',
                  'completed',
                ].map((filter) => (

                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${selectedFilter === filter
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                  >
                    {filter === 'all'
                      ? 'ALL'
                      : filter.replace('_', ' ').toUpperCase()}
                  </button>

                ))}

              </div>

            </div>

            {/* =================================================
                NO FILTER RESULTS
            ================================================= */}
            {filteredItems.length === 0 ? (

              <div className="card p-10 text-center">

                <Clock className="w-10 h-10 mx-auto text-slate-300" />

                <p className="mt-3 font-semibold text-slate-700 dark:text-slate-300">
                  No skills found
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  There are no skills matching the selected filter.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {filteredItems.map((item, idx) => {

                  const statusColors = {
                    completed:
                      'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20',

                    in_progress:
                      'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20',

                    pending:
                      'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900',
                  };

                  const statusTextColors = {
                    completed:
                      'text-emerald-600 dark:text-emerald-400',

                    in_progress:
                      'text-blue-600 dark:text-blue-400',

                    pending:
                      'text-slate-500 dark:text-slate-400',
                  };

                  return (

                    <div
                      key={item._id || `${item.skill}-${idx}`}
                      className={`card p-6 border-l-4 transition-all duration-200 hover:shadow-md ${statusColors[item.status] ||
                        statusColors.pending
                        }`}
                    >

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

                        {/* LEFT */}
                        <div className="space-y-3 flex-1">

                          <div className="flex flex-wrap items-center gap-3">

                            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                              Stage {item.stage}
                            </span>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                              {item.skill}
                            </h3>

                            <span
                              className={`text-xs px-2.5 py-0.5 font-semibold rounded-full capitalize ${statusTextColors[item.status] ||
                                statusTextColors.pending
                                }`}
                            >
                              {item.status.replace('_', ' ')}
                            </span>

                          </div>

                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {item.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">

                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-primary-500" />
                              Est. Duration: {item.estimatedHours} Hours
                            </span>

                            <span>•</span>

                            <span className="capitalize text-amber-600 dark:text-amber-400 font-medium">
                              Priority: {item.priority}
                            </span>

                            {item.hoursSpent > 0 && (
                              <>
                                <span>•</span>

                                <span>
                                  Hours Spent: {item.hoursSpent}
                                </span>
                              </>
                            )}

                          </div>

                        </div>

                        {/* RIGHT ACTIONS */}
                        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">

                          <select
                            value={item.status}
                            disabled={updatingSkill === item.skill}
                            onChange={(e) =>
                              handleStatusChange(
                                item.skill,
                                e.target.value
                              )
                            }
                            className="text-xs font-medium px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-none outline-none cursor-pointer disabled:opacity-50"
                          >
                            <option value="pending">
                              Mark Pending
                            </option>

                            <option value="in_progress">
                              Mark In Progress
                            </option>

                            <option value="completed">
                              Mark Completed
                            </option>
                          </select>

                          {updatingSkill === item.skill ? (

                            <div className="flex items-center gap-2 text-xs text-primary-500">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Updating...
                            </div>

                          ) : (

                            <ArrowRight className="w-4 h-4 text-slate-300" />

                          )}

                        </div>

                      </div>

                      {/* =================================================
                          DYNAMIC LEARNING RESOURCES
                      ================================================= */}
                      {Array.isArray(item.resources) &&
                        item.resources.length > 0 && (

                          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">

                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                  Recommended Learning Resources
                                </p>

                                <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1">
                                  Resources are automatically selected for this skill.
                                </p>
                              </div>

                              {item.resources[0]?.url && (
                                <a
                                  href={item.resources[0].url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-primary text-xs flex items-center justify-center gap-1.5 shrink-0"
                                >
                                  <PlayCircle className="w-4 h-4" />
                                  Start Learning
                                </a>
                              )}

                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                              {item.resources.map(
                                (resource, resourceIndex) => (

                                  <a
                                    key={
                                      resource._id ||
                                      `${resource.title}-${resourceIndex}`
                                    }
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between group transition-colors border border-transparent hover:border-primary-200 dark:hover:border-primary-900"
                                  >

                                    <div className="min-w-0 flex-1">

                                      <span className="block truncate">
                                        {resource.title ||
                                          'Learning Resource'}
                                      </span>

                                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">

                                        {resource.provider && (
                                          <span>
                                            {resource.provider}
                                          </span>
                                        )}

                                        {resource.type && (
                                          <>
                                            <span>•</span>
                                            <span className="capitalize">
                                              {resource.type}
                                            </span>
                                          </>
                                        )}

                                        {resource.isFree === true && (
                                          <>
                                            <span>•</span>
                                            <span className="text-emerald-500 font-semibold">
                                              Free
                                            </span>
                                          </>
                                        )}

                                      </div>

                                    </div>

                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-500 shrink-0 ml-3" />

                                  </a>

                                )
                              )}

                            </div>

                          </div>

                        )}

                      {/* =================================================
                          NO RESOURCE FALLBACK
                      ================================================= */}
                      {(!Array.isArray(item.resources) ||
                        item.resources.length === 0) && (

                          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">

                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <BookOpen className="w-4 h-4 text-primary-500" />

                              <span>
                                Learning resources are being prepared for{' '}
                                <strong>{item.skill}</strong>.
                              </span>
                            </div>

                          </div>

                        )}

                    </div>

                  );
                })}

              </div>

            )}

          </div>
        </>
      )}

    </div>
  );
}