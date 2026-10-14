import { Link } from 'react-router-dom';
import {
  ArrowRight, Zap, BarChart2, Target, Map, Users, Building2, GraduationCap,
  CheckCircle2, FileText, Brain, Layers, Shield, ChevronRight, Star,
  TrendingUp, Code2, BookOpen, Sparkles, Award, Clock, Play
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Animated counter hook
function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
          start += increment;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return [count, ref];
}

function StatCounter({ value, suffix, label }) {
  const [count, ref] = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-black gradient-text mb-2">
        {count}{suffix}
      </div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  );
}

const features = [
  { icon: BarChart2, title: 'ATS Compatibility Score', desc: 'TF-IDF + Cosine Similarity based ATS analysis with transparent methodology.', color: 'from-blue-500 to-indigo-600' },
  { icon: Target, title: 'Skill Gap Diagnosis', desc: 'Identify missing skills at four levels: Strong, Moderate, Priority, Recommended.', color: 'from-emerald-500 to-teal-600' },
  { icon: Map, title: 'Learning Roadmap', desc: 'Personalized step-by-step skill learning paths with curated resources.', color: 'from-violet-500 to-purple-600' },
  { icon: Code2, title: 'Capstone Projects', desc: 'Project recommendations to build evidence for every missing skill.', color: 'from-orange-500 to-red-500' },
  { icon: TrendingUp, title: 'Career Pathways', desc: 'Role compatibility analysis across Frontend, Backend, Data Science, DevOps, and more.', color: 'from-pink-500 to-rose-600' },
  { icon: Brain, title: 'Explainable AI', desc: 'Understand WHY you scored what you did — not just a number.', color: 'from-amber-500 to-yellow-500' },
  { icon: Users, title: 'Recruiter Screening', desc: 'AI-assisted candidate screening with human-review-first design.', color: 'from-cyan-500 to-blue-500' },
  { icon: Building2, title: 'T&P Cell Analytics', desc: 'Institutional dashboard for batch readiness and training priority detection.', color: 'from-indigo-500 to-primary-600' },
];

const steps = [
  { step: '01', title: 'Upload Your Resume', desc: 'Upload PDF, DOCX, or TXT resume. Our parser extracts your skills, projects, education, and experience.', icon: FileText },
  { step: '02', title: 'Add a Job Description', desc: 'Paste a JD or select from saved jobs. The system extracts required skills and requirements.', icon: BookOpen },
  { step: '03', title: 'Run ATS Analysis', desc: 'TF-IDF vectorization and cosine similarity calculates your compatibility score with full explanation.', icon: Zap },
  { step: '04', title: 'Bridge Your Gaps', desc: 'Get learning roadmaps, project recommendations, and career pathway guidance to become job-ready.', icon: Target },
];

