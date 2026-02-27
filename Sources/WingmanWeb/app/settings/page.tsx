'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface User {
  id: number;
  name: string;
  email: string;
  apiKey: string;
  apiProvider: string;
  profileImage: string | null;
  aiConnections?: Array<{ id: string; apiKey: string; apiProvider: string }>;
}

interface AIConnection {
  id: string;
  apiKey: string;
  apiProvider: string;
}

interface AccountFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  aiConnections: AIConnection[];
  profileImage: File | string | null;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  profileImage?: string;
  aiConnections?: { [key: string]: { apiKey?: string; apiProvider?: string } };
}

export default function SettingsPage() {
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [accountFormData, setAccountFormData] = useState<AccountFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    aiConnections: [],
    profileImage: null,
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isImageCropped, setIsImageCropped] = useState(false);
  const [providers, setProviders] = useState<Array<{ id: string; name: string }>>([]);

  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load providers from API
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await fetch('/api/providers');
        if (response.ok) {
          const data = await response.json();
          if (data.providers) {
            setProviders(data.providers.map((provider: any) => ({
              id: provider.id,
              name: provider.name
            })));
          }
        }
      } catch (error) {
        console.error('Error loading providers:', error);
        // Fallback to default providers if loading fails
        setProviders([
          { id: 'qwen-plus', name: 'Qwen Plus' },
          { id: 'gpt-5.2-all', name: 'GPT-5.2 All' }
        ]);
      }
    };

    loadProviders();
  }, []);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await axios.get('/api/account', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth-token') || ''}`
          }
        });
        
        if (response.data.success) {
          const userData = response.data.user;
          setUser(userData);
          // Initialize with existing AI connections
          const initialConnections: AIConnection[] = [];
          if (userData.aiConnections && Array.isArray(userData.aiConnections)) {
            // Use existing connections from API
            userData.aiConnections.forEach((conn: any) => {
              initialConnections.push({
                id: conn.id.toString(),
                apiKey: conn.apiKey,
                apiProvider: conn.apiProvider || 'qwen-plus',
              });
            });
          } else if (userData.apiKey) {
            // Fallback for users with old single API key format
            initialConnections.push({
              id: `connection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              apiKey: userData.apiKey,
              apiProvider: userData.apiProvider || 'qwen-plus',
            });
          }
          setAccountFormData({
            name: userData.name,
            email: userData.email,
            password: '',
            confirmPassword: '',
            aiConnections: initialConnections,
            profileImage: userData.profileImage,
          });
        } else {
          setMessage('Failed to load account information');
          setMessageType('error');
          // Redirect to login if unauthenticated
          if (response.data.error === 'Invalid or expired token') {
            router.push('/login');
          }
        }
      } catch (error) {
        setMessage('Failed to load account information');
        setMessageType('error');
        // Redirect to login if unauthenticated
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, [router]);

  // Check for changes
  useEffect(() => {
    if (user) {
      const hasAccountChanges = 
        accountFormData.name !== user.name ||
        accountFormData.email !== user.email ||
        // Check if AI connections have changed
        JSON.stringify(accountFormData.aiConnections) !== JSON.stringify(user.aiConnections || []) ||
        (typeof accountFormData.profileImage === 'object' && accountFormData.profileImage !== null);
      
      setHasChanges(hasAccountChanges);
    }
  }, [accountFormData, user]);

  const validateAccountForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!accountFormData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!accountFormData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountFormData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Validate password fields if they are not empty
    if (accountFormData.password) {
      if (accountFormData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (!accountFormData.confirmPassword) {
        newErrors.confirmPassword = 'Confirm Password is required';
      } else if (accountFormData.confirmPassword !== accountFormData.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (accountFormData.confirmPassword) {
      newErrors.password = 'Password is required';
    }
    
    // Validate AI connections
    const connectionErrors: { [key: string]: { apiKey?: string; apiProvider?: string } } = {};
    const connectionCombinations = new Set<string>();
    
    accountFormData.aiConnections.forEach((connection) => {
      if (connection.apiKey && !connection.apiProvider) {
        if (!connectionErrors[connection.id]) {
          connectionErrors[connection.id] = {};
        }
        connectionErrors[connection.id].apiProvider = 'Provider is required';
      }
      if (connection.apiProvider && !connection.apiKey) {
        if (!connectionErrors[connection.id]) {
          connectionErrors[connection.id] = {};
        }
        connectionErrors[connection.id].apiKey = 'API Key is required';
      }
      
      // Check for duplicate API key + provider combinations
      if (connection.apiKey && connection.apiProvider) {
        const combination = `${connection.apiKey.trim()}:${connection.apiProvider}`;
        if (connectionCombinations.has(combination)) {
          if (!connectionErrors[connection.id]) {
            connectionErrors[connection.id] = {};
          }
          connectionErrors[connection.id].apiKey = 'Duplicate API key + provider combination';
          connectionErrors[connection.id].apiProvider = 'Duplicate API key + provider combination';
        } else {
          connectionCombinations.add(combination);
        }
      }
    });
    if (Object.keys(connectionErrors).length > 0) {
      newErrors.aiConnections = connectionErrors;
    }
    
    // Validate profile image
    if (accountFormData.profileImage && typeof accountFormData.profileImage === 'object') {
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (accountFormData.profileImage.size > maxSize) {
        newErrors.profileImage = 'File size must be less than 2MB';
      }
      
      if (!accountFormData.profileImage.type.startsWith('image/')) {
        newErrors.profileImage = 'File must be an image';
      }
      
      if (!isImageCropped) {
        newErrors.profileImage = 'Please crop the profile image before submitting';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAccountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    
    if (name === 'profileImage' && files && files[0]) {
      const file = files[0];
      const maxSize = 2 * 1024 * 1024; // 2MB
      
      // Check file size before processing
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          profileImage: 'File size must be less than 2MB'
        }));
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profileImage: 'File must be an image'
        }));
        return;
      }
      
      setAccountFormData(prev => ({ ...prev, profileImage: file }));
      setIsImageCropped(false);
      
      // Clear any previous errors
      if (errors.profileImage) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.profileImage;
          return newErrors;
        });
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setShowImagePreview(true);
      };
      reader.readAsDataURL(file);
    } else if (name.startsWith('apiKey-')) {
      // Handle API key changes for specific connections
      const connectionId = name.replace('apiKey-', '');
      setAccountFormData(prev => {
        const updatedConnections = prev.aiConnections.map(conn => 
          conn.id === connectionId ? { ...conn, apiKey: value } : conn
        );
        
        // Check for duplicate API key + provider combinations
        const connectionErrors: { [key: string]: { apiKey?: string; apiProvider?: string } } = {};
        const connectionCombinations = new Set<string>();
        
        updatedConnections.forEach((connection) => {
          if (connection.apiKey && connection.apiProvider) {
            const combination = `${connection.apiKey.trim()}:${connection.apiProvider}`;
            if (connectionCombinations.has(combination)) {
              if (!connectionErrors[connection.id]) {
                connectionErrors[connection.id] = {};
              }
              connectionErrors[connection.id].apiKey = 'Duplicate API key + provider combination';
              connectionErrors[connection.id].apiProvider = 'Duplicate API key + provider combination';
            } else {
              connectionCombinations.add(combination);
            }
          }
        });
        
        // Update errors
        if (Object.keys(connectionErrors).length > 0) {
          setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            newErrors.aiConnections = connectionErrors;
            return newErrors;
          });
        } else if (errors.aiConnections) {
          // Clear all connection errors if no duplicates found
          setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            delete newErrors.aiConnections;
            return newErrors;
          });
        }
        
        return {
          ...prev,
          aiConnections: updatedConnections
        };
      });
    } else {
      setAccountFormData(prev => ({ ...prev, [name]: value }));
      
      // Clear error when user starts typing
      if (errors[name as keyof ValidationErrors]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name as keyof ValidationErrors];
          return newErrors;
        });
      }
    }
  };

  const handleApiProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('apiProvider-')) {
      // Handle provider changes for specific connections
      const connectionId = name.replace('apiProvider-', '');
      setAccountFormData(prev => {
        const updatedConnections = prev.aiConnections.map(conn => 
          conn.id === connectionId ? { ...conn, apiProvider: value } : conn
        );
        
        // Check for duplicate API key + provider combinations
        const connectionErrors: { [key: string]: { apiKey?: string; apiProvider?: string } } = {};
        const connectionCombinations = new Set<string>();
        
        updatedConnections.forEach((connection) => {
          if (connection.apiKey && connection.apiProvider) {
            const combination = `${connection.apiKey.trim()}:${connection.apiProvider}`;
            if (connectionCombinations.has(combination)) {
              if (!connectionErrors[connection.id]) {
                connectionErrors[connection.id] = {};
              }
              connectionErrors[connection.id].apiKey = 'Duplicate API key + provider combination';
              connectionErrors[connection.id].apiProvider = 'Duplicate API key + provider combination';
            } else {
              connectionCombinations.add(combination);
            }
          }
        });
        
        // Update errors
        if (Object.keys(connectionErrors).length > 0) {
          setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            newErrors.aiConnections = connectionErrors;
            return newErrors;
          });
        } else if (errors.aiConnections) {
          // Clear all connection errors if no duplicates found
          setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            delete newErrors.aiConnections;
            return newErrors;
          });
        }
        
        return {
          ...prev,
          aiConnections: updatedConnections
        };
      });
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setAccountFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ValidationErrors];
        return newErrors;
      });
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAccountForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setIsUploading(true);
    setMessage(null);
    setMessageType(null);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', accountFormData.name);
      formDataToSend.append('email', accountFormData.email);
      formDataToSend.append('aiConnections', JSON.stringify(accountFormData.aiConnections));
      
      // Only include password if it's not empty
      if (accountFormData.password) {
        formDataToSend.append('password', accountFormData.password);
      }
      
      if (accountFormData.profileImage && typeof accountFormData.profileImage === 'object') {
        formDataToSend.append('profileImage', accountFormData.profileImage);
      }
      
      const response = await axios.put('/api/account', formDataToSend, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth-token') || ''}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        // Redirect to Wingman-panel page after successful save
        router.push('/wingman-panel');
      } else {
        setMessage(response.data.error || 'Failed to update account. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage((error as { response?: { data?: { error?: string } }}).response?.data?.error || 'Failed to update account. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      // Initialize with existing API key and provider as the first connection
      const initialConnections: AIConnection[] = [];
      if (user.apiKey) {
        initialConnections.push({
          id: `connection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          apiKey: user.apiKey,
          apiProvider: user.apiProvider || 'qwen-plus',
        });
      }
      setAccountFormData({
        name: user.name,
        email: user.email,
        password: '',
        confirmPassword: '',
        aiConnections: initialConnections,
        profileImage: user.profileImage,
      });
      setHasChanges(false);
      setErrors({});
    }
    // Always redirect to root page
    router.push('/');
  };

  const handleCancelImage = () => {
    setPreviewImage(null);
    setShowImagePreview(false);
    setIsImageCropped(false);
    setAccountFormData(prev => ({
      ...prev, 
      profileImage: user?.profileImage || null,
      password: '',
      confirmPassword: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddConnection = () => {
    // Add a new AI connection
    const newConnection: AIConnection = {
      id: `connection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      apiKey: '',
      apiProvider: providers.length > 0 ? providers[0].id : 'qwen-plus',
    };
    setAccountFormData(prev => ({
      ...prev,
      aiConnections: [...prev.aiConnections, newConnection]
    }));
  };

  const handleDeleteConnection = (connectionId: string) => {
    // Show delete confirmation dialog
    if (confirm('Are you sure you want to delete this AI connection?')) {
      // Perform the actual deletion
      setAccountFormData(prev => ({
        ...prev,
        aiConnections: prev.aiConnections.filter(conn => conn.id !== connectionId)
      }));
      // Clear any errors for this connection
      if (errors.aiConnections?.[connectionId]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          if (newErrors.aiConnections) {
            const connectionErrors = { ...newErrors.aiConnections };
            delete connectionErrors[connectionId];
            if (Object.keys(connectionErrors).length === 0) {
              delete newErrors.aiConnections;
            } else {
              newErrors.aiConnections = connectionErrors;
            }
          }
          return newErrors;
        });
      }
    }
  };

  const handleTestConnection = async (connectionId: string) => {
    // Test a specific AI connection
    const connection = accountFormData.aiConnections.find(conn => conn.id === connectionId);
    if (!connection || !connection.apiKey || !connection.apiProvider) {
      setMessage('Please enter API key and select provider before testing');
      setMessageType('error');
      return;
    }

    setIsTestingConnection(true);
    setMessage(null);
    setMessageType(null);
    
    try {
      const response = await axios.post('/api/test-ai-connection', {
        provider: connection.apiProvider,
        apiKey: connection.apiKey
      });
      
      if (response.data.success) {
        setMessage(`Connection test passed for ${connection.apiProvider}!`);
        setMessageType('success');
      } else {
        setMessage(`Connection test failed for ${connection.apiProvider}: ${response.data.error || 'Unknown error'}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`Connection test failed for ${connection.apiProvider}: ${(error as Error).message}`);
      setMessageType('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleCropImage = () => {
    // Simple cropping implementation - would use a library for production
    setShowImagePreview(false);
    setIsImageCropped(true);
    setMessage('Image cropped successfully');
    setMessageType('success');
  };

  const handleLogout = async () => {
    localStorage.removeItem('auth-token');
    router.push('/login');
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              {/* Profile Image */}
              <div className="w-20 h-20 rounded-md overflow-hidden">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Profile Preview"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : accountFormData.profileImage && typeof accountFormData.profileImage === 'string' ? (
                  <Image
                    src={accountFormData.profileImage}
                    alt="Profile Image"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xl font-medium">
                      {accountFormData.name ? accountFormData.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
                <p className="text-gray-600">Manage your account information and security</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white py-1 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 h-5 flex items-center"
            >
              Logout
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <p>{message}</p>
            </div>
          )}

          <form onSubmit={handleAccountSubmit} className="space-y-6">
              {/* Row 1: User Name, Email Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    User Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={accountFormData.name}
                    onChange={handleAccountInputChange}
                    className={`w-full px-4 py-1 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 h-5`}
                    placeholder="Enter your username"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={accountFormData.email}
                    onChange={handleAccountInputChange}
                    className={`w-full px-4 py-1 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 h-5`}
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>

              {/* Row 2: Password, Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={accountFormData.password}
                    onChange={handlePasswordInputChange}
                    className={`w-full px-4 py-1 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 h-5`}
                    placeholder="Enter new password (optional)"
                    autoComplete="new-password"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  <p className="mt-1 text-sm text-gray-500">Leaving empty will keep existing password</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={accountFormData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className={`w-full px-4 py-1 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 h-5`}
                    placeholder="Confirm new password (optional)"
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Row 3: AI Connections */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  AI Connections
                </label>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">

                  
                  {/* AI Connections List */}
                  {accountFormData.aiConnections.map((connection) => (
                    <div key={connection.id} className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          id={`apiKey-${connection.id}`}
                          name={`apiKey-${connection.id}`}
                          value={connection.apiKey}
                          onChange={handleAccountInputChange}
                          className={`w-full px-4 py-1 border ${errors.aiConnections?.[connection.id]?.apiKey ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 h-5`}
                          placeholder="Enter your API key"
                        />
                        {errors.aiConnections?.[connection.id]?.apiKey && <p className="mt-1 text-sm text-red-600">{errors.aiConnections[connection.id].apiKey}</p>}
                      </div>
                      <div className="sm:w-40">
                        <select
                          id={`apiProvider-${connection.id}`}
                          name={`apiProvider-${connection.id}`}
                          value={connection.apiProvider}
                          onChange={handleApiProviderChange}
                          className={`w-full px-4 py-1 border ${errors.aiConnections?.[connection.id]?.apiProvider ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 h-5`}
                        >
                          {providers.map((provider) => (
                            <option key={provider.id} value={provider.id}>
                              {provider.name}
                            </option>
                          ))}
                        </select>
                        {errors.aiConnections?.[connection.id]?.apiProvider && <p className="mt-1 text-sm text-red-600">{errors.aiConnections[connection.id].apiProvider}</p>}
                      </div>
                      <div className="sm:flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteConnection(connection.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors h-5 flex items-center justify-center"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTestConnection(connection.id)}
                          disabled={isTestingConnection || !connection.apiKey}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed h-5 flex items-center justify-center"
                        >
                          Test
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddConnection}
                  className="mt-4 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors h-5 flex items-center"
                >
                  Add New Connection
                </button>
              </div>

              {/* Row 5: Profile image */}
              <div>
                <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    accept="image/*"
                    onChange={handleAccountInputChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-900 h-10"
                  />
                  {accountFormData.profileImage && typeof accountFormData.profileImage === 'object' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAccountFormData(prev => ({ ...prev, profileImage: user?.profileImage || null }));
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors h-10 flex items-center"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">Max file size: 2MB</p>
                <p className="mt-1 text-sm text-gray-500">Leaving unchanged will keep existing image</p>
                {errors.profileImage && <p className="mt-1 text-sm text-red-600">{errors.profileImage}</p>}
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="flex-1 bg-blue-600 text-white py-1 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed h-5 flex items-center justify-center"
                >
                  {isUploading ? 'Uploading image...' : isSubmitting ? 'Updating...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting || isUploading}
                  className="flex-1 bg-gray-200 text-gray-700 py-1 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed h-5 flex items-center justify-center"
                >
                  Cancel
                </button>
              </div>
            </form>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p>© 2026 Wingman. All rights reserved.</p>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Crop Profile Image</h3>
            <div className="aspect-square relative mb-4">
              {previewImage && (
                <Image
                  src={previewImage}
                  alt="Preview"
                  width={300}
                  height={300}
                  className="w-full h-full object-cover rounded"
                />
              )}
              <div className="absolute inset-0 border-2 border-dashed border-blue-500 rounded"></div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCancelImage}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCropImage}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}