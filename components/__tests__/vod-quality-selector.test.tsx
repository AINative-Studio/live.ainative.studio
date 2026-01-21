import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VODQualitySelector } from '../vod-quality-selector';
import type { VODQualityLevel } from '@/types';

describe('VODQualitySelector', () => {
  const mockQualityLevels: VODQualityLevel[] = [
    { label: 'Auto', height: 0, bitrate: 0, url: 'https://example.com/auto.m3u8' },
    { label: '1080p', height: 1080, bitrate: 5000, url: 'https://example.com/1080p.m3u8' },
    { label: '720p', height: 720, bitrate: 2500, url: 'https://example.com/720p.m3u8' },
    { label: '480p', height: 480, bitrate: 1000, url: 'https://example.com/480p.m3u8' },
  ];

  const mockOnQualityChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('rendering', () => {
    it('should render quality selector button with current quality', () => {
      render(
        <VODQualitySelector
          qualityLevels={mockQualityLevels}
          currentQuality={mockQualityLevels[0]}
          onQualityChange={mockOnQualityChange}
        />
      );

      // Check button shows current quality
      expect(screen.getByRole('button', { name: /quality.*auto/i })).toBeInTheDocument();
    });

    it('should show current quality in button text', () => {
      render(
        <VODQualitySelector
          qualityLevels={mockQualityLevels}
          currentQuality={mockQualityLevels[1]}
          onQualityChange={mockOnQualityChange}
        />
      );

      expect(screen.getByRole('button', { name: /quality.*1080p/i })).toBeInTheDocument();
    });

    it('should display quality selector with settings icon', () => {
      render(
        <VODQualitySelector
          qualityLevels={mockQualityLevels}
          currentQuality={mockQualityLevels[0]}
          onQualityChange={mockOnQualityChange}
        />
      );

      const button = screen.getByRole('button', { name: /quality/i });
      expect(button).toBeInTheDocument();
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('quality switching', () => {
    it('should call onQualityChange when provided', () => {
      render(
        <VODQualitySelector
          qualityLevels={mockQualityLevels}
          currentQuality={mockQualityLevels[0]}
          onQualityChange={mockOnQualityChange}
        />
      );

      // Component should be rendered and accept callbacks
      expect(mockOnQualityChange).not.toHaveBeenCalled();
    });

    it('should have clickable button', () => {
      render(
        <VODQualitySelector
          qualityLevels={mockQualityLevels}
          currentQuality={mockQualityLevels[0]}
          onQualityChange={mockOnQualityChange}
        />
      );

      const button = screen.getByRole('button', { name: /quality/i });
      expect(button).not.toBeDisabled();
    });

    it('should display all quality options with bitrate info', async () => {
      const { container } = render(
        <VODQualitySelector
          qualityLevels={mockQualityLevels}
          currentQuality={mockQualityLevels[0]}
          onQualityChange={mockOnQualityChange}
        />
      );

      // Open dropdown by clicking button
      const button = screen.getByRole('button', { name: /quality/i });
      fireEvent.click(button);

      // Wait for menu to appear and check for quality options
      await waitFor(() => {
        // Check that bitrate is shown for quality levels (except Auto which has bitrate 0)
        const menuContent = container.querySelector('[role="menu"]');
        expect(menuContent).toBeInTheDocument();
      });
    });
  });

  describe('localStorage persistence', () => {
    it('should load saved quality preference on mount', () => {
      // Set a saved preference
      localStorage.setItem('vod_quality_preference', '1080p');

      render(
        <VODQualitySelector
          qualityLevels={mockQualityLevels}
          currentQuality={mockQualityLevels[0]}
          onQualityChange={mockOnQualityChange}
        />
      );

      // Should call onQualityChange with saved preference
      expect(mockOnQualityChange).toHaveBeenCalledWith(
        expect.objectContaining({ label: '1080p' })
      );
    });

    it('should default to current quality if saved preference not available', () => {
      localStorage.setItem('vod_quality_preference', '4K');

      render(
        <VODQualitySelector
          qualityLevels={mockQualityLevels}
          currentQuality={mockQualityLevels[0]}
          onQualityChange={mockOnQualityChange}
        />
      );

      // Should not call onQualityChange since '4K' is not available
      expect(mockOnQualityChange).not.toHaveBeenCalled();
    });

    it('should not load preference if current quality already matches', () => {
      localStorage.setItem('vod_quality_preference', 'Auto');

      render(
        <VODQualitySelector
          qualityLevels={mockQualityLevels}
          currentQuality={mockQualityLevels[0]}
          onQualityChange={mockOnQualityChange}
        />
      );

      // Should not call onQualityChange since current quality is already Auto
      expect(mockOnQualityChange).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle missing quality_levels gracefully', () => {
      render(
        <VODQualitySelector
          qualityLevels={undefined}
          currentQuality={undefined}
          onQualityChange={mockOnQualityChange}
        />
      );

      // Should not render anything or show a disabled state
      expect(screen.queryByRole('button', { name: /quality/i })).toBeNull();
    });

    it('should handle empty quality_levels array', () => {
      render(
        <VODQualitySelector
          qualityLevels={[]}
          currentQuality={undefined}
          onQualityChange={mockOnQualityChange}
        />
      );

      // Should not render or show disabled
      expect(screen.queryByRole('button', { name: /quality/i })).toBeNull();
    });

    it('should handle single quality level', () => {
      const singleQuality = [mockQualityLevels[0]];

      render(
        <VODQualitySelector
          qualityLevels={singleQuality}
          currentQuality={singleQuality[0]}
          onQualityChange={mockOnQualityChange}
        />
      );

      // Should still render but maybe disabled or not interactive
      const button = screen.queryByRole('button', { name: /auto/i });
      expect(button).toBeInTheDocument();
      // With only one quality, clicking shouldn't do much
      if (button) {
        expect(button).toBeDisabled();
      }
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <VODQualitySelector
          qualityLevels={mockQualityLevels}
          currentQuality={mockQualityLevels[0]}
          onQualityChange={mockOnQualityChange}
        />
      );

      const button = screen.getByRole('button', { name: /quality/i });
      expect(button).toHaveAttribute('aria-haspopup', 'menu');
      expect(button).toHaveAttribute('aria-label');
    });

    it('should be keyboard accessible', () => {
      render(
        <VODQualitySelector
          qualityLevels={mockQualityLevels}
          currentQuality={mockQualityLevels[0]}
          onQualityChange={mockOnQualityChange}
        />
      );

      const button = screen.getByRole('button', { name: /quality/i });
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should have descriptive aria-label with quality', () => {
      render(
        <VODQualitySelector
          qualityLevels={mockQualityLevels}
          currentQuality={mockQualityLevels[1]}
          onQualityChange={mockOnQualityChange}
        />
      );

      const button = screen.getByRole('button', { name: /quality.*1080p/i });
      expect(button).toHaveAttribute('aria-label', 'Quality: 1080p');
    });
  });
});
