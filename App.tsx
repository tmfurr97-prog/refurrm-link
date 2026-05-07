/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './components/AuthProvider';
import LoadingState from './components/LoadingState';
import UserMenu from './components/UserMenu';

// Lazy load heavy feature modules for bundle optimization
const Home = lazy(() => import('./components/Home'));
const RepoAnalyzer = lazy(() => import('./components/RepoAnalyzer'));
const ArticleToInfographic = lazy(() => import('./components/ArticleToInfographic'));
const DevStudio = lazy(() => import('./components/DevStudio'));
const LoginPage = lazy(() => import('./components/LoginPage'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 300000 } },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState />;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <nav className="flex justify-between p-4 bg-slate-900 text-white">
            <div className="font-bold">Refurrm Link</div>
            <UserMenu />
          </nav>
          <main className="container mx-auto p-4">
            <Suspense fallback={<LoadingState />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Home />} />
                <Route 
                  path="/analyze" 
                  element={<ProtectedRoute><RepoAnalyzer /></ProtectedRoute>} 
                />
                <Route 
                  path="/studio" 
                  element={<ProtectedRoute><DevStudio /></ProtectedRoute>} 
                />
                <Route 
                  path="/infographic" 
                  element={<ProtectedRoute><ArticleToInfographic /></ProtectedRoute>} 
                />
              </Routes>
            </Suspense>
          </main>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}