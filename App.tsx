/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import RepoAnalyzer from './components/RepoAnalyzer';
import ArticleToInfographic from './components/ArticleToInfographic';
import Home from './components/Home';
import LoginPage from './components/LoginPage';
import ApiKeyModal from './components/ApiKeyModal';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { ViewMode, RepoHistoryItem, ArticleHistoryItem } from './types';
import { Github, PenTool, GitBranch, FileText, Home as HomeIcon, ShieldAlert, Sparkles, CreditCard } from 'lucide-react';
import { UserMenu } from './components/UserMenu';
import { useAuth } from './components/AuthProvider';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.HOME);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [checkingKey, setCheckingKey] = useState<boolean>(true);
  
  // Lifted History State for Persistence
  const [repoHistory, setRepoHistory] = useState<RepoHistoryItem[]>([]);
  const [articleHistory, setArticleHistory] = useState<ArticleHistoryItem[]>([]);

  useEffect(() => {
    // Handle deep links via URL parameters
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'privacy') {
      setCurrentView(ViewMode.PRIVACY);
    } else if (view === 'terms') {
      setCurrentView(ViewMode.TERMS);
    }

    const checkKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      } else {
        const local = localStorage.getItem('REFURRM_API_KEY');
        setHasApiKey(!!local);
      }
      setCheckingKey(false);
    };
    checkKey();

    const handleLoginTrigger = () => setCurrentView(ViewMode.LOGIN);
    document.addEventListener('trigger-login', handleLoginTrigger);
    return () => document.removeEventListener('trigger-login', handleLoginTrigger);
  }, []);

  const handleNavigate = (mode: ViewMode) => {
    setCurrentView(mode);
  };

  const handleAddRepoHistory = (item: RepoHistoryItem) => {
    setRepoHistory(prev => [item, ...prev]);
  };

  const handleAddArticleHistory = (item: ArticleHistoryItem) => {
    setArticleHistory(prev => [item, ...prev]);
  };

  useEffect(() => {
    if (user && currentView === ViewMode.LOGIN) {
      setCurrentView(ViewMode.HOME);
    }
  }, [user, currentView]);

  if (checkingKey || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center animate-pulse">
            <GitBranch className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] animate-pulse">Setting things up...</div>
        </div>
      </div>
    );
  }

  if (currentView === ViewMode.LOGIN && !user) {
    return <LoginPage onTogglePrivacy={() => setCurrentView(ViewMode.PRIVACY)} onToggleTerms={() => setCurrentView(ViewMode.TERMS)} />;
  }

  if (currentView === ViewMode.PRIVACY) {
    return <PrivacyPolicy onBack={() => setCurrentView(user ? ViewMode.HOME : ViewMode.LOGIN)} />;
  }

  if (currentView === ViewMode.TERMS) {
    return <TermsOfService onBack={() => setCurrentView(user ? ViewMode.HOME : ViewMode.LOGIN)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Enforce API Key Modal */}
      {!hasApiKey && <ApiKeyModal onKeySelected={() => setHasApiKey(true)} />}

      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-2 md:py-2.5 flex justify-between items-center">
          <button 
            onClick={() => setCurrentView(ViewMode.HOME)}
            className="flex items-center gap-3 md:gap-4 group transition-opacity hover:opacity-80"
          >
            <div className="relative flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-xl bg-slate-900 border border-white/10 shadow-inner group-hover:border-pink-500/50 transition-colors overflow-hidden">
               <img src="/logo-icon.svg" alt="RFL" className="w-7 h-7 md:w-10 md:h-10" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight font-mono flex items-baseline gap-2">
                L'iNk
              </h1>
              <p className="text-[10px] md:text-xs font-mono text-slate-500 tracking-wider uppercase hidden sm:block mt-0.5">Repository Analysis Platform</p>
            </div>
          </button>
            <div className="flex items-center gap-4">
              {hasApiKey && (
                  <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-widest cursor-help" title="API Key Active">
                      <CreditCard className="w-3 h-3" /> Paid Tier
                  </div>
              )}
              <UserMenu />
            </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col">
        {/* Navigation Tabs (Hidden on Home, visible on tools) */}
        {currentView !== ViewMode.HOME && (
            <div className="flex justify-center mb-6 md:mb-8 animate-in fade-in slide-in-from-top-4 sticky top-16 z-40">
            <div className="glass-panel p-1 md:p-1.5 rounded-full flex relative shadow-2xl">
                <button
                onClick={() => setCurrentView(ViewMode.HOME)}
                className="relative flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full font-medium text-sm transition-all duration-300 font-mono text-slate-500 hover:text-slate-300 hover:bg-white/5"
                title="Home"
                >
                <HomeIcon className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-white/10 my-auto mx-1"></div>
                <button
                onClick={() => setCurrentView(ViewMode.REPO_ANALYZER)}
                className={`relative flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full font-medium text-sm transition-all duration-300 font-mono ${
                    currentView === ViewMode.REPO_ANALYZER
                    ? 'text-white bg-white/10 shadow-glass-inset border border-white/10'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                >
                <GitBranch className="w-4 h-4" />
                <span className="hidden sm:inline">GitFlow</span>
                </button>
                <button
                onClick={() => setCurrentView(ViewMode.ARTICLE_INFOGRAPHIC)}
                className={`relative flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full font-medium text-sm transition-all duration-300 font-mono ${
                    currentView === ViewMode.ARTICLE_INFOGRAPHIC
                    ? 'text-emerald-100 bg-emerald-500/10 shadow-glass-inset border border-emerald-500/20'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">SiteSketch</span>
                </button>
            </div>
            </div>
        )}

        <div className="flex-1">
            {currentView === ViewMode.HOME && (
                <Home onNavigate={handleNavigate} />
            )}
            {currentView === ViewMode.REPO_ANALYZER && (
                <div className="animate-in fade-in-30 slide-in-from-bottom-4 duration-500 ease-out">
                    <RepoAnalyzer 
                        onNavigate={handleNavigate} 
                        history={repoHistory} 
                        onAddToHistory={handleAddRepoHistory}
                    />
                </div>
            )}
            {currentView === ViewMode.ARTICLE_INFOGRAPHIC && (
                <div className="animate-in fade-in-30 slide-in-from-bottom-4 duration-500 ease-out">
                    <ArticleToInfographic 
                        history={articleHistory} 
                        onAddToHistory={handleAddArticleHistory}
                    />
                </div>
            )}
        </div>
      </main>

      <footer className="py-8 mt-auto border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 order-2 md:order-1">
            <p className="text-xs font-mono text-slate-600">
              <span className="text-emerald-500/70">refurrm</span>:<span className="text-violet-500/70">link</span>$
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-slate-500 group hover:border-emerald-500/30 transition-colors">
              <Sparkles className="w-3 h-3 text-emerald-400/50 group-hover:text-emerald-400 transition-colors" />
              <span>Intelligent Code Maps</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-mono text-slate-500 order-1 md:order-2">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></span> SYSTEM_READY</span>
            <a href="mailto:support@refurrm.org" className="hover:text-emerald-400 transition-colors uppercase tracking-widest">support@refurrm.org</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
