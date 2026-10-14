import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, Calendar, ArrowRight, Award, FileText, 
  TrendingUp, CheckCircle2, Clock, Sparkles, Filter 
} from 'lucide-react';
import { analysisAPI } from '../../services/api';

export default function AnalysisHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await analysisAPI.getHistory();
      if (res.data.success && res.data.analyses.length > 0) {
        setHistory(res.data.analyses);
      } else {
        setHistory(defaultDemoHistory);
      }
    } catch (err) {
      console.warn('Using demo analysis history:', err);
      setHistory(defaultDemoHistory);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary-500" />
            ATS Analysis History & Progress
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Review past resume screening diagnostics, track ATS score improvements, and audit missing skill changes over time.
          </p>
        </div>

        <Link to="/dashboard/upload" className="btn-primary flex items-center gap-2 self-start md:self-auto">
          <Sparkles className="w-4 h-4" /> Run New ATS Analysis
        </Link>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Loading analysis history...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, idx) => {
            const scoreColor =
              item.atsScore >= 75
                ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                : item.atsScore >= 50
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                : 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';

            return (
              <div
                key={item._id || idx}
                className="card p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left Metadata */}
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-2xl border text-center min-w-[90px] ${scoreColor}`}>
                      <div className="text-2xl font-black">{item.atsScore}%</div>
                      <div className="text-[10px] uppercase font-bold tracking-wider mt-0.5">ATS Match</div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {item.targetRole || 'Full Stack Developer'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {item.resumeName || 'Resume_v2.pdf'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </p>

                      <div className="flex items-center gap-4 text-xs pt-2">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {item.matchedSkillsCount || item.matchedSkills?.length || 8} Matched Skills
                        </span>
                        <span className="text-rose-500 dark:text-rose-400 font-semibold flex items-center gap-1">
                          {item.missingSkillsCount || item.missingSkills?.length || 4} Missing Skills
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="flex items-center gap-3 self-start md:self-auto">
                    <Link
                      to={`/dashboard/analysis/${item._id}`}
                      className="btn-secondary text-xs flex items-center gap-1.5"
                    >
                      View Full Analysis <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to={`/dashboard/skill-gap/${item._id}`}
                      className="btn-primary text-xs flex items-center gap-1.5"
                    >
                      Skill-Gap Breakdown
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const defaultDemoHistory = [
  {
    _id: 'ana-1',
    targetRole: 'Full Stack Developer',
    atsScore: 78,
    resumeName: 'Alex_Morgan_SoftwareEngineer_v2.pdf',
    createdAt: new Date().toISOString(),
    matchedSkillsCount: 10,
    missingSkillsCount: 3,
  },
  {
    _id: 'ana-2',
    targetRole: 'Backend Systems Engineer',
    atsScore: 64,
    resumeName: 'Alex_Morgan_Resume_v1.pdf',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    matchedSkillsCount: 7,
    missingSkillsCount: 6,
  }
];
