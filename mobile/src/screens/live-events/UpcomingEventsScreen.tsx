import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { useLiveEventsStore } from '../../store/liveEventsStore';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'UpcomingEvents'>;

export default function UpcomingEventsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { upcomingEvents, fetchEvents, isLoading, toggleReminder } = useLiveEventsStore();

  const renderItem = ({ item }: { item: any }) => {
    const isRegistered = item.is_registered || false;
    const isNews = item.category === 'news';
    const date = new Date(item.event_date);
    const dateString = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const timeString = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    return (
      <View className="bg-white dark:bg-gray-800 rounded-xl mb-4 overflow-hidden shadow-sm flex-row">
        <Image 
          source={{ uri: item.thumbnail_url || 'https://via.placeholder.com/150' }} 
          className="w-32 h-full"
          resizeMode="cover"
        />
        <View className="p-3 flex-1 justify-between">
          <View>
            {isNews && item.instructor_name ? (
              <View className="bg-orange-50 dark:bg-orange-950/30 self-start px-2 py-0.5 rounded mb-1">
                <Text className="text-[10px] font-bold text-primary uppercase tracking-wide">
                  {item.instructor_name}
                </Text>
              </View>
            ) : null}
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1" numberOfLines={2}>
              {item.title}
            </Text>
            <Text className="text-sm text-gray-500 mb-1">
              📅 {isNews ? dateString : `${dateString} at ${timeString}`}
            </Text>
          </View>
          {isNews ? (
            <TouchableOpacity 
              className="mt-2 py-2 rounded-full items-center bg-primary"
              onPress={() => {
                if (item.booking_url) {
                  Linking.openURL(item.booking_url).catch(() =>
                    Alert.alert('Error', 'Unable to open page')
                  );
                }
              }}
            >
              <Text className="font-semibold text-white">Read More ➔</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              className={`mt-2 py-2 rounded-full items-center ${isRegistered ? 'bg-gray-200 dark:bg-gray-700' : 'bg-primary'}`}
              onPress={() => toggleReminder(item.id, isRegistered)}
            >
              <Text className={`font-semibold ${isRegistered ? 'text-gray-700 dark:text-gray-300' : 'text-white'}`}>
                {isRegistered ? 'Reminder Set ✅' : 'Set Reminder 🔔'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 pt-12">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-2xl text-gray-900 dark:text-white">←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming Events</Text>
      </View>
      
      <FlatList
        data={upcomingEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onRefresh={fetchEvents}
        refreshing={isLoading}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-gray-500 text-lg">No upcoming events scheduled.</Text>
          </View>
        }
      />
    </View>
  );
}
