import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Search, Package, Upload, X, Loader2, FileUp, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

const emptyProduct = {
  name: '', brand: '', slug: '', price: 0, original_price: 0, discount: 0,
  description: '', gender: 'unisex', sizes: [] as number[], colors: [] as { name: string; hex: string }[],
  images: [] as string[], in_stock: true, stock_quantity: 100, is_featured: false, is_flash_deal: false, is_new: false,
  category_id: null as string | null,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [sizesInput, setSizesInput] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [csvImporting, setCsvImporting] = useState(false);

  useEffect(() => { load(); loadCategories(); }, []);

  const load = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
  };

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(data || []);
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyProduct);
    setSizesInput('');
    setColorsInput('');
    setImageUrls([]);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, brand: p.brand, slug: p.slug, price: p.price, original_price: p.original_price || 0,
      discount: p.discount || 0, description: p.description || '', gender: p.gender || 'unisex',
      sizes: (p.sizes || []) as number[], colors: (p.colors || []) as { name: string; hex: string }[],
      images: (p.images || []) as string[], in_stock: p.in_stock ?? true, stock_quantity: p.stock_quantity || 0,
      is_featured: p.is_featured ?? false, is_flash_deal: p.is_flash_deal ?? false, is_new: p.is_new ?? false,
      category_id: p.category_id,
    });
    setSizesInput((p.sizes || []).join(', '));
    setColorsInput(((p.colors || []) as any[]).map((c: any) => `${c.name}:${c.hex}`).join(', '));
    setImageUrls((p.images || []) as string[]);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const newUrls: string[] = [];
    
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(fileName, file);
      if (error) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
        continue;
      }
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      newUrls.push(urlData.publicUrl);
    }
    
    setImageUrls(prev => [...prev, ...newUrls]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (newUrls.length > 0) toast.success(`${newUrls.length} image(s) uploaded`);
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!form.name || !form.brand || !form.price) {
      toast.error('Name, brand, and price are required');
      return;
    }
    setLoading(true);
    const sizes = sizesInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const colors = colorsInput.split(',').map(c => {
      const [name, hex] = c.trim().split(':');
      return name && hex ? { name: name.trim(), hex: hex.trim() } : null;
    }).filter(Boolean);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const payload = {
      name: form.name, brand: form.brand, slug, price: form.price,
      original_price: form.original_price || null, discount: form.discount || 0,
      description: form.description || null, gender: form.gender || null,
      sizes, colors, images: imageUrls, in_stock: form.in_stock, stock_quantity: form.stock_quantity,
      is_featured: form.is_featured, is_flash_deal: form.is_flash_deal, is_new: form.is_new,
      category_id: form.category_id || null,
    };

    if (editing) {
      const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
      if (error) toast.error(error.message); else { toast.success('Product updated'); setDialogOpen(false); load(); }
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) toast.error(error.message); else { toast.success('Product created'); setDialogOpen(false); load(); }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Product deleted'); load(); }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    return lines.slice(1).map(line => {
      const vals: string[] = [];
      let current = '';
      let inQuotes = false;
      for (const ch of line) {
        if (ch === '"') { inQuotes = !inQuotes; }
        else if (ch === ',' && !inQuotes) { vals.push(current.trim()); current = ''; }
        else { current += ch; }
      }
      vals.push(current.trim());
      const obj: any = {};
      headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
      return obj;
    });
  };

  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target?.result as string);
      if (rows.length === 0) { toast.error('No valid rows found in CSV'); return; }
      setCsvRows(rows);
      setCsvDialogOpen(true);
    };
    reader.readAsText(file);
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const handleCsvImport = async () => {
    setCsvImporting(true);
    let success = 0;
    let failed = 0;
    for (const row of csvRows) {
      const name = row.name || '';
      const brand = row.brand || '';
      const price = parseFloat(row.price);
      if (!name || !brand || isNaN(price)) { failed++; continue; }
      const slug = (row.slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const sizes = row.sizes ? row.sizes.split(';').map((s: string) => parseInt(s.trim())).filter((n: number) => !isNaN(n)) : [];
      const colors = row.colors ? row.colors.split(';').map((c: string) => {
        const [n, h] = c.trim().split(':');
        return n && h ? { name: n.trim(), hex: h.trim() } : null;
      }).filter(Boolean) : [];
      const images = row.images ? row.images.split(';').map((s: string) => s.trim()).filter(Boolean) : [];

      const payload = {
        name, brand, slug, price,
        original_price: parseFloat(row.original_price) || null,
        discount: parseInt(row.discount) || 0,
        description: row.description || null,
        gender: row.gender || null,
        sizes, colors, images,
        in_stock: row.in_stock !== 'false',
        stock_quantity: parseInt(row.stock_quantity) || 0,
        is_featured: row.is_featured === 'true',
        is_flash_deal: row.is_flash_deal === 'true',
        is_new: row.is_new === 'true',
        category_id: row.category_id || null,
      };
      const { error } = await supabase.from('products').insert(payload);
      if (error) failed++; else success++;
    }
    setCsvImporting(false);
    setCsvDialogOpen(false);
    setCsvRows([]);
    toast.success(`Imported ${success} products${failed > 0 ? `, ${failed} failed` : ''}`);
    load();
  };

  const downloadTemplate = () => {
    const headers = 'name,brand,price,original_price,discount,description,gender,sizes,colors,images,in_stock,stock_quantity,is_featured,is_flash_deal,is_new';
    const example = 'Nike Air Max 90,Nike,12500,15000,17,Classic sneaker,men,38;39;40;41;42,Black:#000000;White:#FFFFFF,https://example.com/img.jpg,true,50,false,false,true';
    const blob = new Blob([headers + '\n' + example], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'products_template.csv';
    a.click();
  };

  const exportProducts = () => {
    if (products.length === 0) { toast.error('No products to export'); return; }
    const headers = 'name,brand,price,original_price,discount,description,gender,sizes,colors,images,in_stock,stock_quantity,is_featured,is_flash_deal,is_new,category_id';
    const escape = (v: string) => v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v;
    const rows = products.map(p => [
      escape(p.name), escape(p.brand), p.price, p.original_price || '', p.discount || 0,
      escape(p.description || ''), p.gender || '',
      (p.sizes as number[] || []).join(';'),
      ((p.colors || []) as any[]).map((c: any) => `${c.name}:${c.hex}`).join(';'),
      (p.images || []).join(';'),
      p.in_stock ?? true, p.stock_quantity || 0,
      p.is_featured ?? false, p.is_flash_deal ?? false, p.is_new ?? false,
      p.category_id || ''
    ].join(','));
    const blob = new Blob([headers + '\n' + rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `products_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    toast.success(`Exported ${products.length} products`);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Products ({products.length})</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportProducts}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
          <Button variant="outline" onClick={downloadTemplate}><FileUp className="w-4 h-4 mr-2" />CSV Template</Button>
          <Button variant="outline" onClick={() => csvInputRef.current?.click()}><FileUp className="w-4 h-4 mr-2" />Import CSV</Button>
          <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />Add Product</Button>
        </div>
        <input ref={csvInputRef} type="file" accept=".csv" onChange={handleCsvFile} className="hidden" />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Price</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Stock</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Status</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                          {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-foreground">KES {Number(p.price).toLocaleString()}</p>
                      {p.original_price && <p className="text-xs text-muted-foreground line-through">KES {Number(p.original_price).toLocaleString()}</p>}
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${(p.stock_quantity || 0) < 10 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {p.stock_quantity || 0} in stock
                      </span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {p.is_featured && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">Featured</span>}
                        {p.is_new && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">New</span>}
                        {p.is_flash_deal && <span className="text-xs px-1.5 py-0.5 rounded bg-orange-50 text-orange-700">Flash</span>}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete "{p.name}".</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Brand *</Label><Input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></div>
            </div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from name" /></div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><Label>Price (KES) *</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} /></div>
              <div><Label>Original Price</Label><Input type="number" value={form.original_price} onChange={e => setForm({ ...form, original_price: +e.target.value })} /></div>
              <div><Label>Discount %</Label><Input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: +e.target.value })} /></div>
            </div>
            <div><Label>Description</Label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Gender</Label>
                <Select value={form.gender || ''} onValueChange={v => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category_id || ''} onValueChange={v => setForm({ ...form, category_id: v || null })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Stock Quantity</Label><Input type="number" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: +e.target.value })} /></div>
              <div><Label>Sizes (comma-separated)</Label><Input value={sizesInput} onChange={e => setSizesInput(e.target.value)} placeholder="38, 39, 40, 41, 42, 43" /></div>
            </div>
            <div><Label>Colors (name:hex, comma-separated)</Label><Input value={colorsInput} onChange={e => setColorsInput(e.target.value)} placeholder="Black:#000000, White:#FFFFFF" /></div>
            
            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label>Product Images</Label>
              <div className="flex flex-wrap gap-3">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg border overflow-hidden group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  <span className="text-[10px]">{uploading ? 'Uploading' : 'Upload'}</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.in_stock} onCheckedChange={v => setForm({ ...form, in_stock: v })} /><Label>In Stock</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={v => setForm({ ...form, is_featured: v })} /><Label>Featured</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_new} onCheckedChange={v => setForm({ ...form, is_new: v })} /><Label>New</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_flash_deal} onCheckedChange={v => setForm({ ...form, is_flash_deal: v })} /><Label>Flash Deal</Label></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Products from CSV ({csvRows.length} rows)</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Preview of products to import. Required fields: <strong>name</strong>, <strong>brand</strong>, <strong>price</strong>. Use semicolons (;) to separate multiple sizes, colors, and images within a field.
          </p>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left font-medium text-muted-foreground">#</th>
                  <th className="p-2 text-left font-medium text-muted-foreground">Name</th>
                  <th className="p-2 text-left font-medium text-muted-foreground">Brand</th>
                  <th className="p-2 text-left font-medium text-muted-foreground">Price</th>
                  <th className="p-2 text-left font-medium text-muted-foreground">Gender</th>
                  <th className="p-2 text-left font-medium text-muted-foreground">Stock</th>
                </tr>
              </thead>
              <tbody>
                {csvRows.slice(0, 50).map((row, i) => {
                  const valid = row.name && row.brand && !isNaN(parseFloat(row.price));
                  return (
                    <tr key={i} className={`border-b ${!valid ? 'bg-destructive/10' : ''}`}>
                      <td className="p-2 text-muted-foreground">{i + 1}</td>
                      <td className="p-2 font-medium">{row.name || <span className="text-destructive">Missing</span>}</td>
                      <td className="p-2">{row.brand || <span className="text-destructive">Missing</span>}</td>
                      <td className="p-2">{row.price || <span className="text-destructive">Missing</span>}</td>
                      <td className="p-2">{row.gender || '—'}</td>
                      <td className="p-2">{row.stock_quantity || '0'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {csvRows.length > 50 && <p className="text-xs text-muted-foreground">Showing first 50 of {csvRows.length} rows</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { setCsvDialogOpen(false); setCsvRows([]); }}>Cancel</Button>
            <Button onClick={handleCsvImport} disabled={csvImporting}>
              {csvImporting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Importing...</> : `Import ${csvRows.length} Products`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
