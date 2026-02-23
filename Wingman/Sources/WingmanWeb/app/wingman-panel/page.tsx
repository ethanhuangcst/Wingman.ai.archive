'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MainSection from '../components/MainSection';

interface User {
  id: number;
  name: string;
  email: string;
  apiKey: string;
  apiProvider: string;
  profileImage: string | null;
  aiConnections?: Array<{ id: string; apiKey: string; apiProvider: string }>;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface ApiTestState {
  isTesting: boolean;
  testResult: 'PASS' | 'FAIL' | null;
  testError: string | null;
}

export default function WingmanPanel() {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null
  });

  // Initialize API test state with default values for server-side rendering
  const [apiTest, setApiTest] = useState<ApiTestState>({
    isTesting: false,
    testResult: null,
    testError: null
  });

  // Load API test result from localStorage in the browser after hydration
  useEffect(() => {
    console.log('Starting to load API test result from localStorage...');
    if (typeof window !== 'undefined') {
      const storedApiTest = localStorage.getItem('apiTestResult');
      const firstLoadAfterLogin = localStorage.getItem('firstLoadAfterLogin') === 'true';
      console.log('Stored API test result:', storedApiTest);
      console.log('First load after login:', firstLoadAfterLogin);
      
      if (storedApiTest && !firstLoadAfterLogin) {
        try {
          const parsedTest = JSON.parse(storedApiTest);
          console.log('Parsed API test result:', parsedTest);
          setApiTest({
            isTesting: false,
            testResult: parsedTest.testResult,
            testError: parsedTest.testError
          });
          console.log('Set API test result from localStorage');
        } catch (error) {
          console.error('Error parsing stored API test result:', error);
          // Default to PASS if parsing fails
          console.log('Defaulting API test result to PASS due to parsing error');
          setApiTest({
            isTesting: false,
            testResult: 'PASS',
            testError: null
          });
        }
      } else if (firstLoadAfterLogin) {
        console.log('First load after login detected, will run API connection test');
        // Don't set test result yet - test will run after authentication
      } else {
        // Default to PASS if no stored result (since we skip API test during login)
        console.log('Defaulting API test result to PASS due to no stored result');
        setApiTest({
          isTesting: false,
          testResult: 'PASS',
          testError: null
        });
      }
    }
  }, []);

  // State for AI connection tests
  const [aiTestState, setAiTestState] = useState({
    isTesting: false,
    currentProvider: '',
    testResults: [] as Array<{ provider: string; result: 'PASS' | 'FAIL'; error?: string }>,
    allPassed: false,
    somePassed: false
  });

  // Test AI connection
  const testAIConnection = async (user: User) => {
    console.log('Starting AI connection test...');
    if (!user.aiConnections || user.aiConnections.length === 0) {
      console.log('No AI connections configured, skipping test');
      setApiTest({
        isTesting: false,
        testResult: 'PASS',
        testError: null
      });
      // Store result in localStorage
      localStorage.setItem('apiTestResult', JSON.stringify({
        testResult: 'PASS',
        testError: null
      }));
      // Clear firstLoadAfterLogin flag
      localStorage.removeItem('firstLoadAfterLogin');
      return;
    }

    setAiTestState({
      isTesting: true,
      currentProvider: '',
      testResults: [],
      allPassed: false,
      somePassed: false
    });

    setApiTest({
      isTesting: true,
      testResult: null,
      testError: null
    });

    try {
      const testResults = [];
      let allPassed = true;
      let somePassed = false;

      // Test each AI connection
      for (const connection of user.aiConnections) {
        console.log('Testing AI connection:', connection.apiProvider);
        
        // Update current provider being tested
        setAiTestState(prev => ({
          ...prev,
          currentProvider: connection.apiProvider
        }));

        try {
          const response = await axios.post('/api/test-ai-connection', {
            provider: connection.apiProvider,
            apiKey: connection.apiKey
          });
          
          console.log('AI connection test response for', connection.apiProvider, ':', response.data);
          
          if (response.data.success) {
            testResults.push({
              provider: connection.apiProvider,
              result: 'PASS'
            });
            somePassed = true;
          } else {
            testResults.push({
              provider: connection.apiProvider,
              result: 'FAIL',
              error: response.data.error || 'Connection failed'
            });
            allPassed = false;
          }
        } catch (error) {
          console.error('AI connection test error for', connection.apiProvider, ':', error);
          testResults.push({
            provider: connection.apiProvider,
            result: 'FAIL',
            error: 'Connection test failed'
          });
          allPassed = false;
        }

        // Update test results
        setAiTestState(prev => ({
          ...prev,
          testResults: [...testResults],
          allPassed,
          somePassed
        }));

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('All AI connection tests completed:', { allPassed, somePassed, testResults });

      if (allPassed) {
        setApiTest({
          isTesting: false,
          testResult: 'PASS',
          testError: null
        });
        // Store result in localStorage
        localStorage.setItem('apiTestResult', JSON.stringify({
          testResult: 'PASS',
          testError: null
        }));
      } else if (somePassed) {
        // Some tests passed, some failed
        setApiTest({
          isTesting: false,
          testResult: 'PASS', // Still pass overall since some connections work
          testError: 'Some AI connections failed'
        });
        // Store result in localStorage
        localStorage.setItem('apiTestResult', JSON.stringify({
          testResult: 'PASS',
          testError: 'Some AI connections failed'
        }));
        // Show message to check account settings
        setTimeout(() => {
          alert('Some AI connections failed. Please check your account settings for the failed providers.');
        }, 1000);
      } else {
        // All tests failed
        setApiTest({
          isTesting: false,
          testResult: 'FAIL',
          testError: 'All AI connections failed'
        });
        // Store result in localStorage
        localStorage.setItem('apiTestResult', JSON.stringify({
          testResult: 'FAIL',
          testError: 'All AI connections failed'
        }));
      }
    } catch (error) {
      console.error('AI connection test error:', error);
      setApiTest({
        isTesting: false,
        testResult: 'FAIL',
        testError: 'Connection test failed'
      });
      // Store result in localStorage
      localStorage.setItem('apiTestResult', JSON.stringify({
        testResult: 'FAIL',
        testError: 'Connection test failed'
      }));
    } finally {
      // Clear firstLoadAfterLogin flag
      localStorage.removeItem('firstLoadAfterLogin');
      // Clear AI test state
      setAiTestState(prev => ({
        ...prev,
        isTesting: false
      }));
    }
  };

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Starting authentication check...');
      try {
        const response = await axios.get('/api/account');
        console.log('Authentication API response status:', response.status);
        console.log('Authentication API response data:', response.data);
        if (response.data.success) {
          console.log('Authentication successful, user:', response.data.user);
          setAuth({
            isAuthenticated: true,
            user: response.data.user,
            loading: false,
            error: null
          });
          console.log('Set auth state to authenticated');
          
          // Check if it's first load after login
          const firstLoadAfterLogin = localStorage.getItem('firstLoadAfterLogin') === 'true';
          console.log('First load after login:', firstLoadAfterLogin);
          
          if (firstLoadAfterLogin) {
            // Run AI connection test
            console.log('Running AI connection test after login');
            await testAIConnection(response.data.user);
          }
        } else {
          console.log('Authentication failed, not authorized');
          setAuth({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null
          });
          // Redirect to login if not authenticated
          console.log('Redirecting to login');
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setAuth({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: 'Authentication failed'
        });
        // Redirect to login on error
        console.log('Redirecting to login due to error');
        window.location.href = '/login';
      }
    };

    checkAuth();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
      // Clear API test result from localStorage
      localStorage.removeItem('apiTestResult');
      setAuth({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Loading state
  console.log('Rendering WingmanPanel, auth:', auth, 'apiTest:', apiTest);
  if (auth.loading) {
    console.log('Rendering auth loading state');
    return (
      <div className="page-container bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // API test in progress
  if (apiTest.isTesting) {
    console.log('Rendering API test in progress state');
    return (
      <div className="page-container bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Testing AI Connections...</h2>
            {aiTestState.currentProvider && (
              <p className="text-gray-600 mb-4">
                Current: <span className="font-medium">{aiTestState.currentProvider}</span>
              </p>
            )}
          </div>
          
          {aiTestState.testResults.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Test Results:</h3>
              <div className="space-y-2">
                {aiTestState.testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-md border">
                    <span className="font-medium">{result.provider}</span>
                    <span className={`font-medium ${result.result === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
                      {result.result === 'PASS' ? '✅ PASS' : '❌ FAIL'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <p className="text-gray-500 text-sm text-center">
            This may take a few seconds per connection...
          </p>
        </div>
      </div>
    );
  }

  // API test failed
  if (apiTest.testResult === 'FAIL') {
    console.log('Rendering API test failed state');
    return (
      <div className="page-container bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cannot connect to AI provider</h2>
            <p className="text-gray-600 mb-6">
              Please check your API Key and provider settings in
              <a 
                href="/settings" 
                className="text-blue-600 font-medium ml-1 hover:underline"
              >
                Account Setting
              </a>
            </p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated and API test passed or skipped - show full WingmanPanel
  if (auth.isAuthenticated && auth.user && (apiTest.testResult === 'PASS' || apiTest.testResult === 'SKIPPED')) {
    console.log('Rendering full WingmanPanel, user:', auth.user);
    // Get display name for provider
    const getProviderDisplayName = (provider: string) => {
      if (provider === 'qwen-plus') return 'Qwen';
      if (provider === 'gpt-5.2-all') return 'GPT';
      return provider;
    };

    // Get first AI connection's provider (fallback to 'qwen-plus' if no connections)
    const firstProvider = auth.user.aiConnections && auth.user.aiConnections.length > 0 
      ? auth.user.aiConnections[0].apiProvider 
      : 'qwen-plus';
    console.log('First provider:', firstProvider);

    return (
      <div className="page-container bg-gray-100 min-h-screen flex flex-col">
        {/* Header */}
        <Header user={auth.user} onLogout={handleLogout} />

        {/* Main Section */}
        <main className="flex-1 overflow-hidden pt-6 pb-2">
          <MainSection provider={getProviderDisplayName(firstProvider)} />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    );
  }

  // Default loading state
  console.log('Rendering default loading state');
  return (
    <div className="page-container bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}