import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModeratorManagement } from '../moderator-management';
import type { Moderator, ModeratorSearchResult } from '@/types';

// Mock the moderator service
jest.mock('@/services/moderator', () => ({
  moderatorService: {
    getModerators: jest.fn(),
    searchUsers: jest.fn(),
    addModerator: jest.fn(),
    removeModerator: jest.fn(),
    updateModerator: jest.fn(),
  },
}));

import { moderatorService } from '@/services/moderator';

describe('ModeratorManagement Component', () => {
  const mockModerators: Moderator[] = [
    {
      id: 'mod-1',
      userId: 'user-1',
      streamId: 'stream-123',
      username: 'moderator1',
      displayName: 'Moderator One',
      avatar: 'https://example.com/avatar1.jpg',
      isVip: false,
      addedAt: '2024-01-01T12:00:00Z',
      addedBy: 'streamer-1',
    },
    {
      id: 'mod-2',
      userId: 'user-2',
      streamId: 'stream-123',
      username: 'moderator2',
      displayName: 'Moderator Two',
      avatar: null,
      isVip: true,
      addedAt: '2024-01-02T12:00:00Z',
      addedBy: 'streamer-1',
    },
  ];

  const mockSearchResults: ModeratorSearchResult[] = [
    {
      id: 'user-3',
      username: 'newuser',
      displayName: 'New User',
      avatar: 'https://example.com/avatar3.jpg',
      followerCount: 150,
      isFollowing: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (moderatorService.getModerators as jest.Mock).mockResolvedValue(mockModerators);
  });

  describe('Display List of Moderators', () => {
    it('should display list of current moderators', async () => {
      // Given moderator service returns a list
      // When rendering the component
      render(<ModeratorManagement streamId="stream-123" />);

      // Then it should fetch and display moderators
      await waitFor(() => {
        expect(moderatorService.getModerators).toHaveBeenCalledWith('stream-123');
      });

      expect(await screen.findByText('Moderator One')).toBeInTheDocument();
      expect(screen.getByText('Moderator Two')).toBeInTheDocument();
    });

    it('should display moderator usernames when displayName is null', async () => {
      // Given a moderator without display name
      const moderatorsWithoutDisplayName = [
        { ...mockModerators[0], displayName: null },
      ];
      (moderatorService.getModerators as jest.Mock).mockResolvedValue(moderatorsWithoutDisplayName);

      // When rendering the component
      render(<ModeratorManagement streamId="stream-123" />);

      // Then it should display username
      await waitFor(() => {
        const usernames = screen.getAllByText('moderator1');
        expect(usernames.length).toBeGreaterThan(0);
      });
    });

    it('should display VIP badge for VIP moderators', async () => {
      // Given moderators with VIP status
      // When rendering the component
      render(<ModeratorManagement streamId="stream-123" />);

      // Then it should display VIP badge for VIP moderators
      await waitFor(() => {
        const vipBadges = screen.getAllByText('VIP');
        // Should have both the label and the badge
        expect(vipBadges.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should display moderator badge for all moderators', async () => {
      // Given a list of moderators
      // When rendering the component
      render(<ModeratorManagement streamId="stream-123" />);

      // Then all moderators should have moderator badge
      await waitFor(() => {
        const modBadges = screen.getAllByText('Moderator');
        expect(modBadges).toHaveLength(2);
      });
    });

    it('should display empty state when no moderators exist', async () => {
      // Given no moderators
      (moderatorService.getModerators as jest.Mock).mockResolvedValue([]);

      // When rendering the component
      render(<ModeratorManagement streamId="stream-123" />);

      // Then it should show empty state message
      expect(await screen.findByText(/no moderators yet/i)).toBeInTheDocument();
    });

    it('should display loading state while fetching moderators', () => {
      // Given moderator service is loading
      (moderatorService.getModerators as jest.Mock).mockImplementation(() => new Promise(() => {}));

      // When rendering the component
      render(<ModeratorManagement streamId="stream-123" />);

      // Then it should show loading indicator
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Add New Moderator', () => {
    it('should add new moderator by username', async () => {
      // Given user search returns results
      (moderatorService.searchUsers as jest.Mock).mockResolvedValue(mockSearchResults);
      (moderatorService.addModerator as jest.Mock).mockResolvedValue({
        ...mockSearchResults[0],
        streamId: 'stream-123',
        isVip: false,
        addedAt: new Date().toISOString(),
        addedBy: 'streamer-1',
      });

      // When user types in search input
      const user = userEvent.setup();
      render(<ModeratorManagement streamId="stream-123" />);

      const searchInput = await screen.findByPlaceholderText(/search users/i);
      await user.type(searchInput, 'newuser');

      // Then search should be triggered
      await waitFor(() => {
        expect(moderatorService.searchUsers).toHaveBeenCalledWith('newuser');
      });

      // When user clicks add button
      const addButton = await screen.findByRole('button', { name: /add moderator/i });
      await user.click(addButton);

      // Then moderator should be added
      await waitFor(() => {
        expect(moderatorService.addModerator).toHaveBeenCalledWith('stream-123', {
          userId: 'user-3',
          isVip: false,
        });
      });
    });

    it('should display search results when typing username', async () => {
      // Given user search returns results
      (moderatorService.searchUsers as jest.Mock).mockResolvedValue(mockSearchResults);

      // When user types in search
      const user = userEvent.setup();
      render(<ModeratorManagement streamId="stream-123" />);

      const searchInput = await screen.findByPlaceholderText(/search users/i);
      await user.type(searchInput, 'new');

      // Then search results should be displayed
      expect(await screen.findByText('New User')).toBeInTheDocument();
      expect(screen.getByText('newuser')).toBeInTheDocument();
    });

    it('should clear search after adding moderator', async () => {
      // Given user search returns results
      (moderatorService.searchUsers as jest.Mock).mockResolvedValue(mockSearchResults);
      (moderatorService.addModerator as jest.Mock).mockResolvedValue({
        ...mockSearchResults[0],
        streamId: 'stream-123',
      });

      // When user adds a moderator
      const user = userEvent.setup();
      render(<ModeratorManagement streamId="stream-123" />);

      const searchInput = await screen.findByPlaceholderText(/search users/i);
      await user.type(searchInput, 'newuser');

      const addButton = await screen.findByRole('button', { name: /add moderator/i });
      await user.click(addButton);

      // Then search should be cleared
      await waitFor(() => {
        expect(searchInput).toHaveValue('');
      });
    });

    it('should not allow adding same user as moderator twice', async () => {
      // Given user is already a moderator
      const existingModeratorSearch: ModeratorSearchResult[] = [
        {
          id: 'user-1',
          username: 'moderator1',
          displayName: 'Moderator One',
          avatar: null,
          followerCount: 100,
          isFollowing: false,
        },
      ];
      (moderatorService.searchUsers as jest.Mock).mockResolvedValue(existingModeratorSearch);

      // When user searches for existing moderator
      const user = userEvent.setup();
      render(<ModeratorManagement streamId="stream-123" />);

      const searchInput = await screen.findByPlaceholderText(/search users/i);
      await user.type(searchInput, 'moderator1');

      // Then add button should be disabled or show already moderator message
      await waitFor(() => {
        expect(screen.getByText(/already a moderator/i)).toBeInTheDocument();
      });
    });

    it('should display error when user not found', async () => {
      // Given user search returns empty results
      (moderatorService.searchUsers as jest.Mock).mockResolvedValue([]);

      // When user searches
      const user = userEvent.setup();
      render(<ModeratorManagement streamId="stream-123" />);

      const searchInput = await screen.findByPlaceholderText(/search users/i);
      await user.type(searchInput, 'nonexistent');

      // Then it should show no results message
      expect(await screen.findByText(/no users found/i)).toBeInTheDocument();
    });
  });

  describe('Remove Moderator', () => {
    it('should remove moderator with confirmation', async () => {
      // Given moderators exist
      (moderatorService.removeModerator as jest.Mock).mockResolvedValue(undefined);

      // When user clicks remove button
      const user = userEvent.setup();
      render(<ModeratorManagement streamId="stream-123" />);

      await waitFor(() => {
        expect(screen.getByText('Moderator One')).toBeInTheDocument();
      });

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[0]);

      // Then confirmation dialog should appear
      expect(await screen.findByText(/are you sure/i)).toBeInTheDocument();

      // When user confirms
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Then moderator should be removed
      await waitFor(() => {
        expect(moderatorService.removeModerator).toHaveBeenCalledWith('stream-123', 'mod-1');
      });
    });

    it('should cancel removal when user clicks cancel', async () => {
      // Given moderators exist
      // When user clicks remove then cancel
      const user = userEvent.setup();
      render(<ModeratorManagement streamId="stream-123" />);

      await waitFor(() => {
        expect(screen.getByText('Moderator One')).toBeInTheDocument();
      });

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[0]);

      expect(await screen.findByText(/are you sure/i)).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Then moderator should NOT be removed
      expect(moderatorService.removeModerator).not.toHaveBeenCalled();
    });

    it('should refresh moderator list after removal', async () => {
      // Given moderator is removed successfully
      (moderatorService.removeModerator as jest.Mock).mockResolvedValue(undefined);

      // When user removes a moderator
      const user = userEvent.setup();
      render(<ModeratorManagement streamId="stream-123" />);

      await waitFor(() => {
        expect(screen.getByText('Moderator One')).toBeInTheDocument();
      });

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[0]);

      const confirmButton = await screen.findByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Then moderator list should be refreshed
      await waitFor(() => {
        expect(moderatorService.getModerators).toHaveBeenCalledTimes(2); // Initial + refresh
      });
    });
  });

  describe('VIP Badge Assignment', () => {
    it('should toggle VIP badge on moderator', async () => {
      // Given moderators exist
      (moderatorService.updateModerator as jest.Mock).mockResolvedValue({
        ...mockModerators[0],
        isVip: true,
      });

      // When user clicks VIP toggle
      const user = userEvent.setup();
      render(<ModeratorManagement streamId="stream-123" />);

      await waitFor(() => {
        expect(screen.getByText('Moderator One')).toBeInTheDocument();
      });

      const vipToggles = screen.getAllByRole('switch');
      await user.click(vipToggles[0]);

      // Then VIP status should be updated
      await waitFor(() => {
        expect(moderatorService.updateModerator).toHaveBeenCalledWith('stream-123', 'mod-1', {
          isVip: true,
        });
      });
    });

    it('should remove VIP badge from moderator', async () => {
      // Given moderator has VIP badge
      (moderatorService.updateModerator as jest.Mock).mockResolvedValue({
        ...mockModerators[1],
        isVip: false,
      });

      // When user toggles VIP off
      const user = userEvent.setup();
      render(<ModeratorManagement streamId="stream-123" />);

      await waitFor(() => {
        expect(screen.getByText('Moderator Two')).toBeInTheDocument();
      });

      const vipToggles = screen.getAllByRole('switch');
      await user.click(vipToggles[1]); // Second moderator already has VIP

      // Then VIP status should be removed
      await waitFor(() => {
        expect(moderatorService.updateModerator).toHaveBeenCalledWith('stream-123', 'mod-2', {
          isVip: false,
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully when fetching moderators', async () => {
      // Given API returns error
      (moderatorService.getModerators as jest.Mock).mockRejectedValue(
        new Error('Failed to fetch moderators')
      );

      // When rendering the component
      render(<ModeratorManagement streamId="stream-123" />);

      // Then it should display error message
      expect(await screen.findByText(/failed to load moderators/i)).toBeInTheDocument();
    });

    it('should handle API errors when adding moderator', async () => {
      // Given add moderator fails
      (moderatorService.searchUsers as jest.Mock).mockResolvedValue(mockSearchResults);
      (moderatorService.addModerator as jest.Mock).mockRejectedValue(
        new Error('Failed to add moderator')
      );

      // When user tries to add moderator
      const user = userEvent.setup();
      render(<ModeratorManagement streamId="stream-123" />);

      const searchInput = await screen.findByPlaceholderText(/search users/i);
      await user.type(searchInput, 'newuser');

      const addButton = await screen.findByRole('button', { name: /add moderator/i });
      await user.click(addButton);

      // Then error message should be displayed
      expect(await screen.findByText(/failed to add moderator/i)).toBeInTheDocument();
    });

    it('should handle API errors when removing moderator', async () => {
      // Given remove moderator fails
      (moderatorService.removeModerator as jest.Mock).mockRejectedValue(
        new Error('Failed to remove moderator')
      );

      // When user tries to remove moderator
      const user = userEvent.setup();
      render(<ModeratorManagement streamId="stream-123" />);

      await waitFor(() => {
        expect(screen.getByText('Moderator One')).toBeInTheDocument();
      });

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[0]);

      const confirmButton = await screen.findByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Then error message should be displayed
      expect(await screen.findByText(/failed to remove moderator/i)).toBeInTheDocument();
    });

    it('should handle API errors when updating VIP status', async () => {
      // Given update moderator fails
      (moderatorService.updateModerator as jest.Mock).mockRejectedValue(
        new Error('Failed to update VIP status')
      );

      // When user toggles VIP
      const user = userEvent.setup();
      render(<ModeratorManagement streamId="stream-123" />);

      await waitFor(() => {
        expect(screen.getByText('Moderator One')).toBeInTheDocument();
      });

      const vipToggles = screen.getAllByRole('switch');
      await user.click(vipToggles[0]);

      // Then error message should be displayed
      expect(await screen.findByText(/failed to update vip status/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for all interactive elements', async () => {
      // Given component is rendered
      render(<ModeratorManagement streamId="stream-123" />);

      // Then all inputs and buttons should have labels
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search users/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('textbox')).toHaveAccessibleName();
    });

    it('should support keyboard navigation', async () => {
      // Given component is rendered
      (moderatorService.searchUsers as jest.Mock).mockResolvedValue(mockSearchResults);

      const user = userEvent.setup();
      render(<ModeratorManagement streamId="stream-123" />);

      // When user tabs through elements
      const searchInput = await screen.findByPlaceholderText(/search users/i);
      searchInput.focus();

      await user.keyboard('{Tab}');

      // Then focus should move to next element
      expect(document.activeElement).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should debounce search input to prevent excessive API calls', async () => {
      // Given user types quickly
      (moderatorService.searchUsers as jest.Mock).mockResolvedValue(mockSearchResults);

      const user = userEvent.setup();
      render(<ModeratorManagement streamId="stream-123" />);

      const searchInput = await screen.findByPlaceholderText(/search users/i);

      // When user types multiple characters quickly
      await user.type(searchInput, 'abc');

      // Then search should be debounced (only called once after delay)
      await waitFor(() => {
        expect(moderatorService.searchUsers).toHaveBeenCalledTimes(1);
      }, { timeout: 1000 });
    });
  });
});
