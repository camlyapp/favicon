import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Footer } from '@/components/footer';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: {
    default: 'Favicon',
    template: '%s | Favicon',
  },
  description: 'A modern, intuitive favicon creation app for generating pixel-perfect site icons. Upload an image, use AI to generate variations, and export all necessary sizes in one click.',
  authors: [{ name: 'Firebase' }],
  creator: 'Firebase',
  publisher: 'Firebase',
  applicationName: "Favicon",
  appleWebApp: {
    capable: true,
    title: "Favicon",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL('https://favicon.pro'),
  openGraph: {
    url: 'https://favicon.pro',
    siteName: 'Favicon',
    locale: 'en_US',
    type: 'website',
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
    <html lang="en" suppressHydrationWarning>
      <head>
      <meta name="google-site-verification" content="vAXaQAf1AwfzrK402zrQbne-DlogUKuiHaQAWg7P09A" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#A050C3" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
