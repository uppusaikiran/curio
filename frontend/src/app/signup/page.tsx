'use client';

import { Container } from '@/components/ui/container';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signUp } = useAuthContext();
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }
    
    try {
      await signUp(name, email, password);
      
      // Supabase sends a confirmation email by default
      setSuccess('Success! Please check your email to confirm your account.');
      
      // Don't redirect immediately, show the success message first
      // router.push('/');
    } catch (err) {
      // Handle specific Supabase errors
      if (err instanceof Error) {
        if (err.message.includes('already registered')) {
          setError('This email is already registered. Please sign in instead.');
        } else if (err.message.includes('password')) {
          setError('Password error: ' + err.message);
        } else {
          setError(`Sign up failed: ${err.message}`);
        }
      } else {
        setError('Failed to create account. Please try again.');
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
              Create Account
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 text-center">
              Join Curio and start exploring the future of voice assistants.
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
                {success}
                <div className="mt-2">
                  <Link href="/signin" className="text-primary hover:underline">
                    Go to Sign In
                  </Link>
                </div>
              </div>
            )}
            
            {!success && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-input rounded-md"
                    required
                  />
                </div>
                
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
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-input rounded-md"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Button>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Already have an account?{' '}
                  <Link href="/signin" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </div>
        </Container>
      </main>
    </>
  );
} 