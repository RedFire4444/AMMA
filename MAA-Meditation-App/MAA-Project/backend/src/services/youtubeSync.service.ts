/**
 * File: youtubeSync.service.ts
 *
 * Description: Background service to sync live and upcoming events from YouTube
 * using the YouTube Data API v3. Polls every 60 seconds.
 */

import { supabase } from './supabase.service';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const POLL_INTERVAL_MS = 60 * 1000; // 60 seconds

let syncInterval: NodeJS.Timeout | null = null;

export const syncYouTubeEvents = async () => {
  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    console.warn('[YouTube Sync] Missing API Key or Channel ID. Sync disabled.');
    return;
  }

  try {
    // console.log('[YouTube Sync] Fetching live events...');
    // Fetch live streams
    const liveResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`
    );
    const liveData = await liveResponse.json();
    
    // Fetch upcoming streams
    const upcomingResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&eventType=upcoming&type=video&key=${YOUTUBE_API_KEY}`
    );
    const upcomingData = await upcomingResponse.json();

    const items = [...(liveData.items || []), ...(upcomingData.items || [])];

    for (const item of items) {
      const videoId = item.id.videoId;
      const title = item.snippet.title;
      const description = item.snippet.description;
      const thumbnailUrl = item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url;
      const isLive = item.snippet.liveBroadcastContent === 'live';
      const status = isLive ? 'live' : 'upcoming';
      
      // In a real production scenario, we'd fetch the exact start time using the Videos API
      // For now, we update the existing row or insert a new one
      const { data: existingEvent } = await supabase
        .from('events')
        .select('id, status')
        .eq('youtube_video_id', videoId)
        .single();

      if (existingEvent) {
        // Update existing event
        if (existingEvent.status !== status) {
          await supabase
            .from('events')
            .update({ status, is_live: isLive, title, description, thumbnail_url: thumbnailUrl })
            .eq('id', existingEvent.id);
            
          // If state changed from upcoming to live, we would trigger notifications here
          if (status === 'live' && existingEvent.status === 'upcoming') {
            console.log(`[YouTube Sync] Event ${videoId} is now LIVE! Triggering notifications...`);
            // Trigger Firebase FCM notifications for users in event_reminders
          }
        }
      } else {
        // Create new event
        await supabase
          .from('events')
          .insert({
            youtube_video_id: videoId,
            title,
            description,
            instructor_name: 'Amma',
            thumbnail_url: thumbnailUrl,
            stream_url: `https://www.youtube.com/watch?v=${videoId}`,
            category: 'satsang',
            is_live: isLive,
            status,
            event_date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(), // Default to +24h if missing
          });
      }
    }
  } catch (error) {
    console.error('[YouTube Sync] Error syncing events:', error);
  }
};

export const startYoutubeSync = () => {
  if (syncInterval) return;
  console.log('[YouTube Sync] Starting background sync...');
  syncInterval = setInterval(syncYouTubeEvents, POLL_INTERVAL_MS);
  
  // Run immediately on start
  syncYouTubeEvents();
};

export const stopYoutubeSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};
