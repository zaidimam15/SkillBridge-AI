import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Target,
  BookOpen,
  Map,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { analysisAPI, roadmapAPI } from '../../services/api';
import toast from 'react-hot-toast';

function SkillCard({ skill, tier, onAddToRoadmap, addingSkill }) {
  const config = {
    priority: {
      label: 'Priority',
      class: 'border-red-500/30 bg-red-50 dark:bg-red-950/20',
      dot: 'bg-red-500',
      badge: 'badge-danger',
    },
    recommended: {
      label: 'Recommended',
      class: 'border-amber-500/30 bg-amber-50 dark:bg-amber-950/20',
      dot: 'bg-amber-500',
      badge: 'badge-warning',
    },
    strong: {
      label: 'Strong Match',
      class: 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20',
      dot: 'bg-emerald-500',
      badge: 'badge-success',
    },
    moderate: {
      label: 'Moderate Match',
      class: 'border-blue-500/30 bg-blue-50 dark:bg-blue-950/20',
      dot: 'bg-blue-500',
      badge: 'badge-info',
    },
  }[tier] || {};

  const isAdding = addingSkill === skill;

  return (
    <div
      className={`rounded-xl border p-3 flex items-center gap-3 ${config.class}`}
    >
      <div
        className={`w-3 h-3 rounded-full flex-shrink-0 ${config.dot}`}
      />

      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 flex-1">
        {skill}
      </span>

      <span className={`badge ${config.badge} text-xs`}>
        {config.label}
      </span>

      {(tier === 'priority' || tier === 'recommended') && (
        <button
          onClick={() => onAddToRoadmap(skill)}
          disabled={!!addingSkill}
          className="btn btn-secondary btn-sm text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          title="Add to roadmap"
        >
          {isAdding ? 'Adding...' : '+ Roadmap'}
        </button>
      )}
    </div>
  );
}

