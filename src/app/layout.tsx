import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Favicon Forge | Create and Generate Favicons Instantly',
  description: 'A modern, intuitive favicon creation app for generating pixel-perfect site icons. Upload an image, use AI to generate variations, and export all necessary sizes in one click.',
  keywords: ['favicon generator', 'favicon creator', 'icon generator', 'apple touch icon', 'android chrome icon', 'site icon', 'free favicon', 'online favicon tool', 'AI favicon'],
  authors: [{ name: 'Firebase' }],
  creator: 'Firebase',
  publisher: 'Firebase',
  metadataBase: new URL('https://your-app-url.com'), // Replace with your actual domain
  openGraph: {
    title: 'Favicon Forge | Create and Generate Favicons Instantly',
    description: 'The ultimate tool for creating beautiful, production-ready favicons. Use AI to explore ideas and export a complete package for your website.',
    url: 'https://your-app-url.com', // Replace with your actual domain
    siteName: 'Favicon Forge',
    images: [
      {
        url: '/og-image.png', // Replace with a link to your open graph image
        width: 1200,
        height: 630,
        alt: 'Favicon Forge app interface showing a favicon being edited.',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Favicon Forge | Create and Generate Favicons Instantly',
    description: 'The ultimate tool for creating beautiful, production-ready favicons. Use AI to explore ideas and export a complete package for your website.',
    images: ['/twitter-og-image.png'], // Replace with a link to your twitter open graph image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
