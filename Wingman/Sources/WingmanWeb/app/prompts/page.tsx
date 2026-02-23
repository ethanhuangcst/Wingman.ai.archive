'use client';
import React, { useState, useEffect } from 'react';

interface Prompt {
  id: string;
  name: string;
  text: string;
  created_at: string;
  updated_at: string;
}

export default function PromptManagementPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt>({
    id: '',
    name: '',
    text: '',
    created_at: '',
    updated_at: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load prompts from API
  const loadPrompts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/prompts');
      if (response.ok) {
        const data = await response.json();
        if (data.prompts) {
          setPrompts(data.prompts);
        }
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
      setError('Failed to load prompts');
    } finally {
      setIsLoading(false);
    }
  };

  // Load prompts on component mount
  useEffect(() => {
    loadPrompts();
  }, []);

  // Open create prompt modal
  const handleCreateClick = () => {
    setCurrentPrompt({
      id: '',
      name: '',
      text: '',
      created_at: '',
      updated_at: ''
    });
    setIsCreating(true);
  };

  // Open edit prompt modal
  const handleEditClick = (prompt: Prompt) => {
    setCurrentPrompt({ ...prompt });
    setIsEditing(true);
  };

  // Close modal
  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setCurrentPrompt({
      id: '',
      name: '',
      text: '',
      created_at: '',
      updated_at: ''
    });
  };

  // Save prompt (create or update)
  const handleSave = async () => {
    if (!currentPrompt.name.trim() || !currentPrompt.text.trim()) {
      setError('Prompt name and text are required');
      return;
    }

    try {
      let response;
      if (isCreating) {
        // Create new prompt
        response = await fetch('/api/prompts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: currentPrompt.name.trim(),
            text: currentPrompt.text.trim()
          }),
        });
      } else {
        // Update existing prompt
        response = await fetch('/api/prompts', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: currentPrompt.id,
            name: currentPrompt.name.trim(),
            text: currentPrompt.text.trim()
          }),
        });
      }

      if (response.ok) {
        setSuccessMessage(isCreating ? 'Prompt created successfully' : 'Prompt updated successfully');
        setIsCreating(false);
        setIsEditing(false);
        await loadPrompts();
        
        // Clear success message after 1 second
        setTimeout(() => {
          setSuccessMessage(null);
        }, 1000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to save prompt');
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      setError('Failed to save prompt');
    }
  };

  // Delete prompt
  const handleDelete = async (promptId: string) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      try {
        const response = await fetch('/api/prompts', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: promptId }),
        });

        if (response.ok) {
          setSuccessMessage('Prompt deleted successfully');
          await loadPrompts();
          
          // Clear success message after 1 second
          setTimeout(() => {
            setSuccessMessage(null);
          }, 1000);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.error || 'Failed to delete prompt');
        }
      } catch (error) {
        console.error('Error deleting prompt:', error);
        setError('Failed to delete prompt');
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <button
              onClick={() => window.location.href = '/wingman-panel'}
              className="mr-4 bg-transparent p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Back to Wingman Panel"
            >
              <img src="/Resources/icon_return.svg" alt="Back" className="w-[20px] h-[20px]" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Edit your prompts</h1>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Prompts List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading prompts...</div>
            </div>
          ) : prompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-gray-500 mb-4">No prompts found</div>
              <button
                onClick={handleCreateClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create your first prompt
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {prompts.map((prompt) => (
                <div key={prompt.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{prompt.name}</h3>
                      <span className="text-xs text-gray-500">{formatDate(prompt.updated_at)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{prompt.text}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(prompt)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg"
                      aria-label="Edit prompt"
                    >
                      <img src="/Resources/icon_prmp_edit.svg" alt="Edit" className="w-[20px] h-[20px]" />
                    </button>
                    <button
                      onClick={() => handleDelete(prompt.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg"
                      aria-label="Delete prompt"
                    >
                      <img src="/Resources/icon_prmp_delete.svg" alt="Delete" className="w-[20px] h-[20px]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Button */}
        <div className="flex justify-end">
          <button
            onClick={handleCreateClick}
            className="p-2 bg-transparent hover:bg-gray-100 rounded-lg"
            aria-label="Create new prompt"
          >
            <img src="/Resources/icon_prmp_new.svg" alt="Create" className="w-[20px] h-[20px]" />
          </button>
        </div>

        {/* Create/Edit Modal */}
        {(isCreating || isEditing) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {isCreating ? 'Create New Prompt' : 'Edit Prompt'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Name</label>
                  <input
                    type="text"
                    value={currentPrompt.name}
                    onChange={(e) => setCurrentPrompt({ ...currentPrompt, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter prompt name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Text</label>
                  <textarea
                    value={currentPrompt.text}
                    onChange={(e) => setCurrentPrompt({ ...currentPrompt, text: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
                    placeholder="Enter prompt text"
                  />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!currentPrompt.name.trim() || !currentPrompt.text.trim()}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${(!currentPrompt.name.trim() || !currentPrompt.text.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