const bridgeItems = [
  { role: '👨‍🎓 Student', items: ['ATS Score', 'Skill Gap', 'Roadmap', 'Projects'], color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30' },
  { role: '🏢 Recruiter', items: ['Job Posting', 'Bulk Screen', 'Shortlist', 'Compare'], color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30' },
  { role: '🏫 T&P Cell', items: ['Batch Report', 'Skill Trends', 'Training', 'Readiness'], color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30' },
];

export default function LandingPage() {
  return (
    <div className="bg-slate-950 text-white overflow-hidden">

      {/* ====== HERO ====== */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background */}
        <div className="hero-glow w-[700px] h-[700px] bg-primary-500 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="hero-glow w-[400px] h-[400px] bg-indigo-600 bottom-0 right-0 opacity-10" />
        <div className="absolute inset-0 dot-grid opacity-10" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-950/50 border border-primary-700/50 rounded-full px-4 py-2 mb-8 text-primary-300 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            Final Year B.Tech CS Major Project
            <ChevronRight className="w-4 h-4" />
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight">
            SkillBridge<span className="gradient-text"> AI</span>
            <br />
            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-300">
              From Resume to Career Readiness
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Analyze your resume against real job requirements, understand exactly where you stand,
            discover your skill gaps, and build a personalized path toward industry readiness.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register" id="hero-cta-primary"
              className="btn btn-primary btn-lg text-base w-full sm:w-auto group shadow-glow">
              <Zap className="w-5 h-5" />
              Analyze My Resume
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/register?intent=careers" id="hero-cta-secondary"
              className="btn btn-outline btn-lg text-base w-full sm:w-auto text-slate-300 border-slate-600 hover:border-primary-500 hover:text-white">
              <TrendingUp className="w-5 h-5" />
              Explore Career Paths
            </Link>
          </div>

          {/* Trust badge */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
            {['NLP-Powered TF-IDF Engine', 'Cosine Similarity Matching', '3-Way Bridge Platform', 'Academic Methodology'].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {item}
              </span>
            ))}
          </div>

          {/* Hero Visual */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-auto text-xs text-slate-500 font-mono">ATS Analysis Result</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-slate-800/60">
                  <div className="text-5xl font-black gradient-text mb-1">78</div>
                  <div className="text-slate-400 text-sm">ATS Compatibility Score</div>
                  <div className="text-xs text-slate-600 mt-1">Based on TF-IDF + Cosine Similarity</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60">
                  <div className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Skill Breakdown</div>
                  <div className="space-y-2">
                    {[['Strong', '12', 'emerald'], ['Moderate', '5', 'blue'], ['Missing', '6', 'red']].map(([label, count, color]) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className={`text-xs text-${color}-400`}>{label}</span>
                        <div className="flex gap-1">{Array.from({length: parseInt(count)}).map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full bg-${color}-500 opacity-80`} />
                        )).slice(0, 8)}</div>
                        <span className="text-xs text-slate-400">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60">
                  <div className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Top Priority Skills</div>
                  <div className="space-y-1.5">
                    {['Docker', 'AWS', 'TypeScript', 'Unit Testing'].map(skill => (
                      <div key={skill} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        <span className="text-xs text-slate-300">{skill}</span>
                        <span className="ml-auto text-xs text-red-400 font-medium">Priority</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== STATS ====== */}
      <section className="py-16 border-y border-slate-800">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCounter value={48} suffix="+" label="Career Roles Analyzed" />
          <StatCounter value={200} suffix="+" label="Skill Aliases Mapped" />
          <StatCounter value={6} suffix="" label="Capstone Project Types" />
          <StatCounter value={3} suffix="" label="User Roles Supported" />
        </div>
      </section>

      {/* ====== THREE-WAY BRIDGE ====== */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="badge badge-primary mb-4 text-sm">The Three-Way Bridge</div>
            <h2 className="text-4xl font-bold mb-4">One Platform, Three Perspectives</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              SkillBridge AI creates a unified ecosystem connecting all three stakeholders in career development.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            {bridgeItems.map((item, i) => (
              <div key={i} className="flex-1 w-full">
                <div className={`rounded-2xl border p-6 bg-gradient-to-br ${item.color} backdrop-blur-sm`}>
                  <h3 className="text-xl font-bold mb-4">{item.role}</h3>
                  <ul className="space-y-2">
                    {item.items.map(it => (
                      <li key={it} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
                {i < bridgeItems.length - 1 && (
                  <div className="hidden lg:flex justify-center py-4">
                    <div className="flex flex-col items-center gap-2 text-slate-600">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-primary-600 to-transparent" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Data flow visualization */}
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {['Resume Upload', '→', 'Parsing', '→', 'Skill Normalization', '→', 'TF-IDF', '→', 'Cosine Similarity', '→', 'Skill Gap', '→', 'Roadmap', '→', 'Analytics'].map((item, i) => (
              <span key={i} className={i % 2 === 1
                ? 'text-primary-500 text-xl font-bold'
                : 'bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300'}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section id="features" className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="badge badge-primary mb-4 text-sm">Platform Features</div>
            <h2 className="text-4xl font-bold mb-4">Everything you need for career readiness</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              A complete career intelligence platform with academic-grade NLP at its core.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={i}
                className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">From Upload to Career Clarity</h2>
            <p className="text-slate-400">Four simple steps to understand exactly where you stand</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="text-slate-800 text-7xl font-black absolute -top-4 -left-2 select-none">{step.step}</div>
                <div className="relative bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-primary-700/50 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-indigo-500/20 border border-primary-500/30 flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10">
                    <ArrowRight className="w-5 h-5 text-slate-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== AUDIENCE SECTIONS ====== */}
      <section id="students" className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="badge badge-info mb-4">For Students</div>
              <h2 className="text-4xl font-bold mb-6">Know your gaps before your interview does</h2>
              <ul className="space-y-4">
                {[
                  'ATS compatibility score with TF-IDF + Cosine Similarity explanation',
                  'Four-tier skill classification: Strong, Moderate, Priority, Recommended',
                  'Personalized learning roadmap for every missing skill',
                  'Capstone project recommendations to fill skill gaps with evidence',
                  'Career pathway compatibility across 14+ job roles',
                  'Resume quality analysis with actionable suggestions',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn btn-primary btn-lg mt-8 group">
                Start as Student <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
              {[
                { label: 'ATS Compatibility', score: 78, color: 'bg-primary-500' },
                { label: 'Skill Coverage', score: 65, color: 'bg-blue-500' },
                { label: 'Resume Quality', score: 72, color: 'bg-emerald-500' },
                { label: 'Career Readiness', score: 58, color: 'bg-amber-500' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="font-bold text-white">{item.score}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill ${item.color}`} style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="recruiters" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-slate-900 rounded-2xl border border-slate-800 p-4">
              <div className="text-xs text-slate-500 mb-3 px-2">Candidate Screening — AI-assisted, human-reviewed</div>
              <div className="space-y-2">
                {[
                  { name: 'Arjun S.', score: 84, status: 'Shortlisted', color: 'text-emerald-400' },
                  { name: 'Priya M.', score: 76, status: 'Review', color: 'text-amber-400' },
                  { name: 'Rahul K.', score: 68, status: 'Maybe', color: 'text-blue-400' },
                  { name: 'Sneha P.', score: 51, status: 'Review', color: 'text-slate-400' },
                ].map(c => (
                  <div key={c.name} className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-sm font-bold">{c.name[0]}</div>
                    <span className="flex-1 text-sm text-slate-300">{c.name}</span>
                    <span className="text-lg font-bold text-white">{c.score}%</span>
                    <span className={`text-xs font-medium ${c.color}`}>{c.status}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 px-2 py-2 bg-amber-900/20 rounded-lg">
                <p className="text-xs text-amber-400">⚠️ AI-assisted screening — human review required</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="badge badge-success mb-4">For Recruiters/HR</div>
              <h2 className="text-4xl font-bold mb-6">Screen smarter, hire better</h2>
              <ul className="space-y-4">
                {[
                  'Bulk resume upload and automated ATS analysis',
                  'Side-by-side candidate comparison by skill match',
                  'Filter and sort by ATS score, skills, or experience',
                  'Human-review-first design — AI assists, never decides',
                  'Shortlist management with recruiter notes',
                  'Clear AI disclaimer on every screening result',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register?role=recruiter" className="btn btn-success btn-lg mt-8 group">
                Start as Recruiter <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="tp-cell" className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="badge badge-warning mb-4">For T&P Cells</div>
            <h2 className="text-4xl font-bold mb-4">Institutional Career Intelligence</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Get a real-time view of your batch's career readiness and plan targeted training programs.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Batch Readiness', desc: 'Track average ATS scores and skill coverage across your entire batch.', icon: BarChart2, color: 'from-blue-500' },
              { title: 'Skill Gap Frequency', desc: 'Discover the most common missing skills affecting placement readiness.', icon: Target, color: 'from-red-500' },
              { title: 'Training Priorities', desc: 'AI-identified institutional training priorities based on actual skill data.', icon: BookOpen, color: 'from-emerald-500' },
              { title: 'Department Analytics', desc: 'Compare readiness across different departments and branches.', icon: Building2, color: 'from-purple-500' },
              { title: 'Role-wise Mapping', desc: 'See how many students are ready for each career role category.', icon: Users, color: 'from-amber-500' },
              { title: 'Historical Progress', desc: 'Track improvement trends in ATS scores and skill coverage over time.', icon: TrendingUp, color: 'from-pink-500' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 hover:border-slate-600 transition-all">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color}/20 border border-current/20 flex items-center justify-center mb-3`}>
                  <item.icon className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== RESPONSIBLE AI ====== */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Responsible AI Principles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              { title: 'Transparent Scoring', desc: 'Every score comes with a full explanation of contributing factors.' },
              { title: 'Human Oversight', desc: 'AI assists recruiters — humans make all final hiring decisions.' },
              { title: 'No Bias Attributes', desc: 'Gender, religion, caste, race are never used as matching features.' },
            ].map(item => (
              <div key={item.title} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="font-semibold mb-2 text-emerald-400">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 text-sm text-amber-300">
            ⚠️ Academic Disclaimer: ATS Compatibility Scores are based on TF-IDF + Cosine Similarity and are academic indicators. They may differ significantly from proprietary employer ATS systems and are NOT a guarantee of hiring success.
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="py-24 relative overflow-hidden">
        <div className="hero-glow w-[600px] h-[300px] bg-primary-600 top-0 left-1/2 -translate-x-1/2 opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-black mb-6">
            Ready to bridge your<br />
            <span className="gradient-text">skill gap?</span>
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Join SkillBridge AI and get your personalized career readiness report today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" id="cta-get-started" className="btn btn-primary btn-lg text-base group">
              <Zap className="w-5 h-5" />
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg text-base text-slate-300 bg-slate-800 hover:bg-slate-700 border-slate-700">
              Sign In
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
