import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2, Target, Map, Code2, TrendingUp, Upload, ArrowRight,
  Zap, FileText, CheckCircle2, Clock, Award, AlertCircle,
  BookOpen, Activity, Sparkles, FolderGit2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resumeAPI, analysisAPI, roadmapAPI, careerAPI, projectAPI } from '../../services/api';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area
} from 'recharts';

function StatCard({ icon: Icon, label, value, sub, color, to }) {
  const content = (
    <div className={`card-hover group relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${color} opacity-5 -translate-y-4 translate-x-4`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {to && <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />}
      </div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

function ScoreRing({ score, size = 120 }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 75) return '#22c55e';
    if (s >= 60) return '#3b82f6';
    if (s >= 45) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-700" />
      <circle
        cx={size/2} cy={size/2} r={radius}
        fill="none" stroke={getColor(score)} strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
      />
    </svg>
  );
}

function SmartNextAction({ latestAnalysis, bestCareer }) {
  const top = latestAnalysis?.skillBreakdown?.priority?.[0] || bestCareer?.missingRequiredSkills?.[0];
  return (
    <div className="card border-l-4 border-primary-500 bg-primary-50/50 dark:bg-primary-950/20">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Smart Next Action</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            {top
              ? `Recommended priority: Add ${top} to your roadmap to strengthen your career match.`
              : `Upload your resume to receive AI parsing, ATS analysis, and career recommendations.`}
          </p>
          <Link
            to={top ? '/dashboard/roadmap' : '/dashboard/upload'}
            className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary-600 hover:underline"
          >
            {top ? `Add ${top} to Roadmap` : 'Upload Resume'} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [progress, setProgress] = useState(null);
  const [careerData, setCareerData] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [resumeRes, analysisRes, progressRes, careerRes, projectsRes] = await Promise.allSettled([
          resumeAPI.getAll(),
          analysisAPI.getHistory({ limit: 10 }),
          roadmapAPI.get(),
          careerAPI.getAll(),
          projectAPI.getUserProjects(),
        ]);

        if (resumeRes.status === 'fulfilled') setResumes(resumeRes.value.data.resumes || []);
        if (analysisRes.status === 'fulfilled') setAnalyses(analysisRes.value.data.analyses || []);
        if (progressRes.status === 'fulfilled') setProgress(progressRes.value.data.progress);
        if (careerRes.status === 'fulfilled' && careerRes.value?.data?.success) {
          setCareerData(careerRes.value.data);
        }
        if (projectsRes.status === 'fulfilled' && projectsRes.value?.data?.success) {
          setUserProjects(projectsRes.value.data.projects || []);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const latestAnalysis = analyses[0];
  const latestResume = resumes[0];
  const latestScore = latestAnalysis?.atsScore;
  const completedSkills = progress?.skillProgress?.filter(s => s.status === 'completed')?.length || 0;
  const completedProjects = progress?.projectProgress?.filter(p => p.status === 'completed')?.length || 0;
  const inProgressSkills = progress?.skillProgress?.filter(s => s.status === 'in_progress')?.length || 0;

  // Score history chart data
  const scoreHistory = analyses.slice().reverse().map((a, i) => ({
    date: new Date(a.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    score: a.atsScore,
    role: a.targetRole || 'Analysis',
  }));

  // Radar chart for score breakdown
  const latestBreakdown = latestAnalysis?.scoreBreakdown;
  const radarData = latestBreakdown ? [
    { subject: 'Skills', A: latestBreakdown.skillCoverage || 0, fullMark: 100 },
    { subject: 'Keywords', A: latestBreakdown.keywordAlignment || 0, fullMark: 100 },
    { subject: 'Education', A: latestBreakdown.educationAlignment || 0, fullMark: 100 },
    { subject: 'Experience', A: latestBreakdown.experienceAlignment || 0, fullMark: 100 },
    { subject: 'Resume Quality', A: latestBreakdown.resumeQuality || 0, fullMark: 100 },
  ] : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-60 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="skeleton h-64 rounded-2xl lg:col-span-2" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="section-title">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="section-subtitle">Here's your career readiness overview</p>
        </div>
        <Link to="/dashboard/upload" id="upload-resume-btn" className="btn btn-primary">
          <Upload className="w-4 h-4" />
          Upload New Resume
        </Link>
      </div>

      {/* Smart Next Action */}
      <SmartNextAction latestAnalysis={latestAnalysis} bestCareer={careerData?.bestCareer} />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={BarChart2}
          label="Latest ATS Score"
          value={latestScore ? `${latestScore}%` : '—'}
          sub={latestScore ? (latestScore >= 70 ? 'Good match' : 'Needs upskilling') : 'Run an analysis'}
          color="from-primary-500 to-indigo-600"
          to={latestAnalysis ? `/dashboard/analysis/${latestAnalysis._id}` : '/dashboard/upload'}
        />
        <StatCard
          icon={FileText}
          label="Resume Uploaded"
          value={resumes.length ? `${resumes.length} ${resumes.length === 1 ? 'file' : 'files'}` : '0'}
          sub={latestResume ? `Status: ${latestResume.parseStatus || 'completed'}` : 'No resume uploaded'}
          color="from-blue-500 to-cyan-500"
          to="/dashboard/resumes"
        />
        <StatCard
          icon={TrendingUp}
          label="Best Career Path"
          value={careerData?.bestCareer ? `${careerData.bestCareer.matchScore}%` : '—'}
          sub={careerData?.bestCareer ? careerData.bestCareer.title : 'Upload resume to match'}
          color="from-emerald-500 to-teal-500"
          to="/dashboard/careers"
        />
        <StatCard
          icon={CheckCircle2}
          label="Roadmap Skills"
          value={completedSkills + inProgressSkills}
          sub={inProgressSkills > 0 ? `${inProgressSkills} in progress` : (completedSkills > 0 ? `${completedSkills} completed` : 'Add from Skill Gap')}
          color="from-orange-500 to-red-500"
          to="/dashboard/roadmap"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ATS Score History */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-slate-100">ATS Score History</h2>
            <Link to="/dashboard/history" className="text-xs text-primary-600 hover:underline">View all →</Link>
          </div>
          {scoreHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={scoreHistory}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#6366f1' }}
                  formatter={(v) => [`${v}%`, 'ATS Score']}
                />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fill="url(#scoreGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400">
              <BarChart2 className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No analysis history yet</p>
              <Link to="/dashboard/upload" className="text-primary-500 text-xs mt-2 hover:underline">
                Upload a resume to get started →
              </Link>
            </div>
          )}
        </div>

        {/* Score Breakdown Radar */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-slate-100">Score Breakdown</h2>
            {latestAnalysis && (
              <div className="flex flex-col items-end">
                <div className="text-2xl font-black gradient-text">{latestScore}%</div>
                <div className="text-xs text-slate-500">Latest</div>
              </div>
            )}
          </div>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400">
              <Target className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm text-center">Run an analysis to see your score breakdown</p>
            </div>
          )}
        </div>
      </div>

      {/* Latest Analysis + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Analysis Summary */}
        {latestAnalysis ? (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Latest Analysis</h2>
              <Link to={`/dashboard/analysis/${latestAnalysis._id}`} className="text-xs text-primary-600 hover:underline">
                Full report →
              </Link>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <ScoreRing score={latestAnalysis.atsScore} size={90} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black text-slate-900 dark:text-slate-100">{latestAnalysis.atsScore}</span>
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{latestAnalysis.job?.title || 'ATS Analysis'}</p>
                <p className="text-sm text-slate-500">{latestAnalysis.job?.company}</p>
                <div className="flex gap-2 mt-2">
                  <span className="badge badge-success">{latestAnalysis.matchedSkills?.length || 0} matched</span>
                  <span className="badge badge-danger">{latestAnalysis.missingSkills?.length || 0} missing</span>
                </div>
              </div>
            </div>
            <div className="disclaimer-box text-xs">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <span className="text-amber-700 dark:text-amber-300">
                ATS score is an academic indicator based on TF-IDF + Cosine Similarity, not a hiring guarantee.
              </span>
            </div>
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center py-10 text-center">
            <BarChart2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">No Analysis Yet</h3>
            <p className="text-slate-400 text-sm mb-4">Upload your resume and analyze against a job to see results</p>
            <Link to="/dashboard/upload" className="btn btn-primary">
              <Upload className="w-4 h-4" /> Get Started
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Upload, label: 'Upload Resume', to: '/dashboard/upload', color: 'from-primary-500 to-indigo-600' },
              { icon: BarChart2, label: 'View Analysis', to: '/dashboard/history', color: 'from-blue-500 to-cyan-500' },
              { icon: Map, label: 'My Roadmap', to: '/dashboard/roadmap', color: 'from-violet-500 to-purple-600' },
              { icon: TrendingUp, label: 'Career Paths', to: '/dashboard/careers', color: 'from-emerald-500 to-teal-600' },
              { icon: Code2, label: 'Projects', to: '/dashboard/projects', color: 'from-orange-500 to-red-500' },
              { icon: Target, label: 'Skill Gap', to: latestAnalysis ? `/dashboard/skill-gap/${latestAnalysis._id}` : '/dashboard/upload', color: 'from-red-500 to-pink-600' },
            ].map(action => (
              <Link
                key={action.label}
                to={action.to}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Active Capstone Projects Workspace Tracking */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-primary-500" />
              Active Capstone Projects
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track your persistent portfolio projects, milestones, and deliverables
            </p>
          </div>
          <Link
            to="/dashboard/projects"
            className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1"
          >
            Explore Projects <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {userProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userProjects.map((proj) => (
              <div
                key={proj._id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 flex flex-col justify-between hover:border-primary-500/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
                      {proj.category}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {proj.status} ({proj.progress || 0}%)
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {proj.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-primary-500 h-full rounded-full transition-all"
                      style={{ width: `${proj.progress || 0}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {proj.milestones?.filter((m) => m.completed).length || 0} of {proj.milestones?.length || 0} milestones
                    </span>
                    <Link
                      to={`/dashboard/projects/${proj._id}`}
                      className="text-xs font-semibold text-primary-600 hover:text-primary-500 flex items-center gap-1"
                    >
                      Open Workspace <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <Code2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Projects Started Yet</p>
            <p className="text-xs text-slate-400 mt-1 mb-3">Choose a recommended capstone project and click Start Build to launch your workspace</p>
            <Link to="/dashboard/projects" className="btn btn-primary text-xs">
              <FolderGit2 className="w-3.5 h-3.5" /> Recommended Projects
            </Link>
          </div>
        )}
      </div>

      {/* Timeline */}
      {progress?.timeline && progress.timeline.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-slate-100">Career Readiness Timeline</h2>
          </div>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-4 ml-10">
              {progress.timeline.slice(-6).reverse().map((event, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-10 w-5 h-5 rounded-full bg-primary-500 border-2 border-white dark:border-slate-800 top-0.5" />
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{event.event}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
