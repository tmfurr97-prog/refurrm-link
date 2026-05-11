import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-6 md:p-12 font-sans overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Portal
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-pink-500/20 rounded-xl">
            <Shield className="w-8 h-8 text-pink-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-slate-400">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-100">1. Data Collection</h2>
            <p>
              ReFURRM L'INK is designed with a "Privacy-First" architecture. We do not persist your repository source code on our servers. 
              Analysis is performed in-memory and metadata is stored locally in your browser's session storage.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-100">2. Service Providers</h2>
            <p>
              We utilize Google Firebase for authentication and Google Gemini for AI analysis. When you provide an API key, 
              it is stored securely in your browser's LocalStorage and is only used to facilitate direct requests to the Google AI SDK.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-100">3. Repository Access</h2>
            <p>
              When you analyze a GitHub repository, we only access public metadata or private data explicitly authorized via OAuth. 
              We do not clone your entire repository to our infrastructure; we stream specific logic blocks for analysis.
            </p>
          </section>

          <section className="pt-8 border-t border-white/5">
            <p className="text-[10px] uppercase tracking-widest font-mono">Last Updated: May 2026</p>
          </section>
        </div>
      </div>
    </div>
  );
};
