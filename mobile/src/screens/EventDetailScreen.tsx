/**
 * File: EventDetailScreen.tsx
 *
 * Description: Detailed view of a single event showing description, schedule,
 * location, speaker info, and RSVP/registration actions.
 *
 * Author: Navnit(Ninjacode911)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
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
      <SafeAreaView style={s.loadingContainer}>
        <ActivityIndicator size="large" color="#1B4332" />
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={s.emptyContainer}>
        <Text style={s.emptyText}>Event not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView style={s.flex1} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton}>
            <Text style={s.backButtonText}>{'\u{2190}'}</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle} numberOfLines={1}>
            Event Details
          </Text>
        </View>

        {/* Hero */}
        <View style={s.hero}>
          {event.is_live && (
            <View style={s.liveBadge}>
              <Text style={s.liveBadgeText}>LIVE</Text>
            </View>
          )}
          <Text style={s.heroIcon}>{'\u{1F3B5}'}</Text>
        </View>

        {/* Event Info */}
        <View style={s.infoSection}>
          <Text style={s.eventTitle}>
            {event.title}
          </Text>

          <View style={s.instructorRow}>
            <View style={s.instructorAvatar}>
              <Text style={s.instructorAvatarIcon}>{'\u{1F9D1}'}</Text>
            </View>
            <View>
              <Text style={s.instructorName}>
                {event.instructor_name}
              </Text>
              <Text style={s.instructorLabel}>Instructor</Text>
            </View>
          </View>

          {/* Details */}
          <View style={s.detailsSection}>
            <View style={s.detailRow}>
              <Text style={s.detailIcon}>{'\u{1F4C5}'}</Text>
              <Text style={s.detailText}>
                {formatDate(event.event_date)}
              </Text>
            </View>

            <View style={[s.detailRow, s.detailRowSpaced]}>
              <Text style={s.detailIcon}>{'\u{23F1}'}</Text>
              <Text style={s.detailText}>
                {event.duration_minutes} minutes
              </Text>
            </View>

            <View style={[s.detailRow, s.detailRowSpaced]}>
              <Text style={s.detailIcon}>{'\u{1F465}'}</Text>
              <Text style={s.detailText}>
                {event.registration_count} registered
                {event.max_participants
                  ? ` / ${event.max_participants} spots`
                  : ''}
              </Text>
            </View>

            <View style={[s.detailRow, s.detailRowSpaced]}>
              <Text style={s.detailIcon}>{'\u{1F3F7}'}</Text>
              <View style={s.categoryBadge}>
                <Text style={s.categoryBadgeText}>
                  {event.category}
                </Text>
              </View>
              {event.is_premium && (
                <View style={s.premiumBadge}>
                  <Text style={s.premiumBadgeText}>Premium</Text>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          {event.description && (
            <View style={s.descriptionSection}>
              <Text style={s.descriptionTitle}>
                About this event
              </Text>
              <Text style={s.descriptionBody}>
                {event.description}
              </Text>
            </View>
          )}
        </View>

        <View style={s.footerSpacer} />
      </ScrollView>

      {/* Sticky Footer */}
      <View style={s.stickyFooter}>
        {event.is_live && isRegistered ? (
          <TouchableOpacity
            style={s.liveStreamButton}
            onPress={handleJoinLive}
          >
            <Text style={s.liveStreamButtonText}>Join Live Stream</Text>
          </TouchableOpacity>
        ) : isRegistered ? (
          <View style={s.registeredBadge}>
            <Text style={s.registeredBadgeText}>
              {'\u{2713}'} Registered
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              s.registerButton,
              registering ? s.registerButtonDisabled : null,
            ]}
            onPress={handleRegister}
            disabled={registering}
          >
            {registering ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={s.registerButtonText}>Register Now</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default EventDetailScreen;

const s = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAFAF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FAFAF5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: '#6B7280',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAF5',
  },
  flex1: {
    flex: 1,
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    lineHeight: 26,
    color: '#1B4332',
    textAlign: 'center',
    includeFontPadding: false,
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    flex: 1,
  },
  hero: {
    marginHorizontal: 16,
    marginTop: 16,
    height: 192,
    backgroundColor: '#1B4332',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#DC2626',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroIcon: {
    fontSize: 36,
  },
  infoSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  instructorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(45,106,79,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  instructorAvatarIcon: {
    fontSize: 18,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  instructorLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailsSection: {
    marginTop: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailRowSpaced: {
    marginTop: 8,
  },
  detailIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#1A1A2E',
  },
  categoryBadge: {
    backgroundColor: 'rgba(64,145,108,0.2)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    color: '#40916C',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  premiumBadge: {
    backgroundColor: 'rgba(27,67,50,0.1)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 8,
  },
  premiumBadgeText: {
    color: '#1B4332',
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionSection: {
    marginTop: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  descriptionBody: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  footerSpacer: {
    height: 96,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  liveStreamButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  liveStreamButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  registeredBadge: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(64,145,108,0.2)',
    alignItems: 'center',
  },
  registeredBadgeText: {
    color: '#40916C',
    fontWeight: '700',
    fontSize: 18,
  },
  registerButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#1B4332',
    alignItems: 'center',
  },
  registerButtonDisabled: {
    backgroundColor: '#2D6A4F',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
});
