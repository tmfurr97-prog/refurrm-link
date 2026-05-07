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
    setShowSetupGuide(false);
    try {
      if (provider === 'google') {
        await loginWithGoogle();
      } else {
        await loginWithGithub();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please keep the popup window open to sign in.');
      } else if (err.code === 'auth/cancelled-by-user') {
        setError('Login process was cancelled.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/unauthorized-domain') {
        setError(err.code === 'auth/operation-not-allowed' 
          ? 'This login method is not enabled in your Firebase Console.' 
          : 'This domain is not authorized in your Firebase Console.');
        setShowSetupGuide(true);
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("Email/Password login is restricted to enterprise accounts. Please use the Access Gateway providers below.");
  };

  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const authorizedDomains = [
    'ais-dev-6bcfucldq7dzwx2qqxjwer-548351223917.us-east1.run.app',
    'ais-pre-6bcfucldq7dzwx2qqxjwer-548351223917.us-east1.run.app',
    window.location.hostname
  ];

  const [diagnosticsVisible, setDiagnosticsVisible] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950 logic-map-bg">
      {/* Animated background elements matching the brand image */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
            {/* Simulation of the complex nodes map from user image */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_10px_theme(colors.pink.500)]" />
            <div className="absolute top-1/4 left-1/4 w-32 h-[1px] bg-gradient-to-r from-pink-500 to-transparent rotate-45 origin-left" />
            <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_theme(colors.cyan.400)]" />
            <div className="absolute top-1/2 right-1/3 w-48 h-[1px] bg-gradient-to-r from-cyan-400 to-transparent -rotate-12 origin-left" />
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_theme(colors.emerald.400)]" />
        </div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-600/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative">
        {/* Glass card */}
        <div className="glass-panel rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-white/10">
          {/* Accent line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-pink-500 via-cyan-400 to-emerald-500" />

          {/* Header */}
          <div className="mb-8 text-center relative">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-900 border border-white/10 mb-6 shadow-2xl group transition-transform hover:scale-105">
              <img src="/logo-icon.svg" alt="ReFURRM L'INK" className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-4 text-center tracking-tight">
              ReFURRM L'INK
            </h1>
            <div className="max-w-xs mx-auto mb-6">
              <p className="text-slate-400 text-[13px] leading-relaxed text-center font-sans font-medium">
                ReFURRM L'INK transforms complex repositories into interactive <span className="text-pink-400">Logic Maps</span>. 
                Identify vulnerabilities, bottlenecks, and architectural rot before production.
              </p>
            </div>
            <div className="flex items-center gap-3 justify-center">
                <div className="h-px w-8 bg-slate-800" />
                <p className="text-slate-500 text-[10px] font-mono tracking-[0.2em] uppercase">Security Portal</p>
                <div className="h-px w-8 bg-slate-800" />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
              
              {showSetupGuide && (
                <div className="mt-3 p-3 bg-slate-900/80 rounded-lg border border-white/5 space-y-4">
                  <div>
                    <p className="text-slate-300 text-[10px] uppercase tracking-wider font-bold mb-2">Step 1: Enable Providers</p>
                    <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                      Go to <strong>Authentication &gt; Sign-in method</strong> and enable <strong>Google</strong> and <strong>GitHub</strong>.
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-300 text-[10px] uppercase tracking-wider font-bold mb-2">Step 2: Authorized Domains</p>
                    <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                      Copy the domain marked <span className="text-emerald-400 font-bold underline">CURRENT</span> and add it to <strong>Settings &gt; Authorized domains</strong>.
                    </p>
                    <div className="space-y-1">
                      {Array.from(new Set(authorizedDomains)).map(domain => (
                        <div key={domain} className="flex items-center gap-1 group/item">
                            <code className="flex-1 p-1.5 bg-black/50 rounded border border-white/10 text-[9px] text-emerald-400 select-all truncate">
                            {domain}
                            </code>
                            {domain === window.location.hostname && (
                                <span className="text-[8px] bg-emerald-500 font-bold text-slate-950 px-1.5 py-0.5 rounded animate-pulse">CURRENT</span>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <p className="text-slate-300 text-[10px] uppercase tracking-wider font-bold mb-2">Why am I seeing this?</p>
                    <p className="text-[10px] text-slate-500 italic leading-relaxed">
                      Firebase limits authentication to specific domains to prevent "Domain Spoofing." This is the first line of defense for your user's identity.
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-300 text-[10px] uppercase tracking-wider font-bold mb-2">Step 3: GitHub Callback</p>
                    <code className="block p-1.5 bg-black/50 rounded border border-white/10 text-[9px] text-cyan-400 break-all select-all">
                      https://gen-lang-client-0231544530.firebaseapp.com/__/auth/handler
                    </code>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => window.open('https://console.firebase.google.com/project/gen-lang-client-0231544530/authentication/providers', '_blank')}
                        className="w-full py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded-md text-[9px] font-bold transition-colors border border-cyan-500/20 uppercase"
                    >
                        Enable Providers
                    </button>
                    <button 
                        onClick={() => window.open('https://console.firebase.google.com/project/gen-lang-client-0231544530/authentication/settings', '_blank')}
                        className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-md text-[9px] font-bold transition-colors border border-emerald-500/20 uppercase"
                    >
                        Add Domains
                    </button>
                  </div>
                </div>
              )}
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
              className="w-full bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-pink-500/10 hover:shadow-cyan-500/20 group mt-6 disabled:opacity-50"
            >
              Sign In to ReFURRM L'INK
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-[#0f172a] px-3 text-slate-500 font-mono tracking-widest uppercase">Or sign in with</span>
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
          <div className="mt-8 space-y-4">
            <p className="text-center text-xs text-slate-500 font-mono">
                New to ReFURRM L'INK?{' '}
                <button 
                onClick={() => setError("Registration is currently private. Use the Access Gateway to request trial access.")}
                className="text-violet-400 hover:text-violet-300 transition-colors font-medium underline underline-offset-4"
                >
                Create an account
                </button>
            </p>

            <div className="pt-4 border-t border-white/5">
                <button 
                    onClick={() => setDiagnosticsVisible(!diagnosticsVisible)}
                    className="w-full flex items-center justify-between text-[10px] text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-[0.2em] font-mono"
                >
                    System Architecture Info
                    <Sparkles className={`w-3 h-3 transition-transform ${diagnosticsVisible ? 'rotate-180' : ''}`} />
                </button>
                
                {diagnosticsVisible && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="space-y-1">
                            <p className="text-[10px] text-pink-400 font-bold uppercase">Paid Tier & API Keys</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                Paid users provide their own keys to ensure **Zero-Throttling** and **Direct Billing**. By using your own Gemini Key, you bypass shared limits and keep your data within your own cloud boundary.
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-cyan-400 font-bold uppercase">Security Protocol</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                ReFURRM utilizes AES-256 for key storage and ephemeral JWT tokens. Your repository metadata is analyzed in-memory and never persisted beyond your active session.
                            </p>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Floating accent element */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-violet-600/5 to-emerald-600/5 blur-3xl rounded-full" />
      </div>
    </div>
  );
};

export default LoginPage;
