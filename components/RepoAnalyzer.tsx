/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { fetchRepoFileTree, fetchFileContent } from '../services/githubService';
import { generateInfographic, analyzeRepoCodebase, generateRemasteredFiles, CodeHealthAudit } from '../services/geminiService';
import { RepoFileTree, ViewMode, RepoHistoryItem } from '../types';
import { useAuth } from './AuthProvider';
import { saveAuditLog } from '../services/firebase';
import { AlertCircle, Loader2, Layers, Box, Download, Sparkles, Command, Palette, Globe, Clock, Maximize, KeyRound, ShieldCheck, Activity, Lightbulb, Zap, Code, Copy, Check, ChevronDown, ChevronRight, Shield, Rocket, Cpu } from 'lucide-react';
import { LoadingState } from './LoadingState';
import ImageViewer from './ImageViewer';
import ReactMarkdown from 'react-markdown';
import D3FlowChart from './D3FlowChart';
import { DataFlowGraph, D3Node, D3Link } from '../types';

interface RepoAnalyzerProps {
  onNavigate: (mode: ViewMode, data?: any) => void;
  history: RepoHistoryItem[];
  onAddToHistory: (item: RepoHistoryItem) => void;
}

const FLOW_STYLES = [
    "Modern Data Flow",
    "Hand-Drawn Blueprint",
    "Watercolor Wash",
    "Technical Drawing",
    "Isometric Grid",
    "Retro Terminal",
    "Neon Cyberpunk",
    "Matrix Console",
    "Brutalist Architecture",
    "Ink & Parchment",
    "Ethereal Aura",
    "Custom"
];

const LANGUAGES = [
  { label: "English (US)", value: "English" },
  { label: "Arabic (Egypt)", value: "Arabic" },
  { label: "German (Germany)", value: "German" },
  { label: "Spanish (Mexico)", value: "Spanish" },
  { label: "French (France)", value: "French" },
  { label: "Hindi (India)", value: "Hindi" },
  { label: "Indonesian (Indonesia)", value: "Indonesian" },
  { label: "Italian (Italy)", value: "Italian" },
  { label: "Japanese (Japan)", value: "Japanese" },
  { label: "Korean (South Korea)", value: "Korean" },
  { label: "Portuguese (Brazil)", value: "Portuguese" },
  { label: "Russian (Russia)", value: "Russian" },
  { label: "Ukrainian (Ukraine)", value: "Ukrainian" },
  { label: "Vietnamese (Vietnam)", value: "Vietnamese" },
  { label: "Chinese (China)", value: "Chinese" },
];

const AuditSection: React.FC<{ 
  title: string; 
  content: string; 
  icon: React.ReactNode; 
  color: string;
  defaultOpen?: boolean;
}> = ({ title, content, icon, color, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!content.trim()) return null;

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-white/5 border-white/10' : 'bg-transparent border-white/5 hover:bg-white/5'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between group"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${color} bg-opacity-10 border border-opacity-20 flex items-center justify-center`}>
            {icon}
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-white font-mono tracking-tight">{title}</h4>
            {!isOpen && <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[200px] md:max-w-md">View detailed findings...</p>}
          </div>
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
        </div>
      </button>
      
      {isOpen && (
        <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 duration-300">
          <div className="prose prose-invert prose-emerald max-w-none prose-sm font-sans selection:bg-emerald-500/30 markdown-body">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

const TIER_LABELS = {
  FREE: "CIR BLUEPRINT",
  MID: "AI HANDOFF",
  PRO: "REMASTER PRO"
};

const RepoAnalyzer: React.FC<RepoAnalyzerProps> = ({ onNavigate, history, onAddToHistory }) => {
  const { user, isAdmin: isUserAdmin } = useAuth();
  const [repoInput, setRepoInput] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(FLOW_STYLES[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].value);
  const [customStyle, setCustomStyle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState<string>('');
  
  // Infographic State
  const [infographicData, setInfographicData] = useState<string | null>(null);
  const [infographic3DData, setInfographic3DData] = useState<string | null>(null);
  const [generating3D, setGenerating3D] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CodeHealthAudit | null>(null);
  const [analyzingCodebase, setAnalyzingCodebase] = useState(false);
  const [remasteredFiles, setRemasteredFiles] = useState<{ fileName: string; content: string }[]>([]);
  const [remastering, setRemastering] = useState(false);
  const [selectedRemasteredIdx, setSelectedRemasteredIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showHandoff, setShowHandoff] = useState(false);
  const [selectedNodePath, setSelectedNodePath] = useState<string | null>(null);
  const [currentFileTree, setCurrentFileTree] = useState<RepoFileTree[] | null>(null);
  const [currentRepoName, setCurrentRepoName] = useState<string>('');
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [loadingFileContent, setLoadingFileContent] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (selectedNodePath && currentFileTree && !selectedNodePath.includes('/') === false) {
        // Only fetch if it's a file (has extensions or common path structure)
        const file = currentFileTree.find(f => f.path === selectedNodePath);
        if (file && file.url) {
          setLoadingFileContent(true);
          try {
            const content = await fetchFileContent(file.url);
            setSelectedFileContent(content);
          } catch (err) {
            console.error('Error fetching file content:', err);
            setSelectedFileContent(null);
          } finally {
            setLoadingFileContent(false);
          }
        }
      } else {
        setSelectedFileContent(null);
      }
    };
    fetchContent();
  }, [selectedNodePath, currentFileTree]);

  const generateGraphData = (fileTree: RepoFileTree[]): DataFlowGraph => {
    const nodes: D3Node[] = [];
    const links: D3Link[] = [];
    const nodeMap = new Map<string, D3Node>();

    // Parse hotspots from analysis result if it exists
    const hotspots = new Set<string>();
    if (analysisResult) {
      analysisResult.hotspots.forEach(h => hotspots.add(h.path));

      // Also fallback to fuzzy matching if no explicit list
      if (hotspots.size === 0) {
        fileTree.forEach(file => {
          const fileName = file.path.split('/').pop() || '';
          if (fileName.length > 3 && analysisResult.report.includes(fileName)) {
            hotspots.add(file.path);
          }
        });
      }
    }

    // Root node
    const rootNode: D3Node = { id: 'root', label: 'repository', group: 0 };
    nodes.push(rootNode);
    nodeMap.set('root', rootNode);

    fileTree.forEach(file => {
      const parts = file.path.split('/');
      let currentPath = '';
      
      parts.forEach((part, index) => {
        const parentPath = currentPath || 'root';
        const rawPath = currentPath ? `${currentPath}/${part}` : part;
        currentPath = rawPath;

        if (!nodeMap.has(currentPath)) {
          const node: D3Node = {
            id: currentPath,
            label: part,
            group: index + 1,
            isHot: hotspots.has(currentPath)
          };
          nodes.push(node);
          nodeMap.set(currentPath, node);
          
          links.push({
            source: parentPath,
            target: currentPath,
            value: 1
          });
        }
      });
    });

    return { nodes, links };
  };

  const handleNodeSelect = (node: D3Node) => {
    setSelectedNodePath(node.id === 'root' ? null : node.id);
  };
  
  // Viewer State
  const [fullScreenImage, setFullScreenImage] = useState<{src: string, alt: string} | null>(null);

  const parseRepoInput = (input: string): { owner: string, repo: string } | null => {
    const cleanInput = input.trim().replace(/\/$/, '');
    try {
      const url = new URL(cleanInput);
      if (url.hostname === 'github.com') {
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) return { owner: parts[0], repo: parts[1] };
      }
    } catch (e) { }
    const parts = cleanInput.split('/');
    if (parts.length === 2 && parts[0] && parts[1]) return { owner: parts[0], repo: parts[1] };
    return null;
  };

  const addToHistory = (repoName: string, imageData: string, is3D: boolean, style: string) => {
     const newItem: RepoHistoryItem = {
         id: Date.now().toString(),
         repoName,
         imageData,
         is3D,
         style,
         date: new Date()
     };
     onAddToHistory(newItem);
  };

  const handleApiError = (err: any) => {
      if (err.message && err.message.includes("Requested entity was not found")) {
          // This specific error often implies a Free Tier key is trying to access a Paid Model.
          setError("BILLING_REQUIRED: The current API key does not have access to these models. This feature requires a paid Google Cloud Project. Please use the 'Switch Key' button below to provide a valid Paid Tier API Key.");
          return;
      }
      setError(err.message || 'An unexpected error occurred during analysis.');
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('AUTHENTICATION_REQUIRED: Large-scale neural analysis requires a secure session. Please Sign In via the gateway at the top of the page.');
      return;
    }

    setError(null);
    setInfographicData(null);
    setInfographic3DData(null);
    setCurrentFileTree(null);

    const repoDetails = parseRepoInput(repoInput);
    if (!repoDetails) {
      setError('Invalid format. Use "owner/repo" or a full GitHub URL.');
      return;
    }

    setLoading(true);
    setCurrentRepoName(repoDetails.repo);
    try {
      setLoadingStage('CONNECTING TO GITHUB');
      const fileTree = await fetchRepoFileTree(repoDetails.owner, repoDetails.repo);

      if (fileTree.length === 0) throw new Error('No relevant code files found in this repository.');
      setCurrentFileTree(fileTree);

      setLoadingStage('ANALYZING STRUCTURE & GENERATING');
      
      const styleToUse = selectedStyle === 'Custom' ? customStyle : selectedStyle;

      const infographicBase64 = await generateInfographic(repoDetails.repo, fileTree, styleToUse, false, selectedLanguage);
      
      if (infographicBase64) {
        setInfographicData(infographicBase64);
        addToHistory(repoDetails.repo, infographicBase64, false, styleToUse);
      } else {
          throw new Error("Failed to generate visual.");
      }

    } catch (err: any) {
      handleApiError(err);
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  const handleGenerate3D = async () => {
    if (!currentFileTree || !currentRepoName) return;
    setGenerating3D(true);
    try {
      // Pass the same selected style to the 3D generator
      const styleToUse = selectedStyle === 'Custom' ? customStyle : selectedStyle;
      const data = await generateInfographic(currentRepoName, currentFileTree, styleToUse, true, selectedLanguage);
      if (data) {
          setInfographic3DData(data);
          addToHistory(currentRepoName, data, true, styleToUse);
      }
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setGenerating3D(false);
    }
  };

  const handleAudit = async () => {
    if (!currentFileTree || !currentRepoName) return;
    setAnalyzingCodebase(true);
    setError(null);
    try {
      const result = await analyzeRepoCodebase(currentRepoName, currentFileTree);
      setAnalysisResult(result);
      
      // Save to Firestore
      if (user) {
        await saveAuditLog({
          repoName: currentRepoName,
          repoUrl: `https://github.com/${currentRepoName}`,
          analysisResult: result,
          infographicUrl: infographicData || undefined
        });
      }
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setAnalyzingCodebase(false);
    }
  };

  const handleRemaster = async () => {
    if (!currentRepoName || !currentFileTree || !analysisResult) return;
    setRemastering(true);
    try {
      const files = await generateRemasteredFiles(currentRepoName, currentFileTree, analysisResult.report);
      setRemasteredFiles(files);
      setSelectedRemasteredIdx(0);
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setRemastering(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (fileName: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateHandoffPrompt = () => {
    if (!analysisResult) return "";
    
    if (selectedNodePath) {
        return `I am working on a GitHub repository called "${currentRepoName}". 
I have performed a Code Intelligence Audit and I am currently focused on the file: "${selectedNodePath}".

Audit findings summary:
${analysisResult.report.slice(0, 1000)}...

Please act as a Senior Engineer and provide a specific, high-fidelity refactor for "${selectedNodePath}" that resolves the architectural and security issues identified in the audit.`;
    }

    return `I am working on a GitHub repository called "${currentRepoName}". 
I have performed a Code Intelligence Audit and found the following issues:

${analysisResult.report}

Please act as a Senior Engineer and help me refactor the most critical files based on these findings. Focus on security, performance, and clean architecture.`;
  };

  const handleCopyHandoff = () => {
    handleCopy(generateHandoffPrompt());
    setShowHandoff(true);
    setTimeout(() => setShowHandoff(false), 3000);
  };

  const parseAuditReport = (text: string) => {
    const sections: Record<string, string> = {};
    const lines = text.split('\n');
    let currentSection = 'GENERAL';
    
    lines.forEach(line => {
      const upperLine = line.toUpperCase();
      if (upperLine.startsWith('# SECURITY')) { currentSection = 'SECURITY'; }
      else if (upperLine.startsWith('# PERFORMANCE')) { currentSection = 'PERFORMANCE'; }
      else if (upperLine.startsWith('# ARCHITECTURE')) { currentSection = 'ARCHITECTURE'; }
      else if (upperLine.startsWith('# ROADMAP')) { currentSection = 'ROADMAP'; }
      else if (upperLine.startsWith('# HOTSPOTS')) { currentSection = 'HOTSPOTS'; }
      else {
        // Remove the header line from the content if it was a header
        if (!line.startsWith('# ')) {
           sections[currentSection] = (sections[currentSection] || '') + line + '\n';
        }
      }
    });
    
    return sections;
  };

  const getFileSpecificFindings = (path: string) => {
    if (!analysisResult) return "Run Audit Integrity Scan to extract targeted diagnostic findings.";
    const lines = analysisResult.report.split('\n');
    let fileFindings: string[] = [];
    
    const fileName = path.split('/').pop() || '';
    
    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes(fileName.toLowerCase()) || (path && line.toLowerCase().includes(path.toLowerCase()))) {
        // Collect few lines around the mention
        for (let i = Math.max(0, idx - 2); i < Math.min(lines.length, idx + 4); i++) {
          const l = lines[i].trim();
          if (l.startsWith('-') || l.startsWith('*') || l.toLowerCase().includes('issue') || l.toLowerCase().includes('hotspot')) {
             if (!fileFindings.includes(lines[i])) fileFindings.push(lines[i]);
          }
        }
      }
    });

    return fileFindings.length > 0 
      ? fileFindings.join('\n') 
      : `### Diagnostics for ${fileName}\nNo specific high-priority flags were found for this node in the global audit. It may be part of a larger structural pattern or is considered healthy.`;
  };

  const loadFromHistory = (item: RepoHistoryItem) => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentRepoName(item.repoName);
      // Since history items don't store the full file tree (too large), we just show the image.
      // If user wants to generate 3D from history of a 2D, they'd need to re-fetch.
      // For simplicity, we display the historical image in the appropriate slot.
      if (item.is3D) {
          setInfographic3DData(item.imageData);
      } else {
          setInfographicData(item.imageData);
          setInfographic3DData(null); // Clear 3D if loading a 2D history item to avoid confusion
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 mb-12">
      
      {fullScreenImage && (
          <ImageViewer 
            src={fullScreenImage.src} 
            alt={fullScreenImage.alt} 
            onClose={() => setFullScreenImage(null)} 
          />
      )}

      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 font-sans leading-tight">
          Codebase <span className="text-violet-400">Intelligence</span>.
        </h2>
        <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide">
          Turn any repository into a fully analyzed, interactive architectural blueprint.
        </p>
      </div>

      {/* Input Section */}
      <div className="max-w-xl mx-auto relative z-10">
        <form onSubmit={handleAnalyze} className="glass-panel rounded-2xl p-2 transition-all focus-within:ring-1 focus-within:ring-violet-500/50 focus-within:border-violet-500/50">
          <div className="flex items-center">
             <div className="pl-3 text-slate-500">
                <Command className="w-5 h-5" />
             </div>
             <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="owner/repository"
                className="w-full bg-transparent border-none text-white placeholder:text-slate-600 focus:ring-0 text-lg px-4 py-2 font-mono"
              />
              <div className="pr-2">
                <button
                type="submit"
                disabled={loading || !repoInput.trim()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-white/10 font-mono text-sm"
                >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "RUN_ANALYSIS"}
                </button>
             </div>
          </div>

          {/* Controls: Style and Language */}
          <div className="mt-2 pt-2 border-t border-white/5 px-3 pb-1 space-y-3">
             {/* Style Selector */}
             <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                 <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px] uppercase tracking-wider shrink-0">
                     <Palette className="w-3 h-3" /> Style:
                 </div>
                 <div className="flex gap-2">
                     {FLOW_STYLES.map(style => (
                         <button
                            key={style}
                            type="button"
                            onClick={() => setSelectedStyle(style)}
                            className={`text-[11px] px-2.5 py-1 rounded-md font-mono transition-all whitespace-nowrap ${
                                selectedStyle === style 
                                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' 
                                : 'bg-white/5 text-slate-500 hover:text-slate-300 border border-transparent hover:border-white/10'
                            }`}
                         >
                             {style}
                         </button>
                     ))}
                 </div>
             </div>
             
             {/* Language Selector & Custom Style Input */}
             <div className="flex flex-wrap gap-3">
               <div className="flex items-center gap-2 bg-slate-950/50 border border-white/10 rounded-lg px-2 py-1 shrink-0 min-w-0 max-w-full">
                  <Globe className="w-3 h-3 text-slate-500 shrink-0" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-transparent border-none text-xs text-slate-300 focus:ring-0 p-0 font-mono cursor-pointer min-w-0 flex-1 truncate"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value} className="bg-slate-900 text-slate-300">
                        {lang.label}
                      </option>
                    ))}
                  </select>
               </div>

               {selectedStyle === 'Custom' && (
                   <input 
                      type="text" 
                      value={customStyle}
                      onChange={(e) => setCustomStyle(e.target.value)}
                      placeholder="Custom style..."
                      className="flex-1 min-w-[120px] bg-slate-950/50 border border-white/10 rounded-lg px-3 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 font-mono transition-all"
                   />
               )}
             </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto p-4 glass-panel border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-2 font-mono text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <p className="flex-1">{error}</p>
          {error.toUpperCase().includes("REQUIRED") && (
              <button 
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded text-xs font-bold transition-colors flex items-center gap-1"
              >
                 <KeyRound className="w-3 h-3" /> SWITCH KEY
              </button>
          )}
        </div>
      )}

      {loading && (
        <LoadingState message={loadingStage} type="repo" />
      )}

      {/* Results Section */}
      {infographicData && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 2D Infographic Card */}
              <div className="glass-panel rounded-3xl p-1.5">
                 <div className="px-4 py-3 flex flex-wrap items-center justify-between border-b border-white/5 mb-1.5 gap-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                      <Layers className="w-4 h-4 text-violet-400" /> Flow_Diagram
                    </h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setFullScreenImage({src: `data:image/png;base64,${infographicData}`, alt: `${currentRepoName} 2D`})}
                        className="text-xs flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-mono p-1.5 rounded-lg hover:bg-white/10"
                        title="Full Screen"
                      >
                        <Maximize className="w-4 h-4" />
                      </button>
                      <a href={`data:image/png;base64,${infographicData}`} download={`${currentRepoName}-infographic-2d.png`} className="text-xs flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-mono bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 border border-white/10 font-semibold">
                        <Download className="w-3 h-3" /> <span>Save PNG</span>
                      </a>
                    </div>
                </div>
                <div className="rounded-2xl overflow-hidden bg-[#eef8fe] relative group border border-slate-200/10">
                    {selectedStyle === "Neon Cyberpunk" && <div className="absolute inset-0 bg-slate-950 pointer-events-none mix-blend-multiply" />}
                    <div className="absolute inset-0 bg-slate-950/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <img src={`data:image/png;base64,${infographicData}`} alt="Repository Flow Diagram" className="w-full h-auto object-cover transition-opacity relative z-10" />
                </div>
              </div>

              {/* 3D Infographic Card */}
              <div className="glass-panel rounded-3xl p-1.5 flex flex-col">
                 <div className="px-4 py-3 flex flex-wrap items-center justify-between border-b border-white/5 mb-1.5 shrink-0 gap-2">
                    <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 font-mono uppercase tracking-wider">
                      <Box className="w-4 h-4 text-fuchsia-400" /> <span>Holographic_Model</span>
                    </h3>
                    {infographic3DData && (
                      <div className="flex items-center gap-2 animate-in fade-in">
                        <button 
                            onClick={() => setFullScreenImage({src: `data:image/png;base64,${infographic3DData}`, alt: `${currentRepoName} 3D`})}
                            className="text-xs flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-mono p-1.5 rounded-lg hover:bg-white/10"
                            title="Full Screen"
                        >
                            <Maximize className="w-4 h-4" />
                        </button>
                        <a href={`data:image/png;base64,${infographic3DData}`} download={`${currentRepoName}-infographic-3d.png`} className="text-xs flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-mono bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 border border-white/10 font-semibold">
                          <Download className="w-3 h-3" /> <span>Save PNG</span>
                        </a>
                      </div>
                    )}
                </div>
                
                <div className="flex-1 rounded-2xl overflow-hidden bg-slate-950/30 relative flex items-center justify-center min-h-[300px] group">
                  {infographic3DData ? (
                      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                         <div className="absolute inset-0 bg-slate-950/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />
                         <img src={`data:image/png;base64,${infographic3DData}`} alt="Repository 3D Flow Diagram" className="w-full h-full object-cover animate-in fade-in transition-opacity relative z-20" />
                      </div>
                  ) : generating3D ? (
                    <div className="flex flex-col items-center justify-center gap-4 p-6 text-center animate-in fade-in">
                         <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500/50" />
                         <p className="text-fuchsia-300/50 font-mono text-xs animate-pulse">RENDERING HOLOGRAPHIC MODEL...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
                        <p className="text-slate-500 font-mono text-xs">Render tabletop perspective?</p>
                        <button 
                          onClick={handleGenerate3D}
                          className="px-5 py-2 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 rounded-xl font-semibold transition-all flex items-center gap-2 font-mono text-sm"
                        >
                          <Sparkles className="w-4 h-4" />
                          GENERATE_MODEL
                        </button>
                    </div>
                  )}
                </div>
              </div>
          </div>

          {/* Code Intelligence Report Section */}
          <div className="mt-8 glass-panel rounded-3xl p-1.5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
             <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 mb-1.5 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest">{TIER_LABELS.FREE}</h3>
                        <p className="text-[10px] text-slate-500 font-mono italic">AI-Powered Architectural & Security Blueprint</p>
                    </div>
                </div>
                 {!analysisResult && !analyzingCodebase && (
                    <button 
                        onClick={handleAudit}
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold transition-all flex items-center gap-2 font-mono text-xs shadow-lg shadow-emerald-500/5"
                    >
                        <Activity className="w-4 h-4" />
                        RUN_AUDIT_LOGIC
                    </button>
                )}
                {analysisResult && !remastering && remasteredFiles.length === 0 && (
                    <div className="flex flex-wrap items-center gap-3">
                        {/* TIER 2: AI HANDOFF */}
                        <button 
                            onClick={handleCopyHandoff}
                            className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-slate-300 border border-blue-500/30 rounded-xl font-bold transition-all flex items-center gap-2 font-mono text-xs relative overflow-hidden group shadow-lg shadow-blue-500/5 active:scale-95"
                            title="Generate a high-context prompt for external AI"
                        >
                            <div className="absolute inset-0 bg-blue-400/5 animate-pulse pointer-events-none" />
                            <Copy className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform relative z-10" />
                            <span className="relative z-10">
                                {showHandoff ? 'HANDOFF_COPIED' : TIER_LABELS.MID}
                            </span>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400/20 rounded-full blur-xl group-hover:bg-blue-400/40 transition-colors" />
                        </button>

                        {/* TIER 3: REMASTER PRO */}
                        <button 
                            onClick={handleRemaster}
                            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 font-mono text-xs relative overflow-hidden group ${
                                isUserAdmin 
                                ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-neon-violet' 
                                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                        >
                            {!isUserAdmin && <div className="absolute inset-0 bg-amber-500/5 animate-pulse pointer-events-none" />}
                            <Zap className={`w-4 h-4 ${isUserAdmin ? 'text-white' : 'text-amber-400'}`} />
                            <span className="relative z-10">
                                {isUserAdmin ? TIER_LABELS.PRO : 'UPGRADE_TO_REMASTER_PRO'}
                            </span>
                            {isUserAdmin && <Rocket className="w-3.5 h-3.5 text-white/50 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                        </button>
                    </div>
                )}
             </div>

             <div className="p-6">
                {analyzingCodebase ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-500/40" />
                        <div className="text-center">
                            <p className="text-emerald-300/60 font-mono text-sm animate-pulse tracking-widest">EXAMINING_TECH_STACK...</p>
                            <p className="text-slate-600 text-[10px] font-mono mt-1">Cross-referencing structure with security patterns</p>
                        </div>
                    </div>
                ) : remastering ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-violet-500/40" />
                        <div className="text-center">
                            <p className="text-violet-300/60 font-mono text-sm animate-pulse tracking-widest">HEALING_CODE_ARCH...</p>
                            <p className="text-slate-600 text-[10px] font-mono mt-1">Applying audit findings to core logic</p>
                        </div>
                    </div>
                ) : remasteredFiles.length > 0 ? (
                    <div className="space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="flex flex-col md:flex-row gap-6">
                             {/* File Selection Sidebar */}
                             <div className="md:w-64 space-y-2">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">REMASTERED_SOURCE_DECK</h4>
                                    <button 
                                        onClick={() => remasteredFiles.forEach(f => handleDownloadFile(f.fileName, f.content))}
                                        className="text-[10px] font-mono text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
                                        title="Download All Files"
                                    >
                                        <Download className="w-3 h-3" /> ALL
                                    </button>
                                </div>
                                {remasteredFiles.map((file, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedRemasteredIdx(idx)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all border ${
                                            selectedRemasteredIdx === idx 
                                            ? 'bg-violet-500/20 border-violet-500/40 text-violet-200' 
                                            : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <Code className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">{file.fileName}</span>
                                        </div>
                                    </button>
                                ))}
                             </div>

                             {/* Code Display Area */}
                             <div className="flex-1 min-h-[400px] bg-slate-950/80 rounded-2xl border border-white/5 overflow-hidden flex flex-col relative group">
                                <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-slate-800" />
                                            <div className="w-2 h-2 rounded-full bg-slate-800" />
                                            <div className="w-2 h-2 rounded-full bg-slate-800" />
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400">
                                            {remasteredFiles[selectedRemasteredIdx].fileName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleDownloadFile(remasteredFiles[selectedRemasteredIdx].fileName, remasteredFiles[selectedRemasteredIdx].content)}
                                            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white"
                                            title="Download File"
                                        >
                                            <Download className="w-3 h-3" />
                                        </button>
                                        <button 
                                            onClick={() => handleCopy(remasteredFiles[selectedRemasteredIdx].content)}
                                            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white"
                                            title="Copy Code"
                                        >
                                            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 p-4 overflow-auto font-mono text-[11px] leading-relaxed text-slate-300 selection:bg-violet-500/30 whitespace-pre scrollbar-hide">
                                    {remasteredFiles[selectedRemasteredIdx].content}
                                </div>
                                
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none">
                                    <div className="flex items-center gap-2 text-[9px] font-mono text-violet-400/50 bg-slate-950/80 w-fit px-2 py-1 rounded-full border border-violet-500/10 backdrop-blur">
                                        <Sparkles className="w-3 h-3" /> VERIFIED_DEPLOY_SNIPPET
                                    </div>
                                </div>
                             </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <button 
                                onClick={() => setRemasteredFiles([])}
                                className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2 group"
                            >
                                <Activity className="w-3 h-3" />
                                RETURN_TO_AUDIT_LOG
                            </button>
                            <p className="text-[10px] font-mono text-slate-600">The AI Refactored these files based on security, speed, and clean code principles.</p>
                        </div>
                    </div>
                ) : analysisResult ? (
                    <div className="space-y-6">
                        {/* TIER 1: CIR BLUEPRINT Logic Map */}
                        <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                                    <Globe className="text-emerald-400 w-5 h-5" /> CIR Blueprint: Logic Map
                                </h3>
                                {selectedNodePath && (
                                    <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 animate-pulse uppercase tracking-widest">
                                        Focus: {selectedNodePath.split('/').pop()}
                                    </div>
                                )}
                            </div>
                            <div className="relative border border-white/10 rounded-3xl overflow-hidden bg-black/40 p-1">
                                {currentFileTree && (
                                    <D3FlowChart 
                                        data={generateGraphData(currentFileTree)} 
                                        analysisResult={analysisResult} 
                                        onNodeClick={handleNodeSelect}
                                        isPro={remasteredFiles.length > 0} 
                                    />
                                )}
                                <div className="absolute bottom-6 left-6 text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-4">
                                    <span>Nodes: {currentFileTree?.length || 0}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span>Hotspots: {(() => {
                                      const data = currentFileTree ? generateGraphData(currentFileTree) : { nodes: [] };
                                      return data.nodes.filter(n => n.isHot).length;
                                    })()}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span className={remasteredFiles.length > 0 ? 'text-emerald-400' : 'text-slate-500'}>
                                        Status: {remasteredFiles.length > 0 ? 'INTEGRITY_RESTORED' : 'AUDIT_COMPLETE'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* FOCUSED NODE INTELLIGENCE PANEL */}
                        {selectedNodePath && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 glass-panel rounded-3xl p-6 border-l-4 border-l-emerald-500/50 shadow-2xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                
                                <div className="flex items-start justify-between mb-6 relative z-10">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <h4 className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.2em] font-bold">Node Intelligence Context</h4>
                                        </div>
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Code className="w-5 h-5 text-indigo-400" /> {selectedNodePath.split('/').pop()}
                                        </h3>
                                        <p className="text-[9px] font-mono text-slate-500 truncate max-w-md bg-white/5 px-2 py-0.5 rounded border border-white/5">PATH: {selectedNodePath}</p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedNodePath(null)}
                                        className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors group"
                                    >
                                        <Maximize className="w-4 h-4 rotate-45 group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                                    {/* Content Preview */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> SOURCE_PREVIEW
                                            </span>
                                            {selectedFileContent && (
                                                <button 
                                                    onClick={() => handleCopy(selectedFileContent)}
                                                    className="text-[9px] font-mono text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1"
                                                >
                                                    <Copy className="w-3 h-3" /> COPY_PREVIEW
                                                </button>
                                            )}
                                        </div>
                                        <div className="bg-slate-950/80 rounded-xl border border-white/5 p-4 h-[250px] overflow-auto font-mono text-[10px] text-slate-400 leading-relaxed scrollbar-hide">
                                            {loadingFileContent ? (
                                                <div className="h-full flex flex-col items-center justify-center gap-2 opacity-50">
                                                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                                                    <span className="animate-pulse">FETCHING_BLOB...</span>
                                                </div>
                                            ) : selectedFileContent ? (
                                                <pre className="whitespace-pre">{selectedFileContent.slice(0, 10000)}</pre>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                                                    <Shield className="w-6 h-6 opacity-20" />
                                                    <p className="italic text-center px-4 text-[10px]">Source content unavailable or binary blob.<br/>Nodes may represent directories or non-text fragments.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Audit Context */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> TARGETED_DIAGNOSTICS
                                            </span>
                                            {analysisResult && (
                                                <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-500/50">
                                                    <Zap className="w-2.5 h-2.5" /> NEURAL_EXTRACT
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-emerald-500/5 rounded-xl border border-emerald-500/10 p-5 h-[250px] overflow-auto prose prose-invert prose-xs max-w-none scrollbar-hide">
                                            <div className="space-y-4">
                                                <ReactMarkdown>
                                                    {getFileSpecificFindings(selectedNodePath)}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                        {(() => {
                            const sections = parseAuditReport(analysisResult.report);
                            return (
                                <>
                                    <AuditSection 
                                        title="SECURITY_AUDIT_LOG" 
                                        content={sections['SECURITY']} 
                                        icon={<Shield className="w-4 h-4 text-red-400" />} 
                                        color="bg-red-500 border-red-500"
                                        defaultOpen={true}
                                    />
                                    <AuditSection 
                                        title="PERFORMANCE_METRICS" 
                                        content={sections['PERFORMANCE']} 
                                        icon={<Zap className="w-4 h-4 text-emerald-400" />} 
                                        color="bg-emerald-500 border-emerald-500"
                                    />
                                    <AuditSection 
                                        title="ARCHITECTURAL_HEALTH" 
                                        content={sections['ARCHITECTURE']} 
                                        icon={<Cpu className="w-4 h-4 text-blue-400" />} 
                                        color="bg-blue-500 border-blue-500"
                                    />
                                    <AuditSection 
                                        title="DEVELOPMENT_ROADMAP" 
                                        content={sections['ROADMAP']} 
                                        icon={<Rocket className="w-4 h-4 text-amber-400" />} 
                                        color="bg-amber-500 border-amber-500"
                                    />
                                    {sections['GENERAL'] && (
                                        <AuditSection 
                                            title="MISC_FINDINGS" 
                                            content={sections['GENERAL']} 
                                            icon={<Activity className="w-4 h-4 text-slate-400" />} 
                                            color="bg-slate-500 border-slate-500"
                                        />
                                    )}
                                </>
                            );
                        })()}

                        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-mono italic">
                                <Lightbulb className="w-3 h-3" /> Report generated via SiteSketch AI Engine - High Fidelity Mode
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => handleDownloadFile(`${currentRepoName}-intelligence-report.md`, analysisResult.report)}
                                    className="text-[10px] font-mono text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                                >
                                    <Download className="w-3 h-3" /> DOWNLOAD_REPORT
                                </button>
                                <button 
                                    onClick={() => handleCopy(analysisResult.report)}
                                    className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5"
                                >
                                    <Copy className="w-3 h-3" /> COPY_FULL_REPORT
                                </button>
                                <button 
                                    onClick={() => setAnalysisResult(null)}
                                    className="text-[10px] font-mono text-slate-500 hover:text-red-500/60 transition-colors underline underline-offset-4"
                                >
                                    PURGE_DATA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                ) : (
                    <div className="py-20 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/5 group-hover:border-emerald-500/20 transition-colors">
                            <Activity className="w-8 h-8 text-slate-700" />
                        </div>
                        <h4 className="text-slate-400 font-mono text-sm font-bold">Analysis Ready</h4>
                        <p className="text-slate-600 text-xs mt-2 max-w-xs mx-auto">
                            Examine the repository for bugs, bottlenecks, and security flaws with a deep-dive AI audit.
                        </p>
                    </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
          <div className="pt-12 border-t border-white/5 animate-in fade-in">
              <div className="flex items-center gap-2 mb-6 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <h3 className="text-sm font-mono uppercase tracking-wider">Recent Blueprints</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {history.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => loadFromHistory(item)}
                        className="group bg-slate-900/50 border border-white/5 hover:border-violet-500/50 rounded-xl overflow-hidden text-left transition-all hover:shadow-neon-violet"
                      >
                          <div className="aspect-video relative overflow-hidden bg-slate-950">
                              <img src={`data:image/png;base64,${item.imageData}`} alt={item.repoName} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                              {item.is3D && (
                                  <div className="absolute top-2 right-2 bg-fuchsia-500/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/10">3D</div>
                              )}
                          </div>
                          <div className="p-3">
                              <p className="text-xs font-bold text-white truncate font-mono">{item.repoName}</p>
                              <p className="text-[10px] text-slate-500 mt-1">{item.style}</p>
                          </div>
                      </button>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default RepoAnalyzer;
