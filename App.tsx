
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, COL_USERS } from './firebase';
import { UserProfile, UserRole } from './types';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ApplicationForm from './pages/ApplicationForm';
import LessonList from './pages/LessonList';
import PrivacyConsentPage from './pages/PrivacyConsentPage';

// Components
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, COL_USERS, currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar userProfile={userProfile} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
            
            <Route path="/" element={
              user ? (
                userProfile?.role === UserRole.ADMIN ? <AdminDashboard /> : <Dashboard userProfile={userProfile} />
              ) : <Navigate to="/login" />
            } />

            <Route path="/apply" element={
              user && userProfile?.role === UserRole.USER ? <ApplicationForm userProfile={userProfile} /> : <Navigate to="/" />
            } />

            <Route path="/privacy-consent" element={
              user ? <PrivacyConsentPage /> : <Navigate to="/login" />
            } />

            <Route path="/lessons" element={
              user ? <LessonList userProfile={userProfile} /> : <Navigate to="/login" />
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
