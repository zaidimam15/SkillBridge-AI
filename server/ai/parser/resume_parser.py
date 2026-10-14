"""
SkillBridge AI — Resume Parser
Extracts structured information from PDF, DOCX, and TXT files.
"""

import re
import os
import fitz  # PyMuPDF
from docx import Document
from typing import Dict, List, Any, Optional


class ResumeParser:
    """Parses resume files and extracts structured information."""

    EMAIL_PATTERN = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
    PHONE_PATTERN = re.compile(r'(?:\+91[-\s]?)?[6-9]\d{9}|(?:\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}')
    URL_PATTERN = re.compile(r'https?://(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&/=]*')
    LINKEDIN_PATTERN = re.compile(r'(?:linkedin\.com/in/|linkedin\.com/pub/)([a-zA-Z0-9\-]+)')
    GITHUB_PATTERN = re.compile(r'(?:github\.com/)([a-zA-Z0-9\-]+)')

    SECTION_HEADERS = {
        'education': ['education', 'academic', 'qualification', 'academics', 'educational background'],
        'experience': ['experience', 'work experience', 'employment', 'professional experience', 'internship', 'internships', 'work history'],
        'skills': ['skills', 'technical skills', 'technologies', 'tech stack', 'core competencies', 'competencies', 'technical expertise'],
        'projects': ['projects', 'project work', 'personal projects', 'academic projects', 'key projects'],
        'certifications': ['certifications', 'certificates', 'courses', 'training', 'achievements', 'awards', 'honors'],
        'summary': ['summary', 'objective', 'profile', 'about', 'professional summary', 'career objective', 'overview'],
    }

    DEGREE_PATTERNS = [
        r'\b(B\.?Tech|Bachelor of Technology|B\.?E\.?|Bachelor of Engineering)\b',
        r'\b(M\.?Tech|Master of Technology|M\.?E\.?|Master of Engineering)\b',
        r'\b(B\.?Sc|Bachelor of Science|M\.?Sc|Master of Science)\b',
        r'\b(BCA|MCA|B\.?Com|M\.?Com|MBA|BBA|B\.?A\.?|M\.?A\.?)\b',
        r'\b(Ph\.?D\.?|Doctor of Philosophy)\b',
        r'\b(Diploma|Certificate Program)\b',
    ]

    def extract_text(self, file_path: str, file_type: str) -> str:
        """Extract raw text from resume file."""
        try:
            if file_type == 'pdf':
                return self._extract_pdf(file_path)
            elif file_type == 'docx':
                return self._extract_docx(file_path)
            elif file_type == 'txt':
                return self._extract_txt(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
        except Exception as e:
            raise RuntimeError(f"Failed to extract text from {file_type} file: {str(e)}")

    def _extract_pdf(self, file_path: str) -> str:
        """Extract text from PDF using PyMuPDF."""
        doc = fitz.open(file_path)
        text_parts = []
        for page in doc:
            text = page.get_text("text")
            if not text or not text.strip():
                # Fallback to blocks layout if standard text extraction is empty
                blocks = page.get_text("blocks")
                if isinstance(blocks, list):
                    text = "\n".join([b[4] for b in blocks if len(b) >= 5 and isinstance(b[4], str)])
            text_parts.append(text or "")
        doc.close()
        full_text = '\n'.join(text_parts)
        if len(full_text.strip()) < 15:
            raise RuntimeError(
                "Unable to extract text from this PDF. The file may be scanned, image-based, or empty. "
                "Please provide a text-based PDF."
            )
        return full_text

    def _extract_docx(self, file_path: str) -> str:
        """Extract text from DOCX."""
        doc = Document(file_path)
        parts = []
        for para in doc.paragraphs:
            if para.text.strip():
                parts.append(para.text)
        # Tables
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        parts.append(cell.text)
        full_text = '\n'.join(parts)
        if len(full_text.strip()) < 15:
            raise RuntimeError(
                "Unable to extract text from this DOCX file. The file may be empty or corrupted. "
                "Please provide a text-based DOCX, PDF, or TXT file."
            )
        return full_text

    def _extract_txt(self, file_path: str) -> str:
        """Extract text from TXT file."""
        content = ""
        for enc in ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']:
            try:
                with open(file_path, 'r', encoding=enc, errors='ignore') as f:
                    content = f.read()
                if content.strip():
                    break
            except Exception:
                continue
        if len(content.strip()) < 10:
            raise RuntimeError(
                "Unable to extract text from this TXT file. The file appears to be empty."
            )
        return content

    def parse(self, file_path: str, file_type: str) -> Dict[str, Any]:
        """Main parsing method — returns structured resume data."""
        raw_text = self.extract_text(file_path, file_type)
        lines = [line.strip() for line in raw_text.split('\n') if line.strip()]

        result = {
            'rawText': raw_text,
            'name': self._extract_name(lines),
            'email': self._extract_email(raw_text),
            'phone': self._extract_phone(raw_text),
            'location': self._extract_location(raw_text),
            'linkedin': self._extract_linkedin(raw_text),
            'github': self._extract_github(raw_text),
            'portfolio': self._extract_portfolio(raw_text),
            'summary': '',
            'education': [],
            'experience': [],
            'skills': {
                'technical': [],
                'programming': [],
                'frameworks': [],
                'tools': [],
                'databases': [],
                'cloud': [],
                'soft': [],
                'other': [],
            },
            'projects': [],
            'certifications': [],
            'achievements': [],
        }

        # Section-based extraction
        sections = self._split_into_sections(raw_text)
        result['summary'] = self._extract_summary(sections)
        result['education'] = self._extract_education(sections)
        result['experience'] = self._extract_experience(sections)
        result['projects'] = self._extract_projects(sections)
        result['certifications'] = self._extract_certifications(sections)
        result['skills'] = self._extract_skills(sections, raw_text)

        return result

    def _extract_name(self, lines: List[str]) -> str:
        """Extract candidate name — usually the first non-trivial line."""
        skip_keywords = ['resume', 'curriculum vitae', 'cv', 'profile', 'page']
        for line in lines[:5]:
            clean = line.strip()
            if (len(clean.split()) <= 5 and
                    len(clean) > 2 and
                    not any(k in clean.lower() for k in skip_keywords) and
                    not self.EMAIL_PATTERN.search(clean) and
                    not self.PHONE_PATTERN.search(clean) and
                    re.match(r'^[A-Za-z\s\.\-]+$', clean)):
                return clean
        return ''

    def _extract_email(self, text: str) -> str:
        match = self.EMAIL_PATTERN.search(text)
        return match.group(0).lower() if match else ''

    def _extract_phone(self, text: str) -> str:
        match = self.PHONE_PATTERN.search(text)
        return match.group(0) if match else ''

    def _extract_location(self, text: str) -> str:
        """Heuristic location extraction."""
        patterns = [
            r'(?:Location|Address|City)[:\s]+([A-Za-z\s,]+)',
            r'\b([A-Z][a-z]+(,?\s*[A-Z][a-z]+)*),?\s*(?:India|USA|UK|Canada|Germany|Australia)\b',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return ''

    def _extract_linkedin(self, text: str) -> str:
        match = self.LINKEDIN_PATTERN.search(text)
        if match:
            return f"https://linkedin.com/in/{match.group(1)}"
        return ''

    def _extract_github(self, text: str) -> str:
        match = self.GITHUB_PATTERN.search(text)
        if match:
            return f"https://github.com/{match.group(1)}"
        return ''

    def _extract_portfolio(self, text: str) -> str:
        """Extract portfolio URLs."""
        urls = self.URL_PATTERN.findall(text)
        for url in urls:
            if not any(x in url for x in ['linkedin', 'github', 'twitter', 'facebook']):
                return url
        return ''

    def _split_into_sections(self, text: str) -> Dict[str, str]:
        """Split resume text into sections based on headers."""
        sections = {key: '' for key in self.SECTION_HEADERS}
        lines = text.split('\n')
        current_section = 'other'
        section_text = {k: [] for k in self.SECTION_HEADERS}
        section_text['other'] = []

        for line in lines:
            line_lower = line.lower().strip()
            matched_section = None

            for section, keywords in self.SECTION_HEADERS.items():
                if any(kw in line_lower for kw in keywords):
                    # Check it looks like a header (short line)
                    if len(line.strip()) < 60:
                        matched_section = section
                        break

            if matched_section:
                current_section = matched_section
            else:
                section_text.get(current_section, section_text['other']).append(line)

        for section, lines_list in section_text.items():
            if section in sections:
                sections[section] = '\n'.join(lines_list)

        return sections

    def _extract_summary(self, sections: Dict) -> str:
        text = sections.get('summary', '').strip()
        if text:
            # Return first 500 chars
            return text[:500]
        return ''

    def _extract_education(self, sections: Dict) -> List[Dict]:
        """Extract education records."""
        text = sections.get('education', '')
        if not text:
            return []

        educations = []
        degree_pattern = '|'.join(self.DEGREE_PATTERNS)
        year_pattern = r'\b(19|20)\d{2}\b'

        chunks = re.split(r'\n{2,}', text)
        for chunk in chunks:
            if not chunk.strip():
                continue
            edu = {
                'degree': '',
                'institution': '',
                'year': '',
                'cgpa': '',
                'field': '',
            }

            # Degree
            degree_match = re.search(degree_pattern, chunk, re.IGNORECASE)
            if degree_match:
                edu['degree'] = degree_match.group(0)

            # Year
            years = re.findall(year_pattern, chunk)
            if years:
                edu['year'] = f"{min(years)}" if len(years) == 1 else f"{min(years)} - {max(years)}"

            # CGPA
            cgpa_match = re.search(r'(?:CGPA|GPA|Score)[:\s]*(\d+\.?\d*)', chunk, re.IGNORECASE)
            if cgpa_match:
                edu['cgpa'] = cgpa_match.group(1)

            # Institution (longest non-degree line)
            lines = [l.strip() for l in chunk.split('\n') if l.strip()]
            for line in lines:
                if (len(line) > 10 and
                        not re.search(degree_pattern, line, re.IGNORECASE) and
                        not re.search(year_pattern, line) and
                        not re.search(r'CGPA|GPA', line, re.IGNORECASE)):
                    edu['institution'] = line
                    break

            if edu['degree'] or edu['institution']:
                educations.append(edu)

        return educations[:5]  # Max 5 education records

    def _extract_experience(self, sections: Dict) -> List[Dict]:
        """Extract work experience and internships."""
        text = sections.get('experience', '')
        if not text:
            return []

        experiences = []
        chunks = re.split(r'\n{2,}', text)

        for chunk in chunks:
            if len(chunk.strip()) < 20:
                continue
            exp = {
                'title': '',
                'company': '',
                'duration': '',
                'description': '',
                'technologies': [],
            }

            lines = [l.strip() for l in chunk.split('\n') if l.strip()]
            if lines:
                exp['title'] = lines[0]
            if len(lines) > 1:
                exp['company'] = lines[1]

            # Duration
            dur_match = re.search(
                r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)[\s,]+\d{4}',
                chunk, re.IGNORECASE
            )
            if dur_match:
                exp['duration'] = dur_match.group(0)

            exp['description'] = ' '.join(lines[2:])[:400] if len(lines) > 2 else ''

            if exp['title']:
                experiences.append(exp)

        return experiences[:10]

    def _extract_projects(self, sections: Dict) -> List[Dict]:
        """Extract project entries."""
        text = sections.get('projects', '')
        if not text:
            return []

        projects = []
        chunks = re.split(r'\n{2,}', text)

        for chunk in chunks:
            if len(chunk.strip()) < 15:
                continue
            proj = {
                'title': '',
                'description': '',
                'technologies': [],
                'links': [],
            }

            lines = [l.strip() for l in chunk.split('\n') if l.strip()]
            if lines:
                proj['title'] = lines[0]
                proj['description'] = ' '.join(lines[1:])[:400]

            # Extract links
            proj['links'] = self.URL_PATTERN.findall(chunk)

            # Extract tech stack mentions
            tech_pattern = r'\b(?:using|built with|technologies?|tech stack|stack)[:\s]+([A-Za-z0-9,\s\.\+\#\-]+)'
            tech_match = re.search(tech_pattern, chunk, re.IGNORECASE)
            if tech_match:
                techs = re.split(r'[,|/]', tech_match.group(1))
                proj['technologies'] = [t.strip() for t in techs if t.strip()]

            if proj['title']:
                projects.append(proj)

        return projects[:10]

    def _extract_certifications(self, sections: Dict) -> List[Dict]:
        """Extract certifications and courses."""
        text = sections.get('certifications', '')
        if not text:
            return []

        certs = []
        lines = [l.strip() for l in text.split('\n') if l.strip() and len(l.strip()) > 5]

        for line in lines[:15]:
            cert = {'name': line[:200], 'issuer': '', 'year': ''}
            year_match = re.search(r'\b(20\d{2})\b', line)
            if year_match:
                cert['year'] = year_match.group(0)
            certs.append(cert)

        return certs

    def _extract_skills(self, sections: Dict, full_text: str) -> Dict[str, List[str]]:
        """Extract skills from skills section and full text."""
        from .skill_normalizer import SkillNormalizer
        normalizer = SkillNormalizer()

        skills_text = sections.get('skills', '') or full_text
        raw_skills = self._tokenize_skills(skills_text)
        canonical_skills = [normalizer.normalize(s) for s in raw_skills]
        canonical_skills = list(dict.fromkeys(filter(None, canonical_skills)))

        # Categorize
        categorized = {
            'technical': [],
            'programming': [],
            'frameworks': [],
            'tools': [],
            'databases': [],
            'cloud': [],
            'soft': [],
            'other': [],
        }

        from skills.skill_dictionary import SKILL_CATEGORIES
        for skill in canonical_skills:
            cat = SKILL_CATEGORIES.get(skill, '')
            if cat == 'programming_language':
                categorized['programming'].append(skill)
            elif cat in ('framework', 'library'):
                categorized['frameworks'].append(skill)
            elif cat == 'database':
                categorized['databases'].append(skill)
            elif cat == 'cloud':
                categorized['cloud'].append(skill)
            elif cat == 'tool':
                categorized['tools'].append(skill)
            elif cat == 'soft_skill':
                categorized['soft'].append(skill)
            else:
                categorized['technical'].append(skill)

        return categorized

    def _tokenize_skills(self, text: str) -> List[str]:
        """Tokenize skill text into individual skill candidates."""
        # Split by common delimiters
        text = re.sub(r'[•●▪▸►◆◇○]', ',', text)
        text = re.sub(r'\|', ',', text)
        parts = re.split(r'[,;\n\t]+', text)
        skills = []
        for part in parts:
            part = part.strip().strip('()-•*')
            if 1 < len(part) < 60:
                skills.append(part)
        return skills

    def get_quality_analysis(self, parsed_data: Dict) -> Dict:
        """Analyze resume quality and generate suggestions."""
        analysis = {
            'hasContactInfo': False,
            'hasEmail': False,
            'hasPhone': False,
            'hasSummary': False,
            'hasSkills': False,
            'hasProjects': False,
            'hasExperience': False,
            'hasEducation': False,
            'hasCertifications': False,
            'hasGithub': False,
            'hasLinkedin': False,
            'skillsCount': 0,
            'projectsCount': 0,
            'suggestions': [],
        }

        score = 0

        if parsed_data.get('email'):
            analysis['hasEmail'] = True
            analysis['hasContactInfo'] = True
            score += 10

        if parsed_data.get('phone'):
            analysis['hasPhone'] = True
            score += 5

        if parsed_data.get('summary'):
            analysis['hasSummary'] = True
            score += 10
        else:
            analysis['suggestions'].append("Add a professional summary or objective statement to your resume.")

        all_skills = []
        skills = parsed_data.get('skills', {})
        for cat_skills in skills.values():
            all_skills.extend(cat_skills)
        analysis['skillsCount'] = len(all_skills)

        if len(all_skills) >= 5:
            analysis['hasSkills'] = True
            score += 20
        elif len(all_skills) > 0:
            score += 10
            analysis['suggestions'].append(f"Your resume lists only {len(all_skills)} skills. Add more relevant technical skills.")
        else:
            analysis['suggestions'].append("Add a dedicated skills section with your technical and soft skills.")

        projects = parsed_data.get('projects', [])
        analysis['projectsCount'] = len(projects)

        if len(projects) >= 2:
            analysis['hasProjects'] = True
            score += 20
        elif len(projects) == 1:
            score += 10
            analysis['suggestions'].append("Add more projects (2–4 recommended) to demonstrate your practical skills.")
        else:
            analysis['suggestions'].append("Add at least 2 projects to show real-world application of your skills.")

        if parsed_data.get('experience'):
            analysis['hasExperience'] = True
            score += 15

        if parsed_data.get('education'):
            analysis['hasEducation'] = True
            score += 10

        if parsed_data.get('certifications'):
            analysis['hasCertifications'] = True
            score += 5

        if parsed_data.get('github'):
            analysis['hasGithub'] = True
            score += 5
        else:
            analysis['suggestions'].append("Add your GitHub profile URL to showcase your code and projects.")

        if parsed_data.get('linkedin'):
            analysis['hasLinkedin'] = True
            score += 5
        else:
            analysis['suggestions'].append("Add your LinkedIn profile URL for professional networking visibility.")

        # Check for measurable achievements
        experience_text = str(parsed_data.get('experience', ''))
        if not re.search(r'\d+%|\d+\s*(?:users?|clients?|projects?|teams?|members?)', experience_text):
            if analysis['hasExperience']:
                analysis['suggestions'].append("Add measurable achievements to your experience (e.g., 'Improved performance by 30%').")

        # Cap score at 100
        analysis['qualityScore'] = min(score, 100)

        return analysis
