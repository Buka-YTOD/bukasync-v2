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
  checkingSession?: boolean;
  existingSession?: { id: string; code: string } | null;
  isStaleSession?: boolean;
  onCreateSession: (name: string) => void;
  onJoinSession: (code: string, name: string) => void;
  onJoinExistingSession: (name: string) => void;
  onReplaceStaleSession: (name: string) => void;
}

export function JoinSessionModal({
  isOpen,
  tableNumber,
  restaurantName,
  isLoading = false,
  checkingSession = false,
  existingSession = null,
  isStaleSession = false,
  onCreateSession,
  onJoinSession,
  onJoinExistingSession,
  onReplaceStaleSession,
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

  const handleJoinExisting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateName()) return;
    onJoinExistingSession(name.trim());
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

  // Show loading while checking for existing session
  if (checkingSession) {
    return (
      <Dialog open={isOpen}>
        <DialogContent className="sm:max-w-md" hideCloseButton>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Checking table session...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If there's an existing STALE session, ask if user is part of it
  if (existingSession && isStaleSession) {
    return (
      <Dialog open={isOpen}>
        <DialogContent className="sm:max-w-md" hideCloseButton>
          <DialogHeader className="text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mb-4 w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center"
            >
              <Users className="w-8 h-8 text-accent-foreground" />
            </motion.div>
            <DialogTitle className="font-display text-2xl text-center">
              Table {tableNumber}
            </DialogTitle>
          </DialogHeader>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <p className="text-muted-foreground text-sm text-center">
              There's a previous session at this table that's been inactive. Are you part of that group?
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
              {error && (
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
              type="button"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={!name.trim() || isLoading}
              onClick={(e) => { e.preventDefault(); if (validateName()) onJoinExistingSession(name.trim()); }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Yes, rejoin the session
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="xl"
              className="w-full"
              disabled={!name.trim() || isLoading}
              onClick={(e) => { e.preventDefault(); if (validateName()) onReplaceStaleSession(name.trim()); }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  No, start a new session
                </>
              )}
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  // If there's an existing session (not stale), show smart join UI
  if (existingSession) {
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
              <Users className="w-8 h-8 text-primary" />
            </motion.div>
            <DialogTitle className="font-display text-2xl text-center">
              Join Your Table
            </DialogTitle>
          </DialogHeader>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Table {tableNumber}</span>
              </div>
              <p className="text-muted-foreground text-sm">
                There's already an active session at this table. Enter your name to join!
              </p>
            </div>

            <form onSubmit={handleJoinExisting} className="space-y-4">
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
                {error && (
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
                    Joining...
                  </>
                ) : (
                  <>
                    Join Table Session
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg text-sm text-muted-foreground">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <p>
                <strong className="text-foreground">Real-time sync:</strong> See what others add to the cart instantly!
              </p>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

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