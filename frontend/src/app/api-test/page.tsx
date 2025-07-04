'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import * as qlooService from '@/lib/qlooService';
import QlooInsightsTest from './qloo-insights';

export default function ApiTest() {
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState('/v2/insights');
  const [queryParams, setQueryParams] = useState('filter.type=urn:entity:movie&filter.tags=urn:tag:genre:media:comedy');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState<any>(null);

  useEffect(() => {
    // Get environment variables
    const url = process.env.NEXT_PUBLIC_QLOO_API_URL;
    const key = process.env.NEXT_PUBLIC_QLOO_API_KEY;
    
    setApiUrl(url || '');
    setApiKey(key || '');
  }, []);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setRawResponse(null);
    
    try {
      // Make a direct API call
      const fullUrl = `${apiUrl}${endpoint}${queryParams ? `?${queryParams}` : ''}`;
      
      console.log('Testing API connection to:', fullUrl);
      
      const result = await axios.get(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey
        }
      });
      
      setResponse(result.data);
      setRawResponse(result);
      setError(null);
    } catch (err: any) {
      console.error('API test error:', err);
      setError(`${err.message}${err.response ? ` (Status: ${err.response.status})` : ''}`);
      setResponse(err.response?.data || null);
      setRawResponse(err.response || null);
    } finally {
      setLoading(false);
    }
  };

  const testEntityTypes = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setRawResponse(null);
    
    try {
      // Try both endpoints
      try {
        const result = await qlooService.getEntityTypes();
        setResponse({ entityTypes: result });
        setError(null);
      } catch (err: any) {
        console.error('Entity types error with /v2/entities:', err);
        
        // Try fallback to direct API call
        const fallbackUrl = `${apiUrl}/v2/entity-types`;
        console.log('Trying fallback URL:', fallbackUrl);
        
        const result = await axios.get(fallbackUrl, {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey
          }
        });
        
        setResponse({ entityTypes: result.data.results?.types || [] });
        setError("Primary endpoint failed, but fallback succeeded");
      }
    } catch (err: any) {
      console.error('All entity types attempts failed:', err);
      setError(`${err.message}${err.response ? ` (Status: ${err.response.status})` : ''}`);
      setResponse(err.response?.data || null);
      setRawResponse(err.response || null);
    } finally {
      setLoading(false);
    }
  };

  const testInsights = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setRawResponse(null);
    
    try {
      const params: Record<string, string> = {};
      queryParams.split('&').forEach(param => {
        const [key, value] = param.split('=');
        if (key && value) {
          params[key] = value;
        }
      });
      
      const result = await qlooService.getInsights(params);
      setResponse({ insights: result });
      setError(null);
    } catch (err: any) {
      console.error('Insights error:', err);
      setError(`${err.message}${err.response ? ` (Status: ${err.response.status})` : ''}`);
      setResponse(err.response?.data || null);
      setRawResponse(err.response || null);
    } finally {
      setLoading(false);
    }
  };

  const testTrending = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setRawResponse(null);
    
    try {
      // Try both trending endpoints
      try {
        console.log('Trying dedicated trending endpoint first');
        const result = await qlooService.getTrendingEntities({
          entity_type: 'urn:entity:movie',
          limit: 10
        });
        setResponse({ trending: result });
        setError(null);
      } catch (err: any) {
        console.error('Dedicated trending endpoint failed:', err);
        
        // Try direct API call to trending endpoint
        console.log('Trying direct API call to trending endpoint');
        const trendingUrl = `${apiUrl}/v2/trending`;
        const trendingParams = {
          type: 'urn:entity:movie',
          take: 10
        };
        
        try {
          const result = await axios.get(trendingUrl, {
            headers: {
              'Content-Type': 'application/json',
              'X-Api-Key': apiKey
            },
            params: trendingParams
          });
          
          setResponse({ 
            directTrending: result.data.results?.trending || [],
            message: 'Direct trending API call succeeded, but service method failed'
          });
          setError('Service method failed, but direct API call succeeded');
          setRawResponse(result);
        } catch (directErr: any) {
          console.error('Direct trending API call also failed:', directErr);
          
          // Try insights with trending parameter
          console.log('Trying insights with trending parameter');
          const insightsUrl = `${apiUrl}/v2/insights`;
          const insightsParams = {
            trending: true,
            'filter.type': 'urn:entity:movie',
            take: 10
          };
          
          try {
            const result = await axios.get(insightsUrl, {
              headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey
              },
              params: insightsParams
            });
            
            setResponse({ 
              insightsTrending: result.data.results?.entities || [],
              message: 'Insights trending API call succeeded, but other methods failed'
            });
            setError('Primary methods failed, but insights trending succeeded');
            setRawResponse(result);
          } catch (insightsErr: any) {
            // All methods failed
            setError(`All trending methods failed. Last error: ${insightsErr.message}`);
            setResponse({
              errors: {
                service: err.message,
                direct: directErr.message,
                insights: insightsErr.message
              }
            });
            setRawResponse(insightsErr.response);
          }
        }
      }
    } catch (err: any) {
      console.error('All trending attempts failed:', err);
      setError(`${err.message}${err.response ? ` (Status: ${err.response.status})` : ''}`);
      setResponse(err.response?.data || null);
      setRawResponse(err.response || null);
    } finally {
      setLoading(false);
    }
  };

  const testSearch = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setRawResponse(null);
    
    try {
      const result = await qlooService.searchEntities('urn:entity:movie', 'star wars', 5);
      setResponse({ search: result });
      setError(null);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(`${err.message}${err.response ? ` (Status: ${err.response.status})` : ''}`);
      setResponse(err.response?.data || null);
      setRawResponse(err.response || null);
    } finally {
      setLoading(false);
    }
  };

  const setTestEndpoint = (ep: string, params: string) => {
    setEndpoint(ep);
    setQueryParams(params);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Qloo API Test</h1>
      
      {/* New Qloo Insights Test Component with auto-fixing parameters */}
      <div className="mb-8">
        <QlooInsightsTest />
        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
          <p className="font-bold">Note:</p>
          <p>The component above uses an improved Qloo service that automatically adds required parameters 
          to prevent the "at least one valid signal or filter is required" error.</p>
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <div className="grid grid-cols-1 gap-2">
          <div>
            <span className="font-medium">API URL:</span> {apiUrl ? apiUrl : 'Not set'}
          </div>
          <div>
            <span className="font-medium">API Key:</span> {apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}` : 'Not set'}
          </div>
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Direct API Test</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Endpoint</label>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Query Parameters</label>
          <input
            type="text"
            value={queryParams}
            onChange={(e) => setQueryParams(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="param1=value1&param2=value2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Quick Endpoint Templates</label>
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              onClick={() => setTestEndpoint('/v2/insights', 'filter.type=urn:entity:movie&filter.tags=urn:tag:genre:media:comedy')}
              className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs"
            >
              Insights (Movie + Comedy)
            </button>
            <button
              onClick={() => setTestEndpoint('/v2/insights', 'trending=true&filter.type=urn:entity:movie&take=10')}
              className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs"
            >
              Insights Trending
            </button>
            <button
              onClick={() => setTestEndpoint('/v2/trending', 'type=urn:entity:movie&take=10')}
              className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs"
            >
              Direct Trending
            </button>
            <button
              onClick={() => setTestEndpoint('/v2/search', 'filter.type=urn:entity:movie&q=star%20wars&take=5')}
              className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs"
            >
              Search Movies
            </button>
            <button
              onClick={() => setTestEndpoint('/v2/entities', '')}
              className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs"
            >
              Entity Types
            </button>
            <button
              onClick={() => setTestEndpoint('/v2/entity-types', '')}
              className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs"
            >
              Entity Types (Alt)
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Direct API Call'}
          </button>
          
          <button
            onClick={testEntityTypes}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Test Entity Types
          </button>
          
          <button
            onClick={testInsights}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
          >
            Test Insights
          </button>
          
          <button
            onClick={testTrending}
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-400"
          >
            Test Trending
          </button>

          <button
            onClick={testSearch}
            disabled={loading}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-400"
          >
            Test Search
          </button>
        </div>

        <div className="text-sm text-gray-600">
          <p>Note: If you're experiencing issues, try the direct API call with different endpoint templates above.</p>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-red-700">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {response && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Response</h2>
          <pre className="p-4 bg-gray-100 rounded-lg overflow-auto max-h-96">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {rawResponse && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Raw Response Details</h2>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p><strong>Status:</strong> {rawResponse.status}</p>
            <p><strong>Status Text:</strong> {rawResponse.statusText}</p>
            <p><strong>Headers:</strong></p>
            <pre className="p-2 bg-gray-200 rounded mt-2 overflow-auto max-h-32">
              {JSON.stringify(rawResponse.headers, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 