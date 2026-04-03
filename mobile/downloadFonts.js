const https = require('https');
const fs = require('fs');
const urls = [
  'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Regular.ttf',
  'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Bold.ttf',
  'https://github.com/googlefonts/playfair-display/raw/main/fonts/ttf/PlayfairDisplay-Regular.ttf',
  'https://github.com/googlefonts/playfair-display/raw/main/fonts/ttf/PlayfairDisplay-Bold.ttf'
];

urls.forEach(url => {
  https.get(url, res => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      https.get(res.headers.location, r => r.pipe(fs.createWriteStream('assets/fonts/' + url.split('/').pop())));
    } else {
      res.pipe(fs.createWriteStream('assets/fonts/' + url.split('/').pop()));
    }
  });
});
