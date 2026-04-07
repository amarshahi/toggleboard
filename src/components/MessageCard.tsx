import React from 'react';
import { Message } from '../types';
import { Card, CardContent } from './ui/card';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Trash2, Edit2 } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';

interface MessageCardProps {
  message: Message;
  isOwner: boolean;
  currentToken?: string;
  onEdit?: () => void;
}

export default function MessageCard({ message, isOwner, currentToken, onEdit }: MessageCardProps) {
  const isAuthor = currentToken && message.authorToken === currentToken;

  const handleDelete = async () => {
    if (!confirm('Delete this message?')) return;
    try {
      await deleteDoc(doc(db, 'boards', message.boardId, 'messages', message.id));
      toast.success('Message deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete message. Only the board owner can delete messages.');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="break-inside-avoid mb-6"
    >
      <Card className={`${message.color || 'bg-white'} shadow-sm hover:shadow-2xl transition-all duration-300 border-slate-100 group relative rounded-2xl overflow-hidden`}>
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
          {isAuthor && onEdit && (
            <button 
              onClick={onEdit}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-400 hover:text-primary shadow-lg hover:scale-110 transition-all"
              title="Edit message"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}
          {isOwner && (
            <button 
              onClick={handleDelete}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-400 hover:text-red-500 shadow-lg hover:scale-110 transition-all"
              title="Delete message"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {message.mediaUrl && (
          <div className="w-full overflow-hidden">
            <img 
              src={message.mediaUrl} 
              alt="Message media" 
              className="w-full h-auto object-cover max-h-[500px] group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        
        <CardContent className="p-8">
          <div className="prose prose-slate max-w-none mb-8 text-slate-800 text-lg leading-relaxed">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
          
          <div className="flex items-center justify-between border-t border-slate-100 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm border-2 border-white shadow-sm">
                {message.authorName.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-slate-900">{message.authorName}</span>
            </div>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-black">
              {message.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
