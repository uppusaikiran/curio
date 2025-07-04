'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ApiTroubleshooter() {
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Get environment variables
    const url = process.env.NEXT_PUBLIC_QLOO_API_URL;
    const key = process.env.NEXT_PUBLIC_QLOO_API_KEY;
    
    setApiUrl(url || 'https://hackathon.api.qloo.com');
    if (key) {
      // Mask the key for display
      setApiKey(`${key.substring(0, 5)}...${key.substring(key.length - 5)}`);
    } else {
      setApiKey('Not set');
    }
  }, []);
  
  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);
    
    try {
      // Try different auth formats
      const authFormats = ['x-api-key', 'bearer', 'token'];
      const results: any = {};
      let success = false;
      
      for (const format of authFormats) {
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json'
          };
          
          const key = process.env.NEXT_PUBLIC_QLOO_API_KEY || '';
          
          switch (format) {
            case 'x-api-key':
              headers['X-Api-Key'] = key;
              break;
            case 'bearer':
              headers['Authorization'] = `Bearer ${key}`;
              break;
            case 'token':
              headers['Authorization'] = `Token ${key}`;
              break;
          }
          
          // Try both endpoints
          const endpoints = ['/v2/entities', '/v2/entity-types'];
          
          for (const endpoint of endpoints) {
            try {
              const response = await axios.get(`${apiUrl}${endpoint}`, { headers });
              
              if (response.data && (response.data.results?.types || []).length > 0) {
                results[`${format}-${endpoint}`] = {
                  success: true,
                  types: response.data.results?.types || []
                };
                success = true;
              } else {
                results[`${format}-${endpoint}`] = {
                  success: false,
                  message: 'No entity types returned'
                };
              }
            } catch (endpointErr: any) {
              results[`${format}-${endpoint}`] = {
                success: false,
                status: endpointErr.response?.status,
                message: endpointErr.message
              };
            }
          }
        } catch (formatErr) {
          console.error(`Error with format ${format}:`, formatErr);
        }
      }
      
      setTestResult({ results, success });
      
      if (!success) {
        setError('All connection tests failed. Please check your API key and connection.');
      }
    } catch (err: any) {
      console.error('API test error:', err);
      setError(`${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-4">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="text-blue-500 underline text-sm"
      >
        {isVisible ? 'Hide API Troubleshooter' : 'Show API Troubleshooter'}
      </button>
      
      {isVisible && (
        <div className="mt-2 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">API Configuration</h3>
          
          <div className="mb-4">
            <div><span className="font-medium">API URL:</span> {apiUrl}</div>
            <div><span className="font-medium">API Key:</span> {apiKey}</div>
          </div>
          
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 text-sm"
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </button>
          
          {error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {testResult && (
            <div className="mt-4">
              <h4 className="font-medium mb-1">Test Results:</h4>
              <div className="text-sm bg-white p-2 rounded border overflow-auto max-h-60">
                <pre>{JSON.stringify(testResult, null, 2)}</pre>
              </div>
              
              {testResult.success ? (
                <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-green-700 text-sm">
                  Connection successful! At least one endpoint is working.
                </div>
              ) : (
                <div className="mt-2 text-sm">
                  <p className="font-medium">Troubleshooting Tips:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Check that your API key is correctly set in .env.local</li>
                    <li>Verify that the API URL is correct</li>
                    <li>Check for CORS issues in the browser console</li>
                    <li>Try visiting the <a href="/api-test" className="text-blue-500 underline">API Test page</a> for more detailed testing</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 