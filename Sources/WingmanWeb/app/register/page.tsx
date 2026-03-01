'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';

interface AIConnection {
  id: string;
  apiKey: string;
  apiProvider: string;
}

interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  aiConnections: AIConnection[];
  profileImage: File | null;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  aiConnections?: { [key: string]: { apiKey?: string; apiProvider?: string } };
  profileImage?: string;
}

export default function RegistrationPage() {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    aiConnections: [],
    profileImage: null
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isImageCropped, setIsImageCropped] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
            const providerList = data.providers.map((provider: any) => ({
              id: provider.id,
              name: provider.name
            }));
            setProviders(providerList);
            
            // Initialize with one empty connection using the first provider

          }
        }
      } catch (error) {
        console.error('Error loading providers:', error);
        // Fallback to default providers if loading fails
        const defaultProviders = [
          { id: 'qwen-plus', name: 'qwen-plus' },
          { id: 'gpt-5.2-all', name: 'gpt-5.2-all' }
        ];
        setProviders(defaultProviders);
      }
    };

    loadProviders();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Validate required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate AI connections
    const connectionErrors: { [key: string]: { apiKey?: string; apiProvider?: string } } = {};
    const connectionCombinations = new Set<string>();
    
    formData.aiConnections.forEach((connection) => {
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
    if (formData.profileImage) {
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (formData.profileImage.size > maxSize) {
        newErrors.profileImage = 'File size must be less than 2MB';
      }
      
      if (!formData.profileImage.type.startsWith('image/')) {
        newErrors.profileImage = 'File must be an image';
      }
      
      if (!isImageCropped) {
        newErrors.profileImage = 'Please crop the profile image before submitting';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      setFormData(prev => ({ ...prev, profileImage: file }));
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
      setFormData(prev => {
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
      setFormData(prev => ({ ...prev, [name]: value }));
      
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
      setFormData(prev => {
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

  const handleAddConnection = () => {
    // Add a new AI connection
    const newConnection: AIConnection = {
      id: `connection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      apiKey: '',
      apiProvider: providers.length > 0 ? providers[0].id : 'qwen-plus',
    };
    setFormData(prev => ({
      ...prev,
      aiConnections: [...prev.aiConnections, newConnection]
    }));
  };

  const handleDeleteConnection = (connectionId: string) => {
    // Show delete confirmation dialog
    if (confirm('Are you sure you want to delete this AI connection?')) {
      // Perform the actual deletion
      setFormData(prev => ({
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
    const connection = formData.aiConnections.find(conn => conn.id === connectionId);
    if (!connection || !connection.apiKey || !connection.apiProvider) {
      setMessage('Please enter API key and select provider before testing');
      setMessageType('error');
      return;
    }

    setMessage('Testing API connection...');
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setIsUploading(true);
    setMessage(null);
    setMessageType(null);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('aiConnections', JSON.stringify(formData.aiConnections));
      
      if (formData.profileImage) {
        formDataToSend.append('profileImage', formData.profileImage);
      }
      
      await axios.post('/api/register', formDataToSend);
      
      setMessage('Registration successful! Redirecting to login page...');
      setMessageType('success');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
    } catch (error) {
      setMessage((error as { response?: { data?: { error?: string } }}).response?.data?.error || 'Registration failed. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleCancelImage = () => {
    setPreviewImage(null);
    setShowImagePreview(false);
    setIsImageCropped(false);
    setFormData(prev => ({ ...prev, profileImage: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropImage = () => {
    // Simple cropping implementation - would use a library for production
    setShowImagePreview(false);
    setIsImageCropped(true);
    setMessage('Image cropped successfully');
    setMessageType('success');
  };



  return (
    <div className="page-container bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an Account</h1>
          <p className="text-gray-600">Join Wingman and start using AI assistance</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <p>{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                value={formData.name}
                onChange={handleInputChange}
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
                value={formData.email}
                onChange={handleInputChange}
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
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-1 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 h-5`}
                placeholder="Create a password"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-1 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 h-5`}
                placeholder="Confirm your password"
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
              {formData.aiConnections.map((connection) => (
                <div key={connection.id} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      id={`apiKey-${connection.id}`}
                      name={`apiKey-${connection.id}`}
                      value={connection.apiKey}
                      onChange={handleInputChange}
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
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors h-5 flex items-center justify-center"
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
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-900"
              />
              {formData.profileImage && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, profileImage: null }));
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">Max file size: 2MB</p>
            {errors.profileImage && <p className="mt-1 text-sm text-red-600">{errors.profileImage}</p>}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading image...' : isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign in
              </a>
            </p>
          </div>
        </form>
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
