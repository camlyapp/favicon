import fs from 'fs';

const URL = 'https://favicon-generate.vercel.app';

async function generateSitemap() {
  const pages = [
    '/',
    '/editor',
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map((page) => {
      const path = page.replace('src/app', '').replace('/page.tsx', '');
      const route = path === '/index' ? '' : path;
      return `
    <url>
        <loc>${`${URL}${route}`}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
    </url>
    `;
    })
    .join('')}
</urlset>`;

  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }

  fs.writeFileSync('public/sitemap.xml', sitemap);
}

generateSitemap();
