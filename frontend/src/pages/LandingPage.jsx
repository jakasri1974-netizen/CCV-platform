import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import {
  ShieldCheck,
  Search,
  Lock,
  Cpu,
  FileCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  QrCode,
  Building2,
  GraduationCap,
  Briefcase,
  ExternalLink,
  Layers,
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Polygon Smart Contract & IPFS Decentralized Verifier</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Trust Every Academic Credential with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-teal-300 to-emerald-400">Blockchain Proof</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Eliminate certificate forgery and manual background verification delays. BlockCert anchors SHA-256 Merkle Roots on Polygon for instant, tamper-resistant employer verification.
          </p>

          {/* Quick Verification Lookup Widget */}
          <div className="mt-8 max-w-xl mx-auto space-y-3">
            <form onSubmit={handleVerifySubmit} className="flex flex-col sm:flex-row gap-2.5 bg-slate-800/90 p-2.5 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-md">
              <div className="relative flex-1">
                <Input
                  icon={Search}
                  value={certIdInput}
                  onChange={(e) => setCertIdInput(e.target.value)}
                  placeholder="Enter Certificate ID (e.g. BCERT-2026-000001)..."
                  className="bg-slate-900 text-white border-slate-700 font-mono font-bold"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="shrink-0"
                icon={ArrowRight}
              >
                Verify Instantly
              </Button>
            </form>
            <div className="text-xs text-slate-400 flex items-center justify-center gap-4">
              <span>Try sample ID: <button onClick={() => setCertIdInput('BCERT-2026-000001')} className="text-indigo-400 hover:underline font-mono font-bold">BCERT-2026-000001</button></span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Zero MetaMask setup required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Enterprise Architecture</div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Built for Universities & Employers</h2>
            <p className="text-xs text-slate-500">
              Replacing insecure paper credentials with tamper-proof SHA-256 Merkle tree proofs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">For Universities & Institutions</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cascading hierarchy management (College ➔ Department ➔ Course ➔ Batch), CSV bulk student import, IPFS document storage, and Polygon Merkle root anchoring.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">For Students & Alumni</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Permanent ownership of academic records, semester marksheets, downloadable PDF credentials, and instant public verification links.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">For Employers & Verifiers</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Zero friction background checks. Scan student QR code or upload candidate PDF bytes to verify directly against Polygon smart contracts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Technical Workflow */}
      <section className="py-20 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">How BlockCert Works</h2>
            <p className="text-xs text-slate-400">End-to-end cryptographic credential lifecycle</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center mx-auto font-black text-sm border border-indigo-500/30">
                01
              </div>
              <h4 className="font-extrabold text-white text-sm">Roster & Academic Setup</h4>
              <p className="text-xs text-slate-400">Institution registers student roster and uploads semester marksheets to IPFS.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center mx-auto font-black text-sm border border-indigo-500/30">
                02
              </div>
              <h4 className="font-extrabold text-white text-sm">SHA-256 Merkle Tree</h4>
              <p className="text-xs text-slate-400">Batches 8,000+ certificates into a single cryptographic 32-byte Merkle root digest.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center mx-auto font-black text-sm border border-indigo-500/30">
                03
              </div>
              <h4 className="font-extrabold text-white text-sm">Polygon Blockchain Anchor</h4>
              <p className="text-xs text-slate-400">Backend wallet service executes Polygon smart contract anchoring transaction.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center mx-auto font-black text-sm border border-indigo-500/30">
                04
              </div>
              <h4 className="font-extrabold text-white text-sm">Instant Public Verification</h4>
              <p className="text-xs text-slate-400">Employers scan QR code or query Certificate ID for immediate zero-wallet verification.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

