"use client";
import React, { useState, useEffect } from 'react';

interface Prompt {
  id: string;
  name: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export default function PredefinedPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  // Fetch prompts from database
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/prompts');
        const data = await response.json();
        
        if (data.success) {
          // Sort prompts by updated_datetime, newest first
          const sortedPrompts = [...data.prompts].sort((a, b) => {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });
          setPrompts(sortedPrompts);
        } else if (response.status === 401) {
          // Redirect to login if not authenticated
          window.location.href = '/login';
        } else {
          setError('Failed to fetch prompts');
        }
      } catch (err) {
        setError('An error occurred while fetching prompts');
        console.error('Error fetching prompts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  // Handle create prompt
  const handleCreateClick = () => {
    setEditingPrompt(null);
    setName('');
    setText('');
    setShowForm(true);
  };

  // Handle edit prompt
  const handleEditClick = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setName(prompt.name);
    setText(prompt.text);
    setShowForm(true);
  };

  // Handle save prompt
  const handleSaveClick = async () => {
    try {
      const endpoint = editingPrompt ? '/api/prompts' : '/api/prompts';
      const method = editingPrompt ? 'PUT' : 'POST';
      const body = editingPrompt 
        ? JSON.stringify({ id: editingPrompt.id, name, text })
        : JSON.stringify({ name, text });

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });

      const data = await response.json();
      if (data.success) {
        if (editingPrompt) {
          // Update existing prompt
          const updatedPrompt = {
            ...editingPrompt,
            name: name.trim(),
            text: text.trim(),
            updatedAt: new Date().toISOString()
          };
          setPrompts(prompts.map(prompt => 
            prompt.id === editingPrompt.id ? updatedPrompt : prompt
          ));
          setMessage('Prompt updated successfully');
        } else {
          // Add new prompt
          setPrompts(prevPrompts => [data.prompt, ...prevPrompts]);
          setMessage('Prompt created successfully');
        }
        setShowForm(false);
        setEditingPrompt(null);
        setName('');
        setText('');
      } else {
        setError('Failed to save prompt');
      }
    } catch (err) {
      setError('An error occurred while saving prompt');
      console.error('Error saving prompt:', err);
    }
  };

  // Handle delete prompt
  const handleDeleteClick = async (promptId: string) => {
    console.log('handleDeleteClick called with id:', promptId);
    console.log('About to call confirm()');
    const confirmed = confirm('Are you sure you want to delete this prompt?');
    console.log('confirm() returned:', confirmed);
    
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch('/api/prompts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: promptId }),
      });

      const data = await response.json();
      if (data.success) {
        // Remove prompt from list
        setPrompts(prompts.filter(prompt => prompt.id !== promptId));
        setMessage('Prompt deleted successfully');
        // Close the form and reset states
        setShowForm(false);
        setEditingPrompt(null);
        setName('');
        setText('');
      } else {
        setError('Failed to delete prompt');
      }
    } catch (err) {
      setError('An error occurred while deleting prompt');
      console.error('Error deleting prompt:', err);
    }
  };

  // Handle cancel
  const handleCancelClick = () => {
    setShowForm(false);
    setEditingPrompt(null);
    setName('');
    setText('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Edit your prompts</h1>
          <button
            onClick={() => window.location.href = '/wingman-panel'}
            className="w-10 h-10 bg-transparent text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
            aria-label="Return to wingman panel"
          >
            <img src="/Resources/icon_return.svg" alt="Return" className="w-[20px] h-[20px]" />
          </button>
        </header>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
            {message}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading prompts...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : (
          <>
            {/* Prompts List */}
            <div className="mb-8">
              {prompts.length === 0 ? (
                <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
                  No predefined prompts yet. Click the "Create" button below to add your first prompt.
                </div>
              ) : (
                <ul className="space-y-4">
                  {prompts.map((prompt) => (
                    <li 
                      key={prompt.id} 
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors h-[50px] relative"
                    >
                      <div className="flex items-center justify-between w-full">
                        <h3 
                          className="font-medium text-gray-900 relative group"
                        >
                          {prompt.name}
                          <div className="absolute left-0 top-full mt-2 z-10 w-[1000px] max-h-96 p-3 bg-gray-900 text-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 delay-200 whitespace-pre-wrap overflow-y-auto">
                            {prompt.text}
                          </div>
                        </h3>
                        <p className="text-sm text-gray-500 ml-4">
                          {new Date(prompt.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEditClick(prompt)}
                        className="ml-4 p-2 bg-transparent text-gray-700 rounded hover:bg-gray-100 transition-colors"
                        aria-label="Edit prompt"
                      >
                        <img src="/Resources/icon_prmp_edit.svg" alt="Edit" className="w-[20px] h-[20px]" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Create/Edit Floating Frame */}
            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prompt Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter prompt name"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prompt Text
                      </label>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter prompt text"
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleCancelClick}
                        className="w-10 h-10 bg-transparent text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center p-0"
                        aria-label="Cancel"
                      >
                        <img src="/Resources/icon_cancel.svg" alt="Cancel" className="w-[20px] h-[20px]" />
                      </button>
                      {editingPrompt && (
                        <button
                          onClick={() => handleDeleteClick(editingPrompt.id)}
                          className="w-10 h-10 bg-transparent text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center p-0"
                          aria-label="Delete"
                        >
                          <img src="/Resources/icon_prmp_delete.svg" alt="Delete" className="w-[20px] h-[20px]" />
                        </button>
                      )}
                      <button
                        onClick={handleSaveClick}
                        className="w-10 h-10 bg-transparent text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center p-0"
                        disabled={!name.trim() || !text.trim()}
                        aria-label="Save"
                      >
                        <img src="/Resources/icon_update.svg" alt="Save" className="w-[20px] h-[20px]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Create Button */}
            <div className="flex justify-end">
              <button
                onClick={handleCreateClick}
                className="w-10 h-10 bg-transparent text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                aria-label="Create new prompt"
              >
                <img src="/Resources/icon_prmp_new.svg" alt="Create" className="w-[20px] h-[20px]" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
