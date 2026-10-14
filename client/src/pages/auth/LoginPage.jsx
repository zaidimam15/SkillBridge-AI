import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name}! 👋`);
      if (user.role === 'recruiter') navigate('/recruiter');
      else if (user.role === 'tp_admin' || user.role === 'super_admin') navigate('/tp');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Student Demo', email: 'student@demo.com', password: 'Student@123', color: 'text-primary-600' },
    { label: 'Recruiter Demo', email: 'recruiter@techcorp.ai', password: 'Recruiter@123', color: 'text-emerald-600' },
    { label: 'T&P Admin Demo', email: 'tp@skillbridge.ai', password: 'TnP@123', color: 'text-amber-600' },
  ];

  const fillDemo = (account) => {
    setForm({ email: account.email, password: account.password });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="hero-glow w-[500px] h-[500px] bg-primary-500 -top-40 -left-40" />
      <div className="hero-glow w-[400px] h-[400px] bg-indigo-600 -bottom-20 -right-20" />
      <div className="absolute inset-0 dot-grid opacity-20" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-glow">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-2xl text-white">
              Skill<span className="gradient-text">Bridge</span> AI
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400">Sign in to continue your career journey</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 border border-white/10 dark:border-slate-700/50 bg-slate-900/80 animate-slide-up">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 mb-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  id="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input pl-10 bg-slate-800/60 border-slate-600 text-white placeholder:text-slate-500 focus:ring-primary-500"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label text-slate-300 mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input pl-10 pr-10 bg-slate-800/60 border-slate-600 text-white placeholder:text-slate-500"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-submit-btn"
              className="btn btn-primary w-full btn-lg group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 mb-3 text-center">Quick demo access</p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map(account => (
                <button
                  key={account.email}
                  onClick={() => fillDemo(account)}
                  className={`text-xs ${account.color} bg-slate-800 hover:bg-slate-700 rounded-lg px-2 py-2 transition-colors font-medium`}
                >
                  {account.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-600 text-center mt-2">Click to fill credentials</p>
          </div>

          <p className="mt-4 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-400 font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
