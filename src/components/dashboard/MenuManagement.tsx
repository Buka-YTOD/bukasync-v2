import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DbMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
  allergens: string[] | null;
  sort_order: number | null;
}

const CATEGORIES = ['Starters', 'Mains', 'Sides', 'Drinks'];

const emptyItem = {
  name: '',
  description: '',
  price: 0,
  category: 'Mains',
  image_url: '',
  allergens: [] as string[],
};

export function MenuManagement() {
  const [items, setItems] = useState<DbMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<typeof emptyItem & { id?: string }>(emptyItem);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('dine_in_menu_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching menu items:', error);
    } else {
      setItems(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
    const channel = supabase
      .channel('menu-mgmt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dine_in_menu_items' }, () => fetchItems())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleAvailability = async (item: DbMenuItem) => {
    const { error } = await supabase
      .from('dine_in_menu_items')
      .update({ is_available: !item.is_available })
      .eq('id', item.id);
    if (error) {
      toast.error('Failed to update availability');
    } else {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
    }
  };

  const handleSave = async () => {
    if (!editingItem.name.trim() || editingItem.price <= 0) {
      toast.error('Name and price are required');
      return;
    }
    setIsSaving(true);
    const payload = {
      name: editingItem.name,
      description: editingItem.description || null,
      price: editingItem.price,
      category: editingItem.category,
      image_url: editingItem.image_url || null,
      allergens: editingItem.allergens,
    };

    if (editingItem.id) {
      const { error } = await supabase.from('dine_in_menu_items').update(payload).eq('id', editingItem.id);
      if (error) toast.error('Failed to update item');
      else toast.success('Item updated!');
    } else {
      const { error } = await supabase.from('dine_in_menu_items').insert(payload);
      if (error) toast.error('Failed to add item');
      else toast.success('Item added!');
    }
    setIsSaving(false);
    setShowDialog(false);
    setEditingItem(emptyItem);
  };

  const handleDelete = async () => {
    if (!deleteItemId) return;
    const { error } = await supabase.from('dine_in_menu_items').delete().eq('id', deleteItemId);
    if (error) toast.error('Failed to delete item');
    else toast.success('Item deleted');
    setDeleteItemId(null);
  };

  const openEdit = (item: DbMenuItem) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      image_url: item.image_url || '',
      allergens: item.allergens || [],
    });
    setShowDialog(true);
  };

  const openAdd = () => {
    setEditingItem(emptyItem);
    setShowDialog(true);
  };

  const filteredItems = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Menu Management</h2>
          <p className="text-muted-foreground">{items.length} items in your menu</p>
        </div>
        <Button variant="hero" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['All', ...CATEGORIES].map(cat => (
          <Button key={cat} variant={activeCategory === cat ? 'default' : 'outline'} size="sm" onClick={() => setActiveCategory(cat)}>
            {cat}
          </Button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Item</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Category</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Price</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredItems.map(item => (
              <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4"><Badge variant="secondary">{item.category}</Badge></td>
                <td className="px-6 py-4 font-semibold text-foreground">{formatPrice(item.price)}</td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleAvailability(item)} className={`flex items-center gap-2 text-sm font-medium ${item.is_available ? 'text-success' : 'text-muted-foreground'}`}>
                    {item.is_available ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteItemId(item.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {filteredItems.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No items found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem.id ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={editingItem.description} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₦)</Label>
                <Input type="number" value={editingItem.price} onChange={e => setEditingItem({ ...editingItem, price: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editingItem.category} onValueChange={v => setEditingItem({ ...editingItem, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image URL (optional)</Label>
              <Input value={editingItem.image_url} onChange={e => setEditingItem({ ...editingItem, image_url: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {editingItem.id ? 'Update' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
