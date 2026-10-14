import { Link } from 'react-router-dom';
import { Zap, Github, Linkedin, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl text-white">
                Skill<span className="gradient-text">Bridge</span> AI
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm mb-4">
              An academic ATS Resume Screening & Skill-Gap Diagnostic Platform connecting Students, Recruiters, and T&P Cells.
            </p>
            <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 text-xs text-amber-300">
              ⚠️ ATS Compatibility Scores are academic indicators based on TF-IDF + Cosine Similarity and may differ from proprietary employer ATS systems.
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold text-white mb-3">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Get Started</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Users */}
          <div>
            <h3 className="font-semibold text-white mb-3">For Users</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#students" className="hover:text-white transition-colors">Students</a></li>
              <li><a href="#recruiters" className="hover:text-white transition-colors">Recruiters</a></li>
              <li><a href="#tp-cell" className="hover:text-white transition-colors">T&P Cells</a></li>
              <li><Link to="/register?role=recruiter" className="hover:text-white transition-colors">Recruiter Access</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {year} SkillBridge AI. Final Year B.Tech CS Major Project. All data marked as demo where applicable.
          </p>
          <p className="text-xs text-slate-600">
            Built with React · Node.js · Python NLP · MongoDB Atlas
          </p>
        </div>
      </div>
    </footer>
  );
}
