import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download, Users, Copy, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ActiveSession {
  id: string;
  tableNumber: number;
  sessionCode: string;
  memberCount: number;
  createdAt: Date;
}

export function TablesPanel() {
  const [tables, setTables] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [newTableNumber, setNewTableNumber] = useState('');
  
  // Get base URL for QR codes
  const baseUrl = window.location.origin;

  const fetchActiveSessions = async () => {
    try {
      const { data: sessions } = await supabase
        .from('dining_sessions')
        .select('id, table_number, session_code, created_at')
        .eq('status', 'active');

      if (sessions) {
        // Get member counts for each session
        const sessionsWithCounts = await Promise.all(
          sessions.map(async (session) => {
            const { count } = await supabase
              .from('session_members')
              .select('*', { count: 'exact', head: true })
              .eq('session_id', session.id);

            return {
              id: session.id,
              tableNumber: session.table_number,
              sessionCode: session.session_code,
              memberCount: count || 0,
              createdAt: new Date(session.created_at),
            };
          })
        );

        setActiveSessions(sessionsWithCounts);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  useEffect(() => {
    fetchActiveSessions();

    // Subscribe to session changes
    const channel = supabase
      .channel('sessions-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dining_sessions',
        },
        () => {
          fetchActiveSessions();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_members',
        },
        () => {
          fetchActiveSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getTableUrl = (tableNumber: number) => {
    return `${baseUrl}/menu?table=${tableNumber}`;
  };

  const getSessionForTable = (tableNumber: number) => {
    return activeSessions.find((s) => s.tableNumber === tableNumber);
  };

  const downloadQRCode = (tableNumber: number) => {
    const svg = document.getElementById(`qr-${tableNumber}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx?.fillRect(0, 0, 400, 400);
      ctx!.fillStyle = 'white';
      ctx?.fillRect(0, 0, 400, 400);
      ctx?.drawImage(img, 0, 0, 400, 400);

      const link = document.createElement('a');
      link.download = `table-${tableNumber}-qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const copyTableUrl = (tableNumber: number) => {
    navigator.clipboard.writeText(getTableUrl(tableNumber));
    toast.success('URL copied!', { description: `Table ${tableNumber} link copied` });
  };

  const addTable = () => {
    const num = parseInt(newTableNumber);
    if (num && !tables.includes(num)) {
      setTables((prev) => [...prev, num].sort((a, b) => a - b));
      setNewTableNumber('');
      toast.success(`Table ${num} added`);
    }
  };

  const removeTable = (tableNumber: number) => {
    setTables((prev) => prev.filter((t) => t !== tableNumber));
    toast.success(`Table ${tableNumber} removed`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Tables & QR Codes
          </h2>
          <p className="text-muted-foreground">
            Generate QR codes for each table. Guests scan to join ordering session.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Table #"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            className="w-24"
          />
          <Button onClick={addTable} disabled={!newTableNumber}>
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {tables.map((tableNumber) => {
          const session = getSessionForTable(tableNumber);
          
          return (
            <motion.div
              key={tableNumber}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-4 shadow-soft"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold">Table {tableNumber}</span>
                  {session && (
                    <Badge variant="secondary" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      {session.memberCount}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeTable(tableNumber)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {session && (
                <div className="mb-3 p-2 bg-success/10 rounded-lg">
                  <p className="text-xs text-success font-medium">Active Session</p>
                  <p className="font-mono text-sm font-bold text-success">{session.sessionCode}</p>
                </div>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedTable(tableNumber)}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    View QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">
                      Table {tableNumber} QR Code
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-white rounded-xl">
                      <QRCodeSVG
                        id={`qr-${tableNumber}`}
                        value={getTableUrl(tableNumber)}
                        size={250}
                        level="H"
                        includeMargin
                      />
                    </div>
                    
                    <div className="w-full p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">URL:</p>
                      <p className="font-mono text-sm break-all">{getTableUrl(tableNumber)}</p>
                    </div>

                    <div className="flex gap-2 w-full">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => copyTableUrl(tableNumber)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy URL
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => downloadQRCode(tableNumber)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => window.open(getTableUrl(tableNumber), '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          );
        })}
      </div>

      <div className="p-4 bg-muted/50 rounded-xl">
        <h3 className="font-semibold mb-2">How it works</h3>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Print or display the QR code at each table</li>
          <li>Guests scan with their phone camera</li>
          <li>They enter their name and start/join a session</li>
          <li>Orders appear in your Live Orders dashboard in real-time</li>
        </ol>
      </div>
    </div>
  );
}
