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

class ScraperService {
  private cachedEvents: ScrapedEvent[] | null = null;
  private lastFetchTime: number = 0;
  // Cache for 1 hour
  private readonly CACHE_TTL = 60 * 60 * 1000; 

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

      // We only need a few latest events (e.g. 5)
      const topEvents = events.slice(0, 5);

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
}

export const scraperService = new ScraperService();
