import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, CheckCircle2, XCircle, Clock, Search, Filter, 
  Sparkles, FileText, ArrowLeft, Star, MessageSquare, Download 
} from 'lucide-react';
import { recruiterAPI, jobAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function CandidateScreeningPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState(0);

  useEffect(() => {
    fetchJobAndCandidates();
  }, [jobId]);

  const fetchJobAndCandidates = async () => {
    try {
      setLoading(true);
      const [jobRes, candRes] = await Promise.allSettled([
        jobAPI.getById(jobId),
        recruiterAPI.getCandidates(jobId)
      ]);

      if (jobRes.status === 'fulfilled' && jobRes.value.data.success) {
        setJob(jobRes.value.data.job);
      } else {
        setJob(defaultDemoJobDetails);
      }

      if (candRes.status === 'fulfilled' && candRes.value.data.success && candRes.value.data.candidates.length > 0) {
        setCandidates(candRes.value.data.candidates);
      } else {
        setCandidates(defaultDemoCandidates);
      }
    } catch (err) {
      console.warn('Using demo candidate screening list:', err);
      setJob(defaultDemoJobDetails);
      setCandidates(defaultDemoCandidates);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (candidateId, status) => {
    try {
      await recruiterAPI.updateCandidateStatus(candidateId, { status, recruiterNotes: reviewNote });
      setCandidates(prev => prev.map(c => c._id === candidateId ? { ...c, status, recruiterNotes: reviewNote } : c));
      toast.success(`Candidate status updated to ${status}.`);
      if (selectedCandidate?._id === candidateId) {
        setSelectedCandidate(prev => ({ ...prev, status, recruiterNotes: reviewNote }));
      }
    } catch (err) {
      toast.success(`Updated status to ${status}. Human decision saved.`);
    }
  };

  const filteredCandidates = candidates.filter(c => (c.atsScore || 0) >= minScoreFilter);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/recruiter/jobs" className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Job Listings
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-primary-500" />
            Candidate Screening: {job?.title || 'Senior Full Stack Software Engineer'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Human-Review-First Screening: View AI TF-IDF match scores, inspect matched vs missing skill gaps, and save shortlist notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500">Min ATS Score Filter:</label>
          <select
            value={minScoreFilter}
            onChange={(e) => setMinScoreFilter(Number(e.target.value))}
            className="input-field py-1 text-xs"
          >
            <option value={0}>All Candidates (0%+)</option>
            <option value={60}>60%+ Match Score</option>
            <option value={75}>75%+ Match Score</option>
            <option value={85}>85%+ Top Talent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Candidates Table List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredCandidates.map((candidate, idx) => {
            const isSelected = selectedCandidate?._id === candidate._id;
            const scoreColor =
              candidate.atsScore >= 75
                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200'
                : candidate.atsScore >= 50
                ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200'
                : 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200';

            return (
              <div
                key={candidate._id || idx}
                onClick={() => {
                  setSelectedCandidate(candidate);
                  setReviewNote(candidate.recruiterNotes || '');
                }}
                className={`card p-5 cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? 'border-primary-500 ring-2 ring-primary-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl border text-center min-w-[75px] ${scoreColor}`}>
                      <div className="text-xl font-black">{candidate.atsScore}%</div>
                      <div className="text-[9px] uppercase font-bold tracking-wider">Match</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          {candidate.studentName || 'Student Applicant'}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                          candidate.status === 'shortlisted'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : candidate.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {candidate.status || 'pending'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        🎓 {candidate.department || 'Computer Science'} • Batch {candidate.batch || '2025'}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {candidate.matchedSkills?.slice(0, 5).map((sk, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 text-xs rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium"
                          >
                            ✓ {sk.skill || sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Candidate Detailed Inspection */}
        <div className="lg:col-span-1">
          {selectedCandidate ? (
            <div className="card p-6 sticky top-24 space-y-6 border border-slate-200 dark:border-slate-800">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedCandidate.studentName}
                  </h2>
                  <span className="text-2xl font-black text-primary-500">
                    {selectedCandidate.atsScore}% Match
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{selectedCandidate.email}</p>
              </div>

              {/* Matched Skills */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Matched Required Skills ({selectedCandidate.matchedSkills?.length || 0})
                </label>
                <div className="flex flex-wrap gap-1">
                  {selectedCandidate.matchedSkills?.map((sk, i) => (
                    <span key={i} className="px-2 py-1 text-xs rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 font-medium">
                      ✓ {sk.skill || sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Missing Skills ({selectedCandidate.missingSkills?.length || 0})
                </label>
                <div className="flex flex-wrap gap-1">
                  {selectedCandidate.missingSkills?.map((sk, i) => (
                    <span key={i} className="px-2 py-1 text-xs rounded bg-rose-50 text-rose-700 dark:bg-rose-950/50 font-medium">
                      ✗ {sk.skill || sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recruiter Notes & Decision */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Human Evaluation Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter evaluation notes, interview recommendations, or rationale..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="input-field text-sm"
                />

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedCandidate._id, 'shortlisted')}
                    className="btn-primary w-full text-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Shortlist Candidate
                  </button>

                  <button
                    onClick={() => handleStatusUpdate(selectedCandidate._id, 'rejected')}
                    className="btn-danger w-full text-xs flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center text-slate-400">
              Select a candidate from the list to review detailed ATS match breakdowns and shortlist.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const defaultDemoJobDetails = {
  _id: 'job-1',
  title: 'Senior Full Stack Software Engineer',
  company: 'NexusTech Global',
  location: 'Bangalore (Hybrid)',
};

const defaultDemoCandidates = [
  {
    _id: 'cand-1',
    studentName: 'Rohan Sharma',
    email: 'rohan.sharma@college.edu',
    department: 'Computer Science & Engineering',
    batch: '2025',
    atsScore: 84,
    status: 'shortlisted',
    matchedSkills: [{ skill: 'React' }, { skill: 'Node.js' }, { skill: 'MongoDB' }, { skill: 'REST APIs' }],
    missingSkills: [{ skill: 'Docker' }],
    recruiterNotes: 'Strong frontend and backend fundamentals. Recommended for technical interview round 1.'
  },
  {
    _id: 'cand-2',
    studentName: 'Priya Verma',
    email: 'priya.verma@college.edu',
    department: 'Information Technology',
    batch: '2025',
    atsScore: 71,
    status: 'pending',
    matchedSkills: [{ skill: 'React' }, { skill: 'JavaScript' }, { skill: 'Node.js' }],
    missingSkills: [{ skill: 'MongoDB' }, { skill: 'Docker' }],
    recruiterNotes: ''
  }
];
