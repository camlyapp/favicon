
import type { Metadata } from 'next';
import HomePageContent from '@/app/home-page-content';
import { SeoSection } from '@/components/seo-section';

export const metadata: Metadata = {
  title: 'Free AI Favicon Generator for All Devices & Browsers',
  description: 'Create the perfect favicon for free with our AI-powered generator. Design, edit, and instantly export a complete favicon package for iOS, Android, Windows, and all web browsers. Get every size you need in one click.',
  keywords: ['favicon generator', 'free favicon generator', 'ai favicon generator', 'favicon creator', 'icon generator', 'apple touch icon', 'android chrome icon', 'site icon', 'create favicon', 'custom favicon', 'online favicon tool', 'favicon for all devices'],
  openGraph: {
    title: 'Free AI Favicon Generator for All Devices & Browsers',
    description: 'The ultimate free tool for creating beautiful, production-ready favicons. Use AI to explore ideas, customize with our editor, and export a complete package for your website in seconds.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Favicon app interface showing a favicon being edited on a canvas with tools nearby.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Favicon Generator for All Devices & Browsers',
    description: 'The ultimate free tool for creating beautiful, production-ready favicons. Use AI to explore ideas, customize with our editor, and export a complete package for your website in seconds.',
    images: ['/twitter-og-image.png'], 
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


    