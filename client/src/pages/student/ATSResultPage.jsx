import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2, XCircle, AlertCircle, BarChart2, Target, Map,
  ArrowRight, BookOpen, Code2, TrendingUp, Download, Share2,
  Info, Star, Zap, Shield, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { analysisAPI } from '../../services/api';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';

function ScoreRing({ score, size = 160 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const getColor = (s) => s >= 75 ? '#22c55e' : s >= 60 ? '#3b82f6' : s >= 45 ? '#f59e0b' : '#ef4444';
  const getLabel = (s) => s >= 75 ? 'Excellent Match' : s >= 60 ? 'Good Match' : s >= 45 ? 'Moderate Match' : 'Low Match';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor"
            strokeWidth="12" className="text-slate-200 dark:text-slate-700" />
          <circle cx={size/2} cy={size/2} r={radius} fill="none"
            stroke={getColor(score)} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className="text-4xl font-black text-slate-900 dark:text-slate-100">{score}</span>
          <span className="text-sm text-slate-500">/ 100</span>
        </div>
      </div>
      <span className="font-bold text-lg" style={{ color: getColor(score) }}>{getLabel(score)}</span>
    </div>
  );
}

function SkillBadge({ skill, tier }) {
  const tierClass = {
    strong: 'tier-strong border',
    moderate: 'tier-moderate border',
    priority: 'tier-priority border',
    recommended: 'tier-recommended border',
  };
  const tierIcon = {
    strong: '✅',
    moderate: '🔵',
    priority: '🔴',
    recommended: '⚠️',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${tierClass[tier] || 'badge-gray'}`}>
      <span>{tierIcon[tier]}</span>
      {skill}
    </span>
  );
}

function CollapsibleSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-left mb-2">
        <h3 className="font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && children}
    </div>
  );
}

export default function ATSResultPage() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await analysisAPI.getById(id);
        setAnalysis(res.data.analysis);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analysis.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-60" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="skeleton h-80 rounded-2xl lg:col-span-1" />
          <div className="skeleton h-80 rounded-2xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-16">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">{error}</p>
        <Link to="/dashboard" className="btn btn-primary mt-4">Back to Dashboard</Link>
      </div>
    );
  }

  const { atsScore, skillBreakdown, scoreBreakdown, explanation, matchedSkills, missingSkills,
    learningRecommendations, projectRecommendations, careerCompatibility, job, resume, disclaimer,
    algorithmVersion, cosineSimilarity } = analysis;

  // Breakdown bar chart data
  const breakdownData = [
    { name: 'Skill Coverage', value: scoreBreakdown?.skillCoverage || 0, color: '#6366f1' },
    { name: 'Keywords', value: scoreBreakdown?.keywordAlignment || 0, color: '#3b82f6' },
    { name: 'Education', value: scoreBreakdown?.educationAlignment || 0, color: '#10b981' },
    { name: 'Experience', value: scoreBreakdown?.experienceAlignment || 0, color: '#f59e0b' },
    { name: 'Resume Quality', value: scoreBreakdown?.resumeQuality || 0, color: '#f97316' },
  ];

  // Radar data
  const radarData = breakdownData.map(d => ({ subject: d.name.split(' ')[0], A: d.value, fullMark: 100 }));

  // Career compatibility top 5
  const topCareers = (careerCompatibility || []).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/dashboard/history" className="text-slate-400 hover:text-slate-600 text-sm">← Analysis History</Link>
          </div>
          <h1 className="section-title">ATS Analysis Report</h1>
          <p className="section-subtitle">
            {job?.title} at {job?.company || 'Ad-hoc Analysis'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/dashboard/skill-gap/${id}`} className="btn btn-secondary">
            <Target className="w-4 h-4" />
            Skill Gap Detail
          </Link>
        </div>
      </div>

      {/* Algorithm Info Banner */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-2.5 flex flex-wrap gap-4 items-center text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-primary-500" />
          Algorithm: TF-IDF + Cosine Similarity
        </span>
        <span>Version: {algorithmVersion}</span>
        <span>Cosine Similarity: {(cosineSimilarity * 100).toFixed(1)}%</span>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Ring */}
        <div className="card flex flex-col items-center justify-center py-8">
          <ScoreRing score={atsScore} />
          <div className="mt-4 text-center space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {explanation?.summary}
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <span className="badge badge-success">{skillBreakdown?.strong?.length || 0} Strong</span>
              <span className="badge badge-info">{skillBreakdown?.moderate?.length || 0} Moderate</span>
              <span className="badge badge-danger">{skillBreakdown?.priority?.length || 0} Priority</span>
              <span className="badge badge-warning">{skillBreakdown?.recommended?.length || 0} Recommended</span>
            </div>
          </div>
        </div>

        {/* Score Breakdown Chart */}
        <div className="card lg:col-span-2">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Score Breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={breakdownData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v}%`]}
              />
              <Bar dataKey="value" radius={4}>
                {breakdownData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Explanation boxes */}
          {explanation?.whatImproved?.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {explanation.whatImproved.map((item, i) => (
                <div key={i} className="flex gap-2 text-sm bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-700/30 rounded-xl p-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-emerald-800 dark:text-emerald-300">{item}</span>
                </div>
              ))}
              {explanation.whatCanImprove?.map((item, i) => (
                <div key={i} className="flex gap-2 text-sm bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/30 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-amber-800 dark:text-amber-300">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Skill Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <CollapsibleSection title={`✅ Matched Skills (${matchedSkills?.length || 0})`}>
          <div className="space-y-3 mt-3">
            {skillBreakdown?.strong?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">STRONG MATCH (high-weight JD skills)</p>
                <div className="flex flex-wrap gap-2">
                  {skillBreakdown.strong.map(s => <SkillBadge key={s} skill={s} tier="strong" />)}
                </div>
              </div>
            )}
            {skillBreakdown?.moderate?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">MODERATE MATCH</p>
                <div className="flex flex-wrap gap-2">
                  {skillBreakdown.moderate.map(s => <SkillBadge key={s} skill={s} tier="moderate" />)}
                </div>
              </div>
            )}
            {(!skillBreakdown?.strong?.length && !skillBreakdown?.moderate?.length) && (
              <p className="text-slate-400 text-sm">No matched skills found</p>
            )}
          </div>
        </CollapsibleSection>

        {/* Missing Skills */}
        <CollapsibleSection title={`🎯 Missing Skills (${missingSkills?.length || 0})`}>
          <div className="space-y-3 mt-3">
            {skillBreakdown?.priority?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">PRIORITY — Must Learn</p>
                <div className="flex flex-wrap gap-2">
                  {skillBreakdown.priority.map(s => <SkillBadge key={s} skill={s} tier="priority" />)}
                </div>
              </div>
            )}
            {skillBreakdown?.recommended?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">RECOMMENDED</p>
                <div className="flex flex-wrap gap-2">
                  {skillBreakdown.recommended.map(s => <SkillBadge key={s} skill={s} tier="recommended" />)}
                </div>
              </div>
            )}
            {(!skillBreakdown?.priority?.length && !skillBreakdown?.recommended?.length) && (
              <p className="text-emerald-600 dark:text-emerald-400 text-sm">🎉 No critical missing skills! Great profile for this role.</p>
            )}
            {missingSkills?.length > 0 && (
              <Link to={`/dashboard/skill-gap/${id}`} className="inline-flex items-center gap-1 text-primary-600 text-sm font-semibold hover:underline mt-2">
                View full skill gap analysis <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </CollapsibleSection>
      </div>

      {/* Learning Recommendations */}
      {learningRecommendations?.length > 0 && (
        <CollapsibleSection title="📚 Personalized Learning Recommendations">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            {learningRecommendations.map((rec, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{rec.skill}</span>
                  <span className="badge badge-danger text-xs">{rec.priority} priority</span>
                </div>
                <div className="space-y-2">
                  {rec.resources?.map((r, j) => (
                    <a key={j} href={r.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between text-xs bg-white dark:bg-slate-800 rounded-lg px-3 py-2 hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-colors group">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{r.title}</p>
                        <p className="text-slate-500">{r.provider} • {r.type}</p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-primary-500" />
                    </a>
                  ))}
                </div>
                <Link
                  to="/dashboard/roadmap"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-primary-600 font-semibold hover:underline"
                >
                  <Map className="w-3 h-3" /> Add to Roadmap
                </Link>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Capstone Projects */}
      {projectRecommendations?.length > 0 && (
        <CollapsibleSection title="💻 Recommended Capstone Projects">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            {projectRecommendations.map((proj, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="badge badge-purple mb-2">{proj.difficulty}</div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">{proj.title}</h4>
                <p className="text-xs text-slate-500 mb-2">
                  Bridges gap for: <span className="text-amber-600 font-medium">{proj.targetSkill}</span>
                </p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {proj.technologies?.map(t => <span key={t} className="badge badge-gray text-xs">{t}</span>)}
                </div>
                <p className="text-xs text-slate-400">~{proj.estimatedHours}h estimated</p>
              </div>
            ))}
          </div>
          <Link to="/dashboard/projects" className="inline-flex items-center gap-1 mt-3 text-sm text-primary-600 font-semibold hover:underline">
            View all capstone projects <ArrowRight className="w-4 h-4" />
          </Link>
        </CollapsibleSection>
      )}

      {/* Career Compatibility */}
      {topCareers.length > 0 && (
        <CollapsibleSection title="🚀 Career Role Compatibility" defaultOpen={false}>
          <div className="space-y-3 mt-3">
            {topCareers.map((career, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{career.role}</div>
                <div className="flex-1 progress-bar h-3">
                  <div
                    className={`progress-fill ${career.compatibility >= 70 ? 'bg-emerald-500' : career.compatibility >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                    style={{ width: `${career.compatibility}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 w-12 text-right">{career.compatibility}%</span>
              </div>
            ))}
          </div>
          <Link to="/dashboard/careers" className="inline-flex items-center gap-1 mt-3 text-sm text-primary-600 font-semibold hover:underline">
            Explore all career pathways <ArrowRight className="w-4 h-4" />
          </Link>
        </CollapsibleSection>
      )}

      {/* Disclaimer */}
      <div className="disclaimer-box">
        <Shield className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1">Academic Methodology Disclaimer</p>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {disclaimer || 'ATS Compatibility Score represents similarity calculated by SkillBridge AI using TF-IDF Vectorization and Cosine Similarity. This is an academic indicator and may differ from proprietary employer ATS systems. Human review is always required for final hiring decisions.'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link to={`/dashboard/skill-gap/${id}`} className="btn btn-primary">
          <Target className="w-4 h-4" />
          View Skill Gap Report
        </Link>
        <Link to="/dashboard/roadmap" className="btn btn-secondary">
          <Map className="w-4 h-4" />
          My Learning Roadmap
        </Link>
        <Link to="/dashboard/upload" className="btn btn-secondary">
          <Zap className="w-4 h-4" />
          New Analysis
        </Link>
      </div>
    </div>
  );
}
