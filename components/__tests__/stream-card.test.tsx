import React from 'react';
import { render, screen } from '@testing-library/react';
import { StreamCard } from '../stream-card';
import type { Stream } from '@/types';

describe('StreamCard Component', () => {
  const mockStream: Stream = {
    id: 'stream-1',
    userId: 'user-1',
    title: 'Test Stream',
    description: 'A test stream description',
    status: 'live',
    categoryId: 'cat-1',
    category: {
      id: 'cat-1',
      name: 'Programming',
      slug: 'programming',
      description: 'Coding streams',
      iconUrl: null,
      streamCount: 10,
      viewerCount: 100,
      isActive: true,
      parentId: null,
      createdAt: '2024-01-01T00:00:00Z',
    },
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    streamKey: null,
    cloudflareVideoId: 'video-123',
    viewerCount: 42,
    peakViewers: 100,
    tags: [
      { id: 'tag-1', name: 'JavaScript', slug: 'javascript' },
      { id: 'tag-2', name: 'React', slug: 'react' },
    ],
    startedAt: '2024-01-01T12:00:00Z',
    endedAt: null,
    createdAt: '2024-01-01T11:00:00Z',
    user: {
      id: 'user-1',
      username: 'testuser',
      displayName: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
    },
  };

  describe('Stream Rendering', () => {
    it('should render a stream card with all required fields', () => {
      // Given a valid stream
      // When rendering the component
      render(<StreamCard stream={mockStream} />);

      // Then it should display the stream information
      expect(screen.getByText('Test Stream')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Programming')).toBeInTheDocument();
    });

    it('should render live badge when stream is live', () => {
      // Given a live stream
      // When rendering the component
      render(<StreamCard stream={mockStream} />);

      // Then it should display the LIVE badge
      expect(screen.getByText('LIVE')).toBeInTheDocument();
    });

    it('should render viewer count for live streams', () => {
      // Given a live stream with viewers
      // When rendering the component
      render(<StreamCard stream={mockStream} />);

      // Then it should display the viewer count
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should not render live badge when stream is offline', () => {
      // Given an offline stream
      const offlineStream: Stream = {
        ...mockStream,
        status: 'offline',
      };

      // When rendering the component
      render(<StreamCard stream={offlineStream} />);

      // Then it should not display the LIVE badge
      expect(screen.queryByText('LIVE')).not.toBeInTheDocument();
    });

    it('should render stream tags', () => {
      // Given a stream with tags
      // When rendering the component
      render(<StreamCard stream={mockStream} />);

      // Then it should display the tags
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    it('should limit tags to first 3', () => {
      // Given a stream with many tags
      const manyTagsStream: Stream = {
        ...mockStream,
        tags: [
          { id: 'tag-1', name: 'Tag 1', slug: 'tag-1' },
          { id: 'tag-2', name: 'Tag 2', slug: 'tag-2' },
          { id: 'tag-3', name: 'Tag 3', slug: 'tag-3' },
          { id: 'tag-4', name: 'Tag 4', slug: 'tag-4' },
          { id: 'tag-5', name: 'Tag 5', slug: 'tag-5' },
        ],
      };

      // When rendering the component
      render(<StreamCard stream={manyTagsStream} />);

      // Then it should display only first 3 tags
      expect(screen.getByText('Tag 1')).toBeInTheDocument();
      expect(screen.getByText('Tag 2')).toBeInTheDocument();
      expect(screen.getByText('Tag 3')).toBeInTheDocument();
      expect(screen.queryByText('Tag 4')).not.toBeInTheDocument();
      expect(screen.queryByText('Tag 5')).not.toBeInTheDocument();
    });
  });

  describe('Avatar Fallback - Bug #71 Fix', () => {
    it('should handle empty string displayName without crashing (Bug #71)', () => {
      // Given a stream with empty string displayName
      const emptyDisplayNameStream: Stream = {
        ...mockStream,
        user: {
          id: 'user-1',
          username: '',
          displayName: '',
          avatar: null,
        },
      };

      // When rendering the component
      // Then it should not crash (displayName falls back to 'unknown', rendering 'U')
      expect(() => render(<StreamCard stream={emptyDisplayNameStream} />)).not.toThrow();
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('should handle undefined displayName without crashing (Bug #71)', () => {
      // Given a stream with null displayName
      const nullDisplayNameStream: Stream = {
        ...mockStream,
        user: {
          id: 'user-1',
          username: 'testuser',
          displayName: null,
          avatar: null,
        },
      };

      // When rendering the component
      render(<StreamCard stream={nullDisplayNameStream} />);

      // Then it should use username first letter uppercased
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('should use uppercase for avatar fallback (Bug #71)', () => {
      // Given a stream with lowercase displayName
      const lowercaseStream: Stream = {
        ...mockStream,
        user: {
          ...mockStream.user,
          displayName: 'alice',
          avatar: null,
        },
      };

      // When rendering the component
      render(<StreamCard stream={lowercaseStream} />);

      // Then it should display uppercase 'A'
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('should handle both empty username and displayName (Bug #71)', () => {
      // Given a stream with both empty
      const bothEmptyStream: Stream = {
        ...mockStream,
        user: {
          id: 'user-1',
          username: '',
          displayName: '',
          avatar: null,
        },
      };

      // When rendering the component
      // Then it should not crash and render fallback 'U' (from 'unknown')
      expect(() => render(<StreamCard stream={bothEmptyStream} />)).not.toThrow();
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('should handle null values for all user fields (Bug #71)', () => {
      // Given a stream with null user fields
      const nullUserFieldsStream: Stream = {
        ...mockStream,
        user: {
          id: 'user-1',
          username: null as any,
          displayName: null,
          avatar: null,
        },
      };

      // When rendering the component
      // Then it should not crash and render fallback 'U' (from 'unknown')
      expect(() => render(<StreamCard stream={nullUserFieldsStream} />)).not.toThrow();
      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero viewer count', () => {
      // Given a stream with zero viewers
      const zeroViewersStream: Stream = {
        ...mockStream,
        viewerCount: 0,
      };

      // When rendering the component
      render(<StreamCard stream={zeroViewersStream} />);

      // Then it should display '0'
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle missing category gracefully', () => {
      // Given a stream without category
      const noCategoryStream: Stream = {
        ...mockStream,
        category: null,
        categoryId: null,
      };

      // When rendering the component
      const { container } = render(<StreamCard stream={noCategoryStream} />);

      // Then it should render without crashing
      expect(container).toBeInTheDocument();
    });

    it('should handle missing tags gracefully', () => {
      // Given a stream without tags
      const noTagsStream: Stream = {
        ...mockStream,
        tags: [],
      };

      // When rendering the component
      const { container } = render(<StreamCard stream={noTagsStream} />);

      // Then it should render without tags section
      expect(container).toBeInTheDocument();
      expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
    });

    it('should handle missing thumbnail', () => {
      // Given a stream without thumbnail
      const noThumbnailStream: Stream = {
        ...mockStream,
        thumbnailUrl: null,
      };

      // When rendering the component
      const { container } = render(<StreamCard stream={noThumbnailStream} />);

      // Then it should render with placeholder
      expect(container).toBeInTheDocument();
    });

    it('should handle large viewer counts', () => {
      // Given a stream with large viewer count
      const largeViewersStream: Stream = {
        ...mockStream,
        viewerCount: 12345,
      };

      // When rendering the component
      render(<StreamCard stream={largeViewersStream} />);

      // Then it should format the number with commas
      expect(screen.getByText('12,345')).toBeInTheDocument();
    });

    it('should handle very long stream titles', () => {
      // Given a stream with long title
      const longTitleStream: Stream = {
        ...mockStream,
        title: 'This is a very long stream title that should be truncated or wrapped properly to fit the card layout without breaking the UI',
      };

      // When rendering the component
      const { container } = render(<StreamCard stream={longTitleStream} />);

      // Then it should render with line-clamp
      const titleElement = container.querySelector('.line-clamp-2');
      expect(titleElement).toBeInTheDocument();
    });

    it('should handle missing avatar', () => {
      // Given a stream with null avatar
      const noAvatarStream: Stream = {
        ...mockStream,
        user: {
          ...mockStream.user,
          avatar: null,
        },
      };

      // When rendering the component
      render(<StreamCard stream={noAvatarStream} />);

      // Then it should render fallback with first letter
      expect(screen.getByText('T')).toBeInTheDocument();
    });
  });

  describe('Link Behavior', () => {
    it('should link to the correct stream page', () => {
      // Given a stream
      // When rendering the component
      const { container } = render(<StreamCard stream={mockStream} />);

      // Then it should have correct href
      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', '/stream/testuser');
    });

    it('should handle username with special characters', () => {
      // Given a stream with special characters in username
      const specialUsernameStream: Stream = {
        ...mockStream,
        user: {
          ...mockStream.user,
          username: 'test_user-123',
        },
      };

      // When rendering the component
      const { container } = render(<StreamCard stream={specialUsernameStream} />);

      // Then it should link correctly
      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', '/stream/test_user-123');
    });
  });

  describe('Hover Effects', () => {
    it('should have hover styling classes', () => {
      // Given a stream
      // When rendering the component
      const { container } = render(<StreamCard stream={mockStream} />);

      // Then it should have hover classes
      const card = container.querySelector('.hover\\:border-brand-primary');
      expect(card).toBeInTheDocument();
    });

    it('should have group hover for image scale', () => {
      // Given a stream
      // When rendering the component
      const { container } = render(<StreamCard stream={mockStream} />);

      // Then it should have group hover classes
      const image = container.querySelector('.group-hover\\:scale-105');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Priority Loading', () => {
    it('should set priority when priority prop is true', () => {
      // Given priority is true
      // When rendering the component
      const { container } = render(<StreamCard stream={mockStream} priority={true} />);

      // Then component should render with priority
      expect(container).toBeInTheDocument();
    });

    it('should not set priority by default', () => {
      // Given no priority prop
      // When rendering the component
      const { container } = render(<StreamCard stream={mockStream} />);

      // Then component should render without priority
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper image alt text', () => {
      // Given a stream
      // When rendering the component
      render(<StreamCard stream={mockStream} />);

      // Then image should have alt text
      const image = screen.getByAltText('Test Stream');
      expect(image).toBeInTheDocument();
    });

    it('should render avatar fallback with user initial', () => {
      // Given a stream
      // When rendering the component
      const { container } = render(<StreamCard stream={mockStream} />);

      // Then avatar fallback should display first letter
      // Avatar component handles accessibility internally via Radix UI
      const avatarContainer = container.querySelector('span[class*="relative"]');
      expect(avatarContainer).toBeInTheDocument();
    });
  });
});