export default function SkillGapPage() {
  const { id } = useParams();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingSkill, setAddingSkill] = useState(null);
  const [addingAll, setAddingAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await analysisAPI.getById(id);
        setAnalysis(res.data.analysis);
      } catch (error) {
        console.error('Failed to load skill gap analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // Add one skill
  const handleAddToRoadmap = async (skill) => {
    if (addingSkill || addingAll) return;

    try {
      setAddingSkill(skill);

      await roadmapAPI.addSkill(skill);

      toast.success(`"${skill}" added to your roadmap!`);
    } catch (error) {
      console.error(`Failed to add ${skill}:`, error);

      toast.error(`Failed to add "${skill}". Please try again.`);
    } finally {
      setAddingSkill(null);
    }
  };

  // Add ALL missing skills one-by-one
  const handleAddAllToRoadmap = async () => {
    if (addingAll || allMissing.length === 0) return;

    setAddingAll(true);

    let successCount = 0;
    let failedSkills = [];

    try {
      // Remove duplicate skills
      const uniqueSkills = [...new Set(allMissing)];

      toast.loading(
        `Adding ${uniqueSkills.length} skills to your roadmap...`,
        {
          id: 'add-all-skills',
        }
      );

      // IMPORTANT:
      // Add skills ONE BY ONE instead of sending all requests together.
      for (const skill of uniqueSkills) {
        try {
          await roadmapAPI.addSkill(skill);
          successCount++;
        } catch (error) {
          console.error(`Failed to add skill "${skill}":`, error);
          failedSkills.push(skill);
        }
      }

      toast.dismiss('add-all-skills');

      if (successCount === uniqueSkills.length) {
        toast.success(
          `All ${successCount} missing skills were added to your roadmap!`
        );
      } else if (successCount > 0) {
        toast.success(
          `${successCount} skills added successfully. ${failedSkills.length} failed.`
        );
      } else {
        toast.error('No skills were added to the roadmap.');
      }

      if (failedSkills.length > 0) {
        console.warn('Skills that failed:', failedSkills);
      }
    } catch (error) {
      console.error('Add all skills error:', error);

      toast.dismiss('add-all-skills');
      toast.error('Failed to add missing skills.');
    } finally {
      setAddingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton h-20 rounded-2xl"
          />
        ))}
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-400">
          Analysis not found.
        </p>

        <Link
          to="/dashboard"
          className="btn btn-primary mt-4"
        >
          Dashboard
        </Link>
      </div>
    );
  }

  const {
    skillBreakdown,
    atsScore,
    job,
    resumeQualityScore,
    resumeQualitySuggestions,
  } = analysis;

  const allMissing = [
    ...(skillBreakdown?.priority || []),
    ...(skillBreakdown?.recommended || []),
  ];

  const uniqueMissing = [...new Set(allMissing)];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to={`/dashboard/analysis/${id}`}
            className="text-slate-400 hover:text-slate-600 text-sm"
          >
            ← Back to ATS Report
          </Link>

          <h1 className="section-title mt-1">
            Skill Gap Analysis
          </h1>

          <p className="section-subtitle">
            {job?.title} • ATS Score: {atsScore}%
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/dashboard/roadmap"
            className="btn btn-primary"
          >
            <Map className="w-4 h-4" />
            View Roadmap
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Strong Match',
            value: skillBreakdown?.strong?.length || 0,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-950/20',
          },
          {
            label: 'Moderate Match',
            value: skillBreakdown?.moderate?.length || 0,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-950/20',
          },
          {
            label: 'Priority Gap',
            value: skillBreakdown?.priority?.length || 0,
            color: 'text-red-500',
            bg: 'bg-red-50 dark:bg-red-950/20',
          },
          {
            label: 'Recommended',
            value: skillBreakdown?.recommended?.length || 0,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-950/20',
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-xl p-4 text-center ${s.bg}`}
          >
            <div
              className={`text-3xl font-black ${s.color}`}
            >
              {s.value}
            </div>

            <div className="text-xs text-slate-500 mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Action Hint */}
      {uniqueMissing.length > 0 && (
        <div className="card border-l-4 border-primary-500">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-500" />

            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>
                {uniqueMissing.length} skills missing.
              </strong>{' '}
              Click "+ Roadmap" next to any skill to add it to your
              personalized learning plan.
            </p>
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {uniqueMissing.length > 0 && (
        <div className="card">

          <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-4">
            🎯 Skills to Learn
          </h2>

          <div className="space-y-2">
            {[
              ...(skillBreakdown?.priority || []).map((s) => ({
                s,
                tier: 'priority',
              })),

              ...(skillBreakdown?.recommended || []).map((s) => ({
                s,
                tier: 'recommended',
              })),
            ].map(({ s, tier }) => (
              <SkillCard
                key={`${tier}-${s}`}
                skill={s}
                tier={tier}
                onAddToRoadmap={handleAddToRoadmap}
                addingSkill={addingSkill}
              />
            ))}
          </div>

          {/* Add All */}
          <button
            onClick={handleAddAllToRoadmap}
            disabled={addingAll || !!addingSkill}
            className="btn btn-primary mt-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Map className="w-4 h-4" />

            {addingAll
              ? `Adding Skills...`
              : `Add All ${uniqueMissing.length} Missing Skills to Roadmap`}
          </button>
        </div>
      )}

      {/* Matched Skills */}
      <div className="card">

        <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-4">
          ✅ Matched Skills
        </h2>

        <div className="space-y-2">
          {[
            ...(skillBreakdown?.strong || []).map((s) => ({
              s,
              tier: 'strong',
            })),

            ...(skillBreakdown?.moderate || []).map((s) => ({
              s,
              tier: 'moderate',
            })),
          ].map(({ s, tier }) => (
            <SkillCard
              key={`${tier}-${s}`}
              skill={s}
              tier={tier}
              onAddToRoadmap={handleAddToRoadmap}
              addingSkill={addingSkill}
            />
          ))}

          {!skillBreakdown?.strong?.length &&
            !skillBreakdown?.moderate?.length && (
              <p className="text-slate-400 text-sm">
                No matched skills found.
              </p>
            )}
        </div>
      </div>

      {/* Resume Quality */}
      {resumeQualitySuggestions?.length > 0 && (
        <div className="card">

          <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-3">
            📋 Resume Quality Suggestions
          </h2>

          <div className="flex items-center gap-3 mb-4">

            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {resumeQualityScore || 0}%
            </div>

            <div className="flex-1 progress-bar">
              <div
                className="progress-fill bg-primary-500"
                style={{
                  width: `${resumeQualityScore || 0}%`,
                }}
              />
            </div>

          </div>

          <div className="space-y-2">
            {resumeQualitySuggestions.map((sug, i) => (
              <div
                key={i}
                className="flex gap-2 text-sm text-slate-600 dark:text-slate-400"
              >
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />

                {sug}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="disclaimer-box">

        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />

        <p className="text-xs text-amber-700 dark:text-amber-400">
          Skill gap analysis is based on keyword extraction and alias
          matching. Some skills may not be detected if described
          differently in your resume.
        </p>

      </div>
    </div>
  );
}