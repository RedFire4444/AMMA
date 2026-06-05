import * as cheerio from 'cheerio';

export interface ScrapedEvent {
  id: string;
  title: string;
  event_date: string;
  instructor_name: string;
  thumbnail_url: string | null;
  is_live: boolean;
  category: string;
  booking_url: string; // The URL to the news article
}

export interface YatraPost {
  title: string;
  url: string;
  image: string | null;
  date: string;
}

export interface YatraData {
  statusText: string;
  posts: YatraPost[];
}
class ScraperService {
  private cachedEvents: ScrapedEvent[] | null = null;
  private lastFetchTime: number = 0;
  // Cache for 5 minutes (same as yatra, so news stays fresh)
  private readonly CACHE_TTL = 5 * 60 * 1000;

  private cachedYatra: YatraData | null = null;
  private lastYatraFetchTime: number = 0;
  private readonly YATRA_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache



  public async getRecentEvents(): Promise<ScrapedEvent[]> {
    const now = Date.now();
    
    // Return cached events if valid
    if (this.cachedEvents && (now - this.lastFetchTime) < this.CACHE_TTL) {
      return this.cachedEvents;
    }

    try {
      // Fetch news from Amma.org
      const res = await fetch('https://amma.org/news/');
      
      if (!res.ok) {
        throw new Error(`Failed to fetch news: ${res.statusText}`);
      }

      const html = await res.text();
      const $ = cheerio.load(html);
      
      const events: ScrapedEvent[] = [];

      $('[data-elementor-type="loop-item"]').each((i, el) => {
        const titleEl = $(el).find('.elementor-heading-title a');
        const title = titleEl.text().trim();
        const link = titleEl.attr('href');
        
        const dateEl = $(el).find('time');
        const dateStr = dateEl.text().trim();

        const imgEl = $(el).find('img');
        const imgSrc = imgEl.attr('src') || imgEl.attr('data-src') || null;

        let postCategory = '';
        $(el).find('a').each((_, aEl) => {
          const href = $(aEl).attr('href');
          if (href && (href.includes('/focus-area/') || href.includes('/project-category/'))) {
            postCategory = $(aEl).text().trim();
          }
        });
        
        // Ensure it's a valid news article and not a pagination link or other element
        if (title && link && link.includes('/news/') && !link.match(/\/news\/\d+\/$/)) {
          // Generate a pseudo-ID from the link
          const id = link.split('/').filter(Boolean).pop() || `scraped-${i}`;
          
          let eventDate = new Date().toISOString(); // fallback
          if (dateStr) {
             const parsedDate = new Date(dateStr);
             if (!isNaN(parsedDate.getTime())) {
                eventDate = parsedDate.toISOString();
             }
          }
          
          events.push({
            id: `news-${id}`,
            title: title,
            event_date: eventDate,
            instructor_name: postCategory || 'Amma News',
            thumbnail_url: imgSrc,
            is_live: false,
            category: 'news',
            booking_url: link,
          });
        }
      });

      // Fetch yatra posts to combine them with general news
      const yatraData = await this.getYatraData().catch(() => ({ statusText: '', posts: [] }));
      const yatraEvents: ScrapedEvent[] = (yatraData.posts || []).map((post, i) => {
        let eventDate = new Date().toISOString(); // fallback
        if (post.date) {
           const parsedDate = new Date(post.date);
           if (!isNaN(parsedDate.getTime())) {
              eventDate = parsedDate.toISOString();
           }
        }
        const id = post.url.split('/').filter(Boolean).pop() || `yatra-${i}`;
        return {
          id: `yatra-${id}`,
          title: post.title,
          event_date: eventDate,
          instructor_name: 'Bharata Yatra',
          thumbnail_url: post.image,
          is_live: false,
          category: 'news',
          booking_url: post.url,
        };
      });

      // Merge and sort by date descending so the most recent is first
      const combined = [...yatraEvents, ...events];
      combined.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

      const topEvents = combined.slice(0, 8); // top 8 combined items

      // Cache the result
      this.cachedEvents = topEvents;
      this.lastFetchTime = now;

      return topEvents;
    } catch (error) {
      console.error('[ScraperService] Error scraping recent events:', error);
      // Return stale cache if available, else empty array
      return this.cachedEvents || [];
    }
  }

  public async getYatraData(): Promise<YatraData> {
    const now = Date.now();
    
    // Return cached yatra if valid
    if (this.cachedYatra && (now - this.lastYatraFetchTime) < this.YATRA_CACHE_TTL) {
      return this.cachedYatra;
    }

    try {
      const res = await fetch('https://www.amritapuri.org/yatra', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch yatra: ${res.statusText}`);
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      const statusText = $('.wp-block-paragraph').first().text().trim();

      const posts: YatraPost[] = [];
      $('li.wp-block-post').each((_, el) => {
        const titleLink = $(el).find('.wp-block-post-title a');
        const title = titleLink.text().trim();
        const url = titleLink.attr('href') || '';
        const img = $(el).find('img').attr('src') || null;
        const date = $(el).find('time').text().trim();

        if (title && url) {
          posts.push({
            title,
            url,
            image: img,
            date
          });
        }
      });

      const yatraData: YatraData = {
        statusText,
        posts: posts.slice(0, 6)
      };

      this.cachedYatra = yatraData;
      this.lastYatraFetchTime = now;

      return yatraData;
    } catch (error) {
      console.error('[ScraperService] Error scraping yatra data:', error);
      return this.cachedYatra || { statusText: '', posts: [] };
    }
  }
}

export const scraperService = new ScraperService();
