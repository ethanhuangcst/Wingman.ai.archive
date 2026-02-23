'use client';

import { useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const response = await axios.get('/api/account');
        if (response.data.success) {
          // User is authenticated, redirect to wingman-panel
          window.location.href = '/wingman-panel';
        } else {
          // User is not authenticated, redirect to login
          window.location.href = '/login';
        }
      } catch (error) {
        // Authentication error, redirect to login
        window.location.href = '/login';
      }
    };

    checkAuthAndRedirect();
  }, []);

  return (
    <div className="page-container bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
