import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  ShieldCheck,
  Search,
  Lock,
  Cpu,
  FileCheck,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  QrCode,
  Building2,
  GraduationCap,
  Briefcase,
  ExternalLink,
} from 'lucide-react';

export default function LandingPage() {
  const [certIdInput, setCertIdInput] = useState('');
  const navigate = useNavigate();

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (certIdInput.trim()) {
      navigate(`/verify/${certIdInput.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Polygon PoS Smart Contract Powered</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-sans text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            Trust Every Credential with <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-pink-400 bg-clip-text text-transparent">Blockchain Proof</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Eliminate certificate forgery and manual background verification. BlockCert anchors cryptographic SHA-256 hashes on Polygon for instant, tamper-resistant employer verification.
          </p>

          {/* Quick Verification Lookup Widget */}
          <div className="mt-10 max-w-xl mx-auto">
            <form onSubmit={handleVerifySubmit} className="flex flex-col sm:flex-row gap-2 bg-slate-800/80 p-2 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={certIdInput}
                  onChange={(e) => setCertIdInput(e.target.value)}
                  placeholder="Enter Certificate ID (e.g. BCERT-2026-000001)"
                  className="w-full bg-slate-900/90 text-white placeholder-slate-400 text-sm pl-11 pr-4 py-3 rounded-xl border border-slate-700/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <span>Verify Instantly</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-2 text-xs text-slate-400 flex items-center justify-center gap-4">
              <span>Try sample: <button onClick={() => setCertIdInput('BCERT-2026-000001')} className="text-indigo-400 hover:underline font-mono">BCERT-2026-000001</button></span>
              <span>•</span>
              <span className="text-emerald-400">No MetaMask required for employers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white">Why Traditional Certificates Fail</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
              Paper degrees and standard PDFs are easily edited with basic software, creating massive risk for hiring managers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Traditional Card */}
            <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-900/40 relative">
              <div className="w-12 h-12 rounded-xl bg-rose-900/30 text-rose-400 flex items-center justify-center mb-6">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-rose-300">The Problem: Vulnerable Credentials</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 mt-1">•</span> Easy PDF editing and Photoshop degree counterfeiting.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 mt-1">•</span> Weeks of delayed manual verification by universities.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 mt-1">•</span> High operational overhead and central database hack risks.
                </li>
              </ul>
            </div>

            {/* BlockCert Solution Card */}
            <div className="p-8 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 relative shadow-xl shadow-indigo-900/10">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-indigo-300">The Solution: BlockCert Verification</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 shrink-0" /> Immutable SHA-256 cryptographic hash anchored on Polygon.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 shrink-0" /> Zero-latency instant verification for employers via QR code.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 shrink-0" /> Privacy protected: Student PII remains off-chain in database.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Workflow */}
      <section className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white">How BlockCert Works</h2>
            <p className="text-slate-400 text-sm mt-2">End-to-end cryptographic lifecycle for academic degrees</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 font-bold text-sm">
                01
              </div>
              <h4 className="font-bold text-white mb-2">Issue Credential</h4>
              <p className="text-xs text-slate-400">Institution admin inputs student and course assessment data.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 font-bold text-sm">
                02
              </div>
              <h4 className="font-bold text-white mb-2">Generate SHA-256</h4>
              <p className="text-xs text-slate-400">Canonical deterministic payload produces a unique cryptographic hash.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 font-bold text-sm">
                03
              </div>
              <h4 className="font-bold text-white mb-2">Polygon Smart Contract</h4>
              <p className="text-xs text-slate-400">MetaMask submits transaction anchoring hash on Polygon PoS.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 font-bold text-sm">
                04
              </div>
              <h4 className="font-bold text-white mb-2">Instant QR Verify</h4>
              <p className="text-xs text-slate-400">Employer scans QR or enters ID to check live on-chain status.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholders Section */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <Building2 className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">For Institutions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Effortless batch credential issuance, custom certificate PDF generation, automated verification statistics, and smart contract revocation tools.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <GraduationCap className="w-8 h-8 text-violet-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">For Students</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Permanent ownership of digital certificates, downloadable high-res PDFs, shareable verification links, and Polygon block explorer proof.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <Briefcase className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">For Employers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero friction background checks. Scan QR codes or query candidate Certificate IDs without needing a Web3 wallet or crypto gas funds.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
