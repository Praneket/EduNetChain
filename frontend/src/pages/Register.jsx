import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { User, GraduationCap, Zap, FileText, ChevronRight, ChevronLeft, Check, Upload, X } from "lucide-react";

const STEPS = [
  { id: 1, label: "Personal",  icon: User },
  { id: 2, label: "Education", icon: GraduationCap },
  { id: 3, label: "Skills",    icon: Zap },
  { id: 4, label: "Documents", icon: FileText },
];

const inp = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent bg-white transition";
const label = "block text-xs font-semibold text-gray-600 mb-1";

const SKILL_SUGGESTIONS = [
  "Python","JavaScript","React","Node.js","Java","C++","SQL","MongoDB",
  "Machine Learning","Data Analysis","HTML/CSS","Git","Docker","AWS",
  "TypeScript","Express.js","Django","Spring Boot","Flutter","Kotlin",
];

export default function Register() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const [personal, setPersonal] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    phone: "", dob: "", gender: "", address: "", linkedin: "", github: "", bio: "",
  });
  const [education, setEducation] = useState({
    institution: "", degree: "", branch: "", year: "", cgpa: "", studentId: "",
  });
  const [skills, setSkills] = useState([]);
  const [resume, setResume] = useState(null);
  const [certificates, setCertificates] = useState([]);

  const addSkill = (s) => {
    const trimmed = s.trim();
    if (trimmed && !skills.includes(trimmed)) setSkills([...skills, trimmed]);
    setSkillInput("");
  };
  const removeSkill = (s) => setSkills(skills.filter(x => x !== s));

  const validateStep = () => {
    if (step === 1) {
      if (!personal.name || !personal.email || !personal.password) return "Name, email and password are required.";
      if (personal.password.length < 6) return "Password must be at least 6 characters.";
      if (personal.password !== personal.confirmPassword) return "Passwords do not match.";
    }
    if (step === 2) {
      if (!education.institution || !education.degree || !education.year) return "Institution, degree and year are required.";
    }
    if (step === 3) {
      if (skills.length === 0) return "Add at least one skill.";
    }
    if (step === 4) {
      if (!resume) return "Please upload your resume (PDF).";
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { alert(err); return; }
    setStep(s => s + 1);
  };

  const submit = async () => {
    const err = validateStep();
    if (err) { alert(err); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name",     personal.name);
      fd.append("email",    personal.email);
      fd.append("password", personal.password);
      fd.append("role",     "student");
      fd.append("personalInfo", JSON.stringify({
        phone: personal.phone, dob: personal.dob, gender: personal.gender,
        address: personal.address, linkedin: personal.linkedin,
        github: personal.github, bio: personal.bio,
      }));
      fd.append("educationInfo", JSON.stringify(education));
      fd.append("skills", JSON.stringify(skills));
      if (resume) fd.append("resume", resume);
      certificates.forEach(f => fd.append("certificates", f));

      await axios.post(
        `${import.meta.env.VITE_API || "http://localhost:5000"}/api/auth/register`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert("Registration submitted! Await admin approval.");
      nav("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create your EduNetChain account</h1>
          <p className="text-sm text-gray-500 mt-1">Your credentials will be verified and stored on blockchain</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done   = step > s.id;
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    done   ? "bg-[#0a66c2] border-[#0a66c2]" :
                    active ? "bg-white border-[#0a66c2]" :
                             "bg-white border-gray-300"
                  }`}>
                    {done
                      ? <Check className="w-5 h-5 text-white" />
                      : <Icon className={`w-4 h-4 ${active ? "text-[#0a66c2]" : "text-gray-400"}`} />
                    }
                  </div>
                  <span className={`text-xs mt-1 font-medium ${active ? "text-[#0a66c2]" : done ? "text-gray-600" : "text-gray-400"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 ${step > s.id ? "bg-[#0a66c2]" : "bg-gray-200"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

          {/* ── Step 1: Personal ── */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className={label}>Full Name *</label>
                  <input className={inp} value={personal.name} onChange={e => setPersonal({...personal, name: e.target.value})} placeholder="John Doe" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className={label}>Email *</label>
                  <input className={inp} type="email" value={personal.email} onChange={e => setPersonal({...personal, email: e.target.value})} placeholder="john@example.com" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className={label}>Password *</label>
                  <input className={inp} type="password" value={personal.password} onChange={e => setPersonal({...personal, password: e.target.value})} placeholder="Min 6 characters" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className={label}>Confirm Password *</label>
                  <input className={inp} type="password" value={personal.confirmPassword} onChange={e => setPersonal({...personal, confirmPassword: e.target.value})} placeholder="Repeat password" />
                </div>
                <div>
                  <label className={label}>Phone</label>
                  <input className={inp} value={personal.phone} onChange={e => setPersonal({...personal, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label className={label}>Date of Birth</label>
                  <input className={inp} type="date" value={personal.dob} onChange={e => setPersonal({...personal, dob: e.target.value})} />
                </div>
                <div>
                  <label className={label}>Gender</label>
                  <select className={inp} value={personal.gender} onChange={e => setPersonal({...personal, gender: e.target.value})}>
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className={label}>City / Address</label>
                  <input className={inp} value={personal.address} onChange={e => setPersonal({...personal, address: e.target.value})} placeholder="City, State" />
                </div>
                <div>
                  <label className={label}>LinkedIn URL</label>
                  <input className={inp} value={personal.linkedin} onChange={e => setPersonal({...personal, linkedin: e.target.value})} placeholder="linkedin.com/in/username" />
                </div>
                <div>
                  <label className={label}>GitHub URL</label>
                  <input className={inp} value={personal.github} onChange={e => setPersonal({...personal, github: e.target.value})} placeholder="github.com/username" />
                </div>
                <div className="col-span-2">
                  <label className={label}>Bio / Summary</label>
                  <textarea className={`${inp} h-20 resize-none`} value={personal.bio} onChange={e => setPersonal({...personal, bio: e.target.value})} placeholder="Brief introduction about yourself..." />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Education ── */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Education Details</h2>
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠️ These details will be permanently stored on blockchain after admin approval and cannot be changed.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={label}>Institution / University *</label>
                  <input className={inp} value={education.institution} onChange={e => setEducation({...education, institution: e.target.value})} placeholder="e.g. SVPM College of Engineering" />
                </div>
                <div>
                  <label className={label}>Degree *</label>
                  <input className={inp} value={education.degree} onChange={e => setEducation({...education, degree: e.target.value})} placeholder="e.g. B.Tech, BCA, MBA" />
                </div>
                <div>
                  <label className={label}>Branch / Specialization</label>
                  <input className={inp} value={education.branch} onChange={e => setEducation({...education, branch: e.target.value})} placeholder="e.g. Computer Science" />
                </div>
                <div>
                  <label className={label}>Year of Passing *</label>
                  <select className={inp} value={education.year} onChange={e => setEducation({...education, year: e.target.value})}>
                    <option value="">Select year</option>
                    {Array.from({length: 10}, (_, i) => 2020 + i).map(y => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>CGPA / Percentage</label>
                  <input className={inp} value={education.cgpa} onChange={e => setEducation({...education, cgpa: e.target.value})} placeholder="e.g. 8.5 or 85%" />
                </div>
                <div>
                  <label className={label}>Student ID / Roll No</label>
                  <input className={inp} value={education.studentId} onChange={e => setEducation({...education, studentId: e.target.value})} placeholder="Roll number" />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Skills ── */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Skills & Expertise</h2>
              <p className="text-xs text-gray-500">Add skills that represent your technical and professional abilities. These help match you to jobs.</p>

              {/* Skill input */}
              <div>
                <label className={label}>Add a Skill</label>
                <div className="flex gap-2">
                  <input
                    className={inp}
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); }}}
                    placeholder="Type a skill and press Enter"
                  />
                  <button type="button" onClick={() => addSkill(skillInput)} className="px-4 py-2 bg-[#0a66c2] text-white text-sm font-semibold rounded-lg hover:bg-[#004182] transition">
                    Add
                  </button>
                </div>
              </div>

              {/* Added skills */}
              {skills.length > 0 && (
                <div>
                  <label className={label}>Your Skills ({skills.length})</label>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(s => (
                      <span key={s} className="flex items-center gap-1 px-3 py-1 bg-[#0a66c2] text-white text-xs font-semibold rounded-full">
                        {s}
                        <button onClick={() => removeSkill(s)} className="hover:text-blue-200 ml-0.5"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div>
                <label className={label}>Suggestions — click to add</label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).map(s => (
                    <button key={s} type="button" onClick={() => addSkill(s)}
                      className="px-3 py-1 border border-gray-300 text-gray-600 text-xs font-medium rounded-full hover:border-[#0a66c2] hover:text-[#0a66c2] transition">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Documents ── */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Resume & Documents</h2>

              {/* Resume */}
              <div>
                <label className={label}>Resume / CV * (PDF only)</label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center transition ${resume ? "border-[#0a66c2] bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}>
                  {resume ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-[#0a66c2] font-medium">
                        <FileText className="w-4 h-4" /> {resume.name}
                      </div>
                      <button onClick={() => setResume(null)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Click to upload resume <span className="text-[#0a66c2] font-medium">PDF</span></p>
                      <input type="file" accept=".pdf" className="hidden" onChange={e => setResume(e.target.files[0] || null)} />
                    </label>
                  )}
                </div>
              </div>

              {/* Certificates */}
              <div>
                <label className={label}>Certificates / Supporting Documents (optional)</label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center transition ${certificates.length > 0 ? "border-emerald-400 bg-emerald-50" : "border-gray-300 hover:border-gray-400"}`}>
                  {certificates.length > 0 ? (
                    <div className="space-y-2">
                      {certificates.map((f, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-emerald-700 font-medium"><FileText className="w-4 h-4" />{f.name}</span>
                          <button onClick={() => setCertificates(certificates.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <label className="cursor-pointer text-xs text-gray-500 underline">
                        Add more
                        <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                          onChange={e => setCertificates(prev => [...prev, ...Array.from(e.target.files)])} />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Upload certificates, marksheets, etc.</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG accepted</p>
                      <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                        onChange={e => setCertificates(Array.from(e.target.files))} />
                    </label>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm space-y-1">
                <p className="font-semibold text-gray-700 mb-2">Registration Summary</p>
                <p className="text-gray-600"><span className="font-medium">Name:</span> {personal.name}</p>
                <p className="text-gray-600"><span className="font-medium">Email:</span> {personal.email}</p>
                <p className="text-gray-600"><span className="font-medium">Degree:</span> {education.degree} — {education.institution}</p>
                <p className="text-gray-600"><span className="font-medium">Skills:</span> {skills.join(", ") || "—"}</p>
                <p className="text-gray-600"><span className="font-medium">Resume:</span> {resume?.name || "—"}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
            {step > 1
              ? <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1.5 px-5 py-2 border border-gray-300 text-gray-600 text-sm font-semibold rounded-full hover:bg-gray-50 transition">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              : <Link to="/login" className="flex items-center gap-1.5 px-5 py-2 text-sm text-gray-500 hover:text-gray-700 transition">
                  Already have an account?
                </Link>
            }
            {step < 4
              ? <button onClick={next} className="flex items-center gap-1.5 px-6 py-2 bg-[#0a66c2] text-white text-sm font-semibold rounded-full hover:bg-[#004182] transition">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              : <button onClick={submit} disabled={loading} className="flex items-center gap-1.5 px-6 py-2 bg-[#0a66c2] text-white text-sm font-semibold rounded-full hover:bg-[#004182] transition disabled:opacity-60">
                  {loading ? "Submitting…" : <><Check className="w-4 h-4" /> Submit Registration</>}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
