const fs = require('fs');

async function inspectPage(url) {
  const res = await fetch(url);
  const text = await res.text();
  
  // Find post-body
  const postBodyMatch = text.match(/<div[^>]*class=["'](?:post-body|entry-content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (!postBodyMatch) {
    console.log('No post-body in', url);
    return;
  }
  
  const bodyHtml = postBodyMatch[1];
  
  // Extract paragraphs
  const pMatches = bodyHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  const paragraphs = pMatches.map(p => p.replace(/<[^>]+>/g, '').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n)).trim()).filter(Boolean);
  
  // Extract lists
  const liMatches = bodyHtml.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
  const listItems = liMatches.map(li => li.replace(/<[^>]+>/g, '').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n)).trim()).filter(Boolean);

  console.log('URL:', url);
  console.log('Paragraphs count:', paragraphs.length);
  console.log('First 2 paragraphs:', paragraphs.slice(0, 2));
  console.log('List items count:', listItems.length);
  console.log('First 3 list items:', listItems.slice(0, 3));
  console.log('--------------------------------------------------');
}

async function run() {
  await inspectPage('https://www.idcardscannerpro.com/p/sa.html');
  await inspectPage('https://www.idcardscannerpro.com/p/idmpc.html');
  await inspectPage('https://www.idcardscannerpro.com/p/voter.html');
}
run();
