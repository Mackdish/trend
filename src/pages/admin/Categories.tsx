import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(data || []);
  };

  const openNew = () => { setEditing(null); setName(''); setSlug(''); setIcon(''); setSortOrder(0); setDialogOpen(true); };
  const openEdit = (c: any) => { setEditing(c); setName(c.name); setSlug(c.slug); setIcon(c.icon || ''); setSortOrder(c.sort_order || 0); setDialogOpen(true); };

  const save = async () => {
    const s = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = { name, slug: s, icon: icon || null, sort_order: sortOrder };
    if (editing) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editing.id);
      if (error) toast.error(error.message); else { toast.success('Updated'); setDialogOpen(false); load(); }
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) toast.error(error.message); else { toast.success('Created'); setDialogOpen(false); load(); }
    }
  };

  const del = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Categories ({categories.length})</h1>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />Add Category</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Slug</th>
              <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Order</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium text-foreground">{c.icon && <span className="mr-2">{c.icon}</span>}{c.name}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{c.slug}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{c.sort_order}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete?</AlertDialogTitle><AlertDialogDescription>Delete category "{c.name}"?</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => del(c.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Category</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Slug</Label><Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto-generated" /></div>
            <div><Label>Icon (emoji)</Label><Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="👟" /></div>
            <div><Label>Sort Order</Label><Input type="number" value={sortOrder} onChange={e => setSortOrder(+e.target.value)} /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={save}>{editing ? 'Update' : 'Create'}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
