"""
Skill Normalizer
----------------
Normalizes different spellings and variations of skills
into the canonical skill names used by SkillBridge AI.
"""

import re
from typing import Optional

from skills.skill_dictionary import SKILL_CATEGORIES


class SkillNormalizer:
    """Normalize resume skill names to canonical skill names."""

    def __init__(self):
        self.skill_map = self._build_skill_map()

    def _build_skill_map(self):
        """Build normalized lookup map from the project's skill dictionary."""
        mapping = {}

        for skill in SKILL_CATEGORIES.keys():
            normalized = self._clean(skill)

            if normalized:
                mapping[normalized] = skill

        # Common aliases / variations
        aliases = {
            "js": "JavaScript",
            "javascript": "JavaScript",
            "ts": "TypeScript",
            "typescript": "TypeScript",

            "react": "React",
            "reactjs": "React",
            "react.js": "React",

            "node": "Node.js",
            "nodejs": "Node.js",
            "node.js": "Node.js",

            "express": "Express.js",
            "expressjs": "Express.js",
            "express.js": "Express.js",

            "mongo": "MongoDB",
            "mongodb": "MongoDB",
            "mongo db": "MongoDB",

            "mysql": "MySQL",
            "postgres": "PostgreSQL",
            "postgresql": "PostgreSQL",

            "html": "HTML",
            "html5": "HTML",

            "css": "CSS",
            "css3": "CSS",

            "c++": "C++",
            "cpp": "C++",

            "c#": "C#",
            "csharp": "C#",

            "java": "Java",
            "python": "Python",

            "git": "Git",
            "github": "GitHub",
            "git hub": "GitHub",

            "docker": "Docker",
            "k8s": "Kubernetes",
            "kubernetes": "Kubernetes",

            "aws": "AWS",
            "amazon web services": "AWS",

            "azure": "Microsoft Azure",
            "microsoft azure": "Microsoft Azure",

            "gcp": "Google Cloud",
            "google cloud": "Google Cloud",
            "google cloud platform": "Google Cloud",

            "sql": "SQL",
            "nosql": "NoSQL",

            "rest api": "REST API",
            "rest apis": "REST API",
            "restful api": "REST API",
            "restful apis": "REST API",

            "tailwind": "Tailwind CSS",
            "tailwindcss": "Tailwind CSS",

            "nextjs": "Next.js",
            "next.js": "Next.js",

            "vuejs": "Vue.js",
            "vue.js": "Vue.js",

            "angularjs": "Angular",
            "angular": "Angular",

            "spring boot": "Spring Boot",
            "springboot": "Spring Boot",

            "machine learning": "Machine Learning",
            "ml": "Machine Learning",

            "artificial intelligence": "Artificial Intelligence",
            "ai": "Artificial Intelligence",

            "deep learning": "Deep Learning",
            "nlp": "NLP",
            "natural language processing": "NLP",

            "data structures": "Data Structures",
            "dsa": "Data Structures",
            "data structures and algorithms": "Data Structures",

            "oop": "OOP",
            "oops": "OOP",
            "object oriented programming": "OOP",

            "dbms": "DBMS",
            "database management system": "DBMS",

            "computer networks": "Computer Networks",
            "cn": "Computer Networks",

            "operating systems": "Operating Systems",
            "os": "Operating Systems",
        }

        for alias, canonical in aliases.items():
            # Only add aliases that actually exist in the project's dictionary,
            # unless the dictionary uses a slightly different capitalization.
            mapping[self._clean(alias)] = canonical

        return mapping

    @staticmethod
    def _clean(value: str) -> str:
        """Clean a skill string for comparison."""
        if not value:
            return ""

        value = str(value).strip().lower()

        # Normalize common punctuation/spacing
        value = value.replace("&", " and ")
        value = re.sub(r"[\u2010-\u2015]", "-", value)
        value = re.sub(r"\s+", " ", value)

        return value.strip(" .,-_:;|/\\()[]{}")

    def normalize(self, skill: str) -> Optional[str]:
        """
        Normalize a single skill.

        Returns:
            Canonical skill name if recognized.
            Original cleaned value if not recognized.
            None for empty input.
        """
        if not skill:
            return None

        original = str(skill).strip()

        if not original:
            return None

        cleaned = self._clean(original)

        if not cleaned:
            return None

        # Direct dictionary/alias match
        if cleaned in self.skill_map:
            return self.skill_map[cleaned]

        # Try removing common separators
        compact = re.sub(r"[\s._-]+", "", cleaned)

        for key, canonical in self.skill_map.items():
            key_compact = re.sub(r"[\s._-]+", "", key)

            if compact == key_compact:
                return canonical

        # Try case-insensitive match against dictionary names
        for canonical in SKILL_CATEGORIES.keys():
            if self._clean(canonical) == cleaned:
                return canonical

        # If the skill is not in the dictionary, preserve it in a clean form
        # rather than losing information extracted from the resume.
        return original.strip()


__all__ = ["SkillNormalizer"]