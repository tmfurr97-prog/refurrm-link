/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo } from 'react';
import { useRepoAnalysis } from '../hooks/useRepoAnalysis'; // Abstracted hook
import D3FlowChart from './D3FlowChart';
import LoadingState from './LoadingState';

const RepoAnalyzer: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const { analyze, data, isLoading, error } = useRepoAnalysis();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl) analyze(repoUrl);
  };

  // Heavy transformation logic memoized to prevent UI jank
  const chartData = useMemo(() => {
    if (!data) return null;
    return data.nodes.map(node => ({ ...node, weight: node.connections * 2 }));
  }, [data]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="p-6 border rounded-xl bg-white shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Repository Intelligence</h2>
        <form onSubmit={handleAnalyze} className="space-y-4">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/user/repo"
            className="w-full p-2 border rounded"
          />
          <button 
            disabled={isLoading} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Analyzing Architecture...' : 'Analyze Repo'}
          </button>
        </form>
        
        {error && <p className="mt-4 text-red-500">Error: {error.message}</p>}
      </section>

      <section className="h-[600px] border rounded-xl overflow-hidden bg-slate-50">
        {isLoading ? (
          <LoadingState />
        ) : chartData ? (
          <D3FlowChart data={chartData} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Enter a URL to visualize the codebase structure
          </div>
        )}
      </section>
    </div>
  );
};

export default RepoAnalyzer;