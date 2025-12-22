import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function DashboardHeader() {
  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="font-display text-xl font-semibold text-foreground">
          Mama's Kitchen
        </h1>
        <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full font-medium">
          Open
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="w-64 pl-9 bg-muted/50"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </Button>

        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground font-medium">
            MK
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
