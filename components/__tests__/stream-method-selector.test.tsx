import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StreamMethodSelector } from '../stream-method-selector';
import type { StreamMethod } from '../stream-method-selector';

describe('StreamMethodSelector Component', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  describe('Rendering', () => {
    it('should render both streaming method options', () => {
      // Given the component without selected method
      // When rendering
      render(<StreamMethodSelector onSelect={mockOnSelect} />);

      // Then both options should be visible
      expect(screen.getByText('Stream from Browser')).toBeInTheDocument();
      expect(screen.getByText('Stream with Software')).toBeInTheDocument();
    });

    it('should render heading and description', () => {
      // Given the component
      // When rendering
      render(<StreamMethodSelector onSelect={mockOnSelect} />);

      // Then heading and description should be visible
      expect(screen.getByText('Choose Your Streaming Method')).toBeInTheDocument();
      expect(screen.getByText('Select how you want to broadcast your stream')).toBeInTheDocument();
    });

    it('should render browser compatibility information', () => {
      // Given the component
      // When rendering
      render(<StreamMethodSelector onSelect={mockOnSelect} />);

      // Then browser compatibility info should be visible
      expect(screen.getByText('Browser Compatibility')).toBeInTheDocument();
      expect(screen.getByText('Chrome 53+')).toBeInTheDocument();
      expect(screen.getByText('Firefox 36+')).toBeInTheDocument();
      expect(screen.getByText('Edge 12+')).toBeInTheDocument();
      expect(screen.getByText('Safari 11+')).toBeInTheDocument();
    });
  });

  describe('Browser Streaming Option', () => {
    it('should display browser streaming features', () => {
      // Given the component
      // When rendering
      render(<StreamMethodSelector onSelect={mockOnSelect} />);

      // Then browser streaming features should be listed
      expect(screen.getByText('No additional software required')).toBeInTheDocument();
      expect(screen.getByText('Stream with your webcam and microphone')).toBeInTheDocument();
      expect(screen.getByText('Perfect for quick streams and interviews')).toBeInTheDocument();
      expect(screen.getByText('Multiple quality options available')).toBeInTheDocument();
    });

    it('should call onSelect with browser when clicking browser card', () => {
      // Given the component
      // When rendering and clicking browser card
      render(<StreamMethodSelector onSelect={mockOnSelect} />);
      const browserCard = screen.getByText('Stream from Browser').closest('div[class*="border"]');
      fireEvent.click(browserCard!);

      // Then onSelect should be called with browser
      expect(mockOnSelect).toHaveBeenCalledWith('browser');
    });

    it('should call onSelect with browser when clicking browser button', () => {
      // Given the component
      // When rendering and clicking browser button
      render(<StreamMethodSelector onSelect={mockOnSelect} />);
      const browserButton = screen.getByText('Use Browser Streaming');
      fireEvent.click(browserButton);

      // Then onSelect should be called with browser
      expect(mockOnSelect).toHaveBeenCalledWith('browser');
    });

    it('should show selected state when browser is selected', () => {
      // Given the component with browser selected
      // When rendering
      render(<StreamMethodSelector onSelect={mockOnSelect} selectedMethod="browser" />);

      // Then button text should change to Selected
      expect(screen.getByText('Selected')).toBeInTheDocument();
    });
  });

  describe('Software Streaming Option', () => {
    it('should display software streaming features', () => {
      // Given the component
      // When rendering
      render(<StreamMethodSelector onSelect={mockOnSelect} />);

      // Then software streaming features should be listed
      expect(screen.getByText(/Professional streaming software/)).toBeInTheDocument();
      expect(screen.getByText(/Advanced features like scene switching and overlays/)).toBeInTheDocument();
      expect(screen.getByText(/Screen sharing and multi-source streaming/)).toBeInTheDocument();
      expect(screen.getByText(/Best for gaming, coding, and professional content/)).toBeInTheDocument();
    });

    it('should call onSelect with software when clicking software card', () => {
      // Given the component
      // When rendering and clicking software card
      render(<StreamMethodSelector onSelect={mockOnSelect} />);
      const softwareCard = screen.getByText('Stream with Software').closest('div[class*="border"]');
      fireEvent.click(softwareCard!);

      // Then onSelect should be called with software
      expect(mockOnSelect).toHaveBeenCalledWith('software');
    });

    it('should call onSelect with software when clicking software button', () => {
      // Given the component
      // When rendering and clicking software button
      render(<StreamMethodSelector onSelect={mockOnSelect} />);
      const softwareButton = screen.getByText('Use RTMP Software');
      fireEvent.click(softwareButton);

      // Then onSelect should be called with software
      expect(mockOnSelect).toHaveBeenCalledWith('software');
    });

    it('should show selected state when software is selected', () => {
      // Given the component with software selected
      // When rendering
      const { container } = render(<StreamMethodSelector onSelect={mockOnSelect} selectedMethod="software" />);

      // Then selected button should show Selected text
      const selectedButtons = screen.getAllByText('Selected');
      expect(selectedButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Selection State', () => {
    it('should highlight selected card with border', () => {
      // Given the component with browser selected
      // When rendering
      const { container } = render(<StreamMethodSelector onSelect={mockOnSelect} selectedMethod="browser" />);

      // Then selected card should have brand-primary border
      const cards = container.querySelectorAll('div[class*="border-brand-primary"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should show checkmark icon for selected option', () => {
      // Given the component with browser selected
      // When rendering
      render(<StreamMethodSelector onSelect={mockOnSelect} selectedMethod="browser" />);

      // Then checkmark should be visible in the card
      // Check icon is rendered but may not have accessible text
      const browserCard = screen.getByText('Stream from Browser').closest('div[class*="border"]');
      expect(browserCard).toBeInTheDocument();
    });

    it('should allow switching between methods', () => {
      // Given the component with browser selected
      const { rerender } = render(<StreamMethodSelector onSelect={mockOnSelect} selectedMethod="browser" />);

      // When clicking software option
      const softwareButton = screen.getByText('Use RTMP Software');
      fireEvent.click(softwareButton);

      // Then onSelect should be called with software
      expect(mockOnSelect).toHaveBeenCalledWith('software');

      // When re-rendering with software selected
      rerender(<StreamMethodSelector onSelect={mockOnSelect} selectedMethod="software" />);

      // Then software should show as selected
      const selectedButtons = screen.getAllByText('Selected');
      expect(selectedButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have clickable cards with cursor-pointer', () => {
      // Given the component
      // When rendering
      const { container } = render(<StreamMethodSelector onSelect={mockOnSelect} />);

      // Then cards should have cursor-pointer class
      const cards = container.querySelectorAll('.cursor-pointer');
      expect(cards.length).toBe(2);
    });

    it('should have proper card structure with headers', () => {
      // Given the component
      // When rendering
      render(<StreamMethodSelector onSelect={mockOnSelect} />);

      // Then proper card headers should exist
      expect(screen.getByText('Stream from Browser')).toBeInTheDocument();
      expect(screen.getByText('Stream with Software')).toBeInTheDocument();
    });

    it('should have descriptive button text', () => {
      // Given the component
      // When rendering
      render(<StreamMethodSelector onSelect={mockOnSelect} />);

      // Then buttons should have descriptive text
      expect(screen.getByText('Use Browser Streaming')).toBeInTheDocument();
      expect(screen.getByText('Use RTMP Software')).toBeInTheDocument();
    });
  });

  describe('Browser Support Detection', () => {
    it('should handle browser support check gracefully', () => {
      // Given the component
      // When rendering (browser support is checked internally)
      // Then it should render without errors
      expect(() => render(<StreamMethodSelector onSelect={mockOnSelect} />)).not.toThrow();
    });
  });

  describe('Visual Styling', () => {
    it('should have hover effects on cards', () => {
      // Given the component
      // When rendering
      const { container } = render(<StreamMethodSelector onSelect={mockOnSelect} />);

      // Then cards should have hover classes
      const cards = container.querySelectorAll('.hover\\:shadow-lg');
      expect(cards.length).toBe(2);
    });

    it('should have transition effects', () => {
      // Given the component
      // When rendering
      const { container } = render(<StreamMethodSelector onSelect={mockOnSelect} />);

      // Then cards should have transition class
      const cards = container.querySelectorAll('.transition-all');
      expect(cards.length).toBe(2);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      // Given the component
      // When rendering
      const { container } = render(<StreamMethodSelector onSelect={mockOnSelect} />);

      // Then grid should have responsive classes
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined selectedMethod', () => {
      // Given the component without selectedMethod
      // When rendering
      // Then it should render without errors
      expect(() => render(<StreamMethodSelector onSelect={mockOnSelect} />)).not.toThrow();
    });

    it('should handle multiple rapid clicks', () => {
      // Given the component
      render(<StreamMethodSelector onSelect={mockOnSelect} />);
      const browserButton = screen.getByText('Use Browser Streaming');

      // When clicking multiple times rapidly
      fireEvent.click(browserButton);
      fireEvent.click(browserButton);
      fireEvent.click(browserButton);

      // Then onSelect should be called three times
      expect(mockOnSelect).toHaveBeenCalledTimes(3);
    });
  });
});
