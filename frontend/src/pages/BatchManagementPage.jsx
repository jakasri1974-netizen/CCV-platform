import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { batchApi } from '../services/api';
import {
  Layers,
  Plus,
  RefreshCw,
  Cpu,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Award,
  Sparkles,
  ChevronRight,
  X,
  Lock,
  GitCommit,
  Hash,
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
  const [treePreview, setTreePreview] = useState(null);
  const [processingBatchId, setProcessingBatchId] = useState(null);
  const [anchoringBatchId, setAnchoringBatchId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

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
    if (!batch.merkleRoot) {
      alert("Please click 'Generate Merkle Root' first before anchoring to Polygon.");
      return;
    }

    if (!window.confirm(`Anchor Merkle Root for Batch '${batch.batchId}' on Polygon PoS?\n\nThis will execute 1 backend transaction representing all ${batch.totalCertificates || 'batch'} certificates.`)) {
      return;
    }

    setAnchoringBatchId(batch.batchId);
    setErrorMsg('');

    try {
      const res = await batchApi.anchor(batch.batchId);
      if (res.success) {
        const txHash = res.data?.chainResult?.transactionHash || res.data?.batch?.transactionHash || 'Confirmed';
        alert(`✅ Merkle Root Batch '${batch.batchId}' successfully anchored on Polygon!\n\nTx: ${txHash}`);
        fetchBatches();
      } else {
        throw new Error(res.message || 'Batch anchoring failed');
      }
    } catch (err) {
      console.error("Batch Anchoring Error:", err);
      setErrorMsg(err.message || "Batch transaction failed.");
    } finally {
      setAnchoringBatchId(null);
    }
  };

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
                <Sparkles className="w-3.5 h-3.5" />
                <span>Merkle Tree Architecture: 8,000 Credentials → 1 Polygon Tx</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <Layers className="w-6 h-6 text-indigo-600" />
                Merkle Batch Management Engine
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Group thousands of student credentials into Merkle Trees and anchor single 32-byte Merkle Roots on Polygon backend signer.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCreateModalOpen(true)}
              icon={Plus}
            >
              Create New Batch
            </Button>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <div className="font-bold">Batch Action Error</div>
                <div className="text-rose-700 mt-0.5">{errorMsg}</div>
              </div>
            </div>
          )}

          {/* Scaling Banner Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Scaling Architecture</div>
              <div className="text-lg font-extrabold text-indigo-300 flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-indigo-400" />
                Merkle Tree Batching
              </div>
              <p className="text-[11px] text-slate-400">
                Compresses thousands of student certificates into 1 cryptographic 32-byte Merkle Root per batch.
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Gas Efficiency Ratio</div>
              <div className="text-lg font-extrabold text-emerald-400 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                8,000 : 1 Reduction
              </div>
              <p className="text-[11px] text-slate-400">
                Single Polygon transaction anchors 8,000+ certificates simultaneously with zero client wallet fee.
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Employer Verification</div>
              <div className="text-lg font-extrabold text-violet-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-violet-400" />
                Zero-Wallet Merkle Proof
              </div>
              <p className="text-[11px] text-slate-400">
                Verifies candidate SHA-256 hash + off-chain sibling proof against on-chain smart contract.
              </p>
            </div>
          </div>

          {/* Batches Datatable */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Certificate Batches</h3>
                <p className="text-xs text-slate-500">Active Merkle Root batch containers</p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={fetchBatches}
                isLoading={loading}
                icon={RefreshCw}
              >
                Refresh
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 pl-5">Batch ID</th>
                    <th className="p-3.5">Batch Name</th>
                    <th className="p-3.5">Certificates</th>
                    <th className="p-3.5">Merkle Root Digest</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="p-6">
                        <TableSkeleton rows={4} />
                      </td>
                    </tr>
                  ) : batches.length > 0 ? (
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
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-indigo-700 font-bold border border-slate-200">
                              {batch.merkleRoot.slice(0, 10)}...{batch.merkleRoot.slice(-8)}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Not Generated</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {batch.status === 'ANCHORED' ? (
                            <Badge variant="emerald" icon={CheckCircle}>
                              ANCHORED ON POLYGON
                            </Badge>
                          ) : batch.status === 'GENERATED' ? (
                            <Badge variant="indigo" icon={Layers}>
                              ROOT GENERATED
                            </Badge>
                          ) : (
                            <Badge variant="amber" icon={RefreshCw}>
                              PENDING
                            </Badge>
                          )}
                        </td>
                        <td className="p-3.5 pr-5 text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateMerkleRoot(batch.batchId)}
                            isLoading={processingBatchId === batch.batchId}
                          >
                            Build Merkle Tree
                          </Button>

                          <Button
                            variant={batch.status === 'ANCHORED' ? 'ghost' : 'primary'}
                            size="sm"
                            onClick={() => handleAnchorBatch(batch)}
                            isLoading={anchoringBatchId === batch.batchId}
                            disabled={batch.status === 'ANCHORED'}
                            icon={Lock}
                          >
                            {batch.status === 'ANCHORED' ? 'Anchored' : 'Anchor Batch'}
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8">
                        <EmptyState
                          title="No Batch Containers Found"
                          description="No certificate batches created yet. Click 'Create New Batch' to group student credentials."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Merkle Tree Generated Preview Card */}
          {treePreview && (
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle className="w-5 h-5" />
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
                  <span className="font-mono text-xs text-emerald-400 font-extrabold block bg-slate-950 p-3 rounded-xl border border-slate-800 break-all mt-1">
                    {treePreview.merkleRoot}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Total Leaves (Certificates):</span>
                    <span className="font-bold text-white text-sm">{treePreview.treePreview?.leavesCount || treePreview.leavesCount} Hashes</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Merkle Tree Layers:</span>
                    <span className="font-bold text-white text-sm">{treePreview.treeLayersCount || 4} Binary Layers</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Individual Merkle Proof paths have been assigned to each certificate record in MongoDB. Ready to anchor Merkle Root on Polygon network via backend wallet.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Batch Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Certificate Batch Container"
        subtitle="Group student credentials into a Merkle tree batch"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <Input
            label="Batch Identifier"
            required
            icon={Hash}
            value={newBatchData.batchId}
            onChange={(e) => setNewBatchData({ ...newBatchData, batchId: e.target.value })}
            placeholder="e.g. BATCH-2026-CSE-A"
            className="font-mono font-bold text-indigo-600"
          />

          <Input
            label="Batch Title / Name"
            required
            value={newBatchData.name}
            onChange={(e) => setNewBatchData({ ...newBatchData, name: e.target.value })}
            placeholder="e.g. Computer Science Class of 2026"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Department"
              value={newBatchData.department}
              onChange={(e) => setNewBatchData({ ...newBatchData, department: e.target.value })}
              options={[
                'Computer Science',
                'Information Technology',
                'Cyber Security',
                'Data Science',
                'Artificial Intelligence',
              ]}
            />

            <Input
              label="Academic Year"
              required
              value={newBatchData.academicYear}
              onChange={(e) => setNewBatchData({ ...newBatchData, academicYear: e.target.value })}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Batch Container
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

