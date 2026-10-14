import { Link } from 'react-router-dom';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
      <div className="card p-12 text-center max-w-md space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="w-20 h-20 rounded-3xl bg-primary-50 dark:bg-primary-950/60 text-primary-500 flex items-center justify-center mx-auto text-3xl font-black">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Page Not Found</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The page or resource you requested does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="btn-primary text-xs w-full flex items-center justify-center gap-2">
            <Home className="w-4 h-4" /> Return to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary text-xs w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
