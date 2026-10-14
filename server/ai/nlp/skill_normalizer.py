"""
SkillBridge AI — Skill Normalizer
Maps raw skill text to canonical skill names using the skill dictionary.
Version: v1.2
"""

import re
from typing import Optional, List
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from skills.skill_dictionary import SKILL_ALIASES, SKILL_CATEGORIES


class SkillNormalizer:
    """
    Normalizes raw skill strings to canonical names using
    the configurable skill alias dictionary.
    """

    # Skills that should NOT be lowercased for matching (case-sensitive)
    CASE_SENSITIVE = {'C++', 'C#', '.NET', 'R', 'Go'}

    def __init__(self):
        # Build a lowercased lookup table
        self._lookup = {k.lower(): v for k, v in SKILL_ALIASES.items()}

    def normalize(self, raw: str) -> Optional[str]:
        """
        Normalize a raw skill string to its canonical name.
        Returns None if the skill cannot be recognized.
        """
        if not raw or not isinstance(raw, str):
            return None

        cleaned = raw.strip()
        if len(cleaned) < 2:
            return None

        # Direct lookup (case-insensitive)
        lookup_key = cleaned.lower()
        if lookup_key in self._lookup:
            return self._lookup[lookup_key]

        # Remove trailing punctuation and try again
        cleaned_stripped = re.sub(r'[^\w\s\+\#\.]', '', cleaned).strip()
        if cleaned_stripped.lower() in self._lookup:
            return self._lookup[cleaned_stripped.lower()]

        # If it starts with a capital and has reasonable length,
        # consider it a valid skill even if not in dictionary
        if (len(cleaned) >= 2 and len(cleaned) <= 50 and
                re.match(r'^[A-Za-z]', cleaned) and
                not re.search(r'\d{4}', cleaned)):  # not a year
            return cleaned.strip()

        return None

    def normalize_list(self, raw_skills: List[str]) -> List[str]:
        """
        Normalize a list of raw skill strings.
        Returns deduplicated list of canonical skill names.
        """
        seen = set()
        result = []
        for raw in raw_skills:
            canonical = self.normalize(raw)
            if canonical and canonical not in seen:
                seen.add(canonical)
                result.append(canonical)
        return result

    def extract_skills_from_text(self, text: str) -> List[str]:
        """
        Find all canonical skills mentioned in a block of text.
        Uses the full alias dictionary for matching.
        """
        text_lower = text.lower()
        found = set()

        # Sort aliases by length (longest first) to prefer specific matches
        sorted_aliases = sorted(self._lookup.keys(), key=len, reverse=True)

        for alias in sorted_aliases:
            # Use word-boundary-aware matching
            pattern = r'(?<![a-zA-Z0-9])' + re.escape(alias) + r'(?![a-zA-Z0-9])'
            if re.search(pattern, text_lower):
                canonical = self._lookup[alias]
                found.add(canonical)

        return list(found)

    def get_skill_category(self, skill: str) -> str:
        """Return the category of a canonical skill."""
        return SKILL_CATEGORIES.get(skill, 'other')

    def calculate_skill_overlap(
        self, resume_skills: List[str], jd_skills: List[str]
    ):
        """
        Calculate skill overlap between resume and JD skills.
        Returns matched, missing, and coverage percentage.
        """
        resume_set = set(s.lower() for s in resume_skills)
        jd_set = set(s.lower() for s in jd_skills)

        matched = [s for s in jd_skills if s.lower() in resume_set]
        missing = [s for s in jd_skills if s.lower() not in resume_set]

        coverage = (len(matched) / len(jd_set) * 100) if jd_set else 0

        return {
            'matched': matched,
            'missing': missing,
            'coverage': round(coverage, 2),
            'matchCount': len(matched),
            'missingCount': len(missing),
            'totalRequired': len(jd_set),
        }
