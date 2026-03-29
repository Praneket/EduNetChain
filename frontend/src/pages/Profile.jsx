import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getMyProfile, updateProfile } from "../api";
import { Pencil, Save, CheckCircle, GraduationCap, Phone, MapPin, X, Shield } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(null); // "basic" | "education"
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", institution: "", degree: "", year: "", studentId: "" });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await getMyProfile();
      const u = res.data;
      setProfile(u);
      setForm({
        name: u.name || "",
        phone: u.personalInfo?.phone || "",
        address: u.personalInfo?.address || "",
        institution: u.educationInfo?.institution || u.educationInfo?.institute || "",
        degree: u.educationInfo?.degree || "",
        year: u.educationInfo?.year || "",
        studentId: u.educationInfo?.studentId || "",
      });
    } catch { navigate("/login"); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: form.name,
        personalInfo: { phone: form.phone, address: form.address },
        educationInfo: { institution: form.institution, degree: form.degree, year: form.year, studentId: form.studentId },
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
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name</label>
                    <input
                      value={form.name}
                      onChange={e => !profile.isVerified && setForm({ ...form, name: e.target.value })}
                      className={`${inp} ${profile.isVerified ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}`}
                      readOnly={profile.isVerified}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Phone</label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inp} placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="col-span-2">
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

        {/* Education Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#0a66c2]" /> Education
            </h2>
            {!profile.isVerified && (
            <button
              onClick={() => setEditing(editing === "education" ? null : "education")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
            >
              {editing === "education" ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </button>
            )}
          </div>

          {editing === "education" && !profile.isVerified ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Institution</label>
                  <input value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} className={inp} placeholder="College / University name" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Degree</label>
                  <input value={form.degree} onChange={e => setForm({ ...form, degree: e.target.value })} className={inp} placeholder="B.Tech, BCA…" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Year of Passing</label>
                  <input value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className={inp} placeholder="2025" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Student ID / Roll No</label>
                  <input value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} className={inp} placeholder="Roll number" />
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
          )}
        </div>

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
