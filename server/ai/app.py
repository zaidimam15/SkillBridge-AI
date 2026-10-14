"""
SkillBridge AI — AI Service API (Flask)
Provides HTTP endpoints for NLP/AI operations.
"""

import os
import sys
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

# Add ai directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from parser.resume_parser import ResumeParser
from parser.jd_parser import JDParser
from nlp.skill_normalizer import SkillNormalizer
from matching.tfidf_matcher import MatchingEngine

app = Flask(__name__)
CORS(app, origins=["http://localhost:5000", "http://localhost:5173", "http://127.0.0.1:5000", "http://127.0.0.1:5173"])

# Initialize components
resume_parser = ResumeParser()
jd_parser = JDParser()
normalizer = SkillNormalizer()
matching_engine = MatchingEngine(use_semantic=False)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'SkillBridge AI NLP Service', 'version': '1.0.0'})


@app.route('/parse/resume', methods=['POST'])
def parse_resume():
    """Parse a resume file and return structured data."""
    try:
        data = request.get_json()
        file_path = data.get('filePath')
        file_type = data.get('fileType', 'pdf').lower()

        if not file_path or not os.path.exists(file_path):
            return jsonify({'success': False, 'error': 'File not found'}), 400

        parsed = resume_parser.parse(file_path, file_type)
        quality = resume_parser.get_quality_analysis(parsed)

        # Collect all normalized skills
        all_raw_skills = []
        skills_data = parsed.get('skills', {})
        for cat_skills in skills_data.values():
            all_raw_skills.extend(cat_skills)

        normalized_skills = normalizer.normalize_list(all_raw_skills)
        parsed['normalizedSkills'] = normalized_skills

        return jsonify({
            'success': True,
            'parsedData': parsed,
            'qualityAnalysis': quality,
            'summary': {
                'skillsDetected': len(normalized_skills),
                'projectsDetected': len(parsed.get('projects', [])),
                'educationRecords': len(parsed.get('education', [])),
                'experienceRecords': len(parsed.get('experience', [])),
                'certifications': len(parsed.get('certifications', [])),
            }
        })

    except RuntimeError as e:
        return jsonify({'success': False, 'error': str(e)}), 422
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Failed to parse resume. Please verify the file contains readable text.',
            'detail': str(e) if os.getenv('FLASK_ENV') == 'development' else None,
        }), 500


@app.route('/parse/jd', methods=['POST'])
def parse_jd():
    """Parse a job description and return structured requirements."""
    try:
        data = request.get_json()
        jd_text = data.get('text', '')

        if len(jd_text.strip()) < 50:
            return jsonify({
                'success': False,
                'error': 'Job description is too short for reliable analysis. Please provide more details.'
            }), 400

        parsed = jd_parser.parse(jd_text)

        return jsonify({
            'success': True,
            'parsedData': parsed,
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Failed to parse job description.',
        }), 500


@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Run ATS analysis: TF-IDF + Cosine Similarity + Skill Gap.
    """
    try:
        data = request.get_json()

        resume_text = data.get('resumeText', '')
        jd_text = data.get('jdText', '')
        resume_skills = data.get('resumeSkills', [])
        jd_skills = data.get('jdSkills', [])
        jd_skill_weights = data.get('jdSkillWeights', {})

        if not resume_text or not jd_text:
            return jsonify({'success': False, 'error': 'Resume and JD text are required'}), 400

        result = matching_engine.analyze(
            resume_text=resume_text,
            jd_text=jd_text,
            resume_skills=resume_skills,
            jd_skills=jd_skills,
            jd_skill_weights=jd_skill_weights,
        )

        return jsonify({'success': True, 'analysis': result})

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Analysis failed. Please try again.',
        }), 500


@app.route('/normalize/skills', methods=['POST'])
def normalize_skills():
    """Normalize a list of raw skill strings."""
    try:
        data = request.get_json()
        raw_skills = data.get('skills', [])
        normalized = normalizer.normalize_list(raw_skills)
        return jsonify({'success': True, 'normalized': normalized})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/extract/skills', methods=['POST'])
def extract_skills():
    """Extract skills from free text."""
    try:
        data = request.get_json()
        text = data.get('text', '')
        skills = normalizer.extract_skills_from_text(text)
        return jsonify({'success': True, 'skills': skills})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    try:
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

if __name__ == '__main__':
    port = int(os.getenv('AI_SERVICE_PORT', 8000))
    debug = os.getenv('FLASK_ENV') == 'development'
    print(f"SkillBridge AI NLP Service starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
