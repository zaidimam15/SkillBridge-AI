import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, PlusCircle, Users, CheckCircle2, Clock, 
  Search, ArrowRight, Sparkles, Filter, Briefcase, Award 
} from 'lucide-react';
import { recruiterAPI } from '../../services/api';

export default function RecruiterDashboard() {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await recruiterAPI.getDashboard();
      if (res.data.success) {
        setStats(res.data.stats);
        setJobs(res.data.jobs || []);
      } else {
        setStats(defaultDemoRecruiterStats);
        setJobs(defaultDemoRecruiterJobs);
      }
    } catch (err) {
      console.warn('Using demo recruiter data:', err);
      setStats(defaultDemoRecruiterStats);
      setJobs(defaultDemoRecruiterJobs);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="card bg-gradient-to-r from-slate-900 via-indigo-950 to-primary-950 text-white p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/30 inline-flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Corporate Recruiter Portal
            </span>
            <h1 className="text-3xl font-black tracking-tight">Recruiter Dashboard</h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Post job openings, bulk-screen student resumes with AI ATS scoring, filter top talent, and manage human shortlist decisions transparently.
            </p>
          </div>

          <Link to="/recruiter/create-job" className="btn-primary flex items-center gap-2 self-start md:self-auto shrink-0">
            <PlusCircle className="w-5 h-5" /> Post New Job
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-500">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Job Postings</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats?.activeJobs || 6}
            </p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Resumes Screened</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats?.totalScreened || 142}
            </p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Shortlisted Candidates</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats?.shortlistedCount || 28}
            </p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg ATS Compatibility</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats?.avgMatchScore || 76}%
            </p>
          </div>
        </div>
      </div>

      {/* Recent Job Openings & Screening Shortcuts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary-500" />
            Your Posted Job Openings
          </h2>
          <Link to="/recruiter/jobs" className="text-xs font-semibold text-primary-500 hover:text-primary-600 flex items-center gap-1">
            View All Jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.slice(0, 4).map((job, idx) => (
            <div key={job._id || idx} className="card p-6 flex flex-col justify-between hover:shadow-lg transition-all border border-slate-200 dark:border-slate-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    {job.status || 'Active'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Posted: {new Date(job.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {job.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  🏢 {job.company || 'TechCorp Systems'} • 📍 {job.location || 'Remote'}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {job.requiredSkills?.slice(0, 5).map((sk, sIdx) => (
                    <span key={sIdx} className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-primary-500" />
                  {job.applicantCount || 24} Candidates Screened
                </span>
                <Link
                  to={`/recruiter/jobs/${job._id || 'job-1'}/candidates`}
                  className="btn-primary text-xs flex items-center gap-1"
                >
                  Screen Candidates <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const defaultDemoRecruiterStats = {
  activeJobs: 4,
  totalScreened: 128,
  shortlistedCount: 32,
  avgMatchScore: 74,
};

const defaultDemoRecruiterJobs = [
  {
    _id: 'job-1',
    title: 'Senior Full Stack Software Engineer',
    company: 'NexusTech Global',
    location: 'Bangalore (Hybrid)',
    status: 'active',
    applicantCount: 42,
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'Docker', 'REST APIs'],
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'job-2',
    title: 'Backend Systems Engineer',
    company: 'CloudScale Labs',
    location: 'Remote',
    status: 'active',
    applicantCount: 31,
    requiredSkills: ['Python', 'PostgreSQL', 'Docker', 'Redis', 'Microservices'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  }
];
