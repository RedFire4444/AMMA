/**
 * File: DirectoryMain.tsx
 *
 * Description: Content directory screen with search, category tabs, and a
 * scrollable list of audio/video content cards with mini-player integration.
 *
 * Author: Navnit(Ninjacode911)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MiniPlayer } from '../components/directory/MiniPlayer';

interface ContentItem {
  id: string;
  title: string;
  instructor: string;
  category: string;
  duration: string;
  views: string;
  isPremium: boolean;
  icon: string;
  type: 'video' | 'audio';
}

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'bhajan', label: 'Bhajans' },
  { key: 'meditation', label: 'Meditations' },
  { key: 'satsang', label: 'Satsangs' },
  { key: 'talk', label: 'Discourses' },
  { key: 'chanting', label: 'Chanting' },
];

const MOCK_CONTENT: ContentItem[] = [
  { id: '1', title: 'Sri Lalitha Sahasranamam', instructor: 'Amma', category: 'chanting', duration: '45:30', views: '120k', isPremium: false, icon: '\u{1F3B5}', type: 'audio' },
  { id: '2', title: 'Morning Guided Meditation', instructor: "Amma's Teachings", category: 'meditation', duration: '15:00', views: '85k', isPremium: false, icon: '\u{1F9D8}', type: 'audio' },
  { id: '3', title: 'Satsang: The Power of Infinite Love', instructor: 'Swami Amritaswarupananda', category: 'satsang', duration: '1:12:00', views: '42k', isPremium: false, icon: '\u{1F3AC}', type: 'video' },
  { id: '4', title: 'Stories of the Divine Mother', instructor: 'Br. Ramanandamrita', category: 'talk', duration: '22:15', views: '18k', isPremium: false, icon: '\u{1F3B5}', type: 'audio' },
  { id: '5', title: 'Bhajans for Deep Inner Peace', instructor: 'MAA Global', category: 'bhajan', duration: '30:00', views: '210k', isPremium: false, icon: '\u{1F3AC}', type: 'video' },
  { id: '6', title: 'Om Namah Shivaya - 108 Times', instructor: 'Amma', category: 'chanting', duration: '28:45', views: '340k', isPremium: false, icon: '\u{1F3B5}', type: 'audio' },
  { id: '7', title: 'Guided Body Scan Meditation', instructor: 'Dr. Meera Iyer', category: 'meditation', duration: '20:00', views: '56k', isPremium: true, icon: '\u{1F9D8}', type: 'audio' },
  { id: '8', title: 'Hanuman Chalisa - Sacred Chanting', instructor: 'MAA Global', category: 'bhajan', duration: '12:30', views: '180k', isPremium: false, icon: '\u{1F3B5}', type: 'audio' },
  { id: '9', title: 'Evening Satsang: Finding Peace Within', instructor: 'Swamiji', category: 'satsang', duration: '55:00', views: '31k', isPremium: true, icon: '\u{1F3AC}', type: 'video' },
  { id: '10', title: 'Pranayama: Art of Breathing', instructor: 'Dr. Meera Iyer', category: 'meditation', duration: '18:00', views: '67k', isPremium: false, icon: '\u{1F9D8}', type: 'audio' },
];

const DirectoryMain = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [currentPlaying, setCurrentPlaying] = useState<ContentItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredContent = MOCK_CONTENT.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Directory</Text>
        <Text style={s.headerSubtitle}>Browse bhajans, meditations & satsangs</Text>
      </View>

      {/* Search Bar */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Text style={s.searchIcon}>{'\u{1F50D}'}</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search teachings, bhajans..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={s.clearIcon}>{'\u{2715}'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Tabs */}
      <View style={s.tabRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item.key)}
              style={[s.tab, selectedCategory === item.key ? s.tabActive : s.tabInactive]}
            >
              <Text style={[s.tabText, selectedCategory === item.key ? s.tabTextActive : s.tabTextInactive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Content List */}
      <FlatList
        data={filteredContent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: currentPlaying ? 90 : 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1B4332" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            onPress={() => { setCurrentPlaying(item); setIsPlaying(true); }}
            activeOpacity={0.7}
          >
            {/* Thumbnail */}
            <View style={s.thumb}>
              <Text style={s.thumbIcon}>{item.icon}</Text>
              <View style={s.durationBadge}>
                <Text style={s.durationText}>{item.duration}</Text>
              </View>
              {item.type === 'video' && (
                <View style={s.playOverlay}>
                  <Text style={s.playIcon}>{'\u{25B6}'}</Text>
                </View>
              )}
              {item.isPremium && (
                <View style={s.premiumBadge}>
                  <Text style={s.premiumText}>PRO</Text>
                </View>
              )}
            </View>

            {/* Info */}
            <View style={s.info}>
              <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={s.cardInstructor} numberOfLines={1}>{item.instructor}</Text>
              <View style={s.cardMeta}>
                <Text style={s.viewCount}>{'\u{25B6}'} {item.views}</Text>
                <TouchableOpacity onPress={() => toggleBookmark(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={[s.bookmark, bookmarkedIds.has(item.id) && s.bookmarkActive]}>
                    {bookmarkedIds.has(item.id) ? '\u{2605}' : '\u{2606}'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>{'\u{1F50D}'}</Text>
            <Text style={s.emptyTitle}>No results found</Text>
            <Text style={s.emptyText}>Try a different search or category</Text>
          </View>
        }
      />

      {/* Mini Player */}
      {currentPlaying && (
        <MiniPlayer
          title={currentPlaying.title}
          artist={currentPlaying.instructor}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onClose={() => { setCurrentPlaying(null); setIsPlaying(false); }}
        />
      )}
    </SafeAreaView>
  );
};

export default DirectoryMain;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF5' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#1B4332' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14 },
  searchIcon: { fontSize: 16, color: '#6B7280', marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#1A1A2E' },
  clearIcon: { color: '#6B7280', fontSize: 16 },
  tabRow: { paddingVertical: 12 },
  tab: { marginRight: 10, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, height: 44, justifyContent: 'center' as const, alignItems: 'center' as const },
  tabActive: { backgroundColor: '#1B4332', elevation: 2, shadowColor: '#1B4332', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  tabInactive: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#D1D5DB' },
  tabText: { fontSize: 14, fontWeight: '700' },
  tabTextActive: { color: '#FFFFFF' },
  tabTextInactive: { color: '#374151' },
  card: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  thumb: { width: 120, height: 100, backgroundColor: '#2D6A4F', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  thumbIcon: { fontSize: 28 },
  durationBadge: { position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  durationText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  playOverlay: { position: 'absolute', width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  playIcon: { color: '#FFFFFF', fontSize: 14, marginLeft: 2 },
  premiumBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: '#40916C', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  premiumText: { color: '#FFFFFF', fontSize: 9, fontWeight: 'bold' },
  info: { flex: 1, padding: 12, justifyContent: 'space-between' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A2E', lineHeight: 20 },
  cardInstructor: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  viewCount: { fontSize: 12, color: '#9CA3AF' },
  bookmark: { fontSize: 20, color: '#D1D5DB' },
  bookmarkActive: { color: '#40916C' },
  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 4 },
  emptyText: { fontSize: 14, color: '#6B7280' },
});
