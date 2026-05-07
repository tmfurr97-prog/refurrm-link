/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, Zap, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface ApiKeyModalProps {
  onKeySelected: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onKeySelected }) => {
  const [key, setKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;

    setIsVerifying(true);
    setError(null);

    try {
      // Store the key locally to persist across sessions in this environment
      localStorage.setItem('REFURRM_API_KEY', key);
      
      // Artificial delay for feel
      await new Promise(resolve => setTimeout(resolve, 800));
      onKeySelected();
    } catch (err: any) {
      setError(err.message || "Failed to validate API Key. Please ensure it's a valid Gemini API Key.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="w-full max-w-lg relative">
        <div className="glass-panel rounded-3xl p-8 relative overflow-hidden border border-white/10 shadow-2xl">
          {/* Animated background element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px]" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/20">
                <Key className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Enter your Gemini API Key</h2>
                <p className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-widest">To unlock AI-powered features</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-emerald-500/20 transition-colors">
                <Zap className="w-5 h-5 text-amber-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-slate-200">The Power of Your Own Key</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                    Analyzing repositories requires significant AI compute. Using your own key offers:
                  </p>
                  <ul className="space-y-2 text-[10px] text-slate-400 list-disc list-inside">
                    <li><span className="text-slate-200">Zero Shared Throttling:</span> No queue times during peak usage.</li>
                    <li><span className="text-slate-200">Unlimited Analysis:</span> Perform massive deep-dives without local caps.</li>
                    <li><span className="text-slate-200">Enterprise Privacy:</span> Data routing stays within your cloud billing boundary.</li>
                  </ul>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <Key className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${key ? 'text-emerald-400' : 'text-slate-500'}`} size={18} />
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Enter Gemini API Key..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all font-mono text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying || !key.trim()}
                className="w-full group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-4 rounded-2xl text-white font-bold text-sm tracking-widest uppercase transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Save and Get Started</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <button
                onClick={() => onKeySelected()}
                className="w-full mt-4 text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-[0.2em] py-2"
            >
                Continue with Limited Trial 
                <span className="block mt-0.5 opacity-50 capitalize font-sans tracking-normal">(Uses shared community quota)</span>
            </button>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Built with Gemini AI</span>
              </div>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest underline decoration-emerald-500/30"
              >
                Get API Key
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
