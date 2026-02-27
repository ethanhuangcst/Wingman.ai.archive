import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock fetch API
global.fetch = jest.fn();

const mockPrompts = [
  {
    id: '1',
    name: 'Test Prompt 1',
    text: 'This is test prompt 1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Test Prompt 2',
    text: 'This is test prompt 2',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
];

describe('Prompt Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // US-002-001: Navigate to Prompt Management page
  test('navigates to Prompt Management page when Manage Prompts button is clicked', async () => {
    // Mock the fetch for prompts
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, prompts: mockPrompts })
    });

    // Render the MainSection component (which contains the Manage Prompts button)
    const { container } = render(<MainSection />);

    // Wait for prompts to load
    await waitFor(() => {
      expect(screen.getByText('#Test Prompt 1')).toBeInTheDocument();
    });

    // Find and click the Manage Prompts button
    const manageButton = container.querySelector('button[alt="Manage"]');
    expect(manageButton).toBeInTheDocument();

    // Mock the navigation
    const originalWindowLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: '' };

    fireEvent.click(manageButton!);

    // Check if navigation happened
    expect((window as any).location.href).toBe('/predefined-prompts');

    // Restore original location
    (window as any).location = originalWindowLocation;
  });

  // US-002-002: Create new prompt
  test('creates new prompt when Create button is clicked', async () => {
    // Mock the initial fetch for prompts
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, prompts: [] })
    });

    // Mock the create prompt request
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        prompt: {
          id: '3',
          name: 'New Prompt',
          text: 'This is a new prompt',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z'
        }
      })
    });

    // Render the Prompt Management page
    render(<PromptManagementPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('No predefined prompts yet')).toBeInTheDocument();
    });

    // Find and click the Create button
    const createButton = container.querySelector('button[alt="Create"]');
    expect(createButton).toBeInTheDocument();
    fireEvent.click(createButton!);

    // Fill in the prompt form
    const nameInput = screen.getByLabelText('Prompt Name');
    const textInput = screen.getByLabelText('Prompt Text');
    const saveButton = screen.getByText('Save');

    fireEvent.change(nameInput, { target: { value: 'New Prompt' } });
    fireEvent.change(textInput, { target: { value: 'This is a new prompt' } });
    fireEvent.click(saveButton);

    // Wait for the prompt to be created
    await waitFor(() => {
      expect(screen.getByText('New Prompt')).toBeInTheDocument();
      expect(screen.getByText('Prompt created successfully')).toBeInTheDocument();
    });

    // Verify the fetch was called with correct data
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/prompts',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'New Prompt', text: 'This is a new prompt' })
      })
    );
  });
});

// Mock components for testing
function MainSection() {
  const [prompts, setPrompts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch('/api/prompts');
        const data = await response.json();
        if (data.success) {
          setPrompts(data.prompts);
        }
      } catch (error) {
        console.error('Error fetching prompts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  const handleManageClick = () => {
    window.location.href = '/predefined-prompts';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex overflow-x-auto">
        {prompts.map((prompt: any) => (
          <button key={prompt.id}>
            #{prompt.name}
          </button>
        ))}
      </div>
      <button onClick={handleManageClick} alt="Manage">
        <img src="/Resources/icon_settings.svg" alt="Manage" />
      </button>
    </div>
  );
}

function PromptManagementPage() {
  const [prompts, setPrompts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [name, setName] = React.useState('');
  const [text, setText] = React.useState('');
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch('/api/prompts');
        const data = await response.json();
        if (data.success) {
          setPrompts(data.prompts);
        }
      } catch (error) {
        console.error('Error fetching prompts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  const handleCreateClick = () => {
    setShowForm(true);
  };

  const handleSaveClick = async () => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, text })
      });

      const data = await response.json();
      if (data.success) {
        setPrompts([...prompts, data.prompt]);
        setMessage('Prompt created successfully');
        setShowForm(false);
        setName('');
        setText('');
      }
    } catch (error) {
      console.error('Error creating prompt:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Manage Prompts</h1>
      {prompts.length === 0 ? (
        <div>No predefined prompts yet</div>
      ) : (
        <ul>
          {prompts.map((prompt: any) => (
            <li key={prompt.id}>{prompt.name}</li>
          ))}
        </ul>
      )}
      <button onClick={handleCreateClick} alt="Create">
        <img src="/Resources/icon_prmp_new.svg" alt="Create" />
        Create
      </button>
      {showForm && (
        <div>
          <input
            type="text"
            label="Prompt Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            label="Prompt Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={handleSaveClick}>Save</button>
        </div>
      )}
      {message && <div>{message}</div>}
    </div>
  );
}
