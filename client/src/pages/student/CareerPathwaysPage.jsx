import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Compass,
  TrendingUp,
  DollarSign,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Building2,
  Briefcase,
  Target,
  BookOpen,
  RefreshCw,
  XCircle,
  Users,
  Brain,
  Code2,
  Plus,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';

import { careerAPI, roadmapAPI, resourceAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function CareerPathwaysPage() {
  const navigate = useNavigate();

  const [careers, setCareers] = useState([]);
  const [roadmapSkills, setRoadmapSkills] = useState([]);
  const [roadmapItems, setRoadmapItems] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [bestCareer, setBestCareer] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingRoadmap, setLoadingRoadmap] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);

  const [addingSkill, setAddingSkill] = useState('');
  const [addedSkills, setAddedSkills] = useState([]);

  // Expandable Missing Skills state
  const [expandedSkills, setExpandedSkills] = useState({});
  const [skillResources, setSkillResources] = useState({});
  const [loadingResources, setLoadingResources] = useState({});

  // ============================================================
  // NORMALIZE SKILL
  // ============================================================
  const normalizeSkill = (skill) => {
    return String(skill || '')
      .trim()
      .toLowerCase()
      .replace(/[._-]/g, ' ')
      .replace(/[()[\]{},]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // ============================================================
  // SKILL ALIASES (Harmonized with Backend)
  // ============================================================
  const skillAliases = {
    // React
    react: 'react',
    reactjs: 'react',
    'react js': 'react',
    'react.js': 'react',

    // Node
    node: 'node.js',
    nodejs: 'node.js',
    'node js': 'node.js',
    'node.js': 'node.js',

    // Express
    express: 'express',
    expressjs: 'express',
    'express js': 'express',
    'express.js': 'express',

    // JavaScript
    javascript: 'javascript',
    js: 'javascript',
    'java script': 'javascript',

    // TypeScript
    typescript: 'typescript',
    ts: 'typescript',
    'type script': 'typescript',

    // MongoDB
    mongodb: 'mongodb',
    mongo: 'mongodb',
    'mongo db': 'mongodb',

    // PostgreSQL
    postgres: 'postgresql',
    postgresql: 'postgresql',
    'postgre sql': 'postgresql',
    'postgres sql': 'postgresql',

    // SQL
    sql: 'sql',

    // REST APIs
    rest: 'rest apis',
    'rest api': 'rest apis',
    'rest apis': 'rest apis',
    'restful api': 'rest apis',
    'restful apis': 'rest apis',

    // HTML
    html: 'html',
    html5: 'html',

    // CSS
    css: 'css',
    css3: 'css',

    // Tailwind CSS
    tailwind: 'tailwind css',
    tailwindcss: 'tailwind css',
    'tailwind css': 'tailwind css',

    // Machine Learning
    ml: 'machine learning',
    'machine learning': 'machine learning',

    // NLP
    nlp: 'nlp',

    // scikit-learn
    sklearn: 'scikit learn',
    'scikit learn': 'scikit learn',
    'scikit-learn': 'scikit learn',

    // TF-IDF
    tfidf: 'tf idf',
    'tf idf': 'tf idf',
    'tf-idf': 'tf idf',

    // FastAPI
    fastapi: 'fastapi',
    'fast api': 'fastapi',

    // Vector DBs
    'vector db': 'vector dbs',
    'vector dbs': 'vector dbs',
    'vector database': 'vector dbs',
    'vector databases': 'vector dbs',

    // Python
    python: 'python',
    py: 'python',
    python3: 'python',

    // Next.js
    nextjs: 'next.js',
    'next js': 'next.js',
    'next.js': 'next.js',

    // Vue.js
    vuejs: 'vue.js',
    'vue js': 'vue.js',
    'vue.js': 'vue.js',
  };

  const canonicalSkill = (skill) => {
    const normalized = normalizeSkill(skill);
    return skillAliases[normalized] || normalized;
  };

  // ============================================================
  // CHECK WHETHER TWO SKILLS MATCH
  // ============================================================
  const skillsMatch = (skillA, skillB) => {
    const a = canonicalSkill(skillA);
    const b = canonicalSkill(skillB);

    if (!a || !b) return false;
    if (a === b) return true;

    const normA = normalizeSkill(skillA);
    const normB = normalizeSkill(skillB);
    if (normA === normB) return true;

    // Token containment guard (excluding distinct frameworks like react native)
    if (
      a !== 'react native' &&
      b !== 'react native' &&
      normA !== 'react native' &&
      normB !== 'react native'
    ) {
      const tokensA = normA.split(/[\s,\/:-]+/);
      const tokensB = normB.split(/[\s,\/:-]+/);

      if (tokensA.includes(normB) || tokensA.includes(b)) return true;
      if (tokensB.includes(normA) || tokensB.includes(a)) return true;
    }

    return false;
  };

  // ============================================================
  // REMOVE DUPLICATE SKILLS
  // ============================================================
  const uniqueSkills = (skills = []) => {
    const result = [];

    skills.forEach((skill) => {
      if (!skill) return;
      const exists = result.some((existing) =>
        skillsMatch(existing, skill)
      );
      if (!exists) {
        result.push(String(skill).trim());
      }
    });

    return result;
  };

  // ============================================================
  // CHECK USER HAS SKILL
  // ============================================================
  const userHasSkill = (skill) => {
    return userSkills.some((userSkill) =>
      skillsMatch(skill, userSkill)
    );
  };

  // ============================================================
  // READINESS LABEL
  // ============================================================
  const getReadinessLabel = (score) => {
    if (score >= 85) return 'Excellent Match';
    if (score >= 70) return 'Strong Match';
    if (score >= 50) return 'Good Potential';
    return 'Needs Upskilling';
  };

  // ============================================================
  // MATCH COLOR
  // ============================================================
  const getMatchColor = (score) => {
    if (score >= 85) {
      return {
        text: 'text-emerald-500',
        bg: 'bg-emerald-500',
        soft: 'bg-emerald-50 dark:bg-emerald-950/30',
        border: 'border-emerald-200 dark:border-emerald-800/50',
      };
    }

    if (score >= 70) {
      return {
        text: 'text-blue-500',
        bg: 'bg-blue-500',
        soft: 'bg-blue-50 dark:bg-blue-950/30',
        border: 'border-blue-200 dark:border-blue-800/50',
      };
    }

    if (score >= 50) {
      return {
        text: 'text-amber-500',
        bg: 'bg-amber-500',
        soft: 'bg-amber-50 dark:bg-amber-950/30',
        border: 'border-amber-200 dark:border-amber-800/50',
      };
    }

    return {
      text: 'text-rose-500',
      bg: 'bg-rose-500',
      soft: 'bg-rose-50 dark:bg-rose-950/30',
      border: 'border-rose-200 dark:border-rose-800/50',
    };
  };

  // ============================================================
  // FETCH PERSONALIZED CAREER DATA
  // ============================================================
  useEffect(() => {
    fetchCareerData();
  }, []);

  const fetchCareerData = async () => {
    setLoading(true);
    setLoadingRoadmap(true);

    try {
      const [careerResponse, roadmapResponse] = await Promise.allSettled([
        careerAPI.getAll(),
        roadmapAPI.get(),
      ]);

      if (
        careerResponse.status !== 'fulfilled' ||
        !careerResponse.value?.data?.success
      ) {
        throw new Error('Unable to load career recommendations.');
      }

      const careerData = careerResponse.value.data;

      const apiCareers = Array.isArray(careerData.careers)
        ? careerData.careers
        : [];

      const rawUserSkills = Array.isArray(careerData.userSkills)
        ? careerData.userSkills
        : [];
      setUserSkills(uniqueSkills(rawUserSkills));

      const personalizedCareers = apiCareers.map((career) => {
        const requiredSkills = uniqueSkills(
          Array.isArray(career.requiredSkills) ? career.requiredSkills : []
        );

        const secondarySkills = uniqueSkills(
          Array.isArray(career.secondarySkills) ? career.secondarySkills : []
        );

        const hiringCompanies = uniqueSkills(
          Array.isArray(career.hiringCompanies) ? career.hiringCompanies : []
        );

        const matchedRequiredSkills = requiredSkills.filter((skill) =>
          rawUserSkills.some((u) => skillsMatch(u, skill))
        );

        const missingRequiredSkills = requiredSkills.filter(
          (skill) => !rawUserSkills.some((u) => skillsMatch(u, skill))
        );

        const matchedSecondarySkills = secondarySkills.filter((skill) =>
          rawUserSkills.some((u) => skillsMatch(u, skill))
        );

        const missingSecondarySkills = secondarySkills.filter(
          (skill) => !rawUserSkills.some((u) => skillsMatch(u, skill))
        );

        // Recalculate match score dynamically using exact backend formula (80% core, 20% secondary)
        const reqScorePart =
          requiredSkills.length > 0
            ? (matchedRequiredSkills.length / requiredSkills.length) * 80
            : 0;

        const secScorePart =
          secondarySkills.length > 0
            ? (matchedSecondarySkills.length / secondarySkills.length) * 20
            : 0;

        const score = Math.min(100, Math.round(reqScorePart + secScorePart));

        return {
          ...career,
          matchScore: score,
          matchPercentage: score,
          readiness: getReadinessLabel(score),
          matchedRequiredSkills,
          missingRequiredSkills,
          matchedSecondarySkills,
          missingSecondarySkills,
          matchedRequiredCount: matchedRequiredSkills.length,
          requiredSkillCount: requiredSkills.length,
          matchedSecondaryCount: matchedSecondarySkills.length,
          secondarySkillCount: secondarySkills.length,
          requiredSkills,
          secondarySkills,
          hiringCompanies,
        };
      });

      personalizedCareers.sort((a, b) => b.matchScore - a.matchScore);

      setCareers(personalizedCareers);

      const topMatch = personalizedCareers[0] || null;
      setBestCareer(topMatch);

      setSelectedRole((prevRole) => {
        if (!prevRole) return topMatch;
        const matchingRole = personalizedCareers.find(
          (c) => c.slug === prevRole.slug || c._id === prevRole._id
        );
        return matchingRole || topMatch;
      });

      if (
        roadmapResponse.status === 'fulfilled' &&
        roadmapResponse.value?.data?.success
      ) {
        const progress = roadmapResponse.value.data.progress || {};
        const skillProgress = Array.isArray(progress.skillProgress)
          ? progress.skillProgress
          : [];

        setRoadmapItems(skillProgress);

        const roadmapNames = uniqueSkills(
          skillProgress.map((item) => item?.skill).filter(Boolean)
        );

        setRoadmapSkills(roadmapNames);
      } else {
        setRoadmapSkills([]);
        setRoadmapItems([]);
      }
    } catch (error) {
      console.error('Career pathway loading error:', error);
      setCareers([]);
      setSelectedRole(null);
      setBestCareer(null);
      setUserSkills([]);
      setRoadmapSkills([]);
      setRoadmapItems([]);

      toast.error(
        error?.message || 'Could not load personalized career data.'
      );
    } finally {
      setLoading(false);
      setLoadingRoadmap(false);
    }
  };

  // ============================================================
  // ADD SKILL TO ROADMAP
  // ============================================================
  const addSkillToRoadmap = async (skill) => {
    if (!skill) return;

    const existingRoadmapSkill = roadmapSkills.find((roadmapSkill) =>
      skillsMatch(roadmapSkill, skill)
    );

    if (existingRoadmapSkill) {
      toast.success(`"${existingRoadmapSkill}" is already in your roadmap.`);
      setAddedSkills((prev) => uniqueSkills([...prev, skill]));
      return;
    }

    setAddingSkill(skill);

    try {
      const response = await roadmapAPI.addSkill(skill);

      if (response?.data?.success) {
        setRoadmapSkills((prev) => uniqueSkills([skill, ...prev]));
        setRoadmapItems((prev) => [
          { skill, status: 'in_progress', startedAt: new Date() },
          ...prev,
        ]);
        setAddedSkills((prev) => uniqueSkills([...prev, skill]));

        if (response.data.alreadyExists) {
          toast.success(`"${skill}" is already in your learning roadmap.`);
        } else {
          toast.success(`"${skill}" added to your learning roadmap.`);
        }
      } else {
        throw new Error(response?.data?.message || 'Unable to add skill.');
      }
    } catch (error) {
      console.error('Add roadmap skill error:', error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          `Could not add "${skill}" to roadmap.`
      );
    } finally {
      setAddingSkill('');
    }
  };

  // ============================================================
  // TOGGLE EXPAND MISSING SKILL
  // ============================================================
  const toggleExpandSkill = async (skill) => {
    const isCurrentlyExpanded = !!expandedSkills[skill];
    setExpandedSkills((prev) => ({
      ...prev,
      [skill]: !isCurrentlyExpanded,
    }));

    if (!isCurrentlyExpanded && !skillResources[skill]) {
      setLoadingResources((prev) => ({ ...prev, [skill]: true }));
      try {
        const res = await resourceAPI.getBySkill(skill);
        if (res?.data?.resources) {
          setSkillResources((prev) => ({
            ...prev,
            [skill]: res.data.resources,
          }));
        }
      } catch (err) {
        console.error(`Failed to load resources for ${skill}:`, err);
      } finally {
        setLoadingResources((prev) => ({ ...prev, [skill]: false }));
      }
    }
  };

  // ============================================================
  // GET ROADMAP STATUS OF SKILL
  // ============================================================
  const getRoadmapStatus = (skill) => {
    const item = roadmapItems.find((r) => skillsMatch(r?.skill || r, skill));
    if (!item) {
      if (addedSkills.some((s) => skillsMatch(s, skill))) return 'in_progress';
      return 'not_added';
    }
    return item.status || 'in_progress';
  };

  // ============================================================
  // OPEN LEARNING ROADMAP
  // ============================================================
  const openLearningRoadmap = () => {
    navigate('/dashboard/roadmap');
  };

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Analyzing your career pathways...
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Matching your resume skills with industry benchmark roles
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // EMPTY STATE
  // ============================================================
  if (!careers.length) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Compass className="w-7 h-7 text-primary-500" />
            Career Pathways
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Personalized career recommendations based on your uploaded resume.
          </p>
        </div>

        <div className="card p-12 text-center">
          <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            No career pathways available
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Please make sure your resume has been uploaded and successfully parsed.
          </p>
          <button
            onClick={fetchCareerData}
            className="mt-5 btn-primary inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // SELECTED ROLE DETAILS
  // ============================================================
  const selectedMatchScore = Number(selectedRole?.matchScore) || 0;
  const selectedColors = getMatchColor(selectedMatchScore);

  const selectedMissingSkills = uniqueSkills(
    selectedRole?.missingRequiredSkills || []
  ).filter((skill) => !userHasSkill(skill));

  const selectedSecondaryMissingSkills = uniqueSkills(
    selectedRole?.missingSecondarySkills || []
  ).filter((skill) => !userHasSkill(skill));

  return (
    <div className="space-y-8 animate-fade-in pb-4">
      {/* ======================================================
          1. HEADER
      ====================================================== */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Compass className="w-7 h-7 text-primary-500" />
          Career Pathways & Skill Diagnostics
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Personalized career recommendations dynamically calculated from your uploaded resume.
        </p>
      </div>

      {/* ======================================================
          2. PERSONALIZED CAREER RECOMMENDATIONS SUMMARY
      ====================================================== */}
      <div className="card p-5 border border-primary-200 dark:border-primary-900/40 bg-primary-50/30 dark:bg-primary-950/20">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-primary-100 dark:bg-primary-900/40">
              <Target className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                Personalized Career Recommendations
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your career matches are dynamically generated from the skills extracted from your resume.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {bestCareer && (
              <>
                <div className="text-center">
                  <div className="text-lg font-black text-primary-500">
                    {bestCareer.title}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">
                    Best Match ({bestCareer.matchScore}%)
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
              </>
            )}

            <div className="text-center">
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {careers.length}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">
                Career Paths
              </div>
            </div>

            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />

            <div className="text-center">
              <div className="text-lg font-black text-amber-500">
                {roadmapSkills.length}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">
                Roadmap Skills
              </div>
            </div>

            <button
              onClick={fetchCareerData}
              disabled={loading}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-400 transition disabled:opacity-50"
              title="Refresh career recommendations"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
          3. MAIN LAYOUT: CAREER OPTIONS + SELECTED DETAILS
      ====================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ======================================================
            LEFT COLUMN: CAREER OPTIONS / LIST
        ====================================================== */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Recommended Careers
            </h2>
            <span className="text-xs text-slate-400">
              Sorted by resume match
            </span>
          </div>

          <div className="space-y-3">
            {careers.map((career) => {
              const isSelected = selectedRole?.slug === career.slug;
              const score = Number(career.matchScore) || 0;
              const colors = getMatchColor(score);

              return (
                <div
                  key={career.slug || career._id}
                  onClick={() => setSelectedRole(career)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 border-primary-500 shadow-md ring-2 ring-primary-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {career.title}
                        </h3>

                        {bestCareer?.slug === career.slug && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary-500 text-white flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Best Match
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {career.category}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-base font-black ${colors.text}`}>
                        {score}%
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {career.readiness}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors.bg} transition-all duration-500`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>

                  {/* Skills count */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {career.matchedRequiredCount || 0}/{career.requiredSkillCount || 0} core skills
                    </span>

                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                      {career.missingRequiredSkills?.length || 0} gaps
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================
            RIGHT COLUMN: SELECTED CAREER DETAILS
        ====================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {selectedRole ? (
            <div className="card p-6 space-y-6 border border-slate-200 dark:border-slate-800">
              {/* Selected Career Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {selectedRole.category}
                    </span>

                    {selectedRole.marketDemand && (
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {selectedRole.marketDemand}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                    {selectedRole.title}
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {selectedRole.description}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <div className={`text-2xl font-black ${selectedColors.text}`}>
                    {selectedMatchScore}%
                  </div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {selectedRole.readiness}
                  </div>
                  {selectedRole.salaryRange?.formatted && (
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 sm:justify-end">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                      {selectedRole.salaryRange.formatted}
                    </div>
                  )}
                </div>
              </div>

              {/* Required Core Skills Analysis */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Required Core Skills Breakdown</span>
                  <span className="text-slate-500 font-normal">
                    {selectedRole.matchedRequiredSkills?.length || 0}/{selectedRole.requiredSkills?.length || 0} Matched
                  </span>
                </h3>

                {selectedRole.requiredSkills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {uniqueSkills(selectedRole.requiredSkills).map((skill, sIdx) => {
                      const isUserSkill = userHasSkill(skill);
                      const isMissing = !isUserSkill;

                      return (
                        <span
                          key={`${skill}-${sIdx}`}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 ${
                            isMissing
                              ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50'
                              : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                          }`}
                        >
                          {isMissing ? (
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-500">
                    Core skill information is not available for this career.
                  </div>
                )}
              </div>

              {/* Bonus Skills */}
              {selectedRole.secondarySkills?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Secondary / Bonus Competencies
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {uniqueSkills(selectedRole.secondarySkills).map((skill, sIdx) => {
                      const isMissing = selectedSecondaryMissingSkills.some(
                        (missingSkill) => skillsMatch(skill, missingSkill)
                      );

                      return (
                        <span
                          key={`${skill}-${sIdx}`}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                            isMissing
                              ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
                          }`}
                        >
                          {isMissing ? '× ' : '+ '} {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* =================================================
                  CAREER SKILL GAPS (EXPANDABLE)
                  SINGLE SOURCE OF SKILL GAPS
              ================================================= */}
              {selectedMissingSkills.length > 0 ? (
                <div className="rounded-xl p-5 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/40">
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">
                          Career Skill Gaps
                        </h3>
                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                          Click any skill arrow to view detailed learning resources and add to your roadmap.
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/50">
                      {selectedMissingSkills.length} missing
                    </span>
                  </div>

                  {/* Expandable Skills List */}
                  <div className="space-y-3 pt-2">
                    {selectedMissingSkills.map((skill) => {
                      const isExpanded = !!expandedSkills[skill];
                      const status = getRoadmapStatus(skill);
                      const isAdding = addingSkill === skill;
                      const resources = skillResources[skill] || [];
                      const isLoadingRes = !!loadingResources[skill];

                      return (
                        <div
                          key={skill}
                          className="bg-white dark:bg-slate-900 rounded-xl border border-rose-200/80 dark:border-rose-900/40 overflow-hidden shadow-sm transition-all"
                        >
                          {/* Skill Header */}
                          <div className="p-3.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <Target className="w-4 h-4 text-rose-500 shrink-0" />
                              <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                                {skill}
                              </span>

                              {/* Status Badge */}
                              {status === 'completed' && (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Completed
                                </span>
                              )}
                              {status === 'in_progress' && (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                  In Roadmap
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {status === 'not_added' ? (
                                <button
                                  onClick={() => addSkillToRoadmap(skill)}
                                  disabled={isAdding}
                                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition flex items-center gap-1 disabled:opacity-50"
                                >
                                  {isAdding ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Plus className="w-3.5 h-3.5" />
                                  )}
                                  Add to Roadmap
                                </button>
                              ) : (
                                <button
                                  onClick={openLearningRoadmap}
                                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 hover:underline"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  {status === 'completed' ? 'Completed' : 'Added'}
                                </button>
                              )}

                              {/* Expand Arrow Button */}
                              <button
                                onClick={() => toggleExpandSkill(skill)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title={isExpanded ? "Collapse" : "Expand resources"}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-xs space-y-4 animate-fade-in">
                              {/* Why it matters */}
                              <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                                  Why {skill} Matters
                                </h4>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                  Mastering <strong>{skill}</strong> is required for the <strong>{selectedRole.title}</strong> role to build production software according to industry benchmarks.
                                </p>
                              </div>

                              {/* Recommended Learning Resources */}
                              <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                                  <span>Recommended Resources</span>
                                  {isLoadingRes && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-500" />}
                                </h4>

                                {isLoadingRes ? (
                                  <div className="p-4 text-center text-slate-400">
                                    Loading dynamic resources for {skill}...
                                  </div>
                                ) : resources.length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {resources.slice(0, 4).map((res, rIdx) => (
                                      <a
                                        key={rIdx}
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary-400 transition flex flex-col justify-between group"
                                      >
                                        <div>
                                          <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400 mb-1">
                                            <span className="font-semibold text-primary-600 dark:text-primary-400">{res.provider}</span>
                                            <span className="capitalize">{res.type}</span>
                                          </div>
                                          <div className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 line-clamp-1">
                                            {res.title}
                                          </div>
                                        </div>

                                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                                          <span>Est. {res.estimatedHours || 8}h</span>
                                          <span className="flex items-center gap-1 text-primary-500 font-semibold group-hover:underline">
                                            Open <ExternalLink className="w-3 h-3" />
                                          </span>
                                        </div>
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 text-center">
                                    No direct resources found for {skill}.
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={openLearningRoadmap}
                    className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-300 hover:underline"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Open full Learning Roadmap page
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="rounded-xl p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                        Core Skills Satisfied
                      </h3>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        Your resume currently satisfies all required skills for this career pathway!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Employers */}
              {selectedRole.hiringCompanies?.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Typical Hiring Employers
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {uniqueSkills(selectedRole.hiringCompanies).map((company, cIdx) => (
                      <span
                        key={`${company}-${cIdx}`}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1.5 border border-slate-200/50 dark:border-slate-700/50"
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-12 text-center text-slate-400">
              <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No career pathway selected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}