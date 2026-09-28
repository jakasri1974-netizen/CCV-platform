import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Lock, User, Shield, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please enter your Student ID / Email address and password');
      return;
    }

    setLoading(true);

    try {
      const user = await login({ email: identifier.trim(), password });
      if (user && user.role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-slate-200 shadow-lg space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">BLOCKCERT</h1>
            <p className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
              Certificate Management & Verification Platform
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Student ID / Email Address"
              type="text"
              icon={User}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter Student ID (e.g. 23CSE001) or Email address..."
              required
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Password</span>
                <Link to="/forgot-password" className="text-[11px] text-indigo-600 hover:underline font-semibold">
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full mt-2"
            >
              Log In
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-indigo-600 hover:underline font-bold">
              Register Institution Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
