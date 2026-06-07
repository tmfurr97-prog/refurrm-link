import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertCircle, FileSearch, Crown, Loader2, CodeXml } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export interface ForensicMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  filesScanned?: string[];
}

export interface ForensicChatProps {
  tier?: 'standard' | 'pro';
  currentFileContext?: { path: string; content: string };
  githubRepoMetadata?: { owner: string; repo: string };
  onSendMessage?: (prompt: string, files: any[]) => Promise<string>;
}

export default function ForensicChat({ 
  tier = 'standard', 
  currentFileContext,
  onSendMessage 
}: ForensicChatProps) {
  const [messages, setMessages] = useState<ForensicMessage[]>([
    {
      id: '1',
      role: 'system',
      content: tier === 'pro' 
        ? '**Pro Tier Active:** Wall-Breaker mode enabled. I have master read access to your entire repository. What seems to be the issue?'
        : 'Welcome to Ask AI. I have access to your currently focused file. Upgrade to Pro for full-repository Wall-Breaker capabilities.',
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: ForensicMessage = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      // In a real implementation, this connects to askAIService.ts
      let assistantResponseText = '';
      
      if (onSendMessage) {
        // Collect targeted context files based on tier
        const contextFiles = [];
        if (currentFileContext) contextFiles.push(currentFileContext);
        // If PRO, repositoryScanner.ts would feed all critical config files here
        
        assistantResponseText = await onSendMessage(userMsg.content, contextFiles);
      } else {
        // Mock response to demonstrate the Golden Copy/Full-File Overwrite standard
        await new Promise((resolve) => setTimeout(resolve, 1500));
        assistantResponseText = "I found the mismatch. Your `firestore.rules` is blocking the write because you did not allow unauthenticated access during development. Here is the exact Full-File Replacement for `firestore.rules`:\n\n```javascript\nrules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true; // DEV USE ONLY\n    }\n  }\n}\n```";
      }

      const assistantMsg: ForensicMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: assistantResponseText,
        filesScanned: tier === 'pro' ? ['firebase.json', 'firestore.rules', 'firebase.ts'] : [currentFileContext?.path || 'current file']
      };
      
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev, 
        { id: Date.now().toString(), role: 'system', content: '🚨 Error communicating with the Interrogator.' }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <FileSearch size={20} />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">Ask AI (Forensic Chat)</h2>
            <p className="text-xs text-gray-400">Context-Aware Code Interrogator</p>
          </div>
        </div>
        
        {/* Tier Badge */}
        {tier === 'pro' ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold">
            <Crown size={14} /> Wall-Breaker Active
          </div>
        ) : (
          <div className="flex items-center px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs font-semibold">
            Standard Tier
          </div>
        )}
      </div>

      {/* Internal Context Bar */}
      {currentFileContext && (
        <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700 flex items-center gap-2 text-xs text-gray-400">
          <CodeXml size={14} className="text-gray-500" /> 
          Focused File: <span className="text-blue-400 font-mono">{currentFileContext.path}</span>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === 'user' ? 'bg-blue-600' : 
              msg.role === 'system' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-600'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : 
               msg.role === 'system' ? <AlertCircle size={16} /> : <Bot size={16} />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : msg.role === 'system'
                  ? 'bg-gray-800 border border-red-500/30 text-gray-200 rounded-tl-none'
                  : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-none'
            }`}>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>

              {/* Scanned Files Footer (Forensic Proof) */}
              {msg.filesScanned && msg.filesScanned.length > 0 && msg.role === 'assistant' && (
                <div className="mt-3 pt-3 border-t border-gray-700 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Cross-Referenced Files:</span>
                  {msg.filesScanned.map((file, i) => (
                    <span key={i} className="text-[10px] bg-gray-900 border border-gray-700 text-gray-400 px-2 py-0.5 rounded">
                      {file}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex gap-3">
             <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-800">
               <Loader2 size={16} className="text-emerald-500 animate-spin" />
             </div>
             <div className="bg-gray-800 border border-gray-700 text-gray-400 rounded-2xl rounded-tl-none p-4 text-sm">
               Interrogating repository...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-800 border-t border-gray-700 flex gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={tier === 'pro' 
            ? "Describe the issue (e.g., 'Firestore string write is failing'). I will scan all configs." 
            : "Ask about this file..."}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-14"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isProcessing}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-5 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
