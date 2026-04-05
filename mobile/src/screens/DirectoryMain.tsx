import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { directoryService, ContentItem } from '../services/directory.service';
import { ContentCard } from '../components/directory/ContentCard';
import { MiniPlayer } from '../components/directory/MiniPlayer';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'bhajan', label: 'Bhajans' },
  { key: 'meditation', label: 'Meditations' },
  { key: 'satsang', label: 'Satsangs' },
  { key: 'talk', label: 'Discourses' },
  { key: 'chanting', label: 'Chanting' },
];

const DirectoryMain = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [currentPlaying, setCurrentPlaying] = useState<ContentItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const loadContent = useCallback(async () => {
    try {
      const data = await directoryService.browseDirectory({
        query: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      });
      setContent(data);
    } catch {
      // Show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedCategory]);

  const loadBookmarks = useCallback(async () => {
    try {
      const bookmarks = await directoryService.getBookmarks();
      setBookmarkedIds(new Set(bookmarks.map((b) => b.id)));
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    loadContent();
    loadBookmarks();
  }, [loadContent, loadBookmarks]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      loadContent();
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, loadContent]);

  const handleBookmark = async (contentId: string) => {
    const isBookmarked = bookmarkedIds.has(contentId);
    try {
      if (isBookmarked) {
        await directoryService.removeBookmark(contentId);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(contentId);
          return next;
        });
      } else {
        await directoryService.bookmarkContent(contentId);
        setBookmarkedIds((prev) => new Set(prev).add(contentId));
      }
    } catch {
      // Revert on error
    }
  };

  const handlePlay = (item: ContentItem) => {
    directoryService.trackView(item.id).catch(() => {});
    setCurrentPlaying(item);
    setIsPlaying(true);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadContent();
  }, [loadContent]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Search Bar */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center bg-surface rounded-card border border-border px-4">
          <Text className="text-text-secondary mr-2">{'\u{1F50D}'}</Text>
          <TextInput
            className="flex-1 py-3 text-base text-text-primary"
            placeholder="Search teachings, bhajans..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text className="text-text-secondary text-lg">{'\u{2715}'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Tabs */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(item.key)}
            className={`mr-2 px-4 py-2 rounded-pill ${
              selectedCategory === item.key
                ? 'bg-primary'
                : 'bg-surface border border-border'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                selectedCategory === item.key
                  ? 'text-white'
                  : 'text-text-secondary'
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Content List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1B4332" />
        </View>
      ) : (
        <FlatList
          data={content}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: currentPlaying ? 80 : 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1B4332" />
          }
          renderItem={({ item }) => (
            <ContentCard
              id={item.id}
              title={item.title}
              instructorName={item.instructor_name}
              thumbnailUrl={item.thumbnail_url}
              durationSeconds={item.duration_seconds}
              category={item.category}
              viewCount={item.view_count}
              isPremium={item.is_premium}
              isBookmarked={bookmarkedIds.has(item.id)}
              onPress={() => handlePlay(item)}
              onBookmark={() => handleBookmark(item.id)}
            />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-16">
              <Text className="text-3xl mb-3">{'\u{1F50D}'}</Text>
              <Text className="text-text-secondary text-center">
                {searchQuery
                  ? 'No results found. Try a different search.'
                  : 'No content available yet.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Mini Player */}
      {currentPlaying && (
        <MiniPlayer
          title={currentPlaying.title}
          artist={currentPlaying.instructor_name}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onClose={() => {
            setCurrentPlaying(null);
            setIsPlaying(false);
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default DirectoryMain;
