'use client';

import { useState } from 'react';
import { useAuth } from '../app/context/AuthContext'; // Import useAuth
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthFormProps {
  onSuccess: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    let success = false;
    if (isLogin) {
      success = await login({ email, password });
    } else {
      success = await register({ username, email, password });
    }

    if (success) {
      onSuccess();
    }
  };

  const toggleMode = () => {
    setIsLogin(prev => !prev);
    setEmail('');
    setUsername('');
    setPassword('');
  };

  return (
    <Card className="w-full max-w-sm mx-auto shadow-lg border-2">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center gap-2">
          {isLogin ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
          {isLogin ? 'Sign In' : 'Register'}
        </CardTitle>
        <CardDescription>
          {isLogin ? 'Enter your credentials to access the system.' : 'Create an account to get started.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {!isLogin && (
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="john.doe" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>
          <Button type="button" variant="link" onClick={toggleMode} className="text-sm text-indigo-600">
            {isLogin ? 'Need an account? Register' : 'Already have an account? Sign In'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}