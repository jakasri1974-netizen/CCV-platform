import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { dashboardApi } from '../services/api';
import {
  Cpu,
  ShieldCheck,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Hash,
  Layers,
  Lock,
  Globe,
} from 'lucide-react';

export default function BlockchainPage() {
  const [onChainData, setOnChainData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNodeData();
  }, []);

  const fetchNodeData = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getStats();
      if (res.success && res.blockchain) {
        setOnChainData(res.blockchain);
      }
    } catch (err) {
      console.error("Fetch node data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const chainId = onChainData?.chainId || 80002;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Node Health & Smart Contract Monitor</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <Cpu className="w-6 h-6 text-indigo-600" />
                Polygon Blockchain Node & Smart Contracts
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Real-time smart contract state, RPC gas status, and backend signer wallet node diagnostics.
              </p>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={fetchNodeData}
              isLoading={loading}
              icon={RefreshCw}
            >
              Query Node RPC
            </Button>
          </div>

          {/* Target Network Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Target Blockchain Network
                  </div>
                  <div className="text-lg font-black text-white mt-0.5">
                    {onChainData?.networkName || 'Polygon Amoy Testnet (Chain ID: 80002)'}
                  </div>
                </div>
              </div>

              <Badge variant="emerald" icon={CheckCircle}>
                Backend Signer Active (Zero Wallet Setup)
              </Badge>
            </div>
          </div>

          {/* Detailed Node Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
                <span>Smart Contract Specifications</span>
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">Contract Name & Logic</span>
                  <span className="font-bold text-slate-900 block mt-0.5">BatchCertificateRegistry.sol / CredentialVerification.sol</span>
                </div>

                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">Deployed Contract Address</span>
                  <span className="font-mono text-xs text-indigo-600 font-bold block mt-1 bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 break-all">
                    {onChainData?.contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">Contract Owner / Admin Signer</span>
                  <span className="font-mono text-xs text-slate-700 font-bold block mt-0.5 truncate">
                    {onChainData?.contractOwner || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">Solidity Compiler Version</span>
                  <span className="font-mono text-xs text-slate-700 block mt-0.5">v0.8.20 (Optimizer Runs: 200)</span>
                </div>

                <div className="pt-2">
                  <a
                    href={`https://amoy.polygonscan.com/address/${onChainData?.contractAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-indigo-600 hover:underline font-bold"
                  >
                    <span>View Contract on Polygonscan Explorer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <Cpu className="w-4.5 h-4.5 text-indigo-600" />
                <span>Backend Signer Node Diagnostics</span>
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">Backend Issuer Address</span>
                  <span className="font-mono text-xs text-slate-900 font-bold block mt-0.5 truncate">
                    {onChainData?.contractOwner || 'Server-Side Signer (PRIVATE_KEY)'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">Current RPC Block Height</span>
                  <span className="font-mono text-sm text-emerald-600 font-black block mt-0.5">
                    #{onChainData?.blockNumber || 1234567}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">Network Chain ID</span>
                  <span className="font-mono text-xs text-slate-700 block mt-0.5">
                    {chainId} (Polygon PoS Architecture)
                  </span>
                </div>

                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950 mt-4 leading-relaxed">
                  <div className="font-bold flex items-center gap-1.5 text-xs">
                    <Lock className="w-4 h-4 text-indigo-600" />
                    <span>Zero MetaMask Architecture Enforced</span>
                  </div>
                  <div className="text-[11px] text-indigo-800 mt-1">
                    Admins, students, and employers perform all operations cleanly via standard HTTP APIs. Backend Polygon wallet automatically signs and broadcasts transactions to the network.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

