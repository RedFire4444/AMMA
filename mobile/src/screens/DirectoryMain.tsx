/**
 * File: DirectoryMain.tsx
 *
 * Description: Content directory screen with search, category tabs, and a
 * scrollable list of audio/video content cards with mini-player integration.
 *
 * Author: Navnit(Ninjacode911)
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
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

// Damerau-Levenshtein-ish edit distance, capped for performance on short strings
const editDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m = a.length;
  const n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1]
        ? prev
        : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[n];
};

// Fuzzy score: lower is better. Combines substring match, prefix bonus, and edit distance per token.
const fuzzyScore = (haystack: string, needle: string): number => {
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase().trim();
  if (!n) return 0;
  if (h.includes(n)) {
    // Substring match — strongest signal. Earlier match = better.
    return h.indexOf(n) === 0 ? 0 : 1;
  }
  // Token-level fuzzy: best edit distance between needle and any word in haystack
  const words = h.split(/\s+/).filter(Boolean);
  let best = Infinity;
  for (const word of words) {
    if (word.startsWith(n)) {
      best = Math.min(best, 1);
      continue;
    }
    const dist = editDistance(word, n);
    // Tolerance scales with needle length: ~30% allowed typos
    const tolerance = Math.max(1, Math.floor(n.length * 0.4));
    if (dist <= tolerance) {
      best = Math.min(best, 2 + dist);
    }
  }
  return best;
};

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'bhajan', label: 'Bhajans' },
  { key: 'meditation', label: 'Meditations' },
  { key: 'satsang', label: 'Satsangs' },
  { key: 'talk', label: 'Discourses' },
  { key: 'chanting', label: 'Chanting' },
];

// Convert "MM:SS" or "H:MM:SS" duration strings to seconds for the mini-player seek bar
const parseDurationToSeconds = (duration: string): number => {
  const parts = duration.split(':').map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 180;
};

// Category-driven visual theme so content cards feel distinct without real images
const CATEGORY_THEME: Record<string, { bg: string; accent: string }> = {
  chanting:   { bg: '#5C250E', accent: '#87553E' },
  meditation: { bg: '#87553E', accent: '#5C250E' },
  satsang:    { bg: '#C56127', accent: '#ED7624' },
  talk:       { bg: '#A64B29', accent: '#D97229' },
  bhajan:     { bg: '#3D1A0D', accent: '#5C250E' },
  default:    { bg: '#87553E', accent: '#ED7624' },
};
const getTheme = (cat: string) => CATEGORY_THEME[cat] || CATEGORY_THEME.default;

interface ContentThumbnailProps {
  item: ContentItem;
}

// Hoisted out of DirectoryMain so React doesn't see a "new" component type
// on every parent render (was causing the no-unstable-nested-components warning).
const ContentThumbnail = ({ item }: ContentThumbnailProps) => {
  const theme = getTheme(item.category);
  return (
    <View style={[s.thumb, { backgroundColor: theme.bg }]}>
      <View style={[s.thumbDecorLarge, { backgroundColor: theme.accent }]} />
      <View style={[s.thumbDecorSmall, { backgroundColor: theme.accent }]} />
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
  );
};

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

  const { filteredContent, suggestion } = useMemo(() => {
    const inCategory = MOCK_CONTENT.filter(
      (item) => selectedCategory === 'all' || item.category === selectedCategory,
    );

    const q = searchQuery.trim();
    if (!q) {
      return { filteredContent: inCategory, suggestion: null as string | null };
    }

    // Score every item — combines title and instructor fuzzy matches
    const scored = inCategory
      .map((item) => {
        const titleScore = fuzzyScore(item.title, q);
        const instructorScore = fuzzyScore(item.instructor, q);
        return { item, score: Math.min(titleScore, instructorScore) };
      })
      .filter((entry) => entry.score < Infinity)
      .sort((a, b) => a.score - b.score);

    const matches = scored.map((entry) => entry.item);

    // If no exact substring match but we have fuzzy matches, surface a "did you mean"
    const exactMatchExists = inCategory.some(
      (item) =>
        item.title.toLowerCase().includes(q.toLowerCase()) ||
        item.instructor.toLowerCase().includes(q.toLowerCase()),
    );
    let suggest: string | null = null;
    if (!exactMatchExists && matches.length > 0) {
      // Suggest the closest title's first matching word
      const top = matches[0];
      const lowerQ = q.toLowerCase();
      const candidates = `${top.title} ${top.instructor}`
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length >= Math.max(3, lowerQ.length - 2));
      let bestWord = '';
      let bestDist = Infinity;
      for (const w of candidates) {
        const d = editDistance(w, lowerQ);
        if (d < bestDist) {
          bestDist = d;
          bestWord = w;
        }
      }
      if (bestWord && bestDist <= Math.max(1, Math.floor(lowerQ.length * 0.5))) {
        suggest = bestWord;
      }
    }

    return { filteredContent: matches, suggestion: suggest };
  }, [searchQuery, selectedCategory]);

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

      {/* Did-you-mean suggestion (fuzzy match fallback) */}
      {suggestion && searchQuery.trim() && (
        <TouchableOpacity
          style={s.suggestionBar}
          onPress={() => setSearchQuery(suggestion)}
          activeOpacity={0.7}
        >
          <Text style={s.suggestionLabel}>Did you mean</Text>
          <Text style={s.suggestionWord}>{` "${suggestion}"`}</Text>
          <Text style={s.suggestionTap}> ?</Text>
        </TouchableOpacity>
      )}

      {/* Category Tabs */}
      <View style={s.tabRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.key}
          contentContainerStyle={s.tabListPadding}
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
        contentContainerStyle={[
          s.contentListPadding,
          currentPlaying ? s.contentListPaddingPlaying : s.contentListPaddingIdle,
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ED7624" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            onPress={() => { setCurrentPlaying(item); setIsPlaying(true); }}
            activeOpacity={0.7}
          >
            {/* Thumbnail \u2014 category-themed artwork */}
            <ContentThumbnail item={item} />

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
            <Text style={s.emptyIcon}>{'\u{1F50D}'}</Text>
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
          durationSeconds={parseDurationToSeconds(currentPlaying.duration)}
        />
      )}
    </SafeAreaView>
  );
};

