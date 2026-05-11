import React, { useState } from "react";
import { api } from "../api";
import { ShieldCheck, ShieldX, Search } from "lucide-react";

export default function VerifyCredential() {
  const [walletAddress, setWalletAddress] = useState("");
  const [hash, setHash] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.get(`/api/verify/check?wallet=${walletAddress}&hash=${hash}`);
      setResult(res.data);
    } catch (err) {
      setResult({ verified: false, msg: err.response?.data?.msg || "Verification failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-blue-900">Verify Credential</h1>
          <p className="text-gray-600 mt-2 text-sm">
            Enter the student's wallet address and credential hash to verify authenticity on the blockchain
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Wallet Address
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credential Hash
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            {loading ? "Verifying on Blockchain..." : "Verify Credential"}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
            result.verified ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}>
            {result.verified ? (
              <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <ShieldX className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-semibold ${result.verified ? "text-green-800" : "text-red-800"}`}>
                {result.verified ? "✅ Credential Verified" : "❌ Credential Not Found"}
              </p>
              <p className={`text-sm mt-1 ${result.verified ? "text-green-700" : "text-red-700"}`}>
                {result.verified
                  ? "This credential is authentic and recorded on the blockchain."
                  : result.msg || "This credential could not be verified on the blockchain."}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-400">
          Powered by EduNetChain · Blockchain-secured credentials
        </div>

        <div className="mt-4 text-center">
          <a href="/login" className="text-sm text-blue-600 hover:underline">
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
