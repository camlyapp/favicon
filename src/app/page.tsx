import type { Metadata } from 'next';
import { AppHeader } from '@/components/header';
import { SeoSection } from '@/components/seo-section';
import HomePageContent from '@/app/home-page-content';


export const metadata: Metadata = {
  title: 'Favicon Forge | Create and Generate Favicons Instantly',
  description: 'A modern, intuitive favicon creation app for generating pixel-perfect site icons. Upload an image, use AI to generate variations, and export all necessary sizes in one click.',
  keywords: ['favicon generator', 'favicon creator', 'icon generator', 'apple touch icon', 'android chrome icon', 'site icon', 'free favicon', 'online favicon tool', 'AI favicon'],
  openGraph: {
    title: 'Favicon Forge | Create and Generate Favicons Instantly',
    description: 'The ultimate tool for creating beautiful, production-ready favicons. Use AI to explore ideas and export a complete package for your website.',
    images: [
      {
        url: '/og-image.png', // Replace with a link to your open graph image
        width: 1200,
        height: 630,
        alt: 'Favicon Forge app interface showing a favicon being edited.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Favicon Forge | Create and Generate Favicons Instantly',
    description: 'The ultimate tool for creating beautiful, production-ready favicons. Use AI to explore ideas and export a complete package for your website.',
    images: ['/twitter-og-image.png'], // Replace with a link to your twitter open graph image
  },
};


export default function Home() {

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <HomePageContent />
      <SeoSection />
    </div>
  );
}