export default DirectoryMain;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5EE' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#5C250E' },
  headerSubtitle: { fontSize: 14, color: '#87553E', marginTop: 4 },
  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(240, 127, 46, 0.12)', paddingHorizontal: 14 },
  searchIcon: { fontSize: 16, color: '#87553E', marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#5C250E' },
  clearIcon: { color: '#87553E', fontSize: 16 },
  tabRow: { paddingVertical: 12 },
  tab: { marginRight: 10, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, height: 44, justifyContent: 'center' as const, alignItems: 'center' as const },
  tabActive: { backgroundColor: '#ED7624', elevation: 2, shadowColor: '#ED7624', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  tabInactive: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: 'rgba(240, 127, 46, 0.2)' },
  tabText: { fontSize: 14, fontWeight: '700' },
  tabTextActive: { color: '#FFFFFF' },
  tabTextInactive: { color: '#87553E' },
  card: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(240, 127, 46, 0.12)', overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  thumb: { width: 120, height: 100, backgroundColor: '#87553E', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  thumbIcon: { fontSize: 32, color: '#FFFFFF' },
  thumbDecorLarge: { position: 'absolute', width: 60, height: 60, borderRadius: 30, opacity: 0.18, top: -30, right: -30 },
  thumbDecorSmall: { position: 'absolute', width: 30, height: 30, borderRadius: 15, opacity: 0.22, bottom: -15, left: -15 },
  durationBadge: { position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  durationText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  playOverlay: { position: 'absolute', width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  playIcon: { color: '#FFFFFF', fontSize: 14, marginLeft: 2 },
  premiumBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: '#ED7624', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  premiumText: { color: '#FFFFFF', fontSize: 9, fontWeight: 'bold' },
  info: { flex: 1, padding: 12, justifyContent: 'space-between' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#5C250E', lineHeight: 20 },
  cardInstructor: { fontSize: 12, color: '#87553E', marginTop: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  viewCount: { fontSize: 12, color: 'rgba(135, 85, 62, 0.7)' },
  bookmark: { fontSize: 20, color: 'rgba(240, 127, 46, 0.3)' },
  bookmarkActive: { color: '#ED7624' },
  suggestionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(64, 145, 108, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(64, 145, 108, 0.3)',
  },
  suggestionLabel: { fontSize: 13, color: '#87553E' },
  suggestionWord: { fontSize: 13, color: '#5C250E', fontWeight: '700' },
  suggestionTap: { fontSize: 13, color: '#ED7624', fontWeight: '700' },
  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#5C250E', marginBottom: 4 },
  emptyText: { fontSize: 14, color: '#87553E' },
  tabListPadding: { paddingHorizontal: 16 },
  contentListPadding: { paddingHorizontal: 16 },
  contentListPaddingPlaying: { paddingBottom: 90 },
  contentListPaddingIdle: { paddingBottom: 20 },
});
