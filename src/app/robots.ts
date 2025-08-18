import { MetadataRoute } from 'next';

const URL = 'https://favicon.pro';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${URL}/sitemap.xml`,
  };
}
