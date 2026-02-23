'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';

interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  apiKey: string;
  apiProvider: string;
  profileImage: File | null;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  apiKey?: string;
  apiProvider?: string;
  profileImage?: string;
}

export default function RegistrationPage() {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    apiKey: '',
    apiProvider: 'qwen-plus',
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
          { id: 'qwen-plus', name: 'qwen-plus' },
          { id: 'gpt-5.2-all', name: 'gpt-5.2-all' }
        ]);
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
    
    if (!formData.apiKey.trim()) {
      newErrors.apiKey = 'API Key is required';
    }
    
    if (!formData.apiProvider) {
      newErrors.apiProvider = 'API Provider is required';
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
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ValidationErrors];
        return newErrors;
      });
    }
  };

  const handleApiProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, apiProvider: value }));
    
    // Clear error when user selects a provider
    if (errors.apiProvider) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.apiProvider;
        return newErrors;
      });
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
      formDataToSend.append('apiKey', formData.apiKey);
      formDataToSend.append('apiProvider', formData.apiProvider);
      
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

  const handleApiTest = async () => {
    if (!formData.apiKey || !formData.apiProvider) {
      setMessage('Please enter API Key and select Provider before testing');
      setMessageType('error');
      return;
    }

    try {
      setMessage('Testing API connection...');
      setMessageType(null);
      
      const response = await axios.post('/api/test-ai-connection', {
        provider: formData.apiProvider,
        apiKey: formData.apiKey
      });
      
      if (response.data.success) {
        setMessage('API connection test successful!');
        setMessageType('success');
      } else {
        setMessage(`API connection test failed: ${response.data.error || 'Unknown error'}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`Error testing API connection: ${(error as Error).message}`);
      setMessageType('error');
    }
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
                className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900`}
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
                className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900`}
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
                className={`w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900`}
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
                className={`w-full px-4 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Row 3: API Key, Provider selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                API Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="apiKey"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${errors.apiKey ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900`}
                placeholder="Enter your API key"
              />
              {errors.apiKey && <p className="mt-1 text-sm text-red-600">{errors.apiKey}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider Selection <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {providers.map((provider) => (
                  <div key={provider.id} className="flex items-center">
                    <input
                      type="radio"
                      id={`provider-${provider.id}`}
                      name="apiProvider"
                      value={provider.id}
                      checked={formData.apiProvider === provider.id}
                      onChange={handleApiProviderChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor={`provider-${provider.id}`} className="ml-2 block text-sm text-gray-700">
                      {provider.name}
                    </label>
                  </div>
                ))}
              </div>
              {errors.apiProvider && <p className="mt-1 text-sm text-red-600">{errors.apiProvider}</p>}
            </div>
          </div>

          {/* Row 4: API Test button */}
          <div>
            <button
              type="button"
              onClick={handleApiTest}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              API Test
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
