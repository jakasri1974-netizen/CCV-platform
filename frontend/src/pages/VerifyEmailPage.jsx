import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authApi } from '../services/api';
import { CheckCircle2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ success: false, message: '' });

  useEffect(() => {
    if (token) {
      handleVerification(token);
    } else {
      setLoading(false);
      setStatus({ success: false, message: 'No verification token provided in link.' });
    }
  }, [token]);

  const handleVerification = async (verifyToken) => {
    try {
      const res = await authApi.verifyEmail({ token: verifyToken });
      setStatus({ success: true, message: res.message || 'Email verified successfully!' });
    } catch (err) {
      setStatus({ success: false, message: err.message || 'Verification failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-slate-800/80 rounded-3xl p-8 max-w-md w-full border border-slate-700/60 shadow-2xl backdrop-blur-md text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/20">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black text-white">Email Verification</h1>

          {loading ? (
            <div className="space-y-3 py-4">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Verifying your token with BlockCert backend...</p>
            </div>
          ) : status.success ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-emerald-200 text-xs space-y-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <div className="font-bold text-sm text-white">{status.message}</div>
              <Link
                to="/login"
                className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg transition"
              >
                Proceed to Login
              </Link>
            </div>
          ) : (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-rose-200 text-xs space-y-4">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <div className="font-bold text-sm text-white">{status.message}</div>
              <Link
                to="/login"
                className="block w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
