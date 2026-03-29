import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getUserProfile, canMessageUser } from "../api";
import { GraduationCap, Briefcase, Phone, Link2, Mail, ArrowLeft, MessageSquare, Shield } from "lucide-react";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const viewer = JSON.parse(localStorage.getItem("user") || "{}");
  const viewerRole = localStorage.getItem("role") || "student";
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canMsg, setCanMsg] = useState(false);

  useEffect(() => {
    getUserProfile(id)
      .then(res => {
        setProfile(res.data);
        return canMessageUser(id);
      })
      .then(res => setCanMsg(res.data.allowed))
      .catch(() => navigate(-1))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-[#0a66c2] border-t-transparent rounded-full" />
    </div>
  );

  if (!profile) return null;

  const isAlumni = profile.role === "alumni";
  const accentColor = isAlumni ? "emerald" : "blue";
  const gradientFrom = isAlumni ? "from-emerald-600" : "from-[#0a66c2]";
  const gradientTo   = isAlumni ? "to-emerald-800"   : "to-[#004182]";
  const avatarGrad   = isAlumni ? "from-emerald-500 to-emerald-700" : "from-[#0a66c2] to-[#004182]";
  const ringColor    = isAlumni ? "ring-emerald-600"  : "ring-[#0a66c2]";
  const badgeBg      = isAlumni ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-[#0a66c2] border-blue-100";
  const btnBorder    = isAlumni ? "border-emerald-600 text-emerald-700 hover:bg-emerald-50" : "border-[#0a66c2] text-[#0a66c2] hover:bg-blue-50";

  const edu = profile.educationInfo || {};
  const pro = profile.professionalInfo || {};
  const per = profile.personalInfo || {};

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Header userRole={viewerRole} userName={viewer.name || ""} />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 font-medium transition">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Hero Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className={`h-28 bg-gradient-to-r ${gradientFrom} ${gradientTo}`} />
          <div className="px-6 pb-5">
            <div className="flex items-end justify-between -mt-10 mb-3">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center border-4 border-white shadow-md`}>
                <span className="text-white text-3xl font-bold">{profile.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              {/* Message button — don't show if viewing own profile */}
              {viewer.id !== profile._id?.toString() && canMsg && (
                <button
                  onClick={() => navigate("/messages", { state: { openUserId: profile._id, openUserName: profile.name, openUserRole: profile.role } })}
                  className={`flex items-center gap-1.5 px-4 py-1.5 border rounded-full text-sm font-semibold transition ${btnBorder}`}>
                  <MessageSquare className="w-3.5 h-3.5" /> Message
                </button>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {isAlumni && pro.currentPosition && pro.currentCompany
                ? `${pro.currentPosition} at ${pro.currentCompany}`
                : edu.degree
                  ? `${edu.degree}${edu.branch ? ` — ${edu.branch}` : ""}`
                  : profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${badgeBg} capitalize`}>
                {profile.role}
              </span>

            </div>

            {/* Contact row */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{profile.email}</span>
              {per.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{per.phone}</span>}
              {pro.linkedIn && (
                <a href={pro.linkedIn} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#0a66c2] hover:underline">
                  <Link2 className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <GraduationCap className={`w-5 h-5 text-${accentColor}-600`} /> Education
          </h2>
          {edu.degree ? (
            <div className="flex gap-4">
              <div className={`w-12 h-12 rounded-lg bg-${accentColor}-50 flex items-center justify-center flex-shrink-0`}>
                <GraduationCap className={`w-6 h-6 text-${accentColor}-600`} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{edu.institution || edu.institute || "SVPM College of Engineering"}</p>
                <p className="text-sm text-gray-600">{edu.degree}{edu.branch ? ` — ${edu.branch}` : ""}</p>
                {edu.year && <p className="text-xs text-gray-400 mt-0.5">Class of {edu.year}</p>}
                {edu.studentId && <p className="text-xs text-gray-400">ID: {edu.studentId}</p>}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No education info available.</p>
          )}
        </div>

        {/* Professional (alumni only) */}
        {isAlumni && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-emerald-600" /> Experience
            </h2>
            {pro.currentCompany ? (
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{pro.currentCompany}</p>
                  <p className="text-sm text-gray-600">{pro.currentPosition}</p>
                  {pro.experience && <p className="text-xs text-gray-400 mt-0.5">{pro.experience} experience</p>}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No experience info available.</p>
            )}
          </div>
        )}

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(sk => (
                <span key={sk} className="text-sm px-3 py-1 bg-blue-50 text-[#0a66c2] rounded-full border border-blue-100 font-medium">{sk}</span>
              ))}
            </div>
          </div>
        )}

        {/* Blockchain */}
        {profile.walletAddress && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" /> Blockchain Credential
            </h2>
            <p className="text-xs text-gray-500 font-mono break-all bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
              {profile.walletAddress}
            </p>
            <p className="text-xs text-gray-400 mt-2">Credential hash stored immutably on-chain.</p>
          </div>
        )}

        {/* Member since */}
        <p className="text-xs text-gray-400 text-center pb-2">
          Member since {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </main>
    </div>
  );
}
