import { snakeToCamel, transformKeys } from '../transformers';

describe('transformers', () => {
  describe('snakeToCamel', () => {
    it('should convert simple snake_case to camelCase', () => {
      expect(snakeToCamel('user_id')).toBe('userId');
      expect(snakeToCamel('created_at')).toBe('createdAt');
      expect(snakeToCamel('display_name')).toBe('displayName');
    });

    it('should handle already camelCase strings', () => {
      expect(snakeToCamel('userId')).toBe('userId');
      expect(snakeToCamel('createdAt')).toBe('createdAt');
    });

    it('should handle single word strings', () => {
      expect(snakeToCamel('user')).toBe('user');
      expect(snakeToCamel('id')).toBe('id');
    });

    it('should handle multiple underscores', () => {
      expect(snakeToCamel('user_profile_data')).toBe('userProfileData');
      expect(snakeToCamel('is_ai_generated')).toBe('isAiGenerated');
    });

    it('should handle leading underscores (private fields)', () => {
      expect(snakeToCamel('_private_field')).toBe('_privateField');
    });

    it('should handle consecutive underscores', () => {
      expect(snakeToCamel('user__id')).toBe('userId');
    });
  });

  describe('transformKeys', () => {
    it('should transform simple object keys', () => {
      const input = {
        user_id: '123',
        created_at: '2024-01-01',
        display_name: 'Test User'
      };

      const expected = {
        userId: '123',
        createdAt: '2024-01-01',
        displayName: 'Test User'
      };

      expect(transformKeys(input)).toEqual(expected);
    });

    it('should handle nested objects', () => {
      const input = {
        user_id: '123',
        user_profile: {
          display_name: 'Test User',
          profile_picture: 'url',
          social_links: {
            github_url: 'github.com'
          }
        }
      };

      const expected = {
        userId: '123',
        userProfile: {
          displayName: 'Test User',
          profilePicture: 'url',
          socialLinks: {
            githubUrl: 'github.com'
          }
        }
      };

      expect(transformKeys(input)).toEqual(expected);
    });

    it('should handle arrays of objects', () => {
      const input = {
        user_id: '123',
        recent_streams: [
          {
            stream_id: '1',
            created_at: '2024-01-01'
          },
          {
            stream_id: '2',
            created_at: '2024-01-02'
          }
        ]
      };

      const expected = {
        userId: '123',
        recentStreams: [
          {
            streamId: '1',
            createdAt: '2024-01-01'
          },
          {
            streamId: '2',
            createdAt: '2024-01-02'
          }
        ]
      };

      expect(transformKeys(input)).toEqual(expected);
    });

    it('should handle arrays of primitives', () => {
      const input = {
        tag_names: ['javascript', 'typescript', 'react']
      };

      const expected = {
        tagNames: ['javascript', 'typescript', 'react']
      };

      expect(transformKeys(input)).toEqual(expected);
    });

    it('should handle null values', () => {
      const input = {
        user_id: '123',
        display_name: null,
        profile_data: null
      };

      const expected = {
        userId: '123',
        displayName: null,
        profileData: null
      };

      expect(transformKeys(input)).toEqual(expected);
    });

    it('should handle undefined values', () => {
      const input = {
        user_id: '123',
        display_name: undefined
      };

      const expected = {
        userId: '123',
        displayName: undefined
      };

      expect(transformKeys(input)).toEqual(expected);
    });

    it('should handle empty objects', () => {
      expect(transformKeys({})).toEqual({});
    });

    it('should handle empty arrays', () => {
      const input = {
        streams: []
      };

      const expected = {
        streams: []
      };

      expect(transformKeys(input)).toEqual(expected);
    });

    it('should handle complex nested structure', () => {
      const input = {
        stream_id: '123',
        user_data: {
          user_id: '456',
          display_name: 'Streamer',
          follower_count: 1000
        },
        stream_tags: [
          {
            tag_id: '1',
            tag_name: 'coding'
          }
        ],
        chat_messages: [
          {
            message_id: '1',
            user_info: {
              user_id: '789',
              display_name: 'Viewer'
            }
          }
        ],
        metadata: null
      };

      const expected = {
        streamId: '123',
        userData: {
          userId: '456',
          displayName: 'Streamer',
          followerCount: 1000
        },
        streamTags: [
          {
            tagId: '1',
            tagName: 'coding'
          }
        ],
        chatMessages: [
          {
            messageId: '1',
            userInfo: {
              userId: '789',
              displayName: 'Viewer'
            }
          }
        ],
        metadata: null
      };

      expect(transformKeys(input)).toEqual(expected);
    });

    it('should handle Date objects without modification', () => {
      const date = new Date('2024-01-01');
      const input = {
        created_at: date,
        user_id: '123'
      };

      const result = transformKeys(input);
      expect(result.createdAt).toBe(date);
      expect(result.userId).toBe('123');
    });

    it('should handle primitive values passed directly', () => {
      expect(transformKeys('string')).toBe('string');
      expect(transformKeys(123)).toBe(123);
      expect(transformKeys(true)).toBe(true);
      expect(transformKeys(null)).toBe(null);
      expect(transformKeys(undefined)).toBe(undefined);
    });

    it('should handle arrays passed directly', () => {
      const input = [
        { user_id: '1', display_name: 'User 1' },
        { user_id: '2', display_name: 'User 2' }
      ];

      const expected = [
        { userId: '1', displayName: 'User 1' },
        { userId: '2', displayName: 'User 2' }
      ];

      expect(transformKeys(input)).toEqual(expected);
    });

    it('should preserve boolean values', () => {
      const input = {
        is_live: true,
        is_deleted: false,
        is_active: null
      };

      const expected = {
        isLive: true,
        isDeleted: false,
        isActive: null
      };

      expect(transformKeys(input)).toEqual(expected);
    });

    it('should preserve number values including zero', () => {
      const input = {
        viewer_count: 0,
        follower_count: 1000,
        peak_viewers: 5000
      };

      const expected = {
        viewerCount: 0,
        followerCount: 1000,
        peakViewers: 5000
      };

      expect(transformKeys(input)).toEqual(expected);
    });
  });

  describe('real-world API response scenarios', () => {
    it('should transform user response from backend', () => {
      const backendResponse = {
        id: 'user_123',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        avatar: null,
        bio: 'Developer',
        role: 'USER',
        follower_count: 100,
        following_count: 50,
        is_live: false,
        created_at: '2024-01-01T00:00:00Z'
      };

      const expected = {
        id: 'user_123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        avatar: null,
        bio: 'Developer',
        role: 'USER',
        followerCount: 100,
        followingCount: 50,
        isLive: false,
        createdAt: '2024-01-01T00:00:00Z'
      };

      expect(transformKeys(backendResponse)).toEqual(expected);
    });

    it('should transform stream response with nested user', () => {
      const backendResponse = {
        id: 'stream_123',
        user_id: 'user_456',
        title: 'Coding Stream',
        description: 'Building a web app',
        status: 'live',
        category_id: 'cat_1',
        thumbnail_url: 'thumb.jpg',
        viewer_count: 150,
        peak_viewers: 200,
        started_at: '2024-01-01T10:00:00Z',
        created_at: '2024-01-01T09:00:00Z',
        user: {
          id: 'user_456',
          username: 'streamer',
          display_name: 'The Streamer',
          avatar: 'avatar.jpg'
        },
        tags: [
          {
            id: 'tag_1',
            name: 'JavaScript',
            slug: 'javascript'
          }
        ]
      };

      const expected = {
        id: 'stream_123',
        userId: 'user_456',
        title: 'Coding Stream',
        description: 'Building a web app',
        status: 'live',
        categoryId: 'cat_1',
        thumbnailUrl: 'thumb.jpg',
        viewerCount: 150,
        peakViewers: 200,
        startedAt: '2024-01-01T10:00:00Z',
        createdAt: '2024-01-01T09:00:00Z',
        user: {
          id: 'user_456',
          username: 'streamer',
          displayName: 'The Streamer',
          avatar: 'avatar.jpg'
        },
        tags: [
          {
            id: 'tag_1',
            name: 'JavaScript',
            slug: 'javascript'
          }
        ]
      };

      expect(transformKeys(backendResponse)).toEqual(expected);
    });

    it('should transform paginated response', () => {
      const backendResponse = {
        items: [
          {
            stream_id: '1',
            viewer_count: 100
          },
          {
            stream_id: '2',
            viewer_count: 200
          }
        ],
        total: 50,
        page: 1,
        per_page: 10,
        has_more: true
      };

      const expected = {
        items: [
          {
            streamId: '1',
            viewerCount: 100
          },
          {
            streamId: '2',
            viewerCount: 200
          }
        ],
        total: 50,
        page: 1,
        perPage: 10,
        hasMore: true
      };

      expect(transformKeys(backendResponse)).toEqual(expected);
    });
  });
});
