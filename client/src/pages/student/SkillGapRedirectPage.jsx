import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function SkillGapRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const loadLatestAnalysis = async () => {
      try {
        const res = await analysisAPI.getHistory({ limit: 1 });

        const analyses = res?.data?.analyses || res?.data?.history || [];

        if (analyses.length > 0) {
          const latest = analyses[0];

          const analysisId =
            latest._id ||
            latest.id ||
            latest.analysisId;

          if (analysisId) {
            navigate(`/dashboard/skill-gap/${analysisId}`, {
              replace: true,
            });
            return;
          }
        }

        toast.error('No analysis found. Please analyze a resume first.');
        navigate('/dashboard/upload', { replace: true });
      } catch (error) {
        console.error('Failed to load latest analysis:', error);
        toast.error('Unable to load skill gap analysis.');
        navigate('/dashboard', { replace: true });
      }
    };

    loadLatestAnalysis();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Loading Skill Gap Analysis...
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Finding your latest analysis
        </p>
      </div>
    </div>
  );
}