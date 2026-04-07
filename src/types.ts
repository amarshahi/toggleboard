import { Timestamp } from 'firebase/firestore';

export interface Board {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  creatorEmail?: string;
  isLocked: boolean;
  createdAt: Timestamp;
  theme?: string;
}

export interface Message {
  id: string;
  boardId: string;
  authorName: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'gif';
  createdAt: Timestamp;
  color?: string;
  authorToken?: string;
}

export type View = 'home' | 'board' | 'admin';
