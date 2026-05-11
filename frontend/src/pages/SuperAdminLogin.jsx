import { useState } from 'react';
import { superAdminLogin } from '../api';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';

export default function SuperAdminLogin() {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await superAdminLogin(form);
      localStorage.setItem('sa_token', res.data.token);
      localStorage.setItem('sa_userId', res.data.user.id);
      localStorage.setItem('sa_user', JSON.stringify(res.data.user));
      localStorage.setItem('isSuperAdmin', 'true');
      window.location.href = '/super-admin';
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 to-slate-700 items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-2xl mb-4 shadow-lg">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">EduNetChain</h1>
          <p className="text-slate-400 mt-1 text-sm">Super Admin Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Admin Sign In</h2>
          <p className="text-sm text-gray-500 mb-6">Manage validators and system settings</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="admin@college.edu"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60 mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          © 2025 EduNetChain · Restricted access
        </p>
      </div>
    </div>
  );
}
