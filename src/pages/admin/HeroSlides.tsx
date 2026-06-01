import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';

interface HeroSlide {
  id: string;
  slide_key: string;
  tag: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  sort_order: number;
  is_active: boolean;
}

const emptyForm = {
  slide_key: '',
  tag: '',
  title: '',
  subtitle: '',
  cta_text: 'Shop Now',
  cta_link: '/catalog',
  sort_order: 0,
};

export default function HeroSlides() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ['admin-hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase.from('hero_slides').select('*').order('sort_order');
      if (error) throw error;
      return data as HeroSlide[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
    queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
  };

  const upsert = useMutation({
    mutationFn: async (values: typeof form & { id?: string }) => {
      const payload = {
        slide_key: values.slide_key,
        tag: values.tag,
        title: values.title,
        subtitle: values.subtitle,
        cta_text: values.cta_text,
        cta_link: values.cta_link,
        sort_order: Number(values.sort_order) || 0,
      };
      if (values.id) {
        const { error } = await supabase.from('hero_slides').update(payload).eq('id', values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('hero_slides').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidate();
      toast.success(editing ? 'Slide updated' : 'Slide created');
      closeDialog();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('hero_slides').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Slide deleted');
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (s: HeroSlide) => {
    setEditing(s);
    setForm({
      slide_key: s.slide_key,
      tag: s.tag,
      title: s.title,
      subtitle: s.subtitle,
      cta_text: s.cta_text,
      cta_link: s.cta_link,
      sort_order: s.sort_order,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slide_key || !form.title || !form.subtitle) {
      toast.error('Please fill all required fields');
      return;
    }
    upsert.mutate({ ...form, id: editing?.id });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hero Slides</h1>
          <p className="text-muted-foreground">Customize the homepage hero banner content</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Add Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Slide' : 'New Slide'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Slide Key *</Label>
                  <Input
                    value={form.slide_key}
                    onChange={(e) => setForm({ ...form, slide_key: e.target.value })}
                    placeholder="hot-deals"
                    required
                    disabled={!!editing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tag</Label>
                <Input
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  placeholder="🔥 Hot Deals"
                />
              </div>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle *</Label>
                <Textarea
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>CTA Text</Label>
                  <Input
                    value={form.cta_text}
                    onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                    placeholder="Shop Now"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTA Link</Label>
                  <Input
                    value={form.cta_link}
                    onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
                    placeholder="/catalog"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
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
            <ImageIcon className="h-5 w-5" /> Hero Carousel Slides
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Loading…</p>
          ) : slides.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No hero slides yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>CTA</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slides.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.sort_order}</TableCell>
                    <TableCell className="font-mono text-xs">{s.slide_key}</TableCell>
                    <TableCell>{s.tag}</TableCell>
                    <TableCell className="max-w-[240px] truncate">{s.title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {s.cta_text} → {s.cta_link}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={s.is_active}
                        onCheckedChange={(val) => toggleActive.mutate({ id: s.id, is_active: val })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(s.id)}>
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
