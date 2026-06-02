import { get, post, del } from './api';

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
    const data = await get<any>('/directory', { params: filters });
    return data || [];
  },

  async bookmarkContent(contentId: string): Promise<void> {
    await post(`/directory/${contentId}/bookmark`);
  },

  async removeBookmark(contentId: string): Promise<void> {
    await del(`/directory/${contentId}/bookmark`);
  },

  async getBookmarks(): Promise<ContentItem[]> {
    const data = await get<any>('/directory/bookmarks');
    return data || [];
  },

  async trackView(contentId: string): Promise<void> {
    await post(`/directory/${contentId}/view`);
  },

  async logWatchSession(contentId: string, durationMinutes?: number): Promise<void> {
    await post(`/directory/${contentId}/watch`, { duration_minutes: durationMinutes });
  },
};
