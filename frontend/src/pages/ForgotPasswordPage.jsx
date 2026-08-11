import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authApi } from '../services/api';
import { Mail, KeyRound, AlertCircle, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.forgotPassword({ email });
      if (res.success) {
        setResult(res);
      }
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-slate-800/80 rounded-3xl p-8 max-w-md w-full border border-slate-700/60 shadow-2xl backdrop-blur-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/20">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white">Reset Password</h1>
            <p className="text-xs text-slate-400">
              Enter your registered email address to receive a secure password reset link.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-emerald-200 text-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Reset Link Requested</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {result.message}
              </p>

              {result.resetLink && (
                <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700 text-[11px] font-mono break-all space-y-1">
                  <div className="text-slate-400 font-sans font-semibold">Password Reset Link (Development Mode):</div>
                  <a href={result.resetLink} className="text-indigo-400 hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span>{result.resetLink}</span>
                  </a>
                </div>
              )}

              <div className="pt-2">
                <Link
                  to="/login"
                  className="block w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl text-center shadow-lg transition"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs"
              >
                {loading ? (
                  <span>Sending Reset Link...</span>
                ) : (
                  <>
                    <span>Send Reset Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-700/60 text-center text-xs text-slate-400">
            Remembered your password?{' '}
            <Link to="/login" className="text-indigo-400 hover:underline font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
