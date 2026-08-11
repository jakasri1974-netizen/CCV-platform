import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { batchApi } from '../services/api';
import { useWallet } from '../context/WalletContext';
import { anchorBatchOnChain } from '../services/contractService';
import {
  Layers,
  Plus,
  RefreshCw,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Award,
  Sparkles,
  ChevronRight,
  X,
  Wallet,
} from 'lucide-react';

export default function BatchManagementPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Batch Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBatchData, setNewBatchData] = useState({
    batchId: `BATCH-2026-CSE-${Math.floor(100 + Math.random() * 900)}`,
    name: 'Computer Science Class of 2026',
    department: 'Computer Science',
    academicYear: '2026',
  });

  // Merkle Tree Preview Modal State
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [treePreview, setTreePreview] = useState(null);
  const [processingBatchId, setProcessingBatchId] = useState(null);
  const [anchoringBatchId, setAnchoringBatchId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const { signer, account, connectWallet } = useWallet();

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await batchApi.getAll();
      if (res.success) {
        setBatches(res.data);
      }
    } catch (err) {
      console.error("Fetch batches error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      const res = await batchApi.create(newBatchData);
      if (res.success) {
        setIsCreateModalOpen(false);
        setNewBatchData({
          batchId: `BATCH-2026-CSE-${Math.floor(100 + Math.random() * 900)}`,
          name: 'Computer Science Class of 2026',
          department: 'Computer Science',
          academicYear: '2026',
        });
        fetchBatches();
      }
    } catch (err) {
      alert(err.message || 'Failed to create batch');
    }
  };

  const handleGenerateMerkleRoot = async (batchId) => {
    setProcessingBatchId(batchId);
    setErrorMsg('');
    try {
      const res = await batchApi.generateRoot(batchId);
      if (res.success) {
        setTreePreview(res.data);
        fetchBatches();
      }
    } catch (err) {
      alert(err.message || 'Failed to generate Merkle Root for batch');
    } finally {
      setProcessingBatchId(null);
    }
  };

  const handleAnchorBatch = async (batch) => {
    if (!account || !signer) {
      alert("Please connect your MetaMask wallet to sign the Merkle Root batch transaction.");
      connectWallet();
      return;
    }

    if (!batch.merkleRoot) {
      alert("Please click 'Generate Merkle Root' first before anchoring to Polygon.");
      return;
    }

    if (!window.confirm(`Anchor Merkle Root for Batch '${batch.batchId}' on Polygon PoS?\n\nThis will execute 1 transaction representing all ${batch.totalCertificates || 'batch'} certificates.`)) {
      return;
    }

    setAnchoringBatchId(batch.batchId);
    setErrorMsg('');

    try {
      // 1. Prompt MetaMask for 1 transaction to store Merkle Root
      const receipt = await anchorBatchOnChain(
        signer,
        batch.batchId,
        batch.merkleRoot,
        batch.totalCertificates || 10
      );

      // 2. Confirm transaction receipt in backend
      await batchApi.anchor(batch.batchId, {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        issuerAddress: receipt.issuerAddress,
      });

      alert(`✅ Merkle Root Batch '${batch.batchId}' successfully anchored on Polygon!`);
      fetchBatches();
    } catch (err) {
      console.error("Batch Anchoring Error:", err);
      setErrorMsg(err.reason || err.message || "Batch transaction failed or rejected by wallet.");
    } finally {
      setAnchoringBatchId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Merkle Root Architecture: 8,000 Certificates → 1 Polygon Tx</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">Merkle Batch Management</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Group thousands of student credentials into Merkle Trees and anchor single 32-byte Merkle Roots on Polygon.
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Batch</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <div className="font-bold font-sans">Batch Action Error</div>
                <div className="text-rose-700 mt-0.5">{errorMsg}</div>
              </div>
            </div>
          )}

          {/* Scaling Banner Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <div className="text-slate-400 text-xs font-semibold">Scaling Architecture</div>
              <div className="text-xl font-extrabold text-indigo-300">Merkle Tree Batching</div>
              <p className="text-[11px] text-slate-400">
                Compresses unlimited student certificates into 1 cryptographic Merkle Root per batch.
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-slate-400 text-xs font-semibold">Gas Efficiency Ratio</div>
              <div className="text-xl font-extrabold text-emerald-400">8,000 : 1 Reduction</div>
              <p className="text-[11px] text-slate-400">
                1 Polygon transaction anchors 8,000+ certificates simultaneously.
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-slate-400 text-xs font-semibold">Employer Verification</div>
              <div className="text-xl font-extrabold text-violet-300">Zero-Wallet Merkle Proof</div>
              <p className="text-[11px] text-slate-400">
                Verifies candidate SHA-256 hash + off-chain sibling proof against on-chain root.
              </p>
            </div>
          </div>

          {/* Batches Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Certificate Batches</h3>
                <p className="text-xs text-slate-500">Active Merkle Root batch containers</p>
              </div>

              <button
                onClick={fetchBatches}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3.5 pl-5">Batch ID</th>
                    <th className="p-3.5">Batch Name</th>
                    <th className="p-3.5">Certificates</th>
                    <th className="p-3.5">Merkle Root</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {batches.length > 0 ? (
                    batches.map((batch) => (
                      <tr key={batch._id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 pl-5 font-mono text-indigo-600 font-bold">
                          {batch.batchId}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">{batch.name}</td>
                        <td className="p-3.5 font-bold text-slate-700">
                          {batch.totalCertificates || 10} Credentials
                        </td>
                        <td className="p-3.5 font-mono text-[10px] text-slate-600">
                          {batch.merkleRoot ? (
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-indigo-700 font-bold">
                              {batch.merkleRoot.slice(0, 10)}...{batch.merkleRoot.slice(-8)}
                            </span>
                          ) : (
                            <span className="text-slate-400">Not Generated</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {batch.status === 'ANCHORED' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>ANCHORED ON POLYGON</span>
                            </span>
                          ) : batch.status === 'GENERATED' ? (
                            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                              <Layers className="w-3 h-3 text-indigo-600" />
                              <span>ROOT GENERATED</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                              <RefreshCw className="w-3 h-3 text-amber-600" />
                              <span>PENDING</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 pr-5 text-right space-x-1">
                          <button
                            onClick={() => handleGenerateMerkleRoot(batch.batchId)}
                            disabled={processingBatchId === batch.batchId}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                          >
                            {processingBatchId === batch.batchId ? 'Building Tree...' : 'Generate Merkle Root'}
                          </button>

                          <button
                            onClick={() => handleAnchorBatch(batch)}
                            disabled={anchoringBatchId === batch.batchId || batch.status === 'ANCHORED'}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition shadow-sm disabled:opacity-50"
                          >
                            {anchoringBatchId === batch.batchId ? 'Mining Tx...' : batch.status === 'ANCHORED' ? 'Anchored' : 'Anchor Batch'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center p-8 text-slate-400">
                        No batch records found. Create a new batch to group certificates.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Merkle Tree Generated Preview Modal */}
          {treePreview && (
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Merkle Tree Successfully Constructed</span>
                </div>
                <button
                  onClick={() => setTreePreview(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Batch ID</span>
                  <span className="font-mono text-sm font-bold text-indigo-300">{treePreview.batchId}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Calculated 32-Byte Merkle Root</span>
                  <span className="font-mono text-xs text-emerald-400 font-extrabold block bg-slate-950 p-2.5 rounded-xl border border-slate-800 break-all mt-1">
                    {treePreview.merkleRoot}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400">Total Leaves (Certificates):</span>
                    <span className="font-bold text-white block">{treePreview.treePreview.leavesCount} Hashes</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Merkle Tree Layers:</span>
                    <span className="font-bold text-white block">{treePreview.treeLayersCount} Binary Layers</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Individual Merkle Proof paths have been assigned to each certificate in database. Ready to anchor Merkle Root on Polygon.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Batch Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-4">Create Certificate Batch</h3>

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batch Identifier</label>
                <input
                  type="text"
                  value={newBatchData.batchId}
                  onChange={(e) => setNewBatchData({ ...newBatchData, batchId: e.target.value })}
                  placeholder="e.g. BATCH-2026-CSE-A"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batch Title / Name</label>
                <input
                  type="text"
                  value={newBatchData.name}
                  onChange={(e) => setNewBatchData({ ...newBatchData, name: e.target.value })}
                  placeholder="e.g. Computer Science Class of 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={newBatchData.department}
                    onChange={(e) => setNewBatchData({ ...newBatchData, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option>Computer Science</option>
                    <option>Information Technology</option>
                    <option>Cyber Security</option>
                    <option>Data Science</option>
                    <option>Artificial Intelligence</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={newBatchData.academicYear}
                    onChange={(e) => setNewBatchData({ ...newBatchData, academicYear: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-md transition mt-2"
              >
                Create Batch Container
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
