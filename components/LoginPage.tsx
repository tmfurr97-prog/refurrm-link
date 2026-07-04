/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Mail, Sparkles, Github, Loader2, AlertCircle, Lock, ArrowRight, X } from 'lucide-react';
import { loginWithGoogle, loginWithGithub, loginWithEmail, signupWithEmail } from '../services/firebase';

interface LoginPageProps {
  onClose?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onClose }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setIsAuthenticating(true);
    setError(null);
    try {
      if (provider === 'google') {
        await loginWithGoogle();
      } else {
        await loginWithGithub();
      }
      onClose?.();
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please keep the popup window open to sign in.');
      } else if (err.code === 'auth/cancelled-by-user') {
        setError('Login process was cancelled.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('This login method is not enabled. Please enable Google/GitHub in your Firebase Console (Authentication > Sign-in method).');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setIsAuthenticating(true);
    setError(null);
    try {
      if (isSignUp) {
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      onClose?.();
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative">
        {/* Glass card */}
        <div className="glass-panel rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-white/10">
          {onClose && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-emerald-400 to-violet-500" />

          {/* Header */}
          <div className="mb-8 text-center relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-emerald-500/20 mb-4 shadow-[0_0_20px_-5px_theme(colors.violet.500)]">
              <Sparkles className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              ReFURRM L'INK
            </h1>
            <p className="text-slate-400 text-sm font-mono tracking-tight">Sign in to unlock full features</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-5">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-11 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all font-mono"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-11 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all font-mono"
                />
              </div>
              
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 disabled:opacity-50 text-sm"
              >
                {isAuthenticating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isSignUp ? 'Create Account' : 'Sign In'}
                {!isAuthenticating && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-[#0a0f1c] px-3 text-slate-500 font-mono tracking-widest uppercase">Or continue with</span>
              </div>
            </div>

            {/* Social logins */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={isAuthenticating}
                onClick={() => handleSocialLogin('google')}
                className="w-full bg-slate-800/60 border border-slate-600/50 hover:border-slate-500 text-slate-200 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-slate-700/60 disabled:opacity-50 group"
              >
                {isAuthenticating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />}
                <span className="text-sm font-semibold tracking-wide">Google</span>
              </button>
              <button
                type="button"
                disabled={isAuthenticating}
                onClick={() => handleSocialLogin('github')}
                className="w-full bg-slate-800/60 border border-slate-600/50 hover:border-slate-500 text-slate-200 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-slate-700/60 disabled:opacity-50 group"
              >
                {isAuthenticating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />}
                <span className="text-sm font-semibold tracking-wide">GitHub</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-500 font-mono">
            {isSignUp ? 'Already have an account? ' : 'New to ReFURRM L\'INK? '}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-violet-400 hover:text-violet-300 transition-colors font-medium"
            >
              {isSignUp ? 'Sign in' : 'Create an account'}
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
