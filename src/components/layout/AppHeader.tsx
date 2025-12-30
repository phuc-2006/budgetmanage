import { Link, useLocation } from 'react-router-dom';
import { Menu, Wallet, LogOut, LayoutDashboard, List, Settings, HandCoins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { AddTransactionDialog } from '@/components/finance/AddTransactionDialog';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  onSignOut: () => void;
}

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Tất cả giao dịch', url: '/transactions', icon: List },
  { title: 'Khoản nợ', url: '/loans', icon: HandCoins },
  { title: 'Cài đặt', url: '/settings', icon: Settings },
];

export function AppHeader({ onSignOut }: AppHeaderProps) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-1">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {menuItems.map((item) => (
                <DropdownMenuItem key={item.url} asChild>
                  <Link
                    to={item.url}
                    className={cn(
                      "flex items-center gap-3 w-full cursor-pointer",
                      location.pathname === item.url && "bg-secondary"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onSignOut}
                className="flex items-center gap-3 cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold hidden sm:block">Quản lý chi tiêu</h1>
        </div>
        <div className="flex items-center gap-3">
          <AddTransactionDialog />
        </div>
      </div>
    </header>
  );
}
