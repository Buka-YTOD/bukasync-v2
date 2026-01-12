import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Utensils, ArrowRight, UserPlus, Hash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface JoinSessionModalProps {
  isOpen: boolean;
  tableNumber: number;
  restaurantName: string;
  isLoading?: boolean;
  onCreateSession: (name: string) => void;
  onJoinSession: (code: string, name: string) => void;
}

export function JoinSessionModal({
  isOpen,
  tableNumber,
  restaurantName,
  isLoading = false,
  onCreateSession,
  onJoinSession,
}: JoinSessionModalProps) {
  const [name, setName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'start' | 'join'>('start');

  const validateName = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }
    return true;
  };

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateName()) return;
    onCreateSession(name.trim());
  };

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateName()) return;
    
    if (!sessionCode.trim()) {
      setError('Please enter the session code');
      return;
    }
    
    if (sessionCode.trim().length !== 6) {
      setError('Session code must be 6 characters');
      return;
    }

    onJoinSession(sessionCode.trim().toUpperCase(), name.trim());
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
          >
            <Utensils className="w-8 h-8 text-primary" />
          </motion.div>
          <DialogTitle className="font-display text-2xl text-center">
            Welcome to {restaurantName}
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Table {tableNumber}</span>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'start' | 'join'); setError(''); }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="start" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Start New
              </TabsTrigger>
              <TabsTrigger value="join" className="gap-2">
                <Hash className="w-4 h-4" />
                Join Session
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="start" className="mt-4">
                <motion.form
                  key="start"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleStartSession}
                  className="space-y-4"
                >
                  <p className="text-muted-foreground text-sm text-center">
                    Start a new group session. Share the code with friends at your table!
                  </p>
                  
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Enter your name..."
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError('');
                      }}
                      className="text-center text-lg h-12"
                      autoFocus
                      maxLength={20}
                      disabled={isLoading}
                    />
                    {error && activeTab === 'start' && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-destructive text-sm text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="xl"
                    className="w-full"
                    disabled={!name.trim() || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Start Session
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.form>
              </TabsContent>

              <TabsContent value="join" className="mt-4">
                <motion.form
                  key="join"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleJoinSession}
                  className="space-y-4"
                >
                  <p className="text-muted-foreground text-sm text-center">
                    Have a code from someone at your table? Join their session!
                  </p>
                  
                  <div className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Enter your name..."
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError('');
                      }}
                      className="text-center text-lg h-12"
                      maxLength={20}
                      disabled={isLoading}
                    />
                    
                    <Input
                      type="text"
                      placeholder="Session code (e.g., ABC123)"
                      value={sessionCode}
                      onChange={(e) => {
                        setSessionCode(e.target.value.toUpperCase());
                        setError('');
                      }}
                      className="text-center text-lg h-12 font-mono tracking-widest"
                      maxLength={6}
                      disabled={isLoading}
                    />
                    
                    {error && activeTab === 'join' && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-destructive text-sm text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="xl"
                    className="w-full"
                    disabled={!name.trim() || !sessionCode.trim() || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        Join Session
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.form>
              </TabsContent>
            </AnimatePresence>
          </Tabs>

          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg text-sm text-muted-foreground">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p>
              <strong className="text-foreground">Real-time sync:</strong> See what others add to the cart instantly across all devices!
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
