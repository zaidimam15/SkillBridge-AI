"""
SkillBridge AI — JD Parser
Extracts structured requirements from Job Descriptions.
"""

import re
from typing import Dict, List, Any
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from nlp.skill_normalizer import SkillNormalizer


class JDParser:
    """Parses job description text to extract structured requirements."""

    # Common JD section headers
    SECTION_PATTERNS = {
        'responsibilities': [
            r'(?:responsibilities|duties|what you\'ll do|your role|role description)',
        ],
        'requirements': [
            r'(?:requirements|qualifications|what we\'re looking for|must have|required skills)',
        ],
        'preferred': [
            r'(?:preferred|nice to have|good to have|bonus|additional skills)',
        ],
        'about': [
            r'(?:about the role|overview|about us|company overview|job summary)',
        ],
    }

    def __init__(self):
        self.normalizer = SkillNormalizer()

    def parse(self, jd_text: str) -> Dict[str, Any]:
        """Parse a job description and return structured data."""
        result = {
            'title': self._extract_title(jd_text),
            'company': self._extract_company(jd_text),
            'experience': self._extract_experience(jd_text),
            'educationRequired': self._extract_education_requirement(jd_text),
            'roleCategory': self._classify_role(jd_text),
            'keywords': [],
            'mustHave': [],
            'preferred': [],
            'niceToHave': [],
            'normalizedSkills': [],
            'allSkills': [],
            'skillWeights': {},
            'responsibilities': [],
        }

        # Extract all skills from the full JD
        all_skills = self.normalizer.extract_skills_from_text(jd_text)
        result['normalizedSkills'] = all_skills
        result['allSkills'] = all_skills

        # Classify must-have vs preferred
        sections = self._split_sections(jd_text)
        req_text = sections.get('requirements', jd_text)
        pref_text = sections.get('preferred', '')

        req_skills = self.normalizer.extract_skills_from_text(req_text)
        pref_skills = self.normalizer.extract_skills_from_text(pref_text)

        result['mustHave'] = req_skills
        result['preferred'] = pref_skills

        # Assign weights
        weights = {}
        for skill in req_skills:
            weights[skill] = 2.0  # Must-have: high weight
        for skill in pref_skills:
            if skill not in weights:
                weights[skill] = 1.0  # Preferred: normal weight
        for skill in all_skills:
            if skill not in weights:
                weights[skill] = 0.5  # Mentioned: low weight

        result['skillWeights'] = weights

        # Extract responsibilities
        resp_text = sections.get('responsibilities', '')
        if resp_text:
            result['responsibilities'] = self._extract_bullet_points(resp_text)[:10]

        # Keywords
        result['keywords'] = self._extract_keywords(jd_text)

        return result

    def _extract_title(self, text: str) -> str:
        """Try to extract job title from the first few lines."""
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        # Look for title-like patterns
        title_patterns = [
            r'(?:job title|position|role)[:\s]+(.+)',
            r'^((?:Senior|Junior|Lead|Principal|Staff|Mid-level)?\s*(?:[A-Z][a-z]+\s*){1,5}(?:Developer|Engineer|Analyst|Designer|Manager|Architect|Scientist))',
        ]
        for pattern in title_patterns:
            for line in lines[:10]:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    return match.group(1).strip()

        # First reasonable line as title
        for line in lines[:5]:
            if 3 < len(line) < 80:
                return line

        return ''

    def _extract_company(self, text: str) -> str:
        """Extract company name."""
        patterns = [
            r'(?:company|organization|employer)[:\s]+([A-Z][A-Za-z\s&,\.]+)',
            r'(?:at|@|join)\s+([A-Z][A-Za-z\s&,\.]{2,40})',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return ''

    def _extract_experience(self, text: str) -> str:
        """Extract experience requirement."""
        patterns = [
            r'(\d+)\+?\s*(?:to|-)?\s*(\d+)?\s*years?\s*(?:of)?\s*(?:experience|exp)',
            r'(?:experience|exp)[:\s]+(\d+)\+?\s*years?',
            r'(fresher|entry.?level|0.?1\s*year)',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0).strip()
        return ''

    def _extract_education_requirement(self, text: str) -> str:
        """Extract education requirements."""
        patterns = [
            r'(?:B\.?Tech|Bachelor of Technology|B\.?E\.?|Bachelor of Engineering)',
            r'(?:M\.?Tech|Master of Technology|M\.?S\.?|Master of Science)',
            r'(?:BCA|MCA|B\.?Sc|M\.?Sc|MBA)',
            r'(?:Bachelor\'?s?|Master\'?s?)\s*degree',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0)
        return ''

    def _classify_role(self, text: str) -> str:
        """Classify the job into a role category."""
        text_lower = text.lower()
        role_keywords = {
            'Frontend Developer': ['react', 'angular', 'vue', 'frontend', 'front-end', 'ui developer'],
            'Backend Developer': ['node.js', 'django', 'flask', 'spring', 'backend', 'back-end', 'api developer'],
            'Full Stack Developer': ['full stack', 'fullstack', 'mern', 'mean', 'full-stack'],
            'Data Scientist': ['data science', 'machine learning', 'deep learning', 'data scientist'],
            'Data Analyst': ['data analyst', 'data analysis', 'tableau', 'power bi', 'sql'],
            'DevOps Engineer': ['devops', 'docker', 'kubernetes', 'ci/cd', 'infrastructure'],
            'Machine Learning Engineer': ['mlops', 'ml engineer', 'model deployment', 'pytorch', 'tensorflow'],
            'Cloud Engineer': ['aws', 'azure', 'gcp', 'cloud architect', 'cloud engineer'],
            'QA Engineer': ['qa', 'quality assurance', 'testing', 'automation testing'],
            'Cybersecurity': ['security', 'cybersecurity', 'penetration', 'ethical hacking'],
            'Android Developer': ['android', 'kotlin', 'android studio'],
            'iOS Developer': ['ios', 'swift', 'xcode'],
            'Java Developer': ['java developer', 'spring boot', 'j2ee'],
            'Python Developer': ['python developer', 'django developer', 'flask developer'],
        }

        for role, keywords in role_keywords.items():
            if any(kw in text_lower for kw in keywords):
                return role

        return 'Software Engineer'

    def _split_sections(self, text: str) -> Dict[str, str]:
        """Split JD text into sections."""
        sections = {}
        current_section = 'general'
        current_lines = []

        for line in text.split('\n'):
            line_lower = line.lower().strip()
            matched = False

            for section, patterns in self.SECTION_PATTERNS.items():
                for pattern in patterns:
                    if re.search(pattern, line_lower):
                        if current_lines:
                            sections[current_section] = '\n'.join(current_lines)
                        current_section = section
                        current_lines = []
                        matched = True
                        break
                if matched:
                    break

            if not matched:
                current_lines.append(line)

        if current_lines:
            sections[current_section] = '\n'.join(current_lines)

        return sections

    def _extract_bullet_points(self, text: str) -> List[str]:
        """Extract bullet point items from text."""
        lines = text.split('\n')
        bullets = []
        for line in lines:
            line = re.sub(r'^[\s\-•●▪▸►◆*]+', '', line).strip()
            if len(line) > 10:
                bullets.append(line[:200])
        return bullets

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from JD."""
        # Remove common filler words
        text_clean = re.sub(r'[^\w\s]', ' ', text.lower())
        words = text_clean.split()

        # Count frequency
        freq = {}
        skip = {'the', 'and', 'or', 'to', 'a', 'an', 'in', 'of', 'for',
                 'with', 'on', 'at', 'by', 'is', 'are', 'was', 'will',
                 'be', 'have', 'has', 'this', 'that', 'we', 'you', 'our',
                 'your', 'team', 'role', 'job', 'work', 'ability', 'good'}

        for word in words:
            if word not in skip and len(word) > 2:
                freq[word] = freq.get(word, 0) + 1

        sorted_kw = sorted(freq.items(), key=lambda x: x[1], reverse=True)
        return [k for k, v in sorted_kw[:20] if v >= 2]
