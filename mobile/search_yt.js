const https = require('https');

https.get('https://www.youtube.com/results?search_query=chanting+meditation', r => {
  let d='';
  r.on('data', c=>d+=c);
  r.on('end', () => {
    const matches = d.match(/"videoId":"(.*?)"/g);
    if(matches) {
      const ids = [...new Set(matches.map(m=>m.split('\"')[3]))].slice(0, 15);
      let cnt=0;
      ids.forEach(id => {
        https.get('https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v='+id+'&format=json', r2 => {
          let d2='';
          r2.on('data', c=>d2+=c);
          r2.on('end', () => {
            if(r2.statusCode===200) console.log(id, JSON.parse(d2).title);
            cnt++;
            if(cnt===ids.length) process.exit(0);
          })
        }).on('error', ()=>cnt++)
      });
    }
  })
});
