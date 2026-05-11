import { useEffect, useState } from 'react';
import { getAdminValidators, createAdminValidator, deleteAdminValidator, getAdminStats } from '../api';
import { ShieldAlert, Plus, Trash2, LogOut, RefreshCw, Users, GraduationCap, Clock, ShieldCheck } from 'lucide-react';

export default function SuperAdminDashboard() {
  const user = JSON.parse(localStorage.getItem('sa_user') || '{}');

  const [validators, setValidators] = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting]     = useState(null);
  const [msg, setMsg]               = useState({ text: '', type: '' });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [vRes, sRes] = await Promise.all([getAdminValidators(), getAdminStats()]);
      setValidators(vRes.data);
      setStats(sRes.data);
    } catch (err) {
      flash(err.response?.data?.msg || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }

  function flash(text, type = 'success') {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAdminValidator(form);
      flash('Validator created successfully');
      setForm({ name: '', email: '', password: '' });
      setShowForm(false);
      fetchAll();
    } catch (err) {
      flash(err.response?.data?.msg || 'Failed to create validator', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Remove validator "${name}"? They will lose voting access.`)) return;
    setDeleting(id);
    try {
      await deleteAdminValidator(id);
      flash(`${name} removed as validator`);
      fetchAll();
    } catch (err) {
      flash(err.response?.data?.msg || 'Failed to remove validator', 'error');
    } finally {
      setDeleting(null);
    }
  }

  function handleLogout() {
    ['sa_token', 'sa_userId', 'sa_user', 'isSuperAdmin'].forEach(k => localStorage.removeItem(k));
    window.location.href = '/super-admin-login';
  }

  const inp = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white';

  const statCards = stats ? [
    { label: 'Total Students',    value: stats.totalStudents,    icon: GraduationCap, color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Verified Students', value: stats.verifiedStudents, icon: ShieldCheck,   color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Pending Requests',  value: stats.pendingRequests,  icon: Clock,         color: 'text-amber-600',  bg: 'bg-amber-50' },
    { label: 'Active Validators', value: stats.totalValidators,  icon: ShieldAlert,   color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Alumni',            value: stats.totalAlumni,      icon: Users,         color: 'text-purple-600', bg: 'bg-purple-50' },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldAlert size={22} className="text-amber-400" />
            <div>
              <h1 className="text-lg font-bold">Super Admin Portal</h1>
              <p className="text-slate-400 text-xs">EduNetChain — Validator Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm bg-slate-600 px-3 py-1.5 rounded-full">{user.name || 'Admin'}</span>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm transition">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Flash */}
        {msg.text && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium text-center ${
            msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {msg.text}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col items-center text-center">
                <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center mb-2`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Validators Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Validators</h2>
              <p className="text-xs text-gray-500 mt-0.5">Faculty members who vote on student credential requests</p>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchAll}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-slate-700 px-3 py-1.5 border border-gray-200 rounded-lg transition">
                <RefreshCw size={13} /> Refresh
              </button>
              <button onClick={() => setShowForm(v => !v)}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition">
                <Plus size={15} /> Add Validator
              </button>
            </div>
          </div>

          {/* Create Validator Form */}
          {showForm && (
            <div className="px-5 py-4 bg-amber-50 border-b border-amber-100">
              <p className="text-sm font-semibold text-amber-800 mb-3">New Validator Account</p>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className={inp} placeholder="Dr. John Smith" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className={inp} placeholder="faculty@college.edu" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Password</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className={inp} placeholder="Min 6 characters" minLength={6} required />
                </div>
                <div className="md:col-span-3 flex gap-2 pt-1">
                  <button type="submit" disabled={submitting}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60">
                    {submitting ? 'Creating...' : 'Create Validator'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Validators List */}
          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading...</div>
          ) : validators.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShieldAlert className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No validators yet</p>
              <p className="text-sm mt-1">Add faculty members to start the consensus voting system</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {validators.map(v => (
                <div key={v._id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">
                      {v.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{v.name}</p>
                      <p className="text-xs text-gray-500">{v.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      Added {new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full">
                      Active
                    </span>
                    <button
                      onClick={() => handleDelete(v._id, v.name)}
                      disabled={deleting === v._id}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 transition disabled:opacity-50">
                      <Trash2 size={12} /> {deleting === v._id ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">How consensus works</p>
          <p className="text-blue-700">Requires <strong>floor(N/2) + 1</strong> approvals from {validators.length} active validator{validators.length !== 1 ? 's' : ''} — currently needs <strong>{Math.floor(validators.length / 2) + 1}</strong> approval{Math.floor(validators.length / 2) + 1 !== 1 ? 's' : ''} to verify a student.</p>
        </div>

      </main>
    </div>
  );
}
