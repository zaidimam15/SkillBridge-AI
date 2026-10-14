import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, Sparkles, Building2, MapPin, DollarSign, 
  Tag, FileText, CheckCircle2, ArrowRight, AlertCircle 
} from 'lucide-react';
import { jobAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: 'Bangalore, India',
    jobType: 'full-time',
    description: '',
    requiredSkills: '',
    minExperience: 0,
    maxExperience: 3,
    minSalary: 8,
    maxSalary: 16,
    targetDepartments: 'Computer Science, Information Technology',
    targetBatches: '2025, 2026',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      return toast.error('Please enter a job title and description.');
    }

    try {
      setSubmitting(true);
      const skillsArray = formData.requiredSkills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const deptArray = formData.targetDepartments
        .split(',')
        .map(d => d.trim())
        .filter(Boolean);

      const batchArray = formData.targetBatches
        .split(',')
        .map(b => b.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        jobType: formData.jobType,
        description: formData.description,
        requiredSkills: skillsArray,
        experience: { min: Number(formData.minExperience), max: Number(formData.maxExperience) },
        salary: { min: Number(formData.minSalary), max: Number(formData.maxSalary), currency: 'INR' },
        targetDepartments: deptArray,
        targetBatches: batchArray,
      };

      const res = await jobAPI.create(payload);
      if (res.data.success) {
        toast.success('Job posting created successfully! AI JD parser initialized.');
        navigate('/recruiter/jobs');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <PlusCircle className="w-7 h-7 text-primary-500" />
          Create New Job Opening
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Post job details to trigger AI Job Description Skill Extraction and enable bulk candidate screening.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Job Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Associate Full Stack Developer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Company Name
            </label>
            <input
              type="text"
              placeholder="e.g. NexusTech Global"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="input-field text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. Bangalore / Remote"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input-field text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Employment Type
            </label>
            <select
              value={formData.jobType}
              onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
              className="input-field text-sm"
            >
              <option value="full-time">Full-Time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Job Description & Key Responsibilities *
          </label>
          <textarea
            rows={6}
            placeholder="Paste complete JD text here... SkillBridge AI will automatically extract required skill tokens, importance weights, and keywords for candidate scoring."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field text-sm"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Explicit Required Skills (Comma Separated)
          </label>
          <input
            type="text"
            placeholder="e.g. React, Node.js, MongoDB, Docker, REST APIs, Python"
            value={formData.requiredSkills}
            onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
            className="input-field text-sm"
          />
          <p className="text-xs text-slate-400 mt-1">
            Additional required skills entered manually will be merged with AI-extracted skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Target College Departments (Comma Separated)
            </label>
            <input
              type="text"
              value={formData.targetDepartments}
              onChange={(e) => setFormData({ ...formData, targetDepartments: e.target.value })}
              className="input-field text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Target Graduating Batches
            </label>
            <input
              type="text"
              value={formData.targetBatches}
              onChange={(e) => setFormData({ ...formData, targetBatches: e.target.value })}
              className="input-field text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/recruiter/jobs')}
            className="btn-secondary text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary text-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {submitting ? 'Publishing Job...' : 'Publish Job & Enable AI Screening'}
          </button>
        </div>
      </form>
    </div>
  );
}
