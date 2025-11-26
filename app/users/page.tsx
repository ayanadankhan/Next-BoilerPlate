'use client';

import { useState, useEffect, useMemo } from 'react';
// import { useAuth } from '../context/AuthContext'; // UNCOMMENT THIS IN YOUR REAL APP
import UserForm, { UserData } from '@/components/UserForm';
import UserList from '@/components/UserList';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Filter, X, Loader2, Users } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  // SheetTrigger, // REMOVE THIS IMPORT
} from "@/components/ui/sheet"; 
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Mock Auth hook for demonstration (Replace with your actual import)
const useAuth = () => ({ isLoading: false, isAuthenticated: true, isAdmin: true });

export default function UsersPage() {
  const { isLoading: isAuthLoading, isAuthenticated, isAdmin } = useAuth();
  
  // --- Data States ---
  const [users, setUsers] = useState<UserData[]>([]);
  
  // --- UI States ---
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // --- Filter States ---
  const [filterQuery, setFilterQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | UserData['role']>('all');

  // --- Data Fetching ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setError(null);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to fetch users');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during fetch.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // In a real app, check isAuthenticated here
    fetchUsers();
  }, []); // Added dependency array to prevent infinite loops

  // --- Filter Logic ---
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Query Filter (Name or Email)
      if (filterQuery) {
        const query = filterQuery.toLowerCase();
        // Check both name and email safely
        const nameMatch = user.name?.toLowerCase().includes(query) || false;
        const emailMatch = user.email?.toLowerCase().includes(query) || false;
        
        if (!nameMatch && !emailMatch) {
          return false;
        }
      }

      // Role Filter
      if (filterRole !== 'all' && user.role !== filterRole) {
        return false;
      }

      return true;
    });
  }, [users, filterQuery, filterRole]);

  // --- Handlers ---
  const resetFilters = () => {
    setFilterQuery('');
    setFilterRole('all');
  };

  const handleUserSubmit = async (userData: UserData) => {
    // Auth check removed for demo, add back in real app
    
    setIsSubmitting(true);
    setError(null);

    try {
      const isEdit = userData._id;
      const url = isEdit ? `/api/users/${userData._id}` : '/api/users';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        await fetchUsers(); 
        setIsSheetOpen(false); 
        setEditUser(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Operation failed.");
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Optimistic update (optional, but makes UI snappy)
      const previousUsers = [...users];
      setUsers(users.filter(u => u._id !== userId));

      const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      
      if (!response.ok) {
        // Revert if failed
        setUsers(previousUsers);
        const errorData = await response.json();
        setError(errorData.error || "Deletion failed.");
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during deletion.');
    }
  };

  const openEditSheet = (user: UserData) => {
    setEditUser(user);
    setIsSheetOpen(true);
  };

  const handleSheetClose = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) setEditUser(null);
  }

  // Handle Add Click (The Fix for the "Not Opening" glitch)
  const handleAddClick = () => {
      setEditUser(null);
      setIsSheetOpen(true);
      setError(null);
  };

  if (isAuthLoading) return <Loader2 className="animate-spin h-8 w-8 mx-auto mt-20" />;

  return (
    <div className="space-y-6 fade-in p-6">
      
      {/* 1. HEADER & ACTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-slate-500">Manage user accounts and roles.</p>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
           {/* FIX: REMOVED SheetTrigger. We control opening via the Button below directly */}
          <SheetContent side="right" className="sm:max-w-md w-full md:w-[500px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editUser ? 'Edit User Details' : 'Create New User'}</SheetTitle>
              <SheetDescription>
                Define the user's name, email, and security role.
              </SheetDescription>
            </SheetHeader>
            <UserForm
              onSubmit={handleUserSubmit} 
              initialValues={editUser || undefined} 
              buttonText={editUser ? 'Update User' : 'Create User'}
              onCancel={() => handleSheetClose(false)}
              isSubmitting={isSubmitting}
            />
          </SheetContent>
        </Sheet>

        <Button onClick={handleAddClick} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Add New User
        </Button>
      </div>
      
      {/* Error Message Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* 2. FILTER BAR */}
      <Card>
        <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Filter className="h-4 w-4 text-indigo-600" />
                    Filters
                </CardTitle>
                {(filterQuery || filterRole !== 'all') && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-red-500 hover:text-red-700 h-8 px-2">
                        <X className="h-3 w-3 mr-1" /> Reset
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label>Search by Name or Email</Label>
                    <Input 
                        placeholder="e.g., Jane Doe" 
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        className="h-9"
                    />
                </div>
                <div className="space-y-2">
                    <Label>User Role</Label>
                    <Select 
                        value={filterRole} 
                        onValueChange={(val) => setFilterRole(val as 'all' | UserData['role'])}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardContent>
      </Card>

      {/* 3. RESULTS LIST */}
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-8 text-slate-500">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading user data...
            </div>
          ) : (
            <>
                <div className="mb-2 text-sm text-slate-500 text-right">
                    Showing {filteredUsers.length} of {users.length} results
                </div>
                <UserList 
                  users={filteredUsers} 
                  onEdit={openEditSheet}
                  onDelete={handleDeleteUser}
                />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}