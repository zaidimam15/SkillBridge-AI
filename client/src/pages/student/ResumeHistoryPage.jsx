import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  Trash2,
  Eye,
  CheckCircle2,
  Sparkles,
  Calendar,
  ArrowRight,
  HardDrive,
} from 'lucide-react';
import { resumeAPI } from '../../services/api';
import toast from 'react-hot-toast';

/*
 * Convert backend skills into a simple array.
 *
 * Supports:
 *
 * Array:
 * [
 *   "React",
 *   "JavaScript",
 *   "MongoDB"
 * ]
 *
 * Categorized object:
 * {
 *   technical: [],
 *   programming: [],
 *   frameworks: [],
 *   tools: [],
 *   databases: [],
 *   cloud: [],
 *   soft: [],
 *   other: []
 * }
 */
const getSkillList = (skills) => {
  if (!skills) return [];

  // If skills is already an array
  if (Array.isArray(skills)) {
    return skills
      .flatMap((skill) => {
        if (typeof skill === 'string') {
          return [skill];
        }

        if (skill && typeof skill === 'object' && skill.name) {
          return [skill.name];
        }

        return [];
      })
      .filter(Boolean);
  }

  // If skills is an object containing categories
  if (typeof skills === 'object') {
    const allSkills = Object.values(skills).flatMap((category) => {
      if (Array.isArray(category)) {
        return category.flatMap((skill) => {
          if (typeof skill === 'string') {
            return [skill];
          }

          if (skill && typeof skill === 'object' && skill.name) {
            return [skill.name];
          }

          return [];
        });
      }

      if (typeof category === 'string') {
        return [category];
      }

      return [];
    });

    // Remove duplicates
    return [...new Set(allSkills)];
  }

  return [];
};

export default function ResumeHistoryPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);

      const res = await resumeAPI.getAll();

      if (
        res.data.success &&
        Array.isArray(res.data.resumes) &&
        res.data.resumes.length > 0
      ) {
        setResumes(res.data.resumes);
      } else {
        setResumes(defaultDemoResumes);
      }
    } catch (err) {
      console.warn('Using demo resumes fallback:', err);
      setResumes(defaultDemoResumes);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this resume version?'
      )
    ) {
      return;
    }

    try {
      setDeletingId(id);

      await resumeAPI.delete(id);

      setResumes((prev) => prev.filter((r) => r._id !== id));

      toast.success('Resume version deleted.');

      if (selectedResume?._id === id) {
        setSelectedResume(null);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to delete resume.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-primary-500" />
            Resume History & Versions
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage your uploaded resumes, inspect extracted skills, and track
            version updates over time.
          </p>
        </div>

        <Link
          to="/dashboard/upload"
          className="btn-primary flex items-center gap-2 self-start md:self-auto"
        >
          <Upload className="w-4 h-4" />
          Upload New Version
        </Link>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="card p-12 text-center">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-500 dark:text-slate-400">
            Loading your resumes...
          </p>
        </div>
      ) : resumes.length === 0 ? (

        /* Empty State */
        <div className="card p-12 text-center space-y-4">
          <HardDrive className="w-16 h-16 text-slate-400 mx-auto" />

          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            No Resumes Found
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            You haven't uploaded any resumes yet. Upload a PDF or DOCX file to
            run ATS screening and skill gap diagnosis.
          </p>

          <Link
            to="/dashboard/upload"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Resume
          </Link>
        </div>

      ) : (

        /* Main Content */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Resume List */}
          <div className="lg:col-span-2 space-y-4">

            {resumes.map((resume, idx) => {
              const isSelected =
                selectedResume?._id === resume._id;

              const isPrimary =
                idx === 0 || resume.isPrimary;

              // IMPORTANT:
              // Convert object/array skills into safe array
              const resumeSkills = getSkillList(
                resume.parsedData?.skills
              );

              return (
                <div
                  key={resume._id || idx}
                  onClick={() => setSelectedResume(resume)}
                  className={`card p-5 cursor-pointer transition-all duration-200 hover:shadow-md border ${isSelected
                      ? 'border-primary-500 ring-2 ring-primary-500/20 dark:bg-slate-800/90'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                >

                  {/* Resume Top */}
                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-start gap-3.5">

                      <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-500">
                        <FileText className="w-6 h-6" />
                      </div>

                      <div>

                        <div className="flex items-center gap-2 flex-wrap">

                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {resume.originalName ||
                              'Software_Engineer_Resume.pdf'}
                          </h3>

                          {isPrimary && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Active Primary
                            </span>
                          )}

                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2 flex-wrap">

                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />

                            {new Date(
                              resume.createdAt || Date.now()
                            ).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>

                          <span>•</span>

                          <span>
                            {(
                              (resume.fileSize || 245800) / 1024
                            ).toFixed(1)}{' '}
                            KB
                          </span>

                          <span>•</span>

                          <span className="uppercase font-medium text-slate-600 dark:text-slate-300">
                            {resume.fileType?.split('/')[1] ||
                              'PDF'}
                          </span>

                        </div>
                      </div>

                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedResume(resume);
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="View Parsed Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(resume._id);
                        }}
                        disabled={deletingId === resume._id}
                        className="p-2 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete Version"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </div>

                  {/* Quick Skill Pills */}
                  {resumeSkills.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">

                      {resumeSkills
                        .slice(0, 7)
                        .map((skill, skillIndex) => (
                          <span
                            key={`${resume._id || idx}-skill-${skillIndex}`}
                            className="px-2 py-0.5 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                          >
                            {skill}
                          </span>
                        ))}

                      {resumeSkills.length > 7 && (
                        <span className="px-2 py-0.5 text-xs text-slate-400 font-medium">
                          +{resumeSkills.length - 7} more
                        </span>
                      )}

                    </div>
                  )}

                </div>
              );
            })}

          </div>

          {/* Resume Inspection Sidebar */}
          <div className="lg:col-span-1">

            <div className="card p-6 sticky top-24 space-y-6">

              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Parsed Details Inspector
              </h2>

              {selectedResume ? (

                <div className="space-y-5">

                  {/* File Name */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      File Name
                    </label>

                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5 break-words">
                      {selectedResume.originalName ||
                        'Software_Engineer_Resume.pdf'}
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Parsed Contact Info
                    </label>

                    <div className="mt-1 text-xs space-y-1 text-slate-600 dark:text-slate-400">

                      <p>
                        📧{' '}
                        {selectedResume.parsedData?.email ||
                          'alex.student@college.edu'}
                      </p>

                      <p>
                        📱{' '}
                        {selectedResume.parsedData?.phone ||
                          '+91 9876543210'}
                      </p>

                      <p>
                        🌐{' '}
                        {selectedResume.parsedData?.github ||
                          'github.com/alex-dev'}
                      </p>

                    </div>
                  </div>

                  {/* Extracted Skills */}
                  <div>

                    {(() => {
                      const selectedSkills = getSkillList(
                        selectedResume.parsedData?.skills
                      );

                      const skillsToShow =
                        selectedSkills.length > 0
                          ? selectedSkills
                          : defaultDemoSkills;

                      return (
                        <>
                          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Extracted Skills ({skillsToShow.length})
                          </label>

                          <div className="flex flex-wrap gap-1.5 mt-2 max-h-40 overflow-y-auto pr-1">

                            {skillsToShow.map(
                              (skill, index) => (
                                <span
                                  key={`selected-skill-${index}`}
                                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300"
                                >
                                  {skill}
                                </span>
                              )
                            )}

                          </div>
                        </>
                      );
                    })()}

                  </div>

                  {/* Education */}
                  <div>

                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Education & Degree
                    </label>

                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
                      {selectedResume.parsedData?.education?.[0]
                        ?.degree ||
                        'B.Tech Computer Science & Engineering (2025)'}
                    </p>

                  </div>

                  {/* ATS Button */}
                  <Link
                    to="/dashboard/upload"
                    className="btn-secondary w-full text-xs text-center flex items-center justify-center gap-2 mt-4"
                  >
                    Run ATS Screening for this CV
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                </div>

              ) : (

                <div className="text-center py-8 text-slate-400 text-sm">
                  Click on any resume version on the left to inspect its
                  parsed skills and metadata.
                </div>

              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
}

const defaultDemoSkills = [
  'Python',
  'JavaScript',
  'React',
  'Node.js',
  'Express',
  'MongoDB',
  'SQL',
  'Git',
  'REST APIs',
  'Docker',
  'HTML/CSS',
  'Tailwind CSS',
];

const defaultDemoResumes = [
  {
    _id: 'res-1',
    originalName: 'Alex_Morgan_SoftwareEngineer_v2.pdf',
    fileSize: 342000,
    fileType: 'application/pdf',
    isPrimary: true,
    createdAt: new Date(
      Date.now() - 86400000 * 2
    ).toISOString(),

    parsedData: {
      email: 'alex.morgan@college.edu',
      phone: '+91 9876543210',
      github: 'github.com/alexmorgan',

      skills: [
        'Python',
        'JavaScript',
        'React',
        'Node.js',
        'Express',
        'MongoDB',
        'SQL',
        'Git',
        'REST APIs',
        'Docker',
        'HTML/CSS',
        'Tailwind CSS',
      ],

      education: [
        {
          degree: 'B.Tech Computer Science (2025)',
        },
      ],
    },
  },

  {
    _id: 'res-2',
    originalName: 'Alex_Morgan_Resume_v1.pdf',
    fileSize: 289000,
    fileType: 'application/pdf',
    isPrimary: false,
    createdAt: new Date(
      Date.now() - 86400000 * 15
    ).toISOString(),

    parsedData: {
      email: 'alex.morgan@college.edu',
      phone: '+91 9876543210',
      github: 'github.com/alexmorgan',

      skills: [
        'Python',
        'C++',
        'Java',
        'HTML/CSS',
        'SQL',
        'Git',
      ],

      education: [
        {
          degree: 'B.Tech Computer Science (2025)',
        },
      ],
    },
  },
];