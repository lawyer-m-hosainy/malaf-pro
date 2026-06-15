import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import React, { lazy } from 'react';
import { AsyncBoundary } from '@/components/AsyncBoundary';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Login = lazy(() => import('@/pages/Login'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const Layout = lazy(() => import('@/components/layout/Layout'));
const Clients = lazy(() => import('@/pages/Clients'));
const Cases = lazy(() => import('@/pages/Cases'));
const CaseDetails = lazy(() => import('@/pages/CaseDetails'));
const Execution = lazy(() => import('@/pages/Execution'));
const Sessions = lazy(() => import('@/pages/Sessions'));
const Administrative = lazy(() => import('@/pages/Administrative'));
const Consultations = lazy(() => import('@/pages/Consultations'));
const Finance = lazy(() => import('@/pages/Finance'));
const Archive = lazy(() => import('@/pages/Archive'));
const Team = lazy(() => import('@/pages/Team'));
const AIDrafting = lazy(() => import('@/pages/AIDrafting'));
const Reports = lazy(() => import('@/pages/Reports'));
const Library = lazy(() => import('@/pages/Library'));
const ClientPortal = lazy(() => import('@/pages/ClientPortal'));
const Settings = lazy(() => import('@/pages/Settings'));
import PrivateRoute from '@/components/PrivateRoute';
import PWAPrompt from '@/components/PWAPrompt';

function App() {
  return (
    <AsyncBoundary>
      {/* @ts-ignore - next-themes ThemeProvider type mismatch with React 18+ */}
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BrowserRouter>
        <PWAPrompt />
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="cases" element={<Cases />} />
            <Route path="cases/:id" element={<CaseDetails />} />
            <Route path="execution" element={<Execution />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="administrative" element={<Administrative />} />
            <Route path="consultations" element={<Consultations />} />
            <Route path="finance" element={<Finance />} />
            <Route path="archive" element={<Archive />} />
            <Route path="reports" element={<Reports />} />
            <Route path="ai-drafting" element={<AIDrafting />} />
            <Route path="library" element={<Library />} />
            <Route path="team" element={<Team />} />
            <Route path="client-portal" element={<ClientPortal />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<div className="p-6 text-muted-foreground flex items-center justify-center min-h-[400px]">هذه الصفحة قيد التطوير...</div>} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-center" richColors />
      </BrowserRouter>
      </ThemeProvider>
    </AsyncBoundary>
  );
}

export default App;
