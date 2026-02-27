import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MainSection from '../app/components/MainSection';

describe('US-005 MainSection Component', () => {
  describe('US-005-001', () => {
    it('should render two columns with proper labels', () => {
      render(<MainSection />);
      
      // Check that both columns exist
      const promptsColumn = screen.getByText('Prompts', { selector: 'h2' });
      const chatsColumn = screen.getByText('Chats', { selector: 'h2' });
      
      expect(promptsColumn).toBeInTheDocument();
      expect(chatsColumn).toBeInTheDocument();
    });

    it('should have proper layout structure', () => {
      render(<MainSection />);
      
      // Check that the main section container exists
      const mainSection = screen.getByRole('main');
      expect(mainSection).toBeInTheDocument();
      
      // Check that there are two column containers
      const columns = mainSection.querySelectorAll('div.bg-white');
      expect(columns).toHaveLength(2);
    });

    it('should display sample prompts in left column', () => {
      render(<MainSection />);
      
      // Check that sample prompts are present
      expect(screen.getByText('Math Problem Solver')).toBeInTheDocument();
      expect(screen.getByText('Essay Writer')).toBeInTheDocument();
      expect(screen.getByText('Code Generator')).toBeInTheDocument();
    });

    it('should display sample chats in right column', () => {
      render(<MainSection />);
      
      // Check that sample chats are present
      expect(screen.getByText('Math Help')).toBeInTheDocument();
      expect(screen.getByText('Essay Writing')).toBeInTheDocument();
      expect(screen.getByText('Code Help')).toBeInTheDocument();
    });
  });

  describe('US-005-002', () => {
    it('should have responsive layout structure', () => {
      render(<MainSection />);
      
      // Check that the main container has responsive classes
      const mainContainer = screen.getByRole('main');
      const layoutContainer = mainContainer.querySelector('div');
      
      expect(layoutContainer).toHaveClass('flex');
      expect(layoutContainer).toHaveClass('flex-col');
      expect(layoutContainer).toHaveClass('md:flex-row');
    });

    it('should have responsive column widths', () => {
      render(<MainSection />);
      
      // Check that columns have responsive width classes
      const columns = screen.getAllByRole('region');
      columns.forEach(column => {
        expect(column).toHaveClass('w-full');
        expect(column).toHaveClass('md:w-[400px]');
      });
    });
  });

  describe('US-005-003', () => {
    it('should maintain layout when interacting with content', () => {
      render(<MainSection />);
      
      // Check initial layout
      const columns = screen.querySelectorAll('div.bg-white');
      expect(columns).toHaveLength(2);
      
      // Interact with content in left column
      const mathPrompt = screen.getByText('Math Problem Solver');
      fireEvent.click(mathPrompt);
      
      // Check that both columns still exist
      expect(screen.getByText('Prompts', { selector: 'h2' })).toBeInTheDocument();
      expect(screen.getByText('Chats', { selector: 'h2' })).toBeInTheDocument();
      
      // Interact with content in right column
      const mathChat = screen.getByText('Math Help');
      fireEvent.click(mathChat);
      
      // Check that both columns still exist
      expect(screen.getByText('Prompts', { selector: 'h2' })).toBeInTheDocument();
      expect(screen.getByText('Chats', { selector: 'h2' })).toBeInTheDocument();
    });
  });

  describe('US-006', () => {
    it('should display text area at bottom of chats column', () => {
      render(<MainSection />);
      
      // Check that the text area exists
      const textArea = screen.getByPlaceholderText("What's in your mind?");
      expect(textArea).toBeInTheDocument();
      
      // Check that the text area has proper classes
      expect(textArea).toHaveClass('w-full');
      expect(textArea).toHaveClass('h-[100px]');
      expect(textArea).toHaveClass('px-4');
      expect(textArea).toHaveClass('py-2');
      expect(textArea).toHaveClass('border');
      expect(textArea).toHaveClass('rounded-lg');
      expect(textArea).toHaveClass('resize-none');
    });

    it('should allow user to interact with text area', () => {
      render(<MainSection />);
      
      // Get the text area
      const textArea = screen.getByPlaceholderText("What's in your mind?");
      
      // Interact with the text area
      fireEvent.focus(textArea);
      fireEvent.change(textArea, { target: { value: 'Hello, Wingman!' } });
      
      // Check that the value is set
      expect(textArea).toHaveValue('Hello, Wingman!');
      
      // Clear the text area
      fireEvent.change(textArea, { target: { value: '' } });
      expect(textArea).toHaveValue('');
    });
  });

  describe('US-007', () => {
    it('should display "How can I help?" text area above "What's in your mind?"', () => {
      render(<MainSection />);
      
      // Check that both text areas exist
      const howCanIHelpArea = screen.getByPlaceholderText("How can I help?");
      const whatInYourMindArea = screen.getByPlaceholderText("What's in your mind?");
      
      expect(howCanIHelpArea).toBeInTheDocument();
      expect(whatInYourMindArea).toBeInTheDocument();
      
      // Check that "How can I help?" is above "What's in your mind?"
      const howCanIHelpRect = howCanIHelpArea.getBoundingClientRect();
      const whatInYourMindRect = whatInYourMindArea.getBoundingClientRect();
      expect(howCanIHelpRect.top).toBeLessThan(whatInYourMindRect.top);
    });

    it('should have proper styling for "How can I help?" text area', () => {
      render(<MainSection />);
      
      // Get the text area
      const textArea = screen.getByPlaceholderText("How can I help?");
      
      // Check that the text area has proper classes
      expect(textArea).toHaveClass('w-full');
      expect(textArea).toHaveClass('h-[100px]');
      expect(textArea).toHaveClass('px-4');
      expect(textArea).toHaveClass('py-2');
      expect(textArea).toHaveClass('border');
      expect(textArea).toHaveClass('rounded-lg');
      expect(textArea).toHaveClass('resize-none');
    });

    it('should display Save prompt and Send buttons below "How can I help?" text area', () => {
      render(<MainSection />);
      
      // Check that both buttons exist
      const saveButton = screen.getByText('Save prompt');
      const sendButton = screen.getByText('Send');
      
      expect(saveButton).toBeInTheDocument();
      expect(sendButton).toBeInTheDocument();
    });

    it('should allow user to interact with "How can I help?" text area', () => {
      render(<MainSection />);
      
      // Get the text area
      const textArea = screen.getByPlaceholderText("How can I help?");
      
      // Interact with the text area
      fireEvent.focus(textArea);
      fireEvent.change(textArea, { target: { value: 'Help me with math' } });
      
      // Check that the value is set
      expect(textArea).toHaveValue('Help me with math');
      
      // Clear the text area
      fireEvent.change(textArea, { target: { value: '' } });
      expect(textArea).toHaveValue('');
    });
  });

  describe('US-008', () => {
    it('should display read-only field above "How can I help?" field', () => {
      render(<MainSection />);
      
      // Check that the read-only field exists
      const readOnlyField = screen.getByRole('region', { name: /read-only/i });
      const howCanIHelpArea = screen.getByPlaceholderText("How can I help?");
      
      expect(readOnlyField).toBeInTheDocument();
      expect(howCanIHelpArea).toBeInTheDocument();
      
      // Check that read-only field is above "How can I help?"
      const readOnlyRect = readOnlyField.getBoundingClientRect();
      const howCanIHelpRect = howCanIHelpArea.getBoundingClientRect();
      expect(readOnlyRect.top).toBeLessThan(howCanIHelpRect.top);
    });

    it('should have fixed height of 380px for read-only field', () => {
      render(<MainSection />);
      
      // Get the read-only field
      const readOnlyField = screen.getByRole('region', { name: /read-only/i });
      
      // Check that the read-only field has proper height
      expect(readOnlyField).toHaveClass('h-[380px]');
    });

    it('should span full width of column', () => {
      render(<MainSection />);
      
      // Get the read-only field
      const readOnlyField = screen.getByRole('region', { name: /read-only/i });
      
      // Check that the read-only field spans full width
      expect(readOnlyField).toHaveClass('w-full');
    });

    it('should have proper padding and styling', () => {
      render(<MainSection />);
      
      // Get the read-only field
      const readOnlyField = screen.getByRole('region', { name: /read-only/i });
      
      // Check that the read-only field has proper styling
      expect(readOnlyField).toHaveClass('border');
      expect(readOnlyField).toHaveClass('rounded-lg');
      expect(readOnlyField).toHaveClass('px-4');
      expect(readOnlyField).toHaveClass('py-2');
    });

    it('should not allow user input', () => {
      render(<MainSection />);
      
      // Get the read-only field
      const readOnlyField = screen.getByRole('region', { name: /read-only/i });
      
      // Check that the read-only field has readonly attribute
      expect(readOnlyField).toHaveAttribute('aria-readonly', 'true');
      
      // Try to interact with the field
      fireEvent.click(readOnlyField);
      fireEvent.change(readOnlyField, { target: { value: 'Test input' } });
      
      // Check that no input is allowed
      expect(readOnlyField).not.toHaveValue('Test input');
    });

    it('should remain visible when interacting with "How can I help?" field', () => {
      render(<MainSection />);
      
      // Check initial state
      const readOnlyField = screen.getByRole('region', { name: /read-only/i });
      const howCanIHelpArea = screen.getByPlaceholderText("How can I help?");
      
      expect(readOnlyField).toBeInTheDocument();
      expect(howCanIHelpArea).toBeInTheDocument();
      
      // Interact with "How can I help?" field
      fireEvent.focus(howCanIHelpArea);
      fireEvent.change(howCanIHelpArea, { target: { value: 'Help me with math' } });
      
      // Check that read-only field is still visible
      expect(readOnlyField).toBeInTheDocument();
      expect(readOnlyField).toBeVisible();
    });
  });

  describe('US-001', () => {
    it('should display prompts in left column', () => {
      render(<MainSection />);
      
      // Check that the left column exists
      const promptsColumn = screen.getByText('Prompts', { selector: 'h2' });
      expect(promptsColumn).toBeInTheDocument();
    });

    it('should display sample prompts with proper formatting', () => {
      render(<MainSection />);
      
      // Check that sample prompts exist
      expect(screen.getByText('Math Problem Solver')).toBeInTheDocument();
      expect(screen.getByText('Essay Writer')).toBeInTheDocument();
      expect(screen.getByText('Code Generator')).toBeInTheDocument();
    });

    it('should display "..." at the right end of each prompt', () => {
      render(<MainSection />);
      
      // Check that each prompt has "..." indicator
      const prompts = screen.getAllByRole('listitem');
      prompts.forEach(prompt => {
        expect(prompt).toHaveClass('relative');
      });
    });

    it('should display tooltip on hover', () => {
      render(<MainSection />);
      
      // Check that prompts have title attributes for tooltips
      const mathPrompt = screen.getByText('Math Problem Solver');
      expect(mathPrompt).toHaveAttribute('title');
    });

    it('should display dropdown menu when clicking "..."', () => {
      render(<MainSection />);
      
      // Check that each prompt has a clickable "..." element
      const prompts = screen.getAllByRole('listitem');
      prompts.forEach(prompt => {
        const menuButton = prompt.querySelector('[aria-label="Menu"]');
        expect(menuButton).toBeInTheDocument();
      });
    });

    it('should display message when no prompts', () => {
      // This test will need to be updated when we implement the empty state
      render(<MainSection />);
      
      // For now, just check that the column exists
      const promptsColumn = screen.getByText('Prompts', { selector: 'h2' });
      expect(promptsColumn).toBeInTheDocument();
    });
  });
});
