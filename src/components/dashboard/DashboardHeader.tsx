import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProfileDropdown } from './ProfileDropdown';
import { NotificationsDropdown } from './NotificationsDropdown';

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

        <NotificationsDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
}
