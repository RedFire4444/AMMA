const https = require('https');

const videos = [
  'U9YKY7fdwyg', // 10-Min Meditation (Goodful)
  'O-6f5wQXSu8', // Healing Meditation (Great Meditation) - Might be invalid
  'j7d5PlZ0FAA', // 10 Min Meditation (Meditative Mind)
  'JYY0vdZRg84', // Hanuman Chalisa (Lofi)
  'WIXbM_l6QfQ', // Achyutam Keshavam (Vikram)
  'V9U6G0V3qH4', // Mooji Satsang
  'Tz9qE_E8iXY', // Sadhguru Satsang
  'txFk-1aNIfI', // Ramana Maharshi
  '1ZYbU82GVz4', // Morning Music
  'J3xWbK2hMTo', // Om Namah Shivaya
];

async function fetchVideo(id) {
  return new Promise((resolve) => {
    https.get(`https://www.youtube.com/watch?v=${id}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const titleMatch = data.match(/<title>(.*?) - YouTube<\/title>/);
          const viewsMatch = data.match(/"viewCount":"(\d+)"/);
          const authorMatch = data.match(/"ownerChannelName":"(.*?)"/);
          
          if (titleMatch && viewsMatch && authorMatch) {
            resolve({
              id,
              title: titleMatch[1].replace(/&amp;/g, '&'),
              views: parseInt(viewsMatch[1]).toLocaleString(),
              author: authorMatch[1],
              valid: true
            });
          } else {
            resolve({ id, valid: false });
          }
        } catch (e) {
          resolve({ id, valid: false });
        }
      });
    }).on('error', () => resolve({ id, valid: false }));
  });
}

async function run() {
  for (const id of videos) {
    const info = await fetchVideo(id);
    console.log(info);
  }
}

run();
