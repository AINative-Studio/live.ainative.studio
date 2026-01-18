import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StreamSetupForm } from '../stream-setup-form';

describe('StreamSetupForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/stream title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save configuration/i })).toBeInTheDocument();
    });

    it('should render with initial data', () => {
      const initialData = {
        title: 'Test Stream',
        description: 'Test Description',
        categoryId: 'cat1',
        tags: ['react', 'typescript'],
      };

      render(<StreamSetupForm initialData={initialData} onSubmit={mockOnSubmit} />);

      expect(screen.getByDisplayValue('Test Stream')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('typescript')).toBeInTheDocument();
    });

    it('should show required field indicators', () => {
      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      const requiredLabels = screen.getAllByText('*');
      expect(requiredLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Validation', () => {
    it('should show error when title is empty', async () => {
      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /save configuration/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when title is too short', async () => {
      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByLabelText(/stream title/i);
      await userEvent.type(titleInput, 'ab');

      const submitButton = screen.getByRole('button', { name: /save configuration/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when title is too long', async () => {
      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByLabelText(/stream title/i);
      const longTitle = 'a'.repeat(101);
      await userEvent.type(titleInput, longTitle);

      const submitButton = screen.getByRole('button', { name: /save configuration/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Title must be less than 100 characters')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when category is not selected', async () => {
      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByLabelText(/stream title/i);
      await userEvent.type(titleInput, 'Valid Title');

      const submitButton = screen.getByRole('button', { name: /save configuration/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Category is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should clear validation errors when field is corrected', async () => {
      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByLabelText(/stream title/i);
      const submitButton = screen.getByRole('button', { name: /save configuration/i });

      // Trigger validation error
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });

      // Fix the error
      await userEvent.type(titleInput, 'Valid Title');

      // Error should be cleared
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });
  });

  describe('Tags Management', () => {
    it('should add a tag when plus button is clicked', async () => {
      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      const tagInput = screen.getByLabelText(/tags/i);
      await userEvent.type(tagInput, 'react');

      const addButtons = screen.getAllByRole('button');
      const addButton = addButtons.find(btn => btn.querySelector('[class*="lucide-plus"]'));
      if (addButton) {
        fireEvent.click(addButton);
      }

      expect(screen.getByText('react')).toBeInTheDocument();
      expect(tagInput).toHaveValue('');
    });

    it('should add a tag when Enter key is pressed', async () => {
      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      const tagInput = screen.getByLabelText(/tags/i);
      await userEvent.type(tagInput, 'typescript{Enter}');

      expect(screen.getByText('typescript')).toBeInTheDocument();
      expect(tagInput).toHaveValue('');
    });

    it('should remove a tag when X button is clicked', async () => {
      const initialData = {
        title: 'Test',
        tags: ['react', 'typescript'],
      };

      render(<StreamSetupForm initialData={initialData} onSubmit={mockOnSubmit} />);

      const reactTag = screen.getByText('react').closest('div');
      const removeButton = reactTag?.querySelector('button');

      if (removeButton) {
        fireEvent.click(removeButton);
      }

      expect(screen.queryByText('react')).not.toBeInTheDocument();
      expect(screen.getByText('typescript')).toBeInTheDocument();
    });

    it('should prevent adding more than 5 tags', async () => {
      const initialData = {
        title: 'Test',
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
      };

      render(<StreamSetupForm initialData={initialData} onSubmit={mockOnSubmit} />);

      const tagInput = screen.getByLabelText(/tags/i);
      expect(tagInput).toBeDisabled();

      const addButtons = screen.getAllByRole('button');
      const addButton = addButtons.find(btn => btn.querySelector('[class*="lucide-plus"]'));
      expect(addButton).toBeDisabled();
    });

    it('should show error when trying to add duplicate tag', async () => {
      const initialData = {
        title: 'Test',
        tags: ['react'],
      };

      render(<StreamSetupForm initialData={initialData} onSubmit={mockOnSubmit} />);

      const tagInput = screen.getByLabelText(/tags/i);
      await userEvent.type(tagInput, 'React');

      const addButtons = screen.getAllByRole('button');
      const addButton = addButtons.find(btn => btn.querySelector('[class*="lucide-plus"]'));
      if (addButton) {
        fireEvent.click(addButton);
      }

      expect(screen.getByText('Tag already added')).toBeInTheDocument();
    });

    it('should not add empty tags', async () => {
      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      const tagInput = screen.getByLabelText(/tags/i);
      await userEvent.type(tagInput, '   ');

      const addButtons = screen.getAllByRole('button');
      const addButton = addButtons.find(btn => btn.querySelector('[class*="lucide-plus"]'));
      if (addButton) {
        fireEvent.click(addButton);
      }

      // Check no tags were added by looking for tag text
      const badges = document.querySelectorAll('[class*="badge"]');
      expect(badges).toHaveLength(0);
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      mockOnSubmit.mockResolvedValueOnce(undefined);

      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByLabelText(/stream title/i);
      await userEvent.type(titleInput, 'My Stream Title');

      const descriptionInput = screen.getByLabelText(/description/i);
      await userEvent.type(descriptionInput, 'Stream description');

      // Select category
      const categorySelect = screen.getByRole('combobox');
      await userEvent.click(categorySelect);

      const categoryOptions = await screen.findAllByText('AI Coding');
      await userEvent.click(categoryOptions[categoryOptions.length - 1]);

      const submitButton = screen.getByRole('button', { name: /save configuration/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'My Stream Title',
          description: 'Stream description',
          categoryId: '1',
          tags: undefined,
        });
      });
    });

    it('should submit form with tags', async () => {
      mockOnSubmit.mockResolvedValueOnce(undefined);

      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByLabelText(/stream title/i);
      await userEvent.type(titleInput, 'My Stream Title');

      // Select category
      const categorySelect = screen.getByRole('combobox');
      await userEvent.click(categorySelect);

      const categoryOptions = await screen.findAllByText('AI Coding');
      await userEvent.click(categoryOptions[categoryOptions.length - 1]);

      // Add tags
      const tagInput = screen.getByLabelText(/tags/i);
      await userEvent.type(tagInput, 'react{Enter}');
      await userEvent.type(tagInput, 'typescript{Enter}');

      const submitButton = screen.getByRole('button', { name: /save configuration/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'My Stream Title',
          description: undefined,
          categoryId: '1',
          tags: ['react', 'typescript'],
        });
      });
    });

    it('should show loading state during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByLabelText(/stream title/i);
      await userEvent.type(titleInput, 'My Stream Title');

      // Select category
      const categorySelect = screen.getByRole('combobox');
      await userEvent.click(categorySelect);

      const categoryOptions = await screen.findAllByText('AI Coding');
      await userEvent.click(categoryOptions[categoryOptions.length - 1]);

      const submitButton = screen.getByRole('button', { name: /save configuration/i });
      await userEvent.click(submitButton);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Save Configuration')).toBeInTheDocument();
      });
    });

    it('should display error when submission fails', async () => {
      const errorMessage = 'Network error occurred';
      mockOnSubmit.mockRejectedValueOnce(new Error(errorMessage));

      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByLabelText(/stream title/i);
      await userEvent.type(titleInput, 'My Stream Title');

      // Select category
      const categorySelect = screen.getByRole('combobox');
      await userEvent.click(categorySelect);

      const categoryOptions = await screen.findAllByText('AI Coding');
      await userEvent.click(categoryOptions[categoryOptions.length - 1]);

      const submitButton = screen.getByRole('button', { name: /save configuration/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Error saving stream configuration')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      // Error icon should be visible
      const errorIcon = document.querySelector('[class*="text-destructive"]');
      expect(errorIcon).toBeInTheDocument();
    });

    it('should display generic error when error is not an Error instance', async () => {
      mockOnSubmit.mockRejectedValueOnce('Unknown error');

      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByLabelText(/stream title/i);
      await userEvent.type(titleInput, 'My Stream Title');

      // Select category
      const categorySelect = screen.getByRole('combobox');
      await userEvent.click(categorySelect);

      const categoryOptions = await screen.findAllByText('AI Coding');
      await userEvent.click(categoryOptions[categoryOptions.length - 1]);

      const submitButton = screen.getByRole('button', { name: /save configuration/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to save stream configuration. Please try again.')).toBeInTheDocument();
      });
    });

    it('should clear previous error on new submission attempt', async () => {
      mockOnSubmit.mockRejectedValueOnce(new Error('First error'));

      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByLabelText(/stream title/i);
      await userEvent.type(titleInput, 'My Stream Title');

      // Select category
      const categorySelect = screen.getByRole('combobox');
      await userEvent.click(categorySelect);

      const categoryOptions = await screen.findAllByText('AI Coding');
      await userEvent.click(categoryOptions[categoryOptions.length - 1]);

      const submitButton = screen.getByRole('button', { name: /save configuration/i });

      // First submission
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second submission should clear the error
      mockOnSubmit.mockResolvedValueOnce(undefined);
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });

    it('should trim whitespace from title and description', async () => {
      mockOnSubmit.mockResolvedValueOnce(undefined);

      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByLabelText(/stream title/i);
      await userEvent.type(titleInput, '  My Stream Title  ');

      const descriptionInput = screen.getByLabelText(/description/i);
      await userEvent.type(descriptionInput, '  Stream description  ');

      // Select category
      const categorySelect = screen.getByRole('combobox');
      await userEvent.click(categorySelect);

      const categoryOptions = await screen.findAllByText('AI Coding');
      await userEvent.click(categoryOptions[categoryOptions.length - 1]);

      const submitButton = screen.getByRole('button', { name: /save configuration/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'My Stream Title',
          description: 'Stream description',
          categoryId: '1',
          tags: undefined,
        });
      });
    });
  });

  describe('Character Counter', () => {
    it('should display character count for title', async () => {
      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByLabelText(/stream title/i);

      expect(screen.getByText('0/100 characters')).toBeInTheDocument();

      await userEvent.type(titleInput, 'Test');

      expect(screen.getByText('4/100 characters')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for form fields', () => {
      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/stream title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    });

    it('should show error messages with proper styling', async () => {
      render(<StreamSetupForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /save configuration/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('Title is required');
        expect(errorMessage).toHaveClass('text-destructive');
      });
    });
  });
});
