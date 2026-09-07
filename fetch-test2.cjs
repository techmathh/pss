fetch('https://haha-f55s.vercel.app/assets/index-D00_AuQM.js').then(r => r.text()).then(t => {
  const matches = t.match(/\/[a-zA-Z0-9_\-\/]+/g);
  if(matches) console.log(matches.filter(m => m.includes('upload')).join('\n'));
});
