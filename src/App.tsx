import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import LandingPage from '@/pages/LandingPage';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import Layout from '@/components/layout/Layout';
import Clients from '@/pages/Clients';
import Cases from '@/pages/Cases';
import CaseDetails from '@/pages/CaseDetails';
import Execution from '@/pages/Execution';
import Sessions from '@/pages/Sessions';
import Administrative from '@/pages/Administrative';
import Consultations from '@/pages/Consultations';
import Finance from '@/pages/Finance';
import Archive from '@/pages/Archive';
import Team from '@/pages/Team';
import AIDrafting from '@/pages/AIDrafting';

import Reports from '@/pages/Reports';
import Library from '@/pages/Library';
import ClientPortal from '@/pages/ClientPortal';
import Settings from '@/pages/Settings';
import PrivateRoute from '@/components/PrivateRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import PWAPrompt from '@/components/PWAPrompt';

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
