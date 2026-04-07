import React from 'react';
import { User } from 'firebase/auth';
import { LogIn, LogOut, LayoutDashboard, Home } from 'lucide-react';
import { Button } from './ui/button';
import { View } from '../types';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  setView: (view: View) => void;
}

export default function Navbar({ user, onLogin, onLogout, setView }: NavbarProps) {
  const scrollToSection = (id: string) => {
    setView('home');
    window.location.hash = '';
    setTimeout(() => {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => { setView('home'); window.location.hash = ''; }}
        >
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
            T
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 hidden sm:inline-block">Togglecorp Boards</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          {/* Internal links only if needed */}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button variant="ghost" size="sm" className="font-bold" onClick={() => { setView('admin'); window.location.hash = 'admin'; }}>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center gap-3 ml-2 border-l pl-4 border-slate-100">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  alt={user.displayName || ''} 
                  className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <Button variant="outline" size="sm" className="font-bold rounded-full" onClick={onLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="font-bold" onClick={onLogin}>
                Sign In
              </Button>
              <Button variant="default" size="sm" className="font-bold rounded-full px-6 shadow-lg shadow-primary/20" onClick={onLogin}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
