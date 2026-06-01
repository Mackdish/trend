import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from('product_reviews').select('*, products(name)').order('created_at', { ascending: false });
    setReviews(data || []);
  };

  const del = async (id: string) => {
    const { error } = await supabase.from('product_reviews').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); load(); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Reviews ({reviews.length})</h1>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Rating</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Comment</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium text-foreground">{r.products?.name || '-'}</td>
                    <td className="p-3"><div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-star text-star' : 'text-muted'}`} />)}</div></td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell max-w-xs truncate">{r.comment || '-'}</td>
                    <td className="p-3 text-muted-foreground hidden lg:table-cell">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Delete review?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => del(r.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No reviews yet</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
