/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ViewMode } from '../types';
import { GitBranch, FileText, Link, BrainCircuit, Image, Sparkles, ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (mode: ViewMode) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 mb-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-cyan-400 to-emerald-400 font-mono leading-tight">
          L'iNk
        </h1>
        
        <p className="text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed">
          Interactive code maps for deep repository analysis and visual article summaries.
          <br/>
          <span className="text-pink-400">GitFlow</span>: Analyze GitHub repositories to map data flows and architecture.
          <br/>
          <span className="text-cyan-400">SiteSketch</span>: Transform web articles into highly visual, structured infographics.
        </p>

        {/* Vertical Action Stack */}
        <div className="flex flex-col items-center gap-6 pt-6 w-full max-w-[480px] mx-auto">
            
            {/* GitHub Option */}
            <div className="w-full flex items-center gap-4 group relative">
                <div className="hidden md:flex flex-col items-end w-40 shrink-0 absolute -left-44 top-1/2 -translate-y-1/2">
                    <span className="text-xs font-mono text-pink-400 uppercase tracking-wider mb-1 text-right">GitHub Repo Here</span>
                    <ArrowRight className="w-5 h-5 text-pink-500" />
                </div>
                
                <button 
                    onClick={() => onNavigate(ViewMode.REPO_ANALYZER)}
                    className="w-full glass-panel p-5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 hover:border-pink-500/50 text-left group-hover:translate-x-1 shadow-glass relative overflow-hidden"
                >
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <GitBranch className="w-24 h-24 -rotate-12" />
                    </div>
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="p-3.5 bg-pink-500/20 rounded-xl text-pink-300 border border-pink-500/20 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                            <GitBranch className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-pink-200 transition-colors">GitHub Repo</h3>
                            <p className="text-xs text-slate-400 font-mono mt-1 group-hover:text-slate-300">Data Flow Diagram</p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Web Article Option */}
            <div className="w-full flex items-center gap-4 group relative">
                 <div className="hidden md:flex flex-col items-end w-40 shrink-0 absolute -left-44 top-1/2 -translate-y-1/2">
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1 text-right">Any Other Link</span>
                    <ArrowRight className="w-5 h-5 text-cyan-500" />
                </div>

                <button 
                    onClick={() => onNavigate(ViewMode.ARTICLE_INFOGRAPHIC)}
                    className="w-full glass-panel p-5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 hover:border-cyan-500/50 text-left group-hover:translate-x-1 shadow-glass relative overflow-hidden"
                >
                     <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileText className="w-24 h-24 -rotate-12" />
                    </div>
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="p-3.5 bg-cyan-500/20 rounded-xl text-cyan-300 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-200 transition-colors">Web Article</h3>
                            <p className="text-xs text-slate-400 font-mono mt-1 group-hover:text-slate-300">Summary Infographic</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
      </div>

      {/* 3-Step Process Visualization (Simplified) */}
      <div className="relative pt-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 border-t border-white/5">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative pt-10">
             {/* Step 1 */}
             <div className="flex flex-col items-center text-center space-y-4 group">
                 <div className="w-12 h-12 rounded-xl bg-slate-900/50 border border-white/10 flex items-center justify-center shadow-glass-lg group-hover:border-violet-500/50 transition-colors">
                     <Link className="w-5 h-5 text-slate-300 group-hover:text-violet-300 transition-colors" />
                 </div>
                 <div>
                     <h3 className="text-white font-bold text-sm font-mono uppercase tracking-wider mb-1">
                        1. Paste Link
                     </h3>
                     <p className="text-slate-500 text-xs leading-relaxed max-w-[200px] mx-auto">
                        Use any public URL.
                     </p>
                 </div>
             </div>

             {/* Step 2 */}
             <div className="flex flex-col items-center text-center space-y-4 group">
                 <div className="w-12 h-12 rounded-xl bg-slate-900/50 border border-fuchsia-500/30 flex items-center justify-center shadow-neon-violet">
                     <BrainCircuit className="w-5 h-5 text-fuchsia-300" />
                 </div>
                 <div>
                     <h3 className="text-white font-bold text-sm font-mono uppercase tracking-wider mb-1">
                        2. Analyze
                     </h3>
                     <p className="text-slate-500 text-xs leading-relaxed max-w-[200px] mx-auto">
                        AI maps the structure.
                     </p>
                 </div>
             </div>

             {/* Step 3 */}
             <div className="flex flex-col items-center text-center space-y-4 group">
                 <div className="w-12 h-12 rounded-xl bg-slate-900/50 border border-white/10 flex items-center justify-center shadow-glass-lg group-hover:border-emerald-500/50 transition-colors">
                     <Image className="w-5 h-5 text-slate-300 group-hover:text-emerald-300 transition-colors" />
                 </div>
                 <div>
                     <h3 className="text-white font-bold text-sm font-mono uppercase tracking-wider mb-1">
                        3. Visualize
                     </h3>
                     <p className="text-slate-500 text-xs leading-relaxed max-w-[200px] mx-auto">
                        Download your blueprint.
                     </p>
                 </div>
             </div>
         </div>
      </div>

      {/* Strategic Copy Section */}
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <p className="text-lg text-emerald-400 font-medium mb-4">
          Visual Code Intelligence for Modern Engineering.
        </p>
        
        <p className="text-white/70 leading-relaxed mb-6">
          ReFURRM L'INK transforms complex GitHub repositories into interactive <strong>Logic Maps</strong>. 
          Identify security vulnerabilities, design patterns, and potential code improvements before they reach production.
        </p>

        <div className="grid grid-cols-3 gap-4 text-left border-t border-white/10 pt-6">
          <div>
            <div className="text-emerald-500 font-bold text-xs uppercase tracking-tighter">Blueprint</div>
            <div className="text-[11px] text-white/50">Visualize your entire dependency tree.</div>
          </div>
          <div className="border-x border-white/5 px-4">
            <div className="text-blue-400 font-bold text-xs uppercase tracking-tighter">Handoff</div>
            <div className="text-[11px] text-white/50">Generate file-specific refactor prompts.</div>
          </div>
          <div>
            <div className="text-amber-500 font-bold text-xs uppercase tracking-tighter">Improve</div>
            <div className="text-[11px] text-white/50">Generate refactor suggestions automatically.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
    