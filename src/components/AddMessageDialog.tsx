import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Image as ImageIcon, Gift, Type, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthorToken } from '../lib/utils';
import { Message } from '../types';

interface AddMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editMessage?: Message | null;
}

const CARD_COLORS = [
  'bg-white',
  'bg-yellow-50',
  'bg-blue-50',
  'bg-pink-50',
  'bg-green-50',
  'bg-purple-50',
  'bg-orange-50',
];

export default function AddMessageDialog({ isOpen, onClose, onSubmit, editMessage }: AddMessageDialogProps) {
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'gif'>('image');
  const [color, setColor] = useState('bg-white');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editMessage) {
      setAuthorName(editMessage.authorName);
      setContent(editMessage.content);
      setMediaUrl(editMessage.mediaUrl || '');
      setMediaType(editMessage.mediaType || 'image');
      setColor(editMessage.color || 'bg-white');
    } else {
      setAuthorName('');
      setContent('');
      setMediaUrl('');
      setMediaType('image');
      setColor('bg-white');
    }
  }, [editMessage, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 800KB to stay within Firestore 1MB document limit
    if (file.size > 800 * 1024) {
      toast.error('Image is too large. Please select an image under 800KB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaUrl(reader.result as string);
      setMediaType('image');
      setIsUploading(false);
      toast.success('Image uploaded successfully');
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const clearMedia = () => {
    setMediaUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!content.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    const authorToken = getAuthorToken();
    onSubmit({ 
      authorName: authorName.trim(), 
      content: content.trim(), 
      mediaUrl, 
      mediaType, 
      color,
      authorToken
    });
    
    if (!editMessage) {
      setAuthorName('');
      setContent('');
      setMediaUrl('');
      setColor('bg-white');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-2xl p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-3xl font-black tracking-tight">
            {editMessage ? 'Edit Message' : 'Add a Message'}
          </DialogTitle>
          <p className="text-slate-500">
            {editMessage ? 'Update your celebration message.' : 'No login required to post a message.'}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="author" className="flex items-center gap-1 text-base font-bold">
              Your Name <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="author" 
              placeholder="Enter your full name" 
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
              className="h-12 rounded-xl border-slate-200 focus:border-primary text-lg"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="content" className="flex items-center gap-1 text-base font-bold">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea 
              id="content" 
              placeholder="Write something nice..." 
              className="min-h-[120px] rounded-xl border-slate-200 focus:border-primary text-lg"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-bold">Add Media (Optional)</Label>
            
            {mediaUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 p-4">
                <img 
                  src={mediaUrl} 
                  alt="Preview" 
                  className="max-h-48 mx-auto rounded-xl object-contain shadow-sm"
                />
                <button
                  type="button"
                  onClick={clearMedia}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-slate-50 text-slate-600 transition-transform hover:scale-110"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Tabs defaultValue={mediaType} onValueChange={(v) => setMediaType(v as any)}>
                <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-slate-100 rounded-xl">
                  <TabsTrigger value="upload" className="rounded-lg font-bold">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="image" className="rounded-lg font-bold">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="gif" className="rounded-lg font-bold">
                    <Gift className="w-4 h-4 mr-2" />
                    GIF
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all hover:border-primary/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                          <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <p className="mb-2 text-sm text-slate-600">
                          <span className="font-bold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-400">PNG, JPG or GIF (MAX. 800KB)</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </TabsContent>
                <TabsContent value="image" className="mt-4">
                  <Input 
                    placeholder="https://example.com/image.jpg" 
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="h-12 rounded-xl border-slate-200"
                  />
                </TabsContent>
                <TabsContent value="gif" className="mt-4">
                  <Input 
                    placeholder="https://media.giphy.com/..." 
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="h-12 rounded-xl border-slate-200"
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-base font-bold">Card Color</Label>
            <div className="flex flex-wrap gap-3">
              {CARD_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm ${c} ${color === c ? 'border-primary scale-110 ring-4 ring-primary/10' : 'border-white'}`}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4 gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full h-12 px-6 font-bold">Cancel</Button>
            <Button type="submit" className="rounded-full h-12 px-10 font-bold shadow-xl shadow-primary/20">
              {editMessage ? 'Update Message' : 'Post Message'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
