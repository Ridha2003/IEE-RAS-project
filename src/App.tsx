import React from 'react';
    import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
    import Navbar from './components/Navbar';
    import Home from './pages/Home';
    import MemberDashboard from './pages/member/MemberDashboard';
    import MemberWorkshops from './pages/member/MemberWorkshops';
    import AdminDashboard from './pages/admin/AdminDashboard';
    import ManageWorkshops from './pages/admin/ManageWorkshops';
    import ManageMembers from './pages/admin/ManageMembers';
    import ManageRewards from './pages/admin/ManageRewards';
    import SignIn from './pages/SignIn';
    import { AuthProvider, useAuth } from './contexts/AuthContext';

    // Protected route component
    const ProtectedRoute = ({ children, adminOnly = false }) => {
      const { user } = useAuth();

      if (!user) {
        return <Navigate to="/signin" replace />;
      }

      if (adminOnly && user.email !== 'demo@example.com') {
        return <Navigate to="/dashboard" replace />;
      }

      return children;
    };

    function AppRoutes() {
      return (
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignIn />} />

              {/* Member routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MemberDashboard />
                </ProtectedRoute>
              } />
              <Route path="/workshops" element={
                <ProtectedRoute>
                  <MemberWorkshops />
                </ProtectedRoute>
              } />

              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/workshops" element={
                <ProtectedRoute adminOnly>
                  <ManageWorkshops />
                </ProtectedRoute>
              } />
              <Route path="/admin/members" element={
                <ProtectedRoute adminOnly>
                  <ManageMembers />
                </ProtectedRoute>
              } />
              <Route path="/admin/rewards" element={
                <ProtectedRoute adminOnly>
                  <ManageRewards />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      );
    }

    function App() {
      return (
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      );
    }

    export default App;
