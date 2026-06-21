'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { StreamPlayer } from '@/components/stream-player';
import { usersService } from '@/services/users';
import type { User, Stream } from '@/types';

export default function EmbedStreamPage() {
  const params = useParams();
  const username = params.username as string;

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [stream, setStream] = useState<Stream | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const profile = await usersService.getProfile(username);
        setUserProfile(profile);

        const liveStatus = await usersService.isLive(username);
        setIsLive(liveStatus.isLive);

        if (liveStatus.isLive && liveStatus.stream) {
          setStream(liveStatus.stream);
        }
      } catch (err) {
        console.error('Embed: failed to fetch stream data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-[#131726] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#5867EF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLive || !stream) {
    return (
      <div className="w-full h-screen bg-[#131726] flex flex-col items-center justify-center text-white">
        <p className="text-lg font-medium mb-2">@{username} is offline</p>
        <Link
          href={`https://live.ainative.studio/stream/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#5867EF] hover:underline"
        >
          Watch on AINative Studio Live
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#131726] flex flex-col">
      <div className="flex-1 min-h-0">
        <StreamPlayer
          title={stream.title}
          viewers={stream.viewerCount || 0}
          username={userProfile?.username || username}
          thumbnail={stream.thumbnailUrl || ''}
          streamId={stream.id}
          cloudflareVideoId={stream.cloudflareVideoId ?? undefined}
        />
      </div>

      <div className="flex items-center justify-between px-3 py-2 bg-[#22263c]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-white text-sm font-medium truncate">
            {userProfile?.displayName || username}
          </span>
          {isLive && (
            <span className="bg-[#10B981] text-white text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0">
              LIVE
            </span>
          )}
        </div>
        <Link
          href={`https://live.ainative.studio/stream/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#5867EF] text-xs hover:underline flex-shrink-0 ml-2"
        >
          Watch on AINative Studio Live
        </Link>
      </div>
    </div>
  );
}
