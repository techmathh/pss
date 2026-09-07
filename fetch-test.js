import fs from 'fs';
fetch('https://haha-f55s.vercel.app/assets/index-D00_AuQM.js').then(r => r.text()).then(t => {
  const matches = t.match(/https:\/\/[^"']+/g);
  if(matches) console.log(matches.slice(0, 10).join('\n'));
});
