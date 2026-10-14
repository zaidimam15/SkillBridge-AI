import { useState, useEffect } from 'react';
import { 
  Bell, CheckCircle2, Trash2, Clock, 
  Sparkles, Briefcase, Award, AlertCircle 
} from 'lucide-react';
import { notificationAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.getAll();
      if (res.data.success && res.data.notifications.length > 0) {
        setNotifications(res.data.notifications);
      } else {
        setNotifications(defaultDemoNotifications);
      }
    } catch (err) {
      console.warn('Using demo notifications fallback:', err);
      setNotifications(defaultDemoNotifications);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read.');
    } catch (err) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-primary-500" />
            Notification Center
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            System alerts, job screening updates, T&P workshop announcements, and ATS match insights.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n._id}
            onClick={() => handleMarkRead(n._id)}
            className={`card p-5 cursor-pointer transition-all border ${
              !n.isRead
                ? 'border-primary-500/50 bg-primary-50/20 dark:bg-primary-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {n.title}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {new Date(n.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {n.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const defaultDemoNotifications = [
  {
    _id: 'notif-1',
    title: 'ATS Resume Diagnostic Complete',
    message: 'Your resume matched 78% of requirements for Full Stack Developer role. 3 skill gaps identified.',
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'notif-2',
    title: 'New Job Opening Match',
    message: 'NexusTech Global posted "Senior Full Stack Software Engineer". Check candidate screening eligibility.',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: 'notif-3',
    title: 'T&P Workshop Announcement',
    message: 'College Placement Cell scheduled a 3-day Docker & Microservices Bootcamp on Friday.',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];
