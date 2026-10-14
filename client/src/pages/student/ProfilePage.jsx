import { useState, useEffect } from 'react';
import { 
  User, Mail, Building, GraduationCap, Calendar, Lock, 
  Save, CheckCircle2, Shield, Sparkles, Award 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { profileAPI, authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.studentProfile?.department || '',
    batch: user?.studentProfile?.batch || '',
    rollNumber: user?.studentProfile?.rollNumber || '',
    targetRole: user?.studentProfile?.targetRole || '',
    phone: user?.studentProfile?.phone || '',
    bio: user?.studentProfile?.bio || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await profileAPI.update({
        name: formData.name,
        studentProfile: {
          department: formData.department,
          batch: formData.batch,
          rollNumber: formData.rollNumber,
          targetRole: formData.targetRole,
          phone: formData.phone,
          bio: formData.bio,
        }
      });
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match.');
    }
    try {
      setSavingPassword(true);
      await authAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="card bg-slate-900 text-white p-8 rounded-2xl relative overflow-hidden flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-3xl font-black shadow-xl shrink-0">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{user?.name || 'Student Account'}</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30 uppercase">
              {user?.role || 'student'}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">{user?.email}</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>{formData.department}</span> • <span>Batch {formData.batch}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleProfileSubmit} className="card p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <User className="w-5 h-5 text-primary-500" />
              Academic & Personal Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="input-field text-sm bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Graduation Batch Year
                </label>
                <input
                  type="text"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Roll / Registration No.
                </label>
                <input
                  type="text"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Career Role
                </label>
                <input
                  type="text"
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Bio & Career Objectives
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="input-field text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary text-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handlePasswordSubmit} className="card p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Lock className="w-4 h-4 text-amber-500" />
              Security Settings
            </h2>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="input-field text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input-field text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input-field text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="btn-secondary w-full text-xs flex items-center justify-center gap-2 mt-2"
            >
              <Shield className="w-4 h-4 text-emerald-500" />
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
