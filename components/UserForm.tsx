'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface UserData {
  _id?: string; // Mongoose uses _id
  name: string;
  email: string;
  role: 'user' | 'admin' | 'editor';
}

interface UserFormProps {
  onSubmit: (userData: UserData) => void;
  initialValues?: UserData;
  buttonText?: string;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function UserForm({ 
  onSubmit, 
  initialValues, 
  buttonText = 'Save', 
  onCancel,
  isSubmitting,
}: UserFormProps) {
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    role: 'user',
  });
  
  useEffect(() => {
    if (initialValues) {
      setUserData(initialValues);
    } else {
      // Reset form state when creating a new user
      setUserData({ name: '', email: '', role: 'user' });
    }
  }, [initialValues]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!userData.name.trim() || !userData.email.trim()) return;
    onSubmit(userData);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setUserData(prev => ({ ...prev, role: value as 'user' | 'admin' | 'editor' }));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-6">
      
      {/* Name */}
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          name="name"
          id="name"
          placeholder="User's Full Name"
          value={userData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      {/* Email */}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          name="email"
          id="email"
          placeholder="user@example.com"
          value={userData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      {/* Role */}
      <div className="grid gap-2">
        <Label htmlFor="role">Role</Label>
        <Select
          name="role"
          value={userData.role}
          onValueChange={handleRoleChange}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User (Client/Viewer)</SelectItem>
            <SelectItem value="editor">Editor (Content Creator)</SelectItem>
            <SelectItem value="admin">Admin (Full Control)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {buttonText}
        </Button>
      </div>
    </form>
  );
}