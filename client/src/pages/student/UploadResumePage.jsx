import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  User,
  Info,
  Zap,
} from 'lucide-react';
import { resumeAPI, analysisAPI, jobAPI } from '../../services/api';
import toast from 'react-hot-toast';


// ============================================================
// PARSE SUMMARY
// ============================================================

function ParseSummary({ summary, parsedData }) {
  if (!summary || !parsedData) return null;

  const items = [
    {
      label: 'Skills Detected',
      value: summary.skillsDetected ?? 0,
      icon: '⚡',
    },
    {
      label: 'Projects',
      value: summary.projectsDetected ?? 0,
      icon: '💻',
    },
    {
      label: 'Education Records',
      value: summary.educationRecords ?? 0,
      icon: '🎓',
    },
    {
      label: 'Experience Records',
      value: summary.experienceRecords ?? 0,
      icon: '💼',
    },
    {
      label: 'Certifications',
      value: summary.certifications ?? 0,
      icon: '🏆',
    },
  ];

  const skillGroups = [
    ...(parsedData.skills?.programming || []),
    ...(parsedData.skills?.frameworks || []),
    ...(parsedData.skills?.tools || []),
    ...(parsedData.skills?.databases || []),
    ...(parsedData.skills?.technical || []),
  ];

  return (
    <div className="card border border-emerald-200 dark:border-emerald-700/30 bg-emerald-50/50 dark:bg-emerald-950/20 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />

        <h3 className="font-bold text-emerald-800 dark:text-emerald-300">
          Resume Parsed Successfully
        </h3>
      </div>

      {parsedData.name && (
        <div className="mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-slate-500" />

          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {parsedData.name}
          </span>

          {parsedData.email && (
            <span className="text-sm text-slate-500">
              • {parsedData.email}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="text-center bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm"
          >
            <div className="text-2xl mb-1">
              {item.icon}
            </div>

            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {item.value}
            </div>

            <div className="text-xs text-slate-500 leading-tight">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {skillGroups.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-slate-500 mb-2 font-medium">
            Detected Skills:
          </p>

          <div className="flex flex-wrap gap-1.5">
            {skillGroups
              .slice(0, 20)
              .map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="badge badge-primary"
                >
                  {skill}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ============================================================
// MAIN PAGE
// ============================================================

export default function UploadResumePage() {
  const navigate = useNavigate();

  // ==========================================================
  // RESUME STATE
  // ==========================================================

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');

  const [uploading, setUploading] = useState(false);

  const [uploadedResume, setUploadedResume] = useState(null);

  const [parseError, setParseError] = useState(null);

  const [parseStatus, setParseStatus] = useState(null);


  // ==========================================================
  // ANALYSIS STATE
  // ==========================================================

  const [step, setStep] = useState('upload');

  const [jdMode, setJdMode] = useState('paste');

  const [jdText, setJdText] = useState('');

  const [selectedJob, setSelectedJob] = useState('');

  const [jobs, setJobs] = useState([]);

  const [loadingJobs, setLoadingJobs] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);


  // ==========================================================
  // FILE DROP
  // ==========================================================

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        toast.error(
          'Please upload a PDF, DOCX, or TXT file (max 5MB)'
        );
        return;
      }

      const selectedFile = acceptedFiles[0];

      if (!selectedFile) return;

      setFile(selectedFile);
      setParseError(null);
      setParseStatus(null);
      setUploadedResume(null);
      setStep('upload');
    },
    []
  );


  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });


  // ==========================================================
  // LOAD SAVED JOBS
  // ==========================================================

  const loadJobs = async () => {
    try {
      setLoadingJobs(true);

      const jobRes = await jobAPI.getAll({
        limit: 20,
      });

      setJobs(jobRes?.data?.jobs || []);
    } catch (error) {
      console.error(
        'Failed to load jobs:',
        error
      );

      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };


  // ==========================================================
  // MOVE TO JOB DESCRIPTION
  // ==========================================================

  const moveToJobDescription = async () => {
    setParseStatus('completed');

    setStep('jd');

    toast.success(
      'Resume parsed successfully! 🎉'
    );

    await loadJobs();
  };


  // ==========================================================
  // POLL RESUME PARSE STATUS
  // ==========================================================

  useEffect(() => {
    if (!uploadedResume?._id) return;

    let cancelled = false;
    let intervalId = null;
    let finished = false;

    const finishParsing = async () => {
      if (cancelled || finished) return;

      finished = true;

      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      await moveToJobDescription();
    };


    const handleFailedParsing = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      const errorMessage =
        uploadedResume.parseError ||
        'AI could not parse this resume. Please upload a text-based PDF, DOCX, or TXT file.';

      setParseStatus('failed');

      setParseError(errorMessage);

      toast.error(
        'Resume parsing failed'
      );
    };


    const checkParseStatus = async () => {
      if (cancelled || finished) return;

      try {
        /*
         * IMPORTANT:
         *
         * Sometimes the backend finishes AI parsing
         * before the upload response reaches frontend.
         *
         * Therefore, if the upload response already says
         * "completed", immediately go to Step 2.
         */
        if (
          uploadedResume.parseStatus ===
          'completed'
        ) {
          await finishParsing();
          return;
        }


        if (
          uploadedResume.parseStatus ===
          'failed'
        ) {
          handleFailedParsing();
          return;
        }


        /*
         * Resume is still processing.
         * Ask backend for the latest status.
         */
        const response =
          await resumeAPI.getById(
            uploadedResume._id
          );

        const latestResume =
          response?.data?.resume;

        if (
          !latestResume ||
          cancelled
        ) {
          return;
        }


        console.log(
          '📄 Resume parse status:',
          latestResume.parseStatus
        );


        setUploadedResume(
          latestResume
        );

        setParseStatus(
          latestResume.parseStatus
        );


        if (
          latestResume.parseStatus ===
          'completed'
        ) {
          await finishParsing();
          return;
        }


        if (
          latestResume.parseStatus ===
          'failed'
        ) {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }

          const errorMessage =
            latestResume.parseError ||
            'AI could not parse this resume. Please upload a text-based PDF, DOCX, or TXT file.';

          setParseError(
            errorMessage
          );

          toast.error(
            'Resume parsing failed'
          );
        }
      } catch (error) {
        console.error(
          'Resume status check error:',
          error
        );
      }
    };


    // Check immediately
    checkParseStatus();


    // Continue checking every 3 seconds
    intervalId = setInterval(
      checkParseStatus,
      3000
    );


    return () => {
      cancelled = true;

      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [uploadedResume?._id]);


  // ==========================================================
  // UPLOAD RESUME
  // ==========================================================

  const handleUpload = async () => {
    if (!file) {
      toast.error(
        'Please select a resume first.'
      );
      return;
    }

    setUploading(true);
    setParseError(null);
    setParseStatus(null);

    try {
      const formData = new FormData();

      formData.append(
        'resume',
        file
      );

      if (title.trim()) {
        formData.append(
          'title',
          title.trim()
        );
      }


      const res =
        await resumeAPI.upload(
          formData
        );


      const resume =
        res?.data?.resume;


      if (!resume?._id) {
        throw new Error(
          'Resume upload response did not contain a resume ID.'
        );
      }


      console.log(
        '📤 Resume uploaded:',
        resume
      );


      setUploadedResume(
        resume
      );


      const status =
        resume.parseStatus ||
        'processing';


      setParseStatus(
        status
      );


      /*
       * VERY IMPORTANT:
       *
       * If backend has already completed AI parsing,
       * immediately move to Step 2.
       *
       * This is the main fix for your current issue.
       */
      if (
        status === 'completed'
      ) {
        setStep('jd');

        toast.success(
          'Resume parsed successfully! 🎉'
        );

        await loadJobs();
      } else if (
        status === 'failed'
      ) {
        setParseError(
          resume.parseError ||
          'AI could not parse this resume.'
        );

        toast.error(
          'Resume parsing failed'
        );
      } else {
        /*
         * AI is still processing.
         * Stay on Step 1 and let polling handle it.
         */
        setStep('upload');

        toast.success(
          'Resume uploaded! AI parsing started.'
        );
      }
    } catch (err) {
      console.error(
        'Resume upload error:',
        err
      );

      const errorMessage =
        err.response?.data?.parseWarning ||
        err.response?.data?.message ||
        err.message ||
        'Upload failed. Please try again.';

      setParseError(errorMessage);

      toast.error(errorMessage);

      if (err.response?.data?.resume) {
        setUploadedResume(err.response.data.resume);
        setParseStatus('failed');
      }
    } finally {
      setUploading(false);
    }
  };


  // ==========================================================
  // ANALYZE RESUME
  // ==========================================================

  const handleAnalyze = async () => {
    if (!uploadedResume) {
      toast.error(
        'Please upload a resume first.'
      );
      return;
    }


    if (
      uploadedResume.parseStatus !==
      'completed'
    ) {
      toast.error(
        'Please wait until resume parsing is completed.'
      );
      return;
    }


    if (
      jdMode === 'paste' &&
      jdText.trim().length < 50
    ) {
      toast.error(
        'Please enter a more detailed job description (at least 50 characters).'
      );
      return;
    }


    if (
      jdMode === 'select' &&
      !selectedJob
    ) {
      toast.error(
        'Please select a job.'
      );
      return;
    }


    setAnalyzing(true);


    try {
      const payload = {
        resumeId:
          uploadedResume._id,

        ...(jdMode === 'paste'
          ? {
            jdText:
              jdText.trim(),
          }
          : {
            jobId: selectedJob,
          }),
      };


      const res =
        await analysisAPI.run(
          payload
        );


      toast.success(
        'ATS Analysis complete!'
      );


      const analysisId =
        res?.data?.analysis?._id;


      if (!analysisId) {
        throw new Error(
          'Analysis completed but no analysis ID was returned.'
        );
      }


      setStep('analyzing');


      navigate(
        `/dashboard/analysis/${analysisId}`
      );
    } catch (err) {
      console.error(
        'Analysis error:',
        err
      );

      toast.error(
        err.response?.data?.message ||
        err.message ||
        'Analysis failed. Please try again.'
      );
    } finally {
      setAnalyzing(false);
    }
  };


  // ==========================================================
  // SAMPLE JOB DESCRIPTION
  // ==========================================================

  const sampleJD = `Full Stack Developer — React + Node.js

Requirements:
- 2+ years of experience with JavaScript and TypeScript
- Strong proficiency in React.js and state management (Redux/Zustand)
- Experience with Node.js and Express.js REST API development
- Knowledge of MongoDB or PostgreSQL
- Familiarity with Docker and CI/CD pipelines
- Git version control
- HTML, CSS, Tailwind CSS

Preferred Skills:
- Experience with AWS services
- Unit testing with Jest
- GraphQL knowledge

The candidate will work on building scalable web applications, collaborating with cross-functional teams, and participating in code reviews.`;


  // ==========================================================
  // PROCESSING STATE
  // ==========================================================

  const isProcessing =
    uploadedResume &&
    uploadedResume.parseStatus ===
    'processing';


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>
        <h1 className="section-title">
          Upload & Analyze Resume
        </h1>

        <p className="section-subtitle">
          Upload your resume and run ATS analysis against a job description
        </p>
      </div>


      {/* ======================================================
          PROGRESS STEPS
      ====================================================== */}

      <div className="flex items-center gap-2">
        {[
          'Upload Resume',
          'Add Job Description',
          'ATS Analysis',
        ].map((s, i) => {
          const stepKey = [
            'upload',
            'jd',
            'analyzing',
          ][i];

          const isActive =
            step === stepKey;

          const isDone =
            (step === 'jd' && i === 0) ||
            (step === 'analyzing' &&
              i < 2);

          return (
            <div
              key={s}
              className="flex items-center gap-2 flex-1"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${isDone
                  ? 'bg-emerald-500 text-white'
                  : isActive
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}
              >
                {isDone
                  ? '✓'
                  : i + 1}
              </div>

              <span
                className={`text-xs font-medium hidden sm:block ${isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-slate-400'
                  }`}
              >
                {s}
              </span>

              {i < 2 && (
                <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700" />
              )}
            </div>
          );
        })}
      </div>


      {/* ======================================================
          STEP 1 — UPLOAD RESUME
      ====================================================== */}

      {step === 'upload' && (
        <div className="card space-y-5">

          <h2 className="font-bold text-slate-900 dark:text-slate-100">
            Step 1: Upload Your Resume
          </h2>


          {/* DROPZONE */}

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragActive
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
              : file
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-950/10'
              }`}
          >
            <input
              {...getInputProps()}
              id="resume-file-input"
            />


            {file ? (
              <div className="flex flex-col items-center gap-3">

                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-emerald-600" />
                </div>


                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {file.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>


                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();

                    if (isProcessing) {
                      return;
                    }

                    setFile(null);
                    setUploadedResume(null);
                    setParseStatus(null);
                    setParseError(null);
                    setStep('upload');
                  }}
                  disabled={isProcessing}
                  className="btn btn-secondary btn-sm text-red-500"
                >
                  <X className="w-3 h-3" />
                  Remove
                </button>

              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">

                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>


                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    {isDragActive
                      ? 'Drop your resume here'
                      : 'Drag & drop your resume'}
                  </p>

                  <p className="text-sm text-slate-400 mt-1">
                    or click to browse
                  </p>
                </div>


                <p className="text-xs text-slate-400">
                  PDF, DOCX, TXT • Max 5MB
                </p>

              </div>
            )}

          </div>


          {/* TITLE */}

          <div>
            <label className="label">
              Resume Title (optional)
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              disabled={isProcessing}
              className="input"
              placeholder="e.g., Full Stack Developer Resume"
            />
          </div>


          {/* PROCESSING */}

          {isProcessing && (
            <div className="rounded-xl border border-primary-200 dark:border-primary-700/30 bg-primary-50 dark:bg-primary-950/20 p-5">

              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                </div>


                <div className="flex-1">

                  <h3 className="font-bold text-primary-800 dark:text-primary-300">
                    Analyzing your resume...
                  </h3>

                  <p className="text-sm text-primary-700 dark:text-primary-400 mt-1">
                    Your resume has been uploaded successfully.
                    SkillBridge AI is extracting your skills,
                    education, experience and projects.
                  </p>

                  <div className="flex items-center gap-2 mt-3 text-xs text-primary-600 dark:text-primary-400">
                    <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                    AI parsing is in progress...
                  </div>

                </div>

              </div>

            </div>
          )}


          {/* COMPLETED */}

          {uploadedResume?.parseStatus ===
            'completed' && (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-700/30 bg-emerald-50 dark:bg-emerald-950/20 p-4">

                <div className="flex items-center gap-3">

                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />

                  <div>

                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                      Resume parsed successfully!
                    </p>

                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      Moving to Job Description...
                    </p>

                  </div>

                </div>

              </div>
            )}


          {/* ERROR */}

          {parseError && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-700/30 rounded-xl p-3 flex gap-2 text-sm text-red-700 dark:text-red-400">

              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />

              <div>

                <p className="font-medium">
                  Resume parsing failed
                </p>

                <p className="mt-1">
                  {parseError}
                </p>

              </div>

            </div>
          )}


          {/* UPLOAD BUTTON */}

          <button
            onClick={handleUpload}
            disabled={
              !file ||
              uploading ||
              isProcessing
            }
            id="upload-submit-btn"
            className="btn btn-primary w-full btn-lg"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading Resume...
              </span>
            ) : isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                AI Parsing in Progress...
              </span>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload & Parse Resume
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>


          {/* DISCLAIMER */}

          <div className="disclaimer-box">
            <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />

            <p className="text-xs text-amber-700 dark:text-amber-400">
              Your resume is stored securely and only used for analysis.
              Text-based PDFs work best. Scanned/image PDFs may not parse correctly.
            </p>
          </div>

        </div>
      )}


      {/* ======================================================
          STEP 2 — JOB DESCRIPTION
      ====================================================== */}

      {step === 'jd' && (
        <div className="space-y-5">

          {/* PARSE SUMMARY */}

          <ParseSummary
            summary={
              uploadedResume?.parseSummary
            }
            parsedData={
              uploadedResume?.parsedData
            }
          />


          <div className="card">

            <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-4">
              Step 2: Add Job Description
            </h2>


            {/* JD MODE */}

            <div className="tab-list mb-4">

              <button
                onClick={() =>
                  setJdMode('paste')
                }
                className={`tab ${jdMode === 'paste'
                  ? 'tab-active'
                  : ''
                  }`}
              >
                Paste JD Text
              </button>


              <button
                onClick={() =>
                  setJdMode('select')
                }
                className={`tab ${jdMode === 'select'
                  ? 'tab-active'
                  : ''
                  }`}
              >
                Select Saved Job
              </button>

            </div>


            {/* PASTE JD */}

            {jdMode === 'paste' ? (
              <div className="space-y-3">

                <textarea
                  id="jd-textarea"
                  value={jdText}
                  onChange={(e) =>
                    setJdText(
                      e.target.value
                    )
                  }
                  className="textarea h-48"
                  placeholder={`Paste the job description here...

Include skills, requirements, responsibilities for best results.`}
                />


                <div className="flex justify-end">

                  <button
                    type="button"
                    onClick={() =>
                      setJdText(sampleJD)
                    }
                    className="btn btn-ghost btn-sm text-xs"
                  >
                    Use Sample JD
                  </button>

                </div>


                <p className="text-xs text-slate-400">
                  {jdText.length} characters • Minimum 50 required for analysis
                </p>

              </div>
            ) : (
              <div>

                {loadingJobs ? (
                  <div className="flex items-center gap-2 text-slate-400 py-4">

                    <Loader2 className="w-4 h-4 animate-spin" />

                    Loading available jobs...

                  </div>
                ) : jobs.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4">
                    No jobs available. Try pasting a JD instead.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">

                    {jobs.map((job) => (
                      <label
                        key={job._id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedJob ===
                          job._id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                          }`}
                      >

                        <input
                          type="radio"
                          name="job"
                          value={job._id}
                          checked={
                            selectedJob ===
                            job._id
                          }
                          onChange={() =>
                            setSelectedJob(
                              job._id
                            )
                          }
                          className="mt-1"
                        />


                        <div>

                          <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                            {job.title}
                          </p>

                          <p className="text-xs text-slate-500">
                            {job.company} • {job.location}
                          </p>

                        </div>

                      </label>
                    ))}

                  </div>
                )}

              </div>
            )}


            {/* BUTTONS */}

            <div className="flex gap-3 mt-4">

              <button
                onClick={() =>
                  setStep('upload')
                }
                className="btn btn-secondary"
              >
                ← Back
              </button>


              <button
                onClick={handleAnalyze}
                disabled={
                  analyzing ||
                  uploadedResume?.parseStatus !==
                  'completed' ||
                  (jdMode === 'paste' &&
                    jdText.trim().length < 50) ||
                  (jdMode === 'select' &&
                    !selectedJob)
                }
                id="run-analysis-btn"
                className="btn btn-primary flex-1"
              >
                {analyzing ? (
                  <span className="flex items-center gap-2">

                    <Loader2 className="w-4 h-4 animate-spin" />

                    Running ATS Analysis...

                  </span>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />

                    Run ATS Analysis

                  </>
                )}
              </button>

            </div>


            {/* DISCLAIMER */}

            <div className="disclaimer-box mt-4">

              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />

              <p className="text-xs text-amber-700 dark:text-amber-400">
                ATS Compatibility Score represents similarity calculated by
                SkillBridge AI using TF-IDF + Cosine Similarity.
                This is an academic indicator and may differ from proprietary
                employer ATS systems.
              </p>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}