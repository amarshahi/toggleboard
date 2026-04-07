import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, auth, signInWithPopup, googleProvider, signOut } from './firebase';
import { User } from 'firebase/auth';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { Button } from './components/ui/button';
import HomeView from './components/HomeView';
import BoardView from './components/BoardView';
import UserDashboard from './components/UserDashboard';
import Navbar from './components/Navbar';
import { View } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('home');
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Handle initial routing from hash
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#board/')) {
        const boardId = hash.replace('#board/', '');
        setCurrentBoardId(boardId);
        setView('board');
      } else if (hash === '#admin') {
        setView('admin');
      } else {
        setView('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (user.email && !user.email.endsWith('@togglecorp.com')) {
        await signOut(auth);
        toast.error('Access restricted to togglecorp.com accounts only.');
        return;
      }
      
      toast.success('Logged in successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to login');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      setView('home');
      window.location.hash = '';
    } catch (error) {
      console.error(error);
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        setView={setView} 
      />
      
      <main className="container mx-auto px-4 py-8">
        {view === 'home' && (
          <HomeView 
            setView={setView} 
            setCurrentBoardId={setCurrentBoardId} 
            user={user} 
            onLogin={handleLogin} 
          />
        )}
        {view === 'board' && currentBoardId && <BoardView boardId={currentBoardId} user={user} />}
        {view === 'admin' && user && (
          <UserDashboard 
            user={user} 
            setView={setView} 
            setCurrentBoardId={setCurrentBoardId} 
          />
        )}
        {view === 'admin' && !user && (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold mb-4">Sign in with Togglecorp Email</h2>
            <p className="text-slate-600 mb-8 text-lg">Access restricted to @togglecorp.com accounts.</p>
            <Button 
              size="lg"
              onClick={handleLogin}
              className="px-10 py-6 text-lg rounded-full shadow-xl shadow-primary/20"
            >
              Sign in with Google
            </Button>
          </div>
        )}
      </main>
      
      <Toaster position="top-center" />
    </div>
  );
}
