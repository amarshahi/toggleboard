import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Board, View } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Plus, Trash2, ExternalLink, Calendar, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import CreateBoardDialog from './CreateBoardDialog';
import { motion } from 'motion/react';

interface UserDashboardProps {
  user: any;
  setView: (view: View) => void;
  setCurrentBoardId: (id: string) => void;
}

export default function UserDashboard({ user, setView, setCurrentBoardId }: UserDashboardProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'boards'), 
      where('creatorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Board));
      setBoards(bds);
    });
    return () => unsubscribe();
  }, [user]);

  const handleCreateBoard = async (data: Partial<Board>) => {
    try {
      const docRef = await addDoc(collection(db, 'boards'), {
        ...data,
        creatorId: user.uid,
        creatorEmail: user.email,
        isLocked: false,
        createdAt: Timestamp.now()
      });
      setIsCreateModalOpen(false);
      toast.success('Board created successfully');
      setCurrentBoardId(docRef.id);
      setView('board');
      window.location.hash = `board/${docRef.id}`;
    } catch (error) {
      console.error(error);
      toast.error('Failed to create board');
    }
  };

  const handleDeleteBoard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this board? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'boards', id));
      toast.success('Board deleted');
    } catch (error) {
      toast.error('Failed to delete board');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Togglecorp Dashboard</h1>
          <p className="text-slate-500 text-lg">Welcome back, {user.displayName?.split(' ')[0]}! You have {boards.length} active boards.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="rounded-full h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20">
          <Plus className="w-5 h-5 mr-2" />
          Create New Board
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {boards.map((board) => (
          <motion.div
            key={board.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="group overflow-hidden border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-2xl bg-white h-full flex flex-col">
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className={`h-40 ${board.theme || 'bg-slate-100'} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-6 right-6">
                    <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg">
                      {board.isLocked ? <Lock className="w-5 h-5 text-slate-400" /> : <Unlock className="w-5 h-5 text-green-500" />}
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6">
                    <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                      {board.isLocked ? 'Locked' : 'Public'}
                    </span>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black mb-3 text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{board.title}</h3>
                  <p className="text-slate-500 line-clamp-2 mb-8 text-lg leading-relaxed flex-1">{board.description || 'No description provided.'}</p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Created</span>
                      <span className="text-sm font-bold text-slate-600">{board.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-full h-10 w-10 p-0 hover:bg-red-50 hover:text-red-500 transition-colors"
                        onClick={() => handleDeleteBoard(board.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                      <Button 
                        className="rounded-full h-10 px-6 font-bold shadow-lg shadow-primary/10"
                        onClick={() => {
                          setCurrentBoardId(board.id);
                          setView('board');
                          window.location.hash = `board/${board.id}`;
                        }}
                      >
                        View Board
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {boards.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <h3 className="text-xl font-medium mb-2">No boards yet</h3>
            <p className="text-slate-500 mb-6">Create your first celebration board to get started.</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Create Board
            </Button>
          </div>
        )}
      </div>

      <CreateBoardDialog 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleCreateBoard} 
      />
    </div>
  );
}
