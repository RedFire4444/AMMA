const https = require('https');

const videos = [
  'U9YKY7fdwyg', 'inpok4MKVLM', 'syx3a1_LeFo', 'ZToicYcHIOU',
  'AETFvQonfV8', '7Dq3r051X70', '_V0K3R3E0QY',
  '4O2JK_94g3Y', 'O-6f5wQXSu8', '1ZYbU82GVz4',
  'WIXbM_l6QfQ', 'txFk-1aNIfI', 'JYY0vdZRg84'
];

async function checkOembed(id) {
  return new Promise((resolve) => {
    https.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(data);
            resolve({ id, title: parsed.title, author: parsed.author_name, valid: true });
          } else {
            resolve({ id, valid: false, status: res.statusCode });
          }
        } catch(e) { resolve({ id, valid: false }); }
      });
    });
  });
}

async function run() {
  const valid = [];
  for (const id of videos) {
    const info = await checkOembed(id);
    if (info.valid) valid.push(info);
  }
  console.log(JSON.stringify(valid, null, 2));
}

run();
