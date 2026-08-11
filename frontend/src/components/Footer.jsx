import React from 'react';
import { Shield, Lock, Cpu, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <Shield className="w-5 h-5 text-indigo-500" />
              <span>BlockCert</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Enterprise blockchain academic credential verification platform anchored on Polygon PoS smart contracts.
            </p>
          </div>

          <div>
            <div className="text-white font-semibold mb-3">Architecture</div>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-indigo-400" /> Polygon Amoy Testnet</li>
              <li className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-indigo-400" /> SHA-256 Hash Matching</li>
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-indigo-400" /> Public Verification API</li>
            </ul>
          </div>

          <div>
            <div className="text-white font-semibold mb-3">Quick Navigation</div>
            <ul className="space-y-2 text-xs">
              <li><a href="/verify" className="hover:text-white transition">Verify Credential</a></li>
              <li><a href="/login" className="hover:text-white transition">Institution Portal</a></li>
              <li><a href="/login" className="hover:text-white transition">Student Portal</a></li>
            </ul>
          </div>

          <div>
            <div className="text-white font-semibold mb-3">Security & Privacy</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              No sensitive student PII or PDFs are stored on-chain. Only cryptographic hashes, certificate IDs, and issuer timestamps are recorded on the Polygon network.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <div>&copy; 2026 BlockCert Verification Platform. All rights reserved.</div>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Smart Contract Audit</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
