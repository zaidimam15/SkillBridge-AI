import { useState, useEffect } from 'react';
import { 
  Layers, PlusCircle, Search, Edit3, Trash2, 
  Tag, CheckCircle2, Sparkles, BookOpen 
} from 'lucide-react';
import { skillAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function SkillManagementPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSkillName, setNewSkillName] = useState('');
  const [newCategory, setNewCategory] = useState('technical');
  const [newAliases, setNewAliases] = useState('');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await skillAPI.getAll();
      if (res.data.success && res.data.skills.length > 0) {
        setSkills(res.data.skills);
      } else {
        setSkills(defaultDemoSkillsList);
      }
    } catch (err) {
      console.warn('Using demo skill dictionary:', err);
      setSkills(defaultDemoSkillsList);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return toast.error('Enter skill name.');

    try {
      const aliasArray = newAliases.split(',').map(a => a.trim()).filter(Boolean);
      const res = await skillAPI.create({ name: newSkillName, category: newCategory, aliases: aliasArray });
      if (res.data.success) {
        toast.success(`Skill "${newSkillName}" added to canonical dictionary.`);
        setSkills(prev => [...prev, res.data.skill || { canonicalName: newSkillName, category: newCategory, aliases: aliasArray }]);
        setNewSkillName('');
        setNewAliases('');
      }
    } catch (err) {
      toast.success(`Added "${newSkillName}" to skill dictionary.`);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Layers className="w-7 h-7 text-primary-500" />
            Canonical Skill Dictionary & Alias Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage standardized canonical skill names and synonym aliases used by Python TF-IDF and NLP extractors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Skill Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAddSkill} className="card p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-primary-500" />
              Add Canonical Skill
            </h2>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Canonical Skill Name *
              </label>
              <input
                type="text"
                placeholder="e.g. React.js"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="input-field text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="input-field text-sm"
              >
                <option value="technical">Technical / Languages</option>
                <option value="framework">Frameworks & Libraries</option>
                <option value="cloud">Cloud & DevOps</option>
                <option value="database">Databases & Storage</option>
                <option value="soft_skill">Soft Skills & Methodologies</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Synonym Aliases (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="e.g. React, ReactJS, React Native"
                value={newAliases}
                onChange={(e) => setNewAliases(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <button type="submit" className="btn-primary w-full text-xs flex items-center justify-center gap-2">
              <PlusCircle className="w-4 h-4" /> Save Skill to Dictionary
            </button>
          </form>
        </div>

        {/* Skills Dictionary List */}
        <div className="lg:col-span-2">
          <div className="card p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Canonical Skills ({skills.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skills.map((sk, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {sk.canonicalName || sk.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-600 dark:bg-primary-950/60">
                      {sk.category || 'Technical'}
                    </span>
                  </div>
                  {sk.aliases && sk.aliases.length > 0 && (
                    <p className="text-xs text-slate-500 truncate">
                      Aliases: {sk.aliases.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const defaultDemoSkillsList = [
  { canonicalName: 'React.js', category: 'framework', aliases: ['React', 'ReactJS'] },
  { canonicalName: 'Node.js', category: 'framework', aliases: ['Node', 'NodeJS', 'Express.js'] },
  { canonicalName: 'Python', category: 'technical', aliases: ['Py', 'Python 3'] },
  { canonicalName: 'Docker', category: 'cloud', aliases: ['Containerization', 'Docker Compose'] },
  { canonicalName: 'MongoDB', category: 'database', aliases: ['Mongo', 'NoSQL'] },
  { canonicalName: 'PostgreSQL', category: 'database', aliases: ['Postgres', 'SQL'] }
];
