'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext'; // Relative import for AuthContext
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
  SheetTrigger,
} from "@/components/ui/sheet"; 
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UsersPage() {
  // Authentication and Authorization
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
    if (!isAuthenticated) return;
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
    if (isAuthenticated) {
        fetchUsers();
    } else {
        setLoading(false);
    }
  }, [isAuthenticated]);


  // --- Filter Logic ---
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Query Filter (Name or Email)
      if (filterQuery) {
        const query = filterQuery.toLowerCase();
        if (!user.name.toLowerCase().includes(query) && !user.email.toLowerCase().includes(query)) {
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
    if (!isAdmin) {
        setError("Authorization Required: Only Administrators can create or modify users.");
        return;
    }
    
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
        await fetchUsers(); // Re-fetch all to update the list
        setIsSheetOpen(false); // Close the Sheet
        setEditUser(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Operation failed due to permission or server error.");
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during submit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isAdmin) {
        setError("Authorization Required: Only Administrators can delete users.");
        return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      
      if (response.ok) {
        await fetchUsers(); // Re-fetch all to update the list
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Deletion failed due to permission or server error.");
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during deletion.');
    } finally {
      setLoading(false);
    }
  };

  const openEditSheet = (user: UserData) => {
    if (!isAdmin) {
        setError("Authorization Required: Only Administrators can edit user details.");
        return;
    }
    setEditUser(user);
    setIsSheetOpen(true);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setEditUser(null); // Clear edit state on close
  }

  // --- UI Loading/Access Checks ---
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-slate-500">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading Authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="max-w-xl mx-auto mt-10">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">
            You must be signed in to view User Management.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-yellow-800">
            <p className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" /> This section requires Administrator privileges.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Admin access check for actions
  const actionDisabled = !isAdmin;

  return (
    <div className="space-y-6 fade-in">
      
      {/* 1. HEADER & ACTION - Uses Sheet */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-slate-500">
            {isAdmin ? "Admin: Full control over user accounts and roles." : "Viewing is restricted, and modification requires Administrator privileges."}
          </p>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
          <SheetTrigger asChild>
            <Button 
                onClick={() => { setEditUser(null); setIsSheetOpen(true); setError(null); }} 
                className="shadow-sm"
                disabled={actionDisabled}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New User
            </Button>
          </SheetTrigger>
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
              onCancel={handleSheetClose}
              isSubmitting={isSubmitting}
            />
          </SheetContent>
        </Sheet>
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
                {/* Query Search */}
                <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label className="text-xs font-semibold text-slate-500">Search by Name or Email</Label>
                    <Input 
                        placeholder="e.g., Jane Doe or jane@example.com" 
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        className="h-9"
                    />
                </div>

                {/* Role Filter */}
                <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-500">User Role</Label>
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