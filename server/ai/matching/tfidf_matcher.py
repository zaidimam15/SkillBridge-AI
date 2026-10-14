"""
SkillBridge AI — TF-IDF Matching Engine
Implements ATS compatibility scoring using TF-IDF + Cosine Similarity.

Core Formula:
  TF-IDF(t, d) = TF(t, d) × IDF(t)
  cos(θ) = (R · J) / (||R|| × ||J||)

This is the primary academic ATS baseline as specified.
"""

import sys
import os
import math
from typing import Dict, List, Tuple, Any, Optional

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from nlp.preprocessor import NLPPreprocessor
from nlp.skill_normalizer import SkillNormalizer

ALGORITHM_VERSION = 'v1.0'
SKILL_DICT_VERSION = 'v1.2'


class TfidfMatcher:
    """
    Implements TF-IDF vectorization and cosine similarity matching
    between resume and job description text.

    This is the primary academic ATS compatibility engine.
    The score represents textual similarity and is NOT equivalent
    to proprietary employer ATS scores.
    """

    def __init__(self):
        self.preprocessor = NLPPreprocessor()
        self.normalizer = SkillNormalizer()

        # TF-IDF vectorizer configuration
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),     # Unigrams and bigrams
            min_df=1,
            max_features=5000,
            sublinear_tf=True,      # Apply log normalization to TF
            analyzer='word',
            strip_accents='unicode',
        )

        # Skill weight boost factor
        self.SKILL_WEIGHT_BOOST = 2.0
        self.EDUCATION_WEIGHT = 0.1
        self.EXPERIENCE_WEIGHT = 0.15

    def calculate_ats_score(
        self,
        resume_text: str,
        jd_text: str,
        resume_skills: List[str],
        jd_skills: List[str],
        jd_skill_weights: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """
        Main scoring method.
        Returns comprehensive ATS analysis including score, skill breakdown,
        and explainability data.

        Parameters:
          resume_text: Full preprocessed resume text
          jd_text: Full preprocessed JD text
          resume_skills: Normalized skills from resume
          jd_skills: Normalized skills from JD
          jd_skill_weights: Optional dict of {skill: weight} for JD skills
        """
        # 1. Preprocess both documents
        processed_resume = self.preprocessor.preprocess(resume_text)
        processed_jd = self.preprocessor.preprocess(jd_text)

        # 2. Augment with skill repetition for skill weighting
        resume_augmented = self._augment_with_skills(processed_resume, resume_skills, 2)
        jd_augmented = self._augment_with_skills(processed_jd, jd_skills, 3)

        # 3. TF-IDF Vectorization
        try:
            tfidf_matrix = self.vectorizer.fit_transform([resume_augmented, jd_augmented])
            resume_vector = tfidf_matrix[0]
            jd_vector = tfidf_matrix[1]

            # 4. Cosine Similarity
            cosine_sim = cosine_similarity(resume_vector, jd_vector)[0][0]
        except Exception:
            cosine_sim = 0.0

        # 5. Skill-based matching (independent of TF-IDF)
        skill_analysis = self._analyze_skills(resume_skills, jd_skills, jd_skill_weights)

        # 6. Composite score calculation
        # Weights: TF-IDF similarity 40%, Skill coverage 40%, Quality 20%
        tfidf_component = min(cosine_sim * 100 * 1.3, 100)  # Scale up slightly
        skill_component = skill_analysis['coveragePercent']

        # Weighted composite
        base_score = (
            tfidf_component * 0.40 +
            skill_component * 0.45 +
            15 * 0.15  # baseline for valid submission
        )
        ats_score = min(round(base_score), 100)

        # 7. Score breakdown
        score_breakdown = {
            'skillCoverage': round(skill_component),
            'keywordAlignment': round(tfidf_component),
            'educationAlignment': self._estimate_education_alignment(resume_text, jd_text),
            'experienceAlignment': self._estimate_experience_alignment(resume_text, jd_text),
            'resumeQuality': 0,  # Filled externally
        }

        # 8. Explainability
        explanation = self._generate_explanation(
            resume_skills, jd_skills, skill_analysis, ats_score
        )

        return {
            'atsScore': ats_score,
            'cosineSimilarity': round(float(cosine_sim), 4),
            'algorithmVersion': ALGORITHM_VERSION,
            'skillDictionaryVersion': SKILL_DICT_VERSION,
            'skillAnalysis': skill_analysis,
            'scoreBreakdown': score_breakdown,
            'explanation': explanation,
            'disclaimer': (
                'ATS Compatibility Score represents similarity calculated by SkillBridge AI '
                'using TF-IDF and Cosine Similarity. This is an academic indicator and may '
                'differ from proprietary employer ATS systems.'
            ),
        }

    def _augment_with_skills(
        self, text: str, skills: List[str], repeat: int
    ) -> str:
        """Repeat skill mentions for emphasis in TF-IDF."""
        skill_tokens = [s.lower().replace(' ', '_').replace('.', '_') for s in skills]
        augmentation = ' '.join(skill_tokens * repeat)
        return text + ' ' + augmentation

    def _analyze_skills(
        self,
        resume_skills: List[str],
        jd_skills: List[str],
        jd_skill_weights: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """
        Independent skill gap analysis.
        Missing Skills = Required JD Skills - Resume Skills
        """
        resume_lower = {s.lower(): s for s in resume_skills}
        jd_weights = jd_skill_weights or {}

        matched = []
        missing = []
        strong = []
        moderate = []
        priority = []
        recommended = []

        for jd_skill in jd_skills:
            jd_lower = jd_skill.lower()
            weight = jd_weights.get(jd_skill, 1.0)

            if jd_lower in resume_lower:
                matched.append(jd_skill)
                if weight >= 1.5:
                    strong.append(jd_skill)
                else:
                    moderate.append(jd_skill)
            else:
                missing.append(jd_skill)
                if weight >= 1.5:
                    priority.append(jd_skill)
                else:
                    recommended.append(jd_skill)

        # Extra resume skills not in JD (bonus/additional)
        jd_lower_set = {s.lower() for s in jd_skills}
        additional = [s for s in resume_skills if s.lower() not in jd_lower_set]

        total_weighted = sum(jd_weights.get(s, 1.0) for s in jd_skills) or len(jd_skills)
        matched_weighted = sum(jd_weights.get(s, 1.0) for s in matched)
        coverage = (matched_weighted / total_weighted * 100) if total_weighted > 0 else 0

        return {
            'matched': matched,
            'missing': missing,
            'strong': strong,
            'moderate': moderate,
            'priority': priority,
            'recommended': recommended,
            'additional': additional,
            'coveragePercent': round(coverage, 2),
            'matchCount': len(matched),
            'missingCount': len(missing),
            'totalRequired': len(jd_skills),
        }

    def _generate_explanation(
        self,
        resume_skills: List[str],
        jd_skills: List[str],
        skill_analysis: Dict,
        score: int,
    ) -> Dict[str, Any]:
        """Generate human-readable explanation of ATS score."""

        why_matched = skill_analysis.get('strong', []) + skill_analysis.get('moderate', [])
        what_missing = skill_analysis.get('priority', []) + skill_analysis.get('recommended', [])

        what_improved = []
        if skill_analysis.get('additional'):
            what_improved.append(
                f"Your resume includes {len(skill_analysis['additional'])} additional skills "
                f"not required by this JD but valuable for the role."
            )
        if why_matched:
            what_improved.append(
                f"You matched {len(why_matched)} out of {len(jd_skills)} required skills."
            )

        what_can_improve = []
        if skill_analysis.get('priority'):
            top_priority = skill_analysis['priority'][:3]
            what_can_improve.append(
                f"Learning {', '.join(top_priority)} would most significantly improve your score."
            )
        if skill_analysis.get('recommended'):
            top_rec = skill_analysis['recommended'][:2]
            what_can_improve.append(
                f"Adding {', '.join(top_rec)} would further strengthen your profile."
            )

        if score >= 80:
            summary = "Excellent match! Your resume aligns very well with this job description."
        elif score >= 65:
            summary = "Good match. Address the priority skill gaps to strengthen your application."
        elif score >= 50:
            summary = "Moderate match. Focus on learning the priority skills to become competitive."
        elif score >= 35:
            summary = "Partial match. Significant skill development is needed for this role."
        else:
            summary = "Low match. This role may require skills outside your current profile."

        return {
            'whyMatched': why_matched[:10],
            'whatMissing': what_missing[:10],
            'whatImproved': what_improved,
            'whatCanImprove': what_can_improve,
            'summary': summary,
        }

    def _estimate_education_alignment(self, resume_text: str, jd_text: str) -> int:
        """Estimate education requirement alignment."""
        jd_lower = jd_text.lower()
        resume_lower = resume_text.lower()

        score = 50  # Base
        if 'b.tech' in resume_lower or 'bachelor' in resume_lower:
            if 'b.tech' in jd_lower or 'bachelor' in jd_lower or 'graduate' in jd_lower:
                score = 90
        if 'm.tech' in resume_lower or 'master' in resume_lower:
            score = min(score + 10, 100)

        return score

    def _estimate_experience_alignment(self, resume_text: str, jd_text: str) -> int:
        """Estimate experience level alignment."""
        resume_lower = resume_text.lower()
        has_internship = 'internship' in resume_lower or 'intern' in resume_lower
        has_work_exp = any(kw in resume_lower for kw in ['years of experience', 'year experience', 'worked at'])

        jd_lower = jd_text.lower()
        requires_fresher = 'fresher' in jd_lower or '0-1' in jd_lower or 'entry level' in jd_lower
        requires_senior = 'senior' in jd_lower or '5+' in jd_lower or '7+' in jd_lower

        if requires_fresher:
            return 85
        if requires_senior and not has_work_exp:
            return 40
        if has_work_exp or has_internship:
            return 75
        return 55


class SemanticMatcher:
    """
    Future implementation placeholder.
    Semantic matching using sentence embeddings (BERT/Sentence-Transformers).
    This will be an optional enhancement to the baseline TF-IDF engine.

    Status: NOT YET IMPLEMENTED
    """

    def __init__(self):
        raise NotImplementedError(
            "Semantic matching is a planned future enhancement. "
            "The current baseline uses TF-IDF + Cosine Similarity."
        )

    def calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        raise NotImplementedError


class MatchingEngine:
    """
    Facade for the matching engine.
    Defaults to TF-IDF matching (academic baseline).
    Designed for future extensibility with SemanticMatcher.
    """

    def __init__(self, use_semantic: bool = False):
        if use_semantic:
            raise ValueError(
                "Semantic matching is not yet implemented. Use default TF-IDF matching."
            )
        self.matcher = TfidfMatcher()

    def analyze(
        self,
        resume_text: str,
        jd_text: str,
        resume_skills: List[str],
        jd_skills: List[str],
        jd_skill_weights: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        return self.matcher.calculate_ats_score(
            resume_text, jd_text, resume_skills, jd_skills, jd_skill_weights
        )
