/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import D3FlowChart from './D3FlowChart';
import { DevStudioState, D3Node, ViewMode } from '../types';
import { askNodeSpecificQuestion } from '../services/geminiService';
import ForensicChat from './ForensicChat';
import { Terminal, GitBranch, Cpu, MessageSquare, Zap, Code2, ArrowLeft, Sparkles, Bug, Search } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface DevStudioProps {
  initialState: DevStudioState | null;
  onNavigate: (mode: ViewMode) => void;
}

const QUICK_ACTIONS = [
  { label: "Explain", icon: Search, prompt: "Explain the purpose and likely functionality of this component based on its name and connections." },
  { label: "Optimize", icon: Zap, prompt: "Suggest performance optimizations or refactoring for this specific component." },
  { label: "Debug", icon: Bug, prompt: "What are potential failure points, security risks, or bugs common in components like this one?" },
];

const DevStudio: React.FC<DevStudioProps> = ({ initialState, onNavigate }) => {
  const [selectedNode, setSelectedNode] = useState<D3Node | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatLoading]);

  if (!initialState) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 space-y-6 text-center p-8">
        <div className="p-6 bg-slate-900/50 rounded-full border border-indigo-500/20 shadow-neon-violet">
             <GitBranch className="w-16 h-16 text-indigo-400 opacity-80" />
        </div>
        <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-200 font-sans">Dev Studio Offline</h3>
            <p className="font-mono text-sm max-w-md mx-auto">No repository data is currently loaded into the development environment.</p>
        </div>
        <button 
            onClick={() => onNavigate(ViewMode.REPO_ANALYZER)}
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-400 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
            <ArrowLeft className="w-4 h-4" /> Return to Analyzer
        </button>
      </div>
    );
  }

  const handleNodeClick = (node: D3Node) => {
    setSelectedNode(node);
  };

  const executePrompt = async (promptText: string, nodeOverride?: D3Node | null) => {
    if (!initialState.fileTree) return;
    const node = nodeOverride !== undefined ? nodeOverride : selectedNode;
    const targetNodeLabel = node ? node.label : "the overall architecture";

    setChatHistory(prev => [...prev, { role: 'user', text: promptText }]);
    setChatLoading(true);

    try {
        const answer = await askNodeSpecificQuestion(targetNodeLabel, promptText, initialState.fileTree);
        setChatHistory(prev => [...prev, { role: 'model', text: answer }]);
    } catch (error) {
        setChatHistory(prev => [...prev, { role: 'model', text: "Error processing your request." }]);
    } finally {
        setChatLoading(false);
    }
  }

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim()) return;
    const q = questionInput;
    setQuestionInput('');
    await executePrompt(q);
  };

  const handleQuickAction = (promptTemplate: string) => {
      if (selectedNode) {
         executePrompt(promptTemplate);
      }
  }

  return (
    // Mobile: Flex Column, Desktop: Flex Row. 
    // Mobile: Auto height (stacked), Desktop: Calculated full viewport height
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-180px)] min-h-0 lg:min-h-[600px]">
      
      {/* Left Pane: Interactive Graph */}
      {/* Mobile: Fixed 400px height, Desktop: Flex-1 (fill remaining) */}
      <div className="w-full h-[400px] lg:h-auto lg:flex-1 flex flex-col glass-panel rounded-3xl overflow-hidden">
         <div className="px-4 py-3 bg-slate-950/50 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-300 font-mono uppercase tracking-wider">Live_Dependency_Graph</h3>
            </div>
            <div className="text-xs text-slate-500 font-mono px-2 py-1 bg-white/5 rounded-md hidden sm:block">
                repo: {initialState.repoName}
            </div>
         </div>
         <div className="flex-1 relative w-full h-full">
             <D3FlowChart data={initialState.graphData} onNodeClick={handleNodeClick} />
         </div>
      </div>

      {/* Right Pane: Contextual Dev Terminal */}
      {/* Mobile: Full Width, Fixed Height (500px). Desktop: Fixed Width (420px), Auto Height */}
      <div className="w-full lg:w-[420px] h-[500px] lg:h-auto glass-panel rounded-3xl flex flex-col overflow-hidden shrink-0 mb-6 lg:mb-0">
         <div className="px-4 py-3 bg-slate-950/50 border-b border-white/5 flex items-center gap-2 shrink-0">
              <Terminal className="w-4 h-4 text-emerald-500/70" />
              <h3 className="text-sm font-mono text-slate-400">dev_assistant --context-aware</h3>
         </div>

         {/* Selected Node Context Header & Quick Actions */}
         <div className="bg-slate-950/80 border-b border-white/5 p-4 shrink-0 space-y-3">
             {selectedNode ? (
                 <>
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-1">
                        <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30 shrink-0">
                            <Code2 className="w-5 h-5 text-indigo-300" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider">Active Node</p>
                            <p className="text-sm text-white font-mono truncate font-medium" title={selectedNode.label}>{selectedNode.label}</p>
                        </div>
                    </div>
                    {/* Quick Actions */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                        {QUICK_ACTIONS.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuickAction(action.prompt)}
                                disabled={chatLoading}
                                className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-indigo-500/20 border border-white/5 hover:border-indigo-500/30 transition-all group disabled:opacity-50"
                            >
                                <action.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-300" />
                                <span className="text-[10px] font-mono text-slate-500 group-hover:text-indigo-200 uppercase">{action.label}</span>
                            </button>
                        ))}
                    </div>
                 </>
             ) : (
                 <div className="flex items-center gap-3 opacity-70">
                     <div className="p-2 bg-slate-800 rounded-lg border border-white/5">
                        <Cpu className="w-5 h-5 text-slate-500" />
                     </div>
                     <div>
                         <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Global Scope</p>
                         <p className="text-sm text-slate-400 font-mono">No node selected</p>
                     </div>
                 </div>
             )}
         </div>
        
        {/* Chat Area */}
        <div className="flex-1 overflow-auto bg-slate-950/30 relative min-h-0">
          <ForensicChat 
            tier="pro" 
            githubRepoMetadata={initialState?.repoName ? { owner: initialState.repoName.split('/')[0], repo: initialState.repoName.split('/')[1] } : undefined }
            currentFileContext={{ path: selectedNode?.label || 'Global Architecture', content: 'Node content logic mapping in graph' }}
            onSendMessage={async (prompt, files) => {
              const { interrogateCodebase } = await import('../services/askAIService');
              const result = await interrogateCodebase({
                prompt,
                tier: 'pro',
                githubRepoMetadata: initialState?.repoName ? { owner: initialState.repoName.split('/')[0], repo: initialState.repoName.split('/')[1] } : undefined,
                currentFileContext: files?.[0]
              });
              return result.response;
            }} 
          />
        </div>

        {/* Input Area logic is now handled internally by ForensicChat */}
      </div>
    </div>
  );
};

export default DevStudio;
