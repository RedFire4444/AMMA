import { supabase } from './supabase';

export interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  instructor_name: string | null;
  media_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  category: string;
  tags: string[];
  is_premium: boolean;
  view_count: number;
  bookmark_count: number;
  is_bookmarked?: boolean;
}

export interface DirectoryFilters {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export const directoryService = {
  async browseDirectory(filters: DirectoryFilters = {}): Promise<ContentItem[]> {
    const { query, category, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let q = supabase
      .from('content_directory')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') {
      q = q.eq('category', category);
    }

    if (query) {
      q = q.textSearch('search_vector', query);
    }

    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async bookmarkContent(contentId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('bookmarks')
      .upsert({ user_id: user.id, content_id: contentId });
    if (error) throw error;

    // Try to atomically increment bookmark count via RPC
    try {
      await supabase.rpc('increment_counter', {
        p_table: 'content_directory',
        p_column: 'bookmark_count',
        p_id: contentId,
        p_delta: 1
      });
    } catch {
      // RPC may not exist yet — silently skip
    }
  },

  async removeBookmark(contentId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('content_id', contentId);
    if (error) throw error;
  },

  async getBookmarks(): Promise<ContentItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bookmarks')
      .select('content_id, content_directory(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((b: Record<string, unknown>) => b.content_directory as ContentItem);
  },

  async trackView(contentId: string): Promise<void> {
    // Try to atomically increment view count via RPC
    try {
      await supabase.rpc('increment_counter', {
        p_table: 'content_directory',
        p_column: 'view_count',
        p_id: contentId,
        p_delta: 1
      });
    } catch {
      // RPC may not exist yet — silently skip
    }
  },
};
