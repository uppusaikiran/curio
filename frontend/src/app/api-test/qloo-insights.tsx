'use client';

import { useState } from 'react';
import { getInsights } from '@/lib/qlooServiceAlt';

export default function QlooInsightsTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('urn:entity:movie');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // The improved service will automatically add a valid parameter if needed
      // to avoid the "at least one valid signal or filter is required" error
      const response = await getInsights({
        'filter.type': filterType
      });
      
      setResults(response.entities || []);
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Qloo Insights API Test (Fixed Version)</h2>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entity Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="urn:entity:movie">Movies</option>
              <option value="urn:entity:tv_show">TV Shows</option>
              <option value="urn:entity:music_artist">Music Artists</option>
              <option value="urn:entity:book">Books</option>
              <option value="urn:entity:video_game">Video Games</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>This component uses the improved qlooServiceAlt that automatically adds valid parameters to avoid API errors.</p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Test API Call'}
          </button>
        </form>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {results.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Results ({results.length})</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item, index) => (
              <div key={item.entity_id || index} className="border rounded-md p-4">
                <h4 className="font-medium text-lg">{item.name}</h4>
                <p className="text-sm text-gray-500">{item.type || item.subtype}</p>
                {item.score && (
                  <div className="mt-2">
                    <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Score: {Math.round(item.score * 100)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 