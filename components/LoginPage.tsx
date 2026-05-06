/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Mail, Lock, Sparkles, ArrowRight, Github, Loader2, AlertCircle } from 'lucide-react';
import { loginWithGoogle, loginWithGithub } from '../services/firebase';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setIsAuthenticating(true);
    setError(null);
    try {
      if (provider === 'google') {
        await loginWithGoogle();
      } else {
        await loginWithGithub();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("Email/Password login is restricted to enterprise accounts. Please use the Access Gateway providers below.");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative">
        {/* Glass card */}
        <div className="glass-panel rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-white/10">
          {/* Accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-emerald-400 to-violet-500" />

          {/* Header */}
          <div className="mb-8 text-center relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-emerald-500/20 mb-4 shadow-[0_0_20px_-5px_theme(colors.violet.500)]">
              <Sparkles className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              Link2Ink Studio
            </h1>
            <p className="text-slate-400 text-sm font-mono tracking-tight">Access your creative workspace</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleEmailSubmit}>
            {/* Email input */}
            <div className="relative group">
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  focused === 'email' ? 'text-violet-400' : 'text-slate-500'
                }`} size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-12 py-3.5 text-slate-200 placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all font-mono text-sm"
                  placeholder="you@link2ink.studio"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="relative group">
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  focused === 'password' ? 'text-emerald-400' : 'text-slate-500'
                }`} size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-12 py-3.5 text-slate-200 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-sm"
                  placeholder="••••••••••"
                />
              </div>
            </div>

            {/* Options row */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900/50 text-violet-500 focus:ring-violet-500/20 focus:ring-2 cursor-pointer"
                />
                <span className="text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
              </label>
              <button 
                type="button"
                onClick={() => setError("Password recovery is unavailable for unverified trial accounts.")}
                className="text-emerald-400 hover:text-emerald-300 transition-colors font-mono text-[10px]"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500 text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 group mt-6 disabled:opacity-50"
            >
              Sign In to Studio
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-[#0f172a] px-3 text-slate-500 font-mono tracking-widest uppercase">Access Gateway</span>
              </div>
            </div>

            {/* Social logins */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isAuthenticating}
                onClick={() => handleSocialLogin('google')}
                className="bg-slate-800/60 border border-slate-600/50 hover:border-slate-500 text-slate-200 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-slate-700/60 disabled:opacity-50 group"
              >
                {isAuthenticating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />}
                <span className="text-xs uppercase font-mono tracking-wider">Google</span>
              </button>
              <button
                type="button"
                disabled={isAuthenticating}
                onClick={() => handleSocialLogin('github')}
                className="bg-slate-800/60 border border-slate-600/50 hover:border-slate-500 text-slate-200 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-slate-700/60 disabled:opacity-50 group"
              >
                {isAuthenticating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />}
                <span className="text-xs uppercase font-mono tracking-wider">GitHub</span>
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-500 font-mono">
            New to Link2Ink?{' '}
            <button 
              onClick={() => setError("Registration is currently private. Use the Access Gateway to request trial access.")}
              className="text-violet-400 hover:text-violet-300 transition-colors font-medium"
            >
              Create an account
            </button>
          </p>
        </div>

        {/* Floating accent element */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-violet-600/5 to-emerald-600/5 blur-3xl rounded-full" />
      </div>
    </div>
  );
};

export default LoginPage;
