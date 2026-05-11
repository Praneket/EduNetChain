import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getMyProfile, updateProfile, updateResume, getStudentVotes, getCredentialHistory } from "../api";
import { Pencil, Save, CheckCircle, GraduationCap, Phone, MapPin, X, Shield, FileText, ExternalLink, Plus, Briefcase, Code, Trash2, ShieldCheck, Clock, XCircle, ChevronDown, ChevronUp, Upload, Zap } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(null); // "basic" | "education"
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", institution: "", degree: "", year: "", studentId: "" });

  const [projects, setProjects]     = useState([]);
  const [experience, setExperience] = useState([]);
  const [editSection, setEditSection] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [voteData, setVoteData]       = useState(null);
  const [history, setHistory]         = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [newResume, setNewResume]     = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeSaved, setResumeSaved] = useState(false);

  const emptyProject    = { title: '', description: '', techStack: '', link: '', year: '' };
  const emptyExperience = { company: '', role: '', duration: '', description: '' };

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await getMyProfile();
      const u = res.data;
      setProfile(u);
      setProjects(u.projects || []);
      setExperience(u.experience || []);
      setForm({
        name: u.name || "",
        phone: u.personalInfo?.phone || "",
        address: u.personalInfo?.address || "",
        institution: u.educationInfo?.institution || u.educationInfo?.institute || "",
        degree: u.educationInfo?.degree || "",
        year: u.educationInfo?.year || "",
        studentId: u.educationInfo?.studentId || "",
      });
      try { const vRes = await getStudentVotes(u._id); setVoteData(vRes.data); } catch {}
      try { const hRes = await getCredentialHistory(u._id); setHistory(hRes.data.versions || []); } catch {}

    } catch { navigate("/login"); }
  };

  const handleSaveSection = async (section) => {
    setSaving(true);
    try {
      await updateProfile(section === 'projects' ? { projects } : { experience });
      await fetchProfile();
      setEditSection(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        personalInfo: { phone: form.phone, address: form.address },
      });
      await fetchProfile();
      setEditing(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.err || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleResumeUpload = async () => {
    if (!newResume) return;
    setResumeUploading(true);
    try {
      const fd = new FormData();
      fd.append('resume', newResume);
      await updateResume(fd);
      setNewResume(null);
      setResumeSaved(true);
      setTimeout(() => setResumeSaved(false), 3000);
      await fetchProfile();
    } catch (err) {
      alert(err.response?.data?.msg || 'Resume upload failed');
    } finally { setResumeUploading(false); }
  };

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] bg-white transition";

  if (!profile) return (
    <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-[#0a66c2] border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Header userRole="student" userName={form.name || profile.name} />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {saved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> Profile updated successfully!
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-[#0a66c2] to-[#004182] relative" />

          {/* Avatar + Name */}
          <div className="px-6 pb-5">
            <div className="flex items-end justify-between -mt-10 mb-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center border-4 border-white shadow-md">
                <span className="text-white text-3xl font-bold">{(form.name || "S").charAt(0).toUpperCase()}</span>
              </div>
              <button
                onClick={() => setEditing(editing === "basic" ? null : "basic")}
                className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            </div>

            {editing === "basic" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Phone</label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inp} placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Address</label>
                    <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className={inp} placeholder="City, State" />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 bg-[#0a66c2] text-white text-sm font-semibold rounded-full hover:bg-[#004182] transition disabled:opacity-60">
                    <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 rounded-full hover:bg-gray-100 transition">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900">{form.name}</h1>
                <p className="text-gray-600 text-sm mt-0.5">{form.degree || "Student"} · {form.institution || "EduNetChain"}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                  {form.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{form.phone}</span>}
                  {form.address && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{form.address}</span>}
                </div>

              </>
            )}
          </div>
        </div>

        {/* Education Card — permanently locked after registration */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#0a66c2]" /> Education
            </h2>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Locked after registration
            </span>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-[#0a66c2]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{form.institution || "—"}</p>
              <p className="text-sm text-gray-600">{form.degree || "—"}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {form.year ? `Class of ${form.year}` : ""}
                {form.studentId ? ` · Roll: ${form.studentId}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Skills Card — freely editable, no validator needed */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#0a66c2]" /> Skills
            </h2>
            {editSection === 'skills' ? (
              <div className="flex gap-2">
                <button onClick={async () => { setSaving(true); try { await updateProfile({ skills: profile.skills }); await fetchProfile(); setEditSection(null); setSaved(true); setTimeout(() => setSaved(false), 3000); } catch(e){ alert(e.response?.data?.msg||'Failed'); } finally { setSaving(false); } }} disabled={saving}
                  className="flex items-center gap-1 px-4 py-1.5 bg-[#0a66c2] text-white text-sm font-semibold rounded-full hover:bg-[#004182] transition disabled:opacity-60">
                  <Save className="w-3.5 h-3.5" />{saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => { setEditSection(null); fetchProfile(); }}
                  className="px-3 py-1.5 text-sm text-gray-500 rounded-full hover:bg-gray-100 transition">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setEditSection('skills')}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50 transition">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>

          {editSection === 'skills' ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const t = skillInput.trim(); if (t && !profile.skills?.includes(t)) setProfile(p => ({...p, skills: [...(p.skills||[]), t]})); setSkillInput(''); }}}
                  className={inp}
                  placeholder="Type skill and press Enter"
                />
                <button type="button" onClick={() => { const t = skillInput.trim(); if (t && !profile.skills?.includes(t)) setProfile(p => ({...p, skills: [...(p.skills||[]), t]})); setSkillInput(''); }}
                  className="px-4 py-2 bg-[#0a66c2] text-white text-sm font-semibold rounded-lg hover:bg-[#004182] transition whitespace-nowrap">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(profile.skills || []).map(s => (
                  <span key={s} className="flex items-center gap-1 px-3 py-1 bg-[#0a66c2] text-white text-xs font-semibold rounded-full">
                    {s}
                    <button onClick={() => setProfile(p => ({...p, skills: p.skills.filter(x => x !== s)}))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(profile.skills || []).length === 0
                ? <p className="text-sm text-gray-400">No skills added yet.</p>
                : (profile.skills || []).map(s => (
                    <span key={s} className="px-3 py-1 bg-blue-50 text-[#0a66c2] text-xs font-semibold rounded-full border border-blue-100">{s}</span>
                  ))
              }
            </div>
          )}
        </div>

        {/* Experience Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#0a66c2]" /> Experience
            </h2>
            <div className="flex gap-2">
              {editSection === 'experience' ? (
                <>
                  <button onClick={() => handleSaveSection('experience')} disabled={saving}
                    className="flex items-center gap-1 px-4 py-1.5 bg-[#0a66c2] text-white text-sm font-semibold rounded-full hover:bg-[#004182] transition disabled:opacity-60">
                    <Save className="w-3.5 h-3.5" />{saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => { setEditSection(null); setExperience(profile.experience || []); }}
                    className="px-3 py-1.5 text-sm text-gray-500 rounded-full hover:bg-gray-100 transition">Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditSection('experience')}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50 transition">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              )}
            </div>
          </div>

          {editSection === 'experience' ? (
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
                  <button onClick={() => setExperience(experience.filter((_, j) => j !== i))}
                    className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Company</label>
                      <input value={exp.company} onChange={e => { const a=[...experience]; a[i]={...a[i],company:e.target.value}; setExperience(a); }} className={inp} placeholder="Company name" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Role</label>
                      <input value={exp.role} onChange={e => { const a=[...experience]; a[i]={...a[i],role:e.target.value}; setExperience(a); }} className={inp} placeholder="Software Intern" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Duration</label>
                      <input value={exp.duration} onChange={e => { const a=[...experience]; a[i]={...a[i],duration:e.target.value}; setExperience(a); }} className={inp} placeholder="Jun 2024 – Aug 2024" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                      <textarea value={exp.description} onChange={e => { const a=[...experience]; a[i]={...a[i],description:e.target.value}; setExperience(a); }} className={`${inp} resize-none`} rows={2} placeholder="What you worked on…" />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setExperience([...experience, { ...emptyExperience }])}
                className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-[#0a66c2] hover:text-[#0a66c2] transition flex items-center justify-center gap-1">
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            </div>
          ) : experience.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No experience added yet.</p>
          ) : (
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-[#0a66c2]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{exp.role || '—'}</p>
                    <p className="text-sm text-[#0a66c2]">{exp.company}</p>
                    {exp.duration && <p className="text-xs text-gray-400 mt-0.5">{exp.duration}</p>}
                    {exp.description && <p className="text-sm text-gray-600 mt-1">{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Code className="w-5 h-5 text-[#0a66c2]" /> Projects
            </h2>
            <div className="flex gap-2">
              {editSection === 'projects' ? (
                <>
                  <button onClick={() => handleSaveSection('projects')} disabled={saving}
                    className="flex items-center gap-1 px-4 py-1.5 bg-[#0a66c2] text-white text-sm font-semibold rounded-full hover:bg-[#004182] transition disabled:opacity-60">
                    <Save className="w-3.5 h-3.5" />{saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => { setEditSection(null); setProjects(profile.projects || []); }}
                    className="px-3 py-1.5 text-sm text-gray-500 rounded-full hover:bg-gray-100 transition">Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditSection('projects')}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50 transition">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              )}
            </div>
          </div>

          {editSection === 'projects' ? (
            <div className="space-y-4">
              {projects.map((proj, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
                  <button onClick={() => setProjects(projects.filter((_, j) => j !== i))}
                    className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Project Title</label>
                      <input value={proj.title} onChange={e => { const a=[...projects]; a[i]={...a[i],title:e.target.value}; setProjects(a); }} className={inp} placeholder="My Awesome Project" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Tech Stack</label>
                      <input value={proj.techStack} onChange={e => { const a=[...projects]; a[i]={...a[i],techStack:e.target.value}; setProjects(a); }} className={inp} placeholder="React, Node.js…" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Year</label>
                      <input value={proj.year} onChange={e => { const a=[...projects]; a[i]={...a[i],year:e.target.value}; setProjects(a); }} className={inp} placeholder="2024" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                      <textarea value={proj.description} onChange={e => { const a=[...projects]; a[i]={...a[i],description:e.target.value}; setProjects(a); }} className={`${inp} resize-none`} rows={2} placeholder="What this project does…" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Link (GitHub / Live)</label>
                      <input value={proj.link} onChange={e => { const a=[...projects]; a[i]={...a[i],link:e.target.value}; setProjects(a); }} className={inp} placeholder="https://github.com/…" />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setProjects([...projects, { ...emptyProject }])}
                className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-[#0a66c2] hover:text-[#0a66c2] transition flex items-center justify-center gap-1">
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>
          ) : projects.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No projects added yet.</p>
          ) : (
            <div className="space-y-4">
              {projects.map((proj, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900">{proj.title || '—'}</p>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0a66c2] flex-shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  {proj.techStack && <p className="text-xs text-[#0a66c2] mt-0.5">{proj.techStack}</p>}
                  {proj.year && <p className="text-xs text-gray-400">{proj.year}</p>}
                  {proj.description && <p className="text-sm text-gray-600 mt-1">{proj.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents Card */}
        {(profile.certificates?.length > 0 || profile.resumePath) && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-[#0a66c2]" /> Documents
            </h2>
            <div className="space-y-3">
              {profile.resumePath && (
                <a
                  href={profile.resumePath.startsWith('http') ? profile.resumePath : `${import.meta.env.VITE_API || 'http://localhost:5000'}/${profile.resumePath.replace(/\\/g, '/')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#0a66c2] hover:bg-blue-50 transition group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100">
                    <FileText className="w-5 h-5 text-[#0a66c2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Resume</p>
                    <p className="text-xs text-gray-400 truncate">{profile.resumePath.split('/').pop()}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#0a66c2]" />
                </a>
              )}
              {profile.certificates?.map((cert, i) => (
                <a
                  key={i}
                  href={cert.startsWith('http') ? cert : `${import.meta.env.VITE_API || 'http://localhost:5000'}/${cert.replace(/\\/g, '/')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#0a66c2] hover:bg-blue-50 transition group"
                >
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Certificate {i + 1}</p>
                    <p className="text-xs text-gray-400 truncate">{cert.split('/').pop()}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#0a66c2]" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Validator Votes Card */}
        {voteData && voteData.request && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> Validator Consensus
            </h2>

            {/* Status badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                voteData.request.status === 'approved' ? 'bg-green-100 text-green-700' :
                voteData.request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {voteData.request.status === 'approved' && <CheckCircle className="w-4 h-4" />}
                {voteData.request.status === 'rejected' && <XCircle className="w-4 h-4" />}
                {voteData.request.status === 'pending'  && <Clock className="w-4 h-4" />}
                {voteData.request.status.charAt(0).toUpperCase() + voteData.request.status.slice(1)}
              </span>
              <span className="text-xs text-gray-400">
                {voteData.request.type} request · {new Date(voteData.request.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Vote progress */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Votes cast</span>
                <span className="font-medium text-gray-800">
                  {voteData.request.approvalCount + voteData.request.rejectCount} / {voteData.requiredApprovals + voteData.request.rejectCount}
                </span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> {voteData.request.approvalCount} Approvals
                </span>
                <span className="text-gray-300">·</span>
                <span className="flex items-center gap-1 text-red-500 font-medium">
                  <XCircle className="w-3.5 h-3.5" /> {voteData.request.rejectCount} Rejections
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-gray-500 text-xs">Need {voteData.requiredApprovals} to approve</span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: voteData.requiredApprovals > 0 ? `${Math.min((voteData.request.approvalCount / voteData.requiredApprovals) * 100, 100)}%` : '0%' }}
                />
              </div>
            </div>

            {/* Individual votes */}
            {voteData.votes?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Validator Votes</p>
                <div className="space-y-2">
                  {voteData.votes.map((v, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                          {v.validatorId?.name?.charAt(0).toUpperCase() || 'V'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{v.validatorId?.name || 'Validator'}</p>
                          <p className="text-xs text-gray-400 capitalize">{v.validatorId?.role}</p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        v.vote === 'approve' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {v.vote === 'approve' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {v.vote === 'approve' ? 'Approved' : 'Rejected'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Credential Version History */}
        {history.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <button
              onClick={() => setShowHistory(v => !v)}
              className="w-full flex items-center justify-between"
            >
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" /> Credential Version History
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-normal">{history.length} version{history.length > 1 ? 's' : ''}</span>
              </h2>
              {showHistory ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {showHistory && (
              <div className="mt-4 space-y-3">
                {history.map((v, i) => (
                  <div key={i} className="border-l-2 border-indigo-300 pl-4 py-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">Version {v.version}</p>
                      <p className="text-xs text-gray-400">{new Date(v.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="text-xs font-mono text-gray-500 break-all mt-1">Hash: {v.hash}</p>
                    {v.previousHash && (
                      <p className="text-xs font-mono text-gray-400 break-all">Prev: {v.previousHash}</p>
                    )}
                    {v.txHash && v.txHash !== 'pending' && (
                      <p className="text-xs text-indigo-500 mt-0.5">Tx: {v.txHash.slice(0, 20)}...</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Blockchain Card */}
        {profile.walletAddress && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-green-600" /> Blockchain Credentials
            </h2>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Wallet Address</p>
              <p className="text-xs font-mono text-gray-700 break-all">{profile.walletAddress}</p>
            </div>
            {profile.verificationHashes?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-500 mb-2">Verification Hashes ({profile.verificationHashes.length})</p>
                <div className="space-y-2">
                  {profile.verificationHashes.slice(0, 2).map((v, i) => (
                    <div key={i} className="bg-green-50 rounded-lg p-2.5 border border-green-100">
                      <p className="text-xs font-mono text-green-800 break-all">{v.hash}</p>
                      <p className="text-xs text-green-600 mt-1">{new Date(v.timestamp).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resume Re-upload Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-[#0a66c2]" /> Update Resume
          </h2>
          {resumeSaved && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm mb-3">
              <CheckCircle className="w-4 h-4" /> Resume updated successfully!
            </div>
          )}
          <div className={`border-2 border-dashed rounded-lg p-4 text-center transition ${
            newResume ? 'border-[#0a66c2] bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}>
            {newResume ? (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-[#0a66c2] font-medium">
                  <FileText className="w-4 h-4" />{newResume.name}
                </span>
                <button onClick={() => setNewResume(null)} className="text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Click to upload new resume <span className="text-[#0a66c2] font-medium">(PDF only)</span></p>
                <input type="file" accept=".pdf" className="hidden" onChange={e => setNewResume(e.target.files[0] || null)} />
              </label>
            )}
          </div>
          {newResume && (
            <button
              onClick={handleResumeUpload}
              disabled={resumeUploading}
              className="mt-3 w-full py-2 bg-[#0a66c2] hover:bg-[#004182] text-white text-sm font-semibold rounded-lg transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {resumeUploading ? 'Uploading…' : 'Upload Resume'}
            </button>
          )}
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-3">Account</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-900 font-medium">{profile.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Role</span>
              <span className="text-gray-900 font-medium capitalize">{profile.role}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Member since</span>
              <span className="text-gray-900 font-medium">{new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
