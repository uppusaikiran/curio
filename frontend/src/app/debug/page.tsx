'use client';

import { Container } from '@/components/ui/container';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/providers/AuthProvider';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugPage() {
  const { user, isAuthenticated, loading } = useAuthContext();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSessionInfo(data.session);
      
      const { data: userData } = await supabase.auth.getUser();
      setUserInfo(userData.user);
    };
    
    checkSession();
  }, []);

  const refreshData = async () => {
    const { data } = await supabase.auth.getSession();
    setSessionInfo(data.session);
    
    const { data: userData } = await supabase.auth.getUser();
    setUserInfo(userData.user);
  };

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center bg-background">
        <Container className="py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tighter mb-6">
              Authentication Debug
            </h1>
            
            <div className="space-y-8">
              <section className="bg-gray-50 p-6 rounded-lg border">
                <h2 className="text-2xl font-semibold mb-4">Auth Context State</h2>
                <div className="space-y-2">
                  <p><strong>Loading:</strong> {loading ? 'True' : 'False'}</p>
                  <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'True' : 'False'}</p>
                  <p><strong>User:</strong> {user ? 'Present' : 'Null'}</p>
                  {user && (
                    <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                      {JSON.stringify(user, null, 2)}
                    </pre>
                  )}
                </div>
              </section>
              
              <section className="bg-gray-50 p-6 rounded-lg border">
                <h2 className="text-2xl font-semibold mb-4">Direct Supabase Check</h2>
                <div className="space-y-2">
                  <p><strong>Session:</strong> {sessionInfo ? 'Present' : 'Null'}</p>
                  {sessionInfo && (
                    <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                      {JSON.stringify(sessionInfo, null, 2)}
                    </pre>
                  )}
                  
                  <p><strong>User:</strong> {userInfo ? 'Present' : 'Null'}</p>
                  {userInfo && (
                    <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                      {JSON.stringify(userInfo, null, 2)}
                    </pre>
                  )}
                </div>
              </section>
              
              <div className="flex justify-center">
                <Button onClick={refreshData}>Refresh Data</Button>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
} 