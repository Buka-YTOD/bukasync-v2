import { useState, useEffect } from 'react';
import { Save, Store, Clock, Phone, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

interface RestaurantSettings {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  open_time: string;
  close_time: string;
  open_days: string[];
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, description, address, phone, open_time, close_time, open_days')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSettings(data as RestaurantSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          name: settings.name,
          description: settings.description,
          address: settings.address,
          phone: settings.phone,
          open_time: settings.open_time,
          close_time: settings.close_time,
          open_days: settings.open_days,
        })
        .eq('id', settings.id);

      if (error) throw error;
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      open_days: settings.open_days.includes(day)
        ? settings.open_days.filter(d => d !== day)
        : [...settings.open_days, day],
    });
  };

  const updateField = (field: keyof RestaurantSettings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No restaurant found. Please set up your restaurant first.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground">Manage your restaurant details</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Store className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Restaurant Info</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Restaurant Name</Label>
            <Input id="name" value={settings.name} onChange={e => updateField('name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={settings.description || ''} onChange={e => updateField('description', e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone"><Phone className="w-3 h-3 inline mr-1" />Phone</Label>
              <Input id="phone" value={settings.phone || ''} onChange={e => updateField('phone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address"><MapPin className="w-3 h-3 inline mr-1" />Address</Label>
              <Input id="address" value={settings.address} onChange={e => updateField('address', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Operating Hours</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="open_time">Opening Time</Label>
            <Input id="open_time" type="time" value={settings.open_time} onChange={e => updateField('open_time', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="close_time">Closing Time</Label>
            <Input id="close_time" type="time" value={settings.close_time} onChange={e => updateField('close_time', e.target.value)} />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Open Days</Label>
          <div className="flex flex-wrap gap-3">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="flex items-center gap-2">
                <Switch checked={settings.open_days.includes(day)} onCheckedChange={() => toggleDay(day)} />
                <span className="text-sm capitalize">{day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
