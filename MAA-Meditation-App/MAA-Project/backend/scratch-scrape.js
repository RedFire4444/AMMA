const cheerio = require('cheerio');

async function scrape() {
  const res = await fetch('https://amma.org/news/');
  const html = await res.text();
  const $ = cheerio.load(html);

  const articles = [];

  $('[data-elementor-type="loop-item"]').each((i, el) => {
    const titleEl = $(el).find('.elementor-heading-title a');
    const title = titleEl.text().trim();
    const link = titleEl.attr('href');
    
    // Find category
    let category = '';
    $(el).find('a').each((_, aEl) => {
      const href = $(aEl).attr('href');
      if (href && (href.includes('/focus-area/') || href.includes('/project-category/'))) {
        category = $(aEl).text().trim();
      }
    });
    
    articles.push({
      title,
      category
    });
  });

  console.log(articles.slice(0, 4));
}

scrape().catch(console.error);
