import React, { useState, useEffect, useRef } from 'react';
import { doc, collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Board, Message } from '../types';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Lock, Unlock, Plus, Image as ImageIcon, Gift, Share2, Printer, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import AddMessageDialog from './AddMessageDialog';
import MessageCard from './MessageCard';
import confetti from 'canvas-confetti';
import { getAuthorToken } from '../lib/utils';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface BoardViewProps {
  boardId: string;
  user: any;
}

export default function BoardView({ boardId, user }: BoardViewProps) {
  const [board, setBoard] = useState<Board | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boardUnsubscribe = onSnapshot(doc(db, 'boards', boardId), (docSnap) => {
      if (docSnap.exists()) {
        setBoard({ id: docSnap.id, ...docSnap.data() } as Board);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `boards/${boardId}`);
    });

    const messagesQuery = query(
      collection(db, 'boards', boardId, 'messages'),
      orderBy('createdAt', 'desc')
    );
    const messagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `boards/${boardId}/messages`);
    });

    return () => {
      boardUnsubscribe();
      messagesUnsubscribe();
    };
  }, [boardId]);

  const toggleLock = async () => {
    if (!board || !user || user.uid !== board.creatorId) return;
    try {
      await updateDoc(doc(db, 'boards', boardId), {
        isLocked: !board.isLocked
      });
      toast.success(board.isLocked ? 'Board unlocked' : 'Board locked');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `boards/${boardId}`);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const handleDownloadJSON = () => {
    const data = {
      board,
      messages: messages.map(m => ({
        author: m.authorName,
        content: m.content,
        media: m.mediaUrl,
        date: m.createdAt.toDate().toISOString()
      }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${board.title.replace(/\s+/g, '_')}_messages.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddMessage = async (data: Partial<Message>) => {
    try {
      if (editingMessage) {
        const messageRef = doc(db, 'boards', boardId, 'messages', editingMessage.id);
        await updateDoc(messageRef, {
          ...data,
          updatedAt: Timestamp.now()
        });
        toast.success('Message updated!');
        setEditingMessage(null);
      } else {
        await addDoc(collection(db, 'boards', boardId, 'messages'), {
          ...data,
          boardId,
          createdAt: Timestamp.now()
        });
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success('Message posted!');
      }
      setIsAddModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingMessage ? OperationType.UPDATE : OperationType.CREATE, `boards/${boardId}/messages`);
    }
  };

  const openEditModal = (message: Message) => {
    setEditingMessage(message);
    setIsAddModalOpen(true);
  };

  if (loading) return <div className="text-center py-20">Loading board...</div>;
  if (!board) return <div className="text-center py-20">Board not found.</div>;

  const isOwner = user && user.uid === board.creatorId;
  const currentToken = getAuthorToken();

  return (
    <div className="max-w-7xl mx-auto px-4" ref={boardRef}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 print:hidden">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-5xl font-black tracking-tight text-slate-900">{board.title}</h1>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-bold">
              {board.isLocked ? (
                <><Lock className="w-3 h-3" /> Locked</>
              ) : (
                <><Unlock className="w-3 h-3 text-green-500" /> Active</>
              )}
            </div>
          </div>
          <p className="text-2xl text-slate-500 font-medium leading-relaxed max-w-3xl">{board.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white rounded-full p-1 border border-slate-200 shadow-sm">
            <Button variant="ghost" size="sm" className="rounded-full h-10 px-4 font-bold" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full h-10 px-4 font-bold" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            {isOwner && (
              <Button variant="ghost" size="sm" className="rounded-full h-10 px-4 font-bold" onClick={handleDownloadJSON}>
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
            )}
          </div>

          {isOwner && (
            <Button 
              variant={board.isLocked ? "default" : "outline"} 
              size="lg" 
              className="rounded-full h-12 px-6 font-bold"
              onClick={toggleLock}
            >
              {board.isLocked ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              {board.isLocked ? 'Unlock' : 'Lock'}
            </Button>
          )}
          
          {!board.isLocked && (
            <Button size="lg" className="rounded-full h-12 px-8 text-lg font-bold shadow-xl shadow-primary/20" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Message
            </Button>
          )}
        </div>
      </div>

      <div className="print:block hidden mb-8">
        <h1 className="text-4xl font-bold mb-2">{board.title}</h1>
        <p className="text-xl text-slate-600 mb-8">{board.description}</p>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        <AnimatePresence>
          {messages.map((msg) => (
            <MessageCard 
              key={msg.id} 
              message={msg} 
              isOwner={isOwner} 
              currentToken={currentToken}
              onEdit={() => openEditModal(msg)}
            />
          ))}
        </AnimatePresence>
      </div>

      {messages.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="text-6xl mb-4">💌</div>
          <h3 className="text-xl font-medium mb-2">No messages yet</h3>
          <p className="text-slate-500 mb-6">Be the first to leave a message! No login required.</p>
          {!board.isLocked && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              Add Message
            </Button>
          )}
        </div>
      )}

      <AddMessageDialog 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMessage(null);
        }} 
        onSubmit={handleAddMessage}
        editMessage={editingMessage}
      />

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          body { background: white !important; }
          .container { max-width: 100% !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .columns-1, .sm\\:columns-2, .lg\\:columns-3, .xl\\:columns-4 {
            column-count: 2 !important;
          }
        }
      `}</style>
    </div>
  );
}
