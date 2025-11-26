'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Clapperboard, Layers, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../app/context/AuthContext'; // Import useAuth
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { useState } from 'react';
import AuthForm from './AuthForm';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const routes = [
    {
      href: '/',
      label: 'Home',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      href: '/users',
      label: 'Users',
      icon: Users,
      active: pathname === '/users',
    },
      {
      href: '/categories',
      label: 'Genere',
      icon: Layers,
      active: pathname === '/categories',
    },
    {
      href: '/media-assets',
      label: 'Items',
      icon: Clapperboard,
      active: pathname === '/media-assets',
    }
  
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="border-b bg-white dark:bg-slate-950 sticky top-0 z-10">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8 w-full container mx-auto max-w-[1600px]">
        
        {/* Logo Area */}
        <div className="flex items-center mr-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">FC</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              FCCE LIBRARY
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-4 lg:space-x-6 mx-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-indigo-600 flex items-center gap-2",
                route.active
                  ? "text-black dark:text-white"
                  : "text-muted-foreground"
              )}
            >
              <route.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{route.label}</span>
            </Link>
          ))}
        </div>
        
        {/* User / Auth Area */}
        <div className="ml-auto flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <UserCircle className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className={cn("text-xs font-semibold mt-1", user?.role === 'admin' ? 'text-indigo-600' : 'text-emerald-600')}>
                      Role: {user?.role.toUpperCase()}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 hover:text-red-700">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="shadow-md">
                  Sign In
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <AuthForm onSuccess={() => setIsAuthModalOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </nav>
  );
}