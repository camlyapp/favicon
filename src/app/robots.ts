import { MetadataRoute } from 'next';

// This is a placeholder URL. Replace with your actual domain.
const URL = 'https://your-app-url.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${URL}/sitemap.xml`,
  };
}
