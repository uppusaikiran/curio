'use client';

import { Container } from '@/components/ui/container';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuthContext();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await signIn(email, password);
      
      // Redirect to home page after successful sign-in
      router.push('/');
    } catch (err) {
      // Handle specific Supabase errors
      if (err instanceof Error) {
        if (err.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (err.message.includes('Email not confirmed')) {
          setError('Please confirm your email address before signing in.');
        } else {
          setError(`Sign in failed: ${err.message}`);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center bg-background">
        <Container className="py-16">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl font-bold tracking-tighter mb-6 text-center">
              Sign In
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 text-center">
              Welcome back to Curio! Sign in to continue your conversations.
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-input rounded-md"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-input rounded-md"
                  required
                />
              </div>
              
              <div className="flex justify-between items-center">
                <Link href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </Container>
      </main>
    </>
  );
} 