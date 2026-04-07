import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Board, View } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Plus, ArrowRight, Sparkles, Heart, Users, Zap, CheckCircle2, Star, MessageSquare, Image as ImageIcon, Gift } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeViewProps {
  setView: (view: View) => void;
  setCurrentBoardId: (id: string) => void;
  user: any;
  onLogin: () => void;
}

export default function HomeView({ setView, setCurrentBoardId, user, onLogin }: HomeViewProps) {
  const [recentBoards, setRecentBoards] = useState<Board[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'boards'), orderBy('createdAt', 'desc'), limit(3));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const boards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Board));
      setRecentBoards(boards);
    });
    return () => unsubscribe();
  }, []);

  const handleBoardClick = (id: string) => {
    setCurrentBoardId(id);
    setView('board');
    window.location.hash = `board/${id}`;
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Togglecorp Internal Celebration Board</span>
          </div>
          
          <h1 className="text-6xl sm:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
            Celebrate our <br />
            <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Team Milestones.
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            A simple place for Togglecorp team members to appreciate each other.
            Create a board for birthdays, work anniversaries, or just to say thanks.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Button 
              size="lg" 
              className="rounded-full px-10 h-16 text-xl font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-transform" 
              onClick={() => {
                if (user) {
                  setView('admin');
                  window.location.hash = 'admin';
                } else {
                  onLogin();
                }
              }}
            >
              {user ? 'Go to Dashboard' : 'Sign in with Togglecorp Email'}
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </div>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex items-center justify-between mb-16">
          <div>
            <h2 className="text-5xl font-black tracking-tight mb-4">Active Boards</h2>
            <p className="text-xl text-slate-500 font-medium">Recent celebrations across the team.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {recentBoards.map((board, index) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-slate-100 overflow-hidden rounded-2xl bg-white h-full flex flex-col"
                onClick={() => handleBoardClick(board.id)}
              >
                <div className={`h-48 w-full ${board.theme || 'bg-primary/10'} flex items-center justify-center relative overflow-hidden`}>
                  <div className="text-7xl group-hover:scale-125 transition-transform duration-700 z-10">🎉</div>
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <CardHeader className="p-8 flex-1">
                  <CardTitle className="text-2xl font-black group-hover:text-primary transition-colors mb-3 line-clamp-1">{board.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-lg leading-relaxed text-slate-500 font-medium">{board.description || 'A celebration board for a team member.'}</CardDescription>
                </CardHeader>
                <CardFooter className="px-8 pb-8 pt-0 flex justify-between items-center text-sm text-slate-400 font-black uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Team Board</span>
                  </div>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform text-primary" />
                </CardFooter>
              </Card>
            </motion.div>
          ))}
          
          {recentBoards.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-100">
              <p className="text-slate-400 text-lg">No active boards yet. Be the first to create one!</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 pt-20 border-t border-slate-100 text-slate-500">
        <div className="flex flex-col sm:flex-row justify-between items-center py-8 gap-4">
          <div className="flex items-center gap-2 text-2xl font-black text-slate-900">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-xl">T</div>
            Togglecorp Boards
          </div>
          <p>© 2026 Togglecorp. Internal Use Only.</p>
        </div>
      </footer>
    </div>
  );
}
