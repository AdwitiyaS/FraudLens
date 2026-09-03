import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import TransactionHistory from './pages/TransactionHistory';
import Alerts from './pages/Alerts';
import CheckTransaction from './pages/CheckTransaction';
import CaseReview from './pages/CaseReview';
import Analytics from './pages/Analytics';
import ModelStats from './pages/ModelStats';
import UploadDataset from './pages/UploadDataset';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';
import AuditTrail from './pages/AuditTrail';


function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <AuthProvider>
      <div className="min-h-screen">
        {!isAuthPage && <Navbar />}

        {isAuthPage ? (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <main className="ml-0 md:ml-64 pt-14 md:pt-0 p-6 md:p-8 transition-all">
            

            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
              <Route path="/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
              <Route path="/check" element={<ProtectedRoute><CheckTransaction /></ProtectedRoute>} />
              <Route path="/cases" element={<ProtectedRoute><CaseReview /></ProtectedRoute>} />
              <Route path="/audit-trail" element={<ProtectedRoute><AuditTrail /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/model-stats" element={<ProtectedRoute><ModelStats /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><UploadDataset /></ProtectedRoute>} />
            </Routes>
          </main>
        )}
      </div>
    </AuthProvider>
  );
}

export default App;
