import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, PlusCircle, Trash2, Edit3, Users, 
  Search, CheckCircle2, ArrowRight, Eye, AlertCircle 
} from 'lucide-react';
import { jobAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function JobManagementPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobAPI.getAll({ search });
      if (res.data.success && res.data.jobs.length > 0) {
        setJobs(res.data.jobs);
      } else {
        setJobs(defaultDemoJobList);
      }
    } catch (err) {
      console.warn('Using demo job list fallback:', err);
      setJobs(defaultDemoJobList);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete job "${title}"?`)) return;
    try {
      await jobAPI.delete(id);
      setJobs(prev => prev.filter(j => j._id !== id));
      toast.success('Job deleted.');
    } catch (err) {
      toast.error('Failed to delete job.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-primary-500" />
            Job Management Portal
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage your corporate listings, monitor applicant volumes, and launch candidate screening dashboards.
          </p>
        </div>

        <Link to="/recruiter/create-job" className="btn-primary flex items-center gap-2 self-start md:self-auto">
          <PlusCircle className="w-4 h-4" /> Create New Job
        </Link>
      </div>

      {/* Jobs Table Card */}
      <div className="card p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Job Postings</h2>
          <span className="text-xs text-slate-500 font-medium">{jobs.length} Total Jobs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Job Title</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Required Skills</th>
                <th className="py-3 px-4">Candidates Screened</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {jobs.map((job) => (
                <tr key={job._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                    <div>
                      {job.title}
                      <span className="block text-xs font-normal text-slate-500">{job.company || 'TechCorp'}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-slate-600 dark:text-slate-400 text-xs">
                    {job.location || 'Remote'}
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {job.requiredSkills?.slice(0, 4).map((sk, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 text-xs">
                      <Users className="w-3.5 h-3.5" />
                      {job.applicantCount || 24} Screened
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/recruiter/jobs/${job._id}/candidates`}
                        className="btn-primary text-xs flex items-center gap-1 py-1.5 px-3"
                      >
                        Screen <ArrowRight className="w-3 h-3" />
                      </Link>

                      <button
                        onClick={() => handleDeleteJob(job._id, job.title)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const defaultDemoJobList = [
  {
    _id: 'job-1',
    title: 'Senior Full Stack Software Engineer',
    company: 'NexusTech Global',
    location: 'Bangalore (Hybrid)',
    applicantCount: 42,
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'Docker', 'REST APIs'],
  },
  {
    _id: 'job-2',
    title: 'Backend Systems Engineer',
    company: 'CloudScale Labs',
    location: 'Remote',
    applicantCount: 31,
    requiredSkills: ['Python', 'PostgreSQL', 'Docker', 'Redis', 'Microservices'],
  }
];
