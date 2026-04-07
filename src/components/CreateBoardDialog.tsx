import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface CreateBoardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const THEMES = [
  { name: 'Default', value: 'bg-slate-100' },
  { name: 'Birthday Blue', value: 'bg-blue-100' },
  { name: 'Celebration Pink', value: 'bg-pink-100' },
  { name: 'Success Green', value: 'bg-green-100' },
  { name: 'Sunset Orange', value: 'bg-orange-100' },
  { name: 'Royal Purple', value: 'bg-purple-100' },
];

export default function CreateBoardDialog({ isOpen, onClose, onSubmit }: CreateBoardDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('bg-slate-100');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onSubmit({ title, description, theme });
    setTitle('');
    setDescription('');
    setTheme('bg-slate-100');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-3xl font-black tracking-tight">Create a New Board</DialogTitle>
          <p className="text-slate-500">Set up your celebration in seconds.</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-base font-bold">Board Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. Happy Birthday Sarah! 🎂" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-12 rounded-xl border-slate-200 focus:border-primary text-lg"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="description" className="text-base font-bold">What's the occasion?</Label>
            <Textarea 
              id="description" 
              placeholder="Tell everyone what we're celebrating..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] rounded-xl border-slate-200 focus:border-primary text-lg"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="theme" className="text-base font-bold">Choose a Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {THEMES.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border border-slate-200 ${t.value}`} />
                      <span className="font-medium">{t.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-4 gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full h-12 px-6 font-bold">Cancel</Button>
            <Button type="submit" className="rounded-full h-12 px-8 font-bold shadow-xl shadow-primary/20">Create Board</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
