import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { eventsService, Event } from '../services/events.service';

type Props = NativeStackScreenProps<{ EventDetail: { eventId: string } }, 'EventDetail'>;

const EventDetailScreen = ({ route, navigation }: Props) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  const loadEvent = useCallback(async () => {
    try {
      const [eventData, registered] = await Promise.all([
        eventsService.getEvent(eventId),
        eventsService.isRegistered(eventId),
      ]);
      setEvent(eventData);
      setIsRegistered(registered);
    } catch {
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await eventsService.registerForEvent(eventId);
      setIsRegistered(true);
      Alert.alert('Success', 'You are registered for this event!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      Alert.alert('Error', message);
    } finally {
      setRegistering(false);
    }
  };

  const handleJoinLive = async () => {
    try {
      const streamUrl = await eventsService.getStreamUrl(eventId);
      if (streamUrl) {
        Alert.alert('Live Stream', 'Stream URL: ' + streamUrl);
      } else {
        Alert.alert('Not Available', 'Stream is not yet available');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Cannot access stream';
      Alert.alert('Error', message);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#1B4332" />
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-text-secondary">Event not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-4 flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Text className="text-2xl text-primary">{'\u{2190}'}</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-text-primary flex-1" numberOfLines={1}>
            Event Details
          </Text>
        </View>

        {/* Hero */}
        <View className="mx-4 mt-4 h-48 bg-primary rounded-card items-center justify-center">
          {event.is_live && (
            <View className="absolute top-3 left-3 bg-red-500 rounded-pill px-3 py-1">
              <Text className="text-white text-xs font-bold">LIVE</Text>
            </View>
          )}
          <Text className="text-4xl">{'\u{1F3B5}'}</Text>
        </View>

        {/* Event Info */}
        <View className="px-4 mt-4">
          <Text className="text-2xl font-serif font-bold text-text-primary">
            {event.title}
          </Text>

          <View className="flex-row items-center mt-3">
            <View className="w-10 h-10 rounded-full bg-primary-light/30 items-center justify-center mr-3">
              <Text className="text-lg">{'\u{1F9D1}'}</Text>
            </View>
            <View>
              <Text className="text-base font-semibold text-text-primary">
                {event.instructor_name}
              </Text>
              <Text className="text-sm text-text-secondary">Instructor</Text>
            </View>
          </View>

          {/* Details */}
          <View className="mt-6 space-y-3">
            <View className="flex-row items-center">
              <Text className="text-lg mr-3">{'\u{1F4C5}'}</Text>
              <Text className="text-base text-text-primary">
                {formatDate(event.event_date)}
              </Text>
            </View>

            <View className="flex-row items-center mt-2">
              <Text className="text-lg mr-3">{'\u{23F1}'}</Text>
              <Text className="text-base text-text-primary">
                {event.duration_minutes} minutes
              </Text>
            </View>

            <View className="flex-row items-center mt-2">
              <Text className="text-lg mr-3">{'\u{1F465}'}</Text>
              <Text className="text-base text-text-primary">
                {event.registration_count} registered
                {event.max_participants
                  ? ` / ${event.max_participants} spots`
                  : ''}
              </Text>
            </View>

            <View className="flex-row items-center mt-2">
              <Text className="text-lg mr-3">{'\u{1F3F7}'}</Text>
              <View className="bg-accent/20 rounded-pill px-3 py-1">
                <Text className="text-accent text-sm font-semibold capitalize">
                  {event.category}
                </Text>
              </View>
              {event.is_premium && (
                <View className="bg-primary/10 rounded-pill px-3 py-1 ml-2">
                  <Text className="text-primary text-sm font-semibold">Premium</Text>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          {event.description && (
            <View className="mt-6">
              <Text className="text-lg font-bold text-text-primary mb-2">
                About this event
              </Text>
              <Text className="text-base text-text-secondary leading-6">
                {event.description}
              </Text>
            </View>
          )}
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Sticky Footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border px-4 py-4 pb-8">
        {event.is_live && isRegistered ? (
          <TouchableOpacity
            className="w-full py-4 rounded-button bg-red-500 items-center"
            onPress={handleJoinLive}
          >
            <Text className="text-white font-bold text-lg">Join Live Stream</Text>
          </TouchableOpacity>
        ) : isRegistered ? (
          <View className="w-full py-4 rounded-button bg-accent/20 items-center">
            <Text className="text-accent font-bold text-lg">
              {'\u{2713}'} Registered
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            className={`w-full py-4 rounded-button items-center ${
              registering ? 'bg-primary-light' : 'bg-primary'
            }`}
            onPress={handleRegister}
            disabled={registering}
          >
            {registering ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Register Now</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default EventDetailScreen;
