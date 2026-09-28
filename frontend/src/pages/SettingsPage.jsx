import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import {
  Settings,
  ShieldCheck,
  Building,
  Lock,
  Mail,
  Save,
  CheckCircle,
  Database,
  Globe,
  Key,
  Server,
} from 'lucide-react';

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    universityName: 'Tamil Nadu Central Higher Education Credential Platform',
    platformCode: 'CCV-TN-REGISTRY',
    contactEmail: 'admin@ccv.tn.gov.in',
    supportPhone: '+91 44 2235 7000',
    autoAnchorEnabled: true,
    emailNotifications: true,
    verificationPublicAccess: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 pt-16">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
                <Settings className="w-4 h-4" /> Platform Control
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                System Settings & Security Config
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage university credential platform parameters and backend verification engine.
              </p>
            </div>

            <Button
              variant="primary"
              icon={Save}
              onClick={handleSave}
              className="text-xs font-bold"
            >
              {saved ? 'Settings Saved!' : 'Save Changes'}
            </Button>
          </div>

          {saved && (
            <div className="p-4 rounded-xl mb-6 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>Platform configuration updated successfully.</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Institution Profile Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-400" /> Institution & Platform Profile
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Platform Identity Title"
                  value={settings.universityName}
                  onChange={(e) => setSettings({ ...settings, universityName: e.target.value })}
                />
                <Input
                  label="Central Registry Code"
                  value={settings.platformCode}
                  onChange={(e) => setSettings({ ...settings, platformCode: e.target.value })}
                  className="font-mono uppercase font-bold text-indigo-400"
                />
                <Input
                  label="Administrative Contact Email"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                />
                <Input
                  label="Support Helpline"
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                />
              </div>
            </div>

            {/* Backend Verification & Anchoring Infrastructure Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Backend Verification Engine
              </h2>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs mb-4">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-slate-500" /> Verification Contract:
                  </span>
                  <span className="text-indigo-400 font-bold">0x8ED130360DB4eCabCAAa3Eb9cf4afAb107c16f59</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-500" /> Network / Chain ID:
                  </span>
                  <span className="text-emerald-400 font-bold">Polygon Amoy (80002)</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-500" /> Cryptographic Hashing:
                  </span>
                  <span className="text-white font-bold">SHA-256 + IPFS CIDv1</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-slate-500" /> Backend Signing Mode:
                  </span>
                  <span className="text-emerald-400 font-bold">Automated Server-Side Vault</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-white">Automated Batch Anchoring</div>
                    <div className="text-[11px] text-slate-400">Automatically anchor newly issued certificate batches to the registry.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoAnchorEnabled}
                    onChange={(e) => setSettings({ ...settings, autoAnchorEnabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-white">Public Employer Verification Portal</div>
                    <div className="text-[11px] text-slate-400">Allow employers to instantly verify certificates without requiring login.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.verificationPublicAccess}
                    onChange={(e) => setSettings({ ...settings, verificationPublicAccess: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                  />
                </label>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
