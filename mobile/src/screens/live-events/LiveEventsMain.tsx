import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { useLiveEventsStore } from '../../store/liveEventsStore';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

interface LiveEventsMainProps {
  isNested?: boolean;
}

export default function LiveEventsMain({ isNested = false }: LiveEventsMainProps) {
  const navigation = useNavigation<NavigationProp>();
  const { liveEvents, fetchEvents, isLoading } = useLiveEventsStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-xl mb-4 overflow-hidden shadow-sm"
      onPress={() => navigation.navigate('LiveEventDetails', { eventId: item.id })}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: item.thumbnail_url || 'https://via.placeholder.com/400x200' }} 
        className="w-full h-48"
        resizeMode="cover"
      />
      <View className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded-full flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-white mr-1" />
        <Text className="text-white text-xs font-bold">LIVE NOW</Text>
      </View>
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">{item.title}</Text>
        <Text className="text-sm text-gray-500 mb-2">Category: {item.category}</Text>
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-sm text-gray-600 dark:text-gray-300">
            👁️ {item.viewer_count || 0} watching
          </Text>
          <View style={s.watchNowBtn}>
            <Text style={s.watchNowBtnText}>Watch Now</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={isNested ? s.nestedContainer : s.fullContainer}>
      {!isNested ? (
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">Live Events</Text>
          <TouchableOpacity onPress={() => navigation.navigate('UpcomingEvents')}>
            <Text style={s.upcomingLink}>Upcoming ➔</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.nestedHeader}>
          <Text style={s.nestedTitle}>Active Streams</Text>
          <TouchableOpacity onPress={() => navigation.navigate('UpcomingEvents')} style={s.upcomingBtn} activeOpacity={0.7}>
            <Text style={s.upcomingBtnText}>Upcoming Events ➔</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {isLoading && liveEvents.length === 0 ? (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-gray-500">Loading events...</Text>
        </View>
      ) : liveEvents.length === 0 ? (
        <View className="flex-1 justify-center items-center py-16 px-4">
          <Text className="text-gray-500 text-lg mb-2 text-center">No live events right now.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('UpcomingEvents')} style={s.upcomingBtnInline} activeOpacity={0.7}>
            <Text style={s.upcomingBtnInlineText}>Check out upcoming events</Text>
          </TouchableOpacity>
        </View>
      ) : isNested ? (
        <View style={{ paddingBottom: 120 }}>
          {liveEvents.map((item) => (
            <React.Fragment key={item.id}>
              {renderItem({ item })}
            </React.Fragment>
          ))}
        </View>
      ) : (
        <FlatList
          data={liveEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchEvents}
          refreshing={isLoading}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#FFF5EE',
    padding: 16,
    paddingTop: 48,
  },
  nestedContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  nestedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  nestedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C250E',
  },
  upcomingBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(240, 127, 46, 0.1)',
  },
  upcomingBtnText: {
    color: '#ED7624',
    fontSize: 13,
    fontWeight: '600',
  },
  upcomingLink: {
    color: '#ED7624',
    fontWeight: '600',
    fontSize: 16,
  },
  upcomingBtnInline: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(240, 127, 46, 0.1)',
    marginTop: 8,
  },
  upcomingBtnInlineText: {
    color: '#ED7624',
    fontSize: 14,
    fontWeight: '600',
  },
  watchNowBtn: {
    backgroundColor: 'rgba(240, 127, 46, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  watchNowBtnText: {
    color: '#ED7624',
    fontWeight: '600',
    fontSize: 14,
  },
});
