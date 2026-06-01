import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Clock, Timer } from 'lucide-react';
import { format } from 'date-fns';

interface Promotion {
  id: string;
  slide_key: string;
  label: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const SLIDE_OPTIONS = [
  { key: 'hot-deals', name: 'Hot Deals Slide' },
  { key: 'new-arrivals', name: 'New Arrivals Slide' },
  { key: 'flash-sale', name: 'Flash Sale Slide' },
];

export default function Promotions() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState({ slide_key: '', label: 'Ends in', ends_at: '' });

  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ['admin-promotions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('promotions').select('*').order('created_at');
      if (error) throw error;
      return data as Promotion[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (values: typeof form & { id?: string }) => {
      if (values.id) {
        const { error } = await supabase.from('promotions').update({
          slide_key: values.slide_key,
          label: values.label,
          ends_at: values.ends_at,
        }).eq('id', values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('promotions').insert({
          slide_key: values.slide_key,
          label: values.label,
          ends_at: values.ends_at,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success(editing ? 'Promotion updated' : 'Promotion created');
      closeDialog();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('promotions').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('promotions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promotion deleted');
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ slide_key: '', label: 'Ends in', ends_at: '' });
    setDialogOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({
      slide_key: p.slide_key,
      label: p.label,
      ends_at: format(new Date(p.ends_at), "yyyy-MM-dd'T'HH:mm"),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slide_key || !form.ends_at) {
      toast.error('Please fill all required fields');
      return;
    }
    upsert.mutate({ ...form, id: editing?.id });
  };

  const slideName = (key: string) => SLIDE_OPTIONS.find((s) => s.key === key)?.name ?? key;

  const isExpired = (endsAt: string) => new Date(endsAt).getTime() < Date.now();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Promotions</h1>
          <p className="text-muted-foreground">Manage hero banner countdown timers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Add Promotion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Promotion' : 'New Promotion'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Hero Slide</Label>
                <select
                  value={form.slide_key}
                  onChange={(e) => setForm({ ...form, slide_key: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select a slide…</option>
                  {SLIDE_OPTIONS.map((s) => (
                    <option key={s.key} value={s.key}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Countdown Label</Label>
                <Input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g. Deal ends in"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>End Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button type="submit" disabled={upsert.isPending}>
                  {upsert.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" /> Active Countdowns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Loading…</p>
          ) : promotions.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No promotions yet. Create one to add a countdown timer to the hero banner.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slide</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Ends At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{slideName(p.slide_key)}</TableCell>
                    <TableCell>{p.label}</TableCell>
                    <TableCell>{format(new Date(p.ends_at), 'PPp')}</TableCell>
                    <TableCell>
                      {isExpired(p.ends_at) ? (
                        <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">Expired</span>
                      ) : (
                        <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                          <Clock className="h-3 w-3" /> Live
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={p.is_active}
                        onCheckedChange={(val) => toggleActive.mutate({ id: p.id, is_active: val })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(p.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
