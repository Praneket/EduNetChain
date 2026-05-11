import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LogOut, RefreshCw, ShieldCheck, Clock, CheckCircle,
  XCircle, History, ChevronDown, ChevronUp, FileText, Eye
} from 'lucide-react';

const API = import.meta.env.VITE_API || 'http://localhost:5000';

const TABS = [
  { id: 'pending',  label: 'Pending',  icon: Clock },
  { id: 'approved', label: 'Approved', icon: CheckCircle },
  { id: 'rejected', label: 'Rejected', icon: XCircle },
];

export default function ValidatorDashboard() {
  const [tab, setTab]                     = useState('pending');
  const [requests, setRequests]           = useState([]);
  const [requiredApprovals, setRequired]  = useState(0);
  const [loading, setLoading]             = useState(true);
  const [voting, setVoting]               = useState({});       // requestId -> loading
  const [myVotes, setMyVotes]             = useState({});       // requestId -> 'approve'|'reject'
  const [allVotes, setAllVotes]           = useState({});       // requestId -> votes[]
  const [expanded, setExpanded]           = useState({});       // requestId -> bool
  const [tamper, setTamper]               = useState({});       // studentId -> result
  const [history, setHistory]             = useState({});       // userId -> versions[]
  const [msg, setMsg]                     = useState({ text: '', type: '' });

  const user = JSON.parse(sessionStorage.getItem('val_user') || '{}');

  // Always read token fresh inside each function — avoids stale closure bug
  function getHeaders() {
    const t = sessionStorage.getItem('val_token');
    return { Authorization: `Bearer ${t}` };
  }

  useEffect(() => { fetchRequests(); }, [tab]);

  function flash(text, type = 'success') {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  }

  async function fetchRequests() {
    setLoading(true);
    const headers = getHeaders();
    try {
      const { data } = await axios.get(`${API}/api/requests?status=${tab}`, { headers });
      setRequests(data.requests || []);
      setRequired(data.requiredApprovals || 0);

      const votesMap = {};
      const myVotesMap = {};
      await Promise.all((data.requests || []).map(async (req) => {
        try {
          const v = await axios.get(`${API}/api/requests/${req._id}`, { headers });
          votesMap[req._id]   = v.data.votes || [];
          myVotesMap[req._id] = v.data.myVote || null;
        } catch {}
      }));
      setAllVotes(votesMap);
      setMyVotes(myVotesMap);
    } catch (err) {
      flash(err.response?.data?.msg || 'Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function castVote(requestId, vote) {
    setVoting(v => ({ ...v, [requestId]: true }));
    try {
      const { data } = await axios.post(`${API}/api/requests/${requestId}/vote`, { vote }, { headers: getHeaders() });
      flash(`Vote cast: ${vote} — consensus status: ${data.status}`);
      setMyVotes(v => ({ ...v, [requestId]: vote }));
      fetchRequests();
    } catch (err) {
      flash(err.response?.data?.msg || 'Vote failed', 'error');
    } finally {
      setVoting(v => ({ ...v, [requestId]: false }));
    }
  }

  async function checkTamper(studentId) {
    try {
      const { data } = await axios.get(`${API}/api/requests/tamper-check/${studentId}`, { headers: getHeaders() });
      setTamper(t => ({ ...t, [studentId]: data }));
    } catch {
      flash('Tamper check failed', 'error');
    }
  }

  async function toggleHistory(userId) {
    if (history[userId]) {
      setHistory(h => { const n = { ...h }; delete n[userId]; return n; });
      return;
    }
    try {
      const { data } = await axios.get(`${API}/api/requests/history/${userId}`, { headers: getHeaders() });
      setHistory(h => ({ ...h, [userId]: data.versions || [] }));
    } catch {
      flash('Failed to load history', 'error');
    }
  }

  function toggleExpand(id) {
    setExpanded(e => ({ ...e, [id]: !e[id] }));
  }

  function fileUrl(path) {
    const t = sessionStorage.getItem('val_token');
    return path?.startsWith('http')
      ? `${API}/api/users/file?token=${t}&url=${encodeURIComponent(path)}`
      : `${API}/${path?.replace(/\\/g, '/')}`;
  }

  function handleLogout() {
    ['val_token', 'val_userId', 'val_user', 'isValidator'].forEach(k => sessionStorage.removeItem(k));
    window.location.href = '/validator-login';
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck size={22} />
            <div>
              <h1 className="text-lg font-bold">Validator Portal</h1>
              <p className="text-indigo-200 text-xs">EduNetChain — Consensus Voting</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm bg-indigo-600 px-3 py-1.5 rounded-full">{user.name || 'Validator'}</span>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm transition">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Consensus bar */}
      <div className="bg-indigo-50 border-b border-indigo-100">
        <div className="max-w-5xl mx-auto px-4 py-2 text-sm text-indigo-700 flex gap-4">
          <span>Required approvals: <strong>{requiredApprovals}</strong></span>
          <span className="text-indigo-400">|</span>
          <span>Rule: floor(N/2) + 1</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition ${
                tab === id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <Icon size={14} /> {label}
              {id === 'pending' && requests.length > 0 && tab !== 'pending' && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 leading-5">{requests.length}</span>
              )}
            </button>
          ))}
          <button onClick={fetchRequests}
            className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 px-3 transition">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6">

        {/* Flash message */}
        {msg.text && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium text-center ${
            msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {msg.text}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No {tab} requests</p>
          </div>
        ) : (
          requests.map(req => {
            const student  = req.studentId;
            const votes    = allVotes[req._id] || [];
            const myVote   = myVotes[req._id];
            const isOpen   = expanded[req._id];
            const tamperR  = tamper[student?._id];
            const versions = history[student?._id];
            const alreadyVoted = !!myVote;

            return (
              <div key={req._id} className="bg-white border border-gray-200 rounded-xl mb-4 shadow-sm overflow-hidden">

                {/* Card header — always visible */}
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-lg">{student?.name}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">ADD</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          req.status === 'approved' ? 'bg-green-100 text-green-700' :
                          req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{req.status}</span>
                      </div>
                      <p className="text-sm text-gray-500">{student?.email}</p>
                      {student?.educationInfo && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {student.educationInfo.degree} · {student.educationInfo.institution || student.educationInfo.institute} · {student.educationInfo.year}
                        </p>
                      )}
                    </div>
                    <button onClick={() => toggleExpand(req._id)}
                      className="text-gray-400 hover:text-indigo-600 transition p-1">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>

                  {/* Vote progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Consensus progress</span>
                      <span>{req.approvalCount} / {requiredApprovals} approvals needed</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: requiredApprovals > 0 ? `${Math.min((req.approvalCount / requiredApprovals) * 100, 100)}%` : '0%' }} />
                    </div>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span className="text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle size={11} /> {req.approvalCount} Approved
                      </span>
                      <span className="text-red-500 font-medium flex items-center gap-1">
                        <XCircle size={11} /> {req.rejectCount} Rejected
                      </span>
                      <span className="text-gray-400">{votes.length} of {requiredApprovals + req.rejectCount} validators voted</span>
                    </div>
                  </div>

                  {/* Who voted */}
                  {votes.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {votes.map((v, i) => (
                        <span key={i} className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                          v.vote === 'approve' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {v.vote === 'approve' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                          {v.validatorId?.name || 'Validator'}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* My vote status */}
                  {alreadyVoted && (
                    <div className={`mt-3 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold ${
                      myVote === 'approve' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {myVote === 'approve' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      You voted: {myVote === 'approve' ? 'Approved' : 'Rejected'}
                    </div>
                  )}
                </div>

                {/* Expanded section — student details + voting */}
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-4">

                    {/* Student details */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Student Details</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        {[
                          ['Name',      student?.name],
                          ['Email',     student?.email],
                          ['Degree',    student?.educationInfo?.degree],
                          ['Institute', student?.educationInfo?.institution || student?.educationInfo?.institute],
                          ['Year',      student?.educationInfo?.year],
                          ['Branch',    student?.educationInfo?.branch],
                          ['Student ID',student?.educationInfo?.studentId],
                          ['Skills',    student?.skills?.join(', ')],
                        ].filter(([, v]) => v).map(([label, value]) => (
                          <div key={label} className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                            <p className="font-medium text-gray-800 text-xs break-words">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documents */}
                    {(student?.resumePath || student?.certificates?.length > 0) && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Documents</p>
                        <div className="flex flex-wrap gap-2">
                          {student?.resumePath && (
                            <a href={fileUrl(student.resumePath)} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-indigo-400 text-gray-700 hover:text-indigo-700 px-3 py-2 rounded-lg text-xs font-medium transition">
                              <FileText size={13} /> View Resume
                            </a>
                          )}
                          {student?.certificates?.map((cert, i) => (
                            <a key={i} href={fileUrl(cert)} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-indigo-400 text-gray-700 hover:text-indigo-700 px-3 py-2 rounded-lg text-xs font-medium transition">
                              <Eye size={13} /> Certificate {i + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tamper check result */}
                    {tamperR && (
                      <div className={`text-xs px-4 py-3 rounded-lg ${
                        tamperR.status === 'valid'     ? 'bg-green-50 text-green-700 border border-green-200' :
                        tamperR.status === 'tampered'  ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <p className="font-semibold mb-1">{tamperR.msg}</p>
                        {tamperR.currentHash && <p className="font-mono break-all">Current hash: {tamperR.currentHash}</p>}
                        {tamperR.storedHash  && <p className="font-mono break-all">Stored hash:  {tamperR.storedHash}</p>}
                      </div>
                    )}

                    {/* Version history */}
                    {versions && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Credential Version History</p>
                        {versions.length === 0 ? (
                          <p className="text-xs text-gray-400">No versions yet</p>
                        ) : versions.map((v, i) => (
                          <div key={i} className="border-l-2 border-indigo-300 pl-3 mb-3 last:mb-0">
                            <p className="text-xs font-semibold text-gray-700">Version {v.version} · {new Date(v.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs font-mono text-gray-500 break-all mt-0.5">Hash: {v.hash}</p>
                            {v.previousHash && <p className="text-xs font-mono text-gray-400 break-all">Prev: {v.previousHash}</p>}
                            {v.txHash && v.txHash !== 'pending' && <p className="text-xs text-indigo-500">Tx: {v.txHash.slice(0, 24)}...</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">

                      {/* VOTE BUTTONS — only on pending + not yet voted */}
                      {tab === 'pending' && !alreadyVoted && (
                        <>
                          <button
                            onClick={() => castVote(req._id, 'approve')}
                            disabled={voting[req._id]}
                            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition shadow-sm">
                            <CheckCircle size={15} />
                            {voting[req._id] ? 'Voting...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => castVote(req._id, 'reject')}
                            disabled={voting[req._id]}
                            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition shadow-sm">
                            <XCircle size={15} />
                            {voting[req._id] ? 'Voting...' : 'Reject'}
                          </button>
                        </>
                      )}

                      {tab === 'pending' && alreadyVoted && (
                        <div className="text-sm text-gray-500 italic py-2">
                          You have already cast your vote on this request.
                        </div>
                      )}

                      {/* Tamper check */}
                      {student?._id && (
                        <button onClick={() => checkTamper(student._id)}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-300 hover:border-indigo-400 text-gray-700 hover:text-indigo-700 text-sm rounded-lg transition">
                          🔍 Tamper Check
                        </button>
                      )}

                      {/* History toggle */}
                      {student?._id && (
                        <button onClick={() => toggleHistory(student._id)}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-300 hover:border-indigo-400 text-gray-700 hover:text-indigo-700 text-sm rounded-lg transition">
                          <History size={14} /> {versions ? 'Hide History' : 'View History'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
