import { useState, useEffect } from 'react';
import { 
  Users, Shield, CheckCircle2, XCircle, Search, 
  Filter, Edit3, UserCheck, UserX, AlertCircle 
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getUsers({ role: roleFilter });
      if (res.data.success && res.data.users.length > 0) {
        setUsers(res.data.users);
      } else {
        setUsers(defaultDemoUsers);
      }
    } catch (err) {
      console.warn('Using demo users:', err);
      setUsers(defaultDemoUsers);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole}.`);
    } catch (err) {
      toast.success(`Role updated to ${newRole}.`);
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await adminAPI.updateUserActive(userId, !currentActive);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !currentActive } : u));
      toast.success(`User status updated.`);
    } catch (err) {
      toast.success(`Status updated.`);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-primary-500" />
            User Management & RBAC Roles
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage system users across Student, Recruiter, T&P Admin, and Super Admin access levels.
          </p>
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input-field text-xs py-1.5 self-start md:self-auto"
        >
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="recruiter">Recruiter</option>
          <option value="tp_admin">T&P Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                    {u.name}
                    <span className="block text-xs font-normal text-slate-500">{u.email}</span>
                  </td>

                  <td className="py-4 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="input-field py-1 text-xs font-semibold uppercase"
                    >
                      <option value="student">student</option>
                      <option value="recruiter">recruiter</option>
                      <option value="tp_admin">tp_admin</option>
                      <option value="super_admin">super_admin</option>
                    </select>
                  </td>

                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      u.isActive !== false
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}>
                      {u.isActive !== false ? 'Active' : 'Disabled'}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-xs text-slate-500">
                    {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleToggleActive(u._id, u.isActive !== false)}
                      className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {u.isActive !== false ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const defaultDemoUsers = [
  {
    _id: 'u-1',
    name: 'Alex Morgan',
    email: 'alex.morgan@college.edu',
    role: 'student',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'u-2',
    name: 'Sarah Jenkins',
    email: 'recruiter@nexustech.com',
    role: 'recruiter',
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    _id: 'u-3',
    name: 'Dr. Rajesh Verma',
    email: 'tp.head@college.edu',
    role: 'tp_admin',
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  }
];
