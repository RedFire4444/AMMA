import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import YoutubeIframe from 'react-native-youtube-iframe';
import { HomeStackParamList } from '../../navigation/types';
import { eventsService, Event } from '../../services/events.service';
import { useLiveEventsStore } from '../../store/liveEventsStore';

type DetailsRouteProp = RouteProp<HomeStackParamList, 'LiveEventDetails'>;

export default function LiveEventDetails() {
  const route = useRoute<DetailsRouteProp>();
  const { eventId } = route.params;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const { toggleReminder } = useLiveEventsStore();

  useEffect(() => {
    let pingInterval: NodeJS.Timeout;
    const fetchDetails = async () => {
      try {
        const data = await eventsService.getEvent(eventId);
        setEvent(data);
        
        // Start pinging if live
        if (data.status === 'live') {
          eventsService.pingWatchDuration(eventId);
          pingInterval = setInterval(() => {
            eventsService.pingWatchDuration(eventId);
          }, 30000); // ping every 30s
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDetails();
    return () => {
      if (pingInterval) clearInterval(pingInterval);
    };
  }, [eventId]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#FF5A5F" />
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-gray-500">Event not found.</Text>
      </View>
    );
  }

  const isLive = event.status === 'live';
  const videoId = event.youtube_video_id || event.stream_url?.split('v=')[1] || '';

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Video Player Section */}
      <View className="w-full bg-black" style={{ aspectRatio: 16 / 9, paddingTop: 40 }}>
        {videoId ? (
          <YoutubeIframe
            height={250}
            play={isPlaying}
            videoId={videoId}
            onChangeState={(state) => {
              if (state === 'ended') setIsPlaying(false);
            }}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-white">Stream URL not available</Text>
          </View>
        )}
      </View>

      {/* Details Section */}
      <View className="p-4">
        {isLive && (
          <View className="bg-red-600 px-3 py-1 rounded-full self-start flex-row items-center mb-3">
            <View className="w-2 h-2 rounded-full bg-white mr-2" />
            <Text className="text-white font-bold text-xs">LIVE</Text>
            <Text className="text-white font-semibold text-xs ml-2 border-l border-white/30 pl-2">
              👁️ {event.viewer_count || 0} watching
            </Text>
          </View>
        )}
        
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {event.title}
        </Text>
        
        <Text className="text-gray-500 mb-6">
          {new Date(event.event_date).toLocaleString()} • {event.category}
        </Text>

        {!isLive && event.status === 'upcoming' && (
          <TouchableOpacity 
            className="bg-primary py-3 rounded-xl items-center mb-6"
            onPress={() => toggleReminder(event.id, false)}
          >
            <Text className="text-white font-bold text-lg">Set Reminder</Text>
          </TouchableOpacity>
        )}

        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">Description</Text>
        <Text className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          {event.description || 'Join us for this special spiritual session.'}
        </Text>
        
        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">Speaker</Text>
        <View className="flex-row items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6">
          <View className="w-12 h-12 bg-gray-200 rounded-full mr-4 overflow-hidden">
             <Image source={{ uri: event.instructor_avatar_url || 'https://via.placeholder.com/150' }} className="w-full h-full" />
          </View>
          <View>
            <Text className="text-gray-900 dark:text-white font-bold text-lg">{event.instructor_name || 'Amma'}</Text>
            <Text className="text-gray-500">Spiritual Leader</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
