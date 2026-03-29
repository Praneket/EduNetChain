import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getMyProfile, updateProfile } from "../api";
import { Pencil, Save, CheckCircle, GraduationCap, Briefcase, Phone, Link2, Shield, X } from "lucide-react";

export default function AlumniProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", degree: "", graduationYear: "", currentCompany: "", currentPosition: "", experience: "", linkedIn: "" });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await getMyProfile();
      const u = res.data;
      setProfile(u);
      setForm({
        name: u.name || "",
        phone: u.personalInfo?.phone || "",
        degree: u.educationInfo?.degree || "",
        graduationYear: u.educationInfo?.year || "",
        currentCompany: u.professionalInfo?.currentCompany || "",
        currentPosition: u.professionalInfo?.currentPosition || "",
        experience: u.professionalInfo?.experience || "",
        linkedIn: u.professionalInfo?.linkedIn || "",
      });
    } catch { navigate("/alumni-login"); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: form.name,
        personalInfo: { phone: form.phone },
        educationInfo: { degree: form.degree, year: form.graduationYear },
        professionalInfo: { currentCompany: form.currentCompany, currentPosition: form.currentPosition, experience: form.experience, linkedIn: form.linkedIn },
      });
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, name: form.name }));
      window.dispatchEvent(new Event("storage"));
      await fetchProfile();
      setEditing(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.err || "Failed to save");
    } finally { setSaving(false); }
  };

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition";

  if (!profile) return (
    <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Header userRole="alumni" userName={form.name || profile.name} />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {saved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> Profile updated successfully!
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-emerald-600 to-emerald-800 relative" />
          <div className="px-6 pb-5">
            <div className="flex items-end justify-between -mt-10 mb-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center border-4 border-white shadow-md">
                <span className="text-white text-3xl font-bold">{(form.name || "A").charAt(0).toUpperCase()}</span>
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
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inp} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Phone</label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inp} placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-full hover:bg-emerald-700 transition disabled:opacity-60">
                    <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 rounded-full hover:bg-gray-100 transition">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900">{form.name}</h1>
                <p className="text-gray-600 text-sm mt-0.5">
                  {form.currentPosition && form.currentCompany
                    ? `${form.currentPosition} at ${form.currentCompany}`
                    : "Alumni · EduNetChain"}
                </p>
                {form.phone && <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{form.phone}</p>}
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Alumni
                  </span>
                  {form.linkedIn && (
                    <a href={form.linkedIn} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-[#0a66c2] border border-blue-200 hover:bg-blue-100 transition">
                      <Link2 className="w-3 h-3" /> LinkedIn
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Professional Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" /> Experience
            </h2>
            <button onClick={() => setEditing(editing === "professional" ? null : "professional")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
              {editing === "professional" ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </button>
          </div>

          {editing === "professional" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Current Company</label>
                  <input value={form.currentCompany} onChange={e => setForm({ ...form, currentCompany: e.target.value })} className={inp} placeholder="Google, Microsoft…" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Position</label>
                  <input value={form.currentPosition} onChange={e => setForm({ ...form, currentPosition: e.target.value })} className={inp} placeholder="Software Engineer" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Experience</label>
                  <input value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} className={inp} placeholder="3 years" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">LinkedIn URL</label>
                  <input value={form.linkedIn} onChange={e => setForm({ ...form, linkedIn: e.target.value })} className={inp} placeholder="https://linkedin.com/in/…" />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-full hover:bg-emerald-700 transition disabled:opacity-60">
                  <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 rounded-full hover:bg-gray-100 transition">Cancel</button>
              </div>
            </div>
          ) : (
            form.currentCompany ? (
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{form.currentCompany}</p>
                  <p className="text-sm text-gray-600">{form.currentPosition}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{form.experience ? `${form.experience} experience` : ""}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No experience added yet. Click edit to add.</p>
            )
          )}
        </div>

        {/* Education Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" /> Education
            </h2>
            <button onClick={() => setEditing(editing === "education" ? null : "education")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
              {editing === "education" ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </button>
          </div>

          {editing === "education" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Degree</label>
                  <input value={form.degree} onChange={e => setForm({ ...form, degree: e.target.value })} className={inp} placeholder="B.Tech Computer Science" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Graduation Year</label>
                  <input value={form.graduationYear} onChange={e => setForm({ ...form, graduationYear: e.target.value })} className={inp} placeholder="2020" />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-full hover:bg-emerald-700 transition disabled:opacity-60">
                  <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 rounded-full hover:bg-gray-100 transition">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">SVPM College of Engineering</p>
                <p className="text-sm text-gray-600">{form.degree || "—"}</p>
                <p className="text-xs text-gray-400 mt-0.5">{form.graduationYear ? `Class of ${form.graduationYear}` : ""}</p>
              </div>
            </div>
          )}
        </div>

        {/* Account */}
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
