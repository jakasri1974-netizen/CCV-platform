import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useWallet } from '../context/WalletContext';
import { dashboardApi } from '../services/api';
import {
  Cpu,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Hash,
  Layers,
  Wallet,
} from 'lucide-react';

export default function BlockchainPage() {
  const { account, chainId, balance, switchNetwork, connectWallet } = useWallet();
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

  const isHardhat = chainId === '0x7a69' || chainId === '31337';
  const isAmoy = chainId === '0x13882' || chainId === '80002';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Polygon Blockchain Network Info</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time smart contract state and network node diagnostics
              </p>
            </div>

            <button
              onClick={fetchNodeData}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl shadow-sm transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Query Node</span>
            </button>
          </div>

          {/* Network Switcher Alert Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Target Blockchain Network
                  </div>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {isHardhat ? 'Hardhat Localhost Node (31337)' : isAmoy ? 'Polygon Amoy Testnet (80002)' : 'Polygon PoS Network'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => switchNetwork('0x7a69')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-700 transition"
                >
                  Switch to Hardhat Local
                </button>
                <button
                  onClick={() => switchNetwork('0x13882')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition"
                >
                  Switch to Polygon Amoy
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Node Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Smart Contract Specifications</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Contract Name</span>
                  <span className="font-bold text-slate-900 block mt-0.5">CredentialVerification.sol</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Deployed Address</span>
                  <span className="font-mono text-xs text-indigo-600 font-bold block mt-0.5 bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 break-all">
                    {onChainData?.contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Contract Owner / Issuer Address</span>
                  <span className="font-mono text-xs text-slate-700 font-bold block mt-0.5 truncate">
                    {onChainData?.contractOwner || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Solidity Compiler Version</span>
                  <span className="font-mono text-xs text-slate-700 block mt-0.5">v0.8.20 (Optimizer Runs: 200)</span>
                </div>

                <a
                  href={`https://amoy.polygonscan.com/address/${onChainData?.contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-indigo-600 hover:underline font-semibold pt-2"
                >
                  <span>View Contract on Polygonscan Explorer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <Wallet className="w-4 h-4 text-indigo-600" />
                <span>Connected Wallet Diagnostics</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Connected Address</span>
                  <span className="font-mono text-xs text-slate-900 font-bold block mt-0.5 truncate">
                    {account || 'MetaMask Not Connected'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">POL / ETH Gas Balance</span>
                  <span className="font-mono text-sm text-emerald-600 font-extrabold block mt-0.5">
                    {balance} POL
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Chain ID</span>
                  <span className="font-mono text-xs text-slate-700 block mt-0.5">
                    {chainId || '31337'}
                  </span>
                </div>

                {!account && (
                  <button
                    onClick={connectWallet}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl transition mt-4"
                  >
                    Connect MetaMask Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
