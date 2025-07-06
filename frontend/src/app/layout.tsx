import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Footer } from '@/components/ui/footer';
import ElevenLabsWidget from '@/components/ElevenLabsWidget';
import TavusVideoAI from '@/components/TavusVideoAI';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Curio - Cultural Intelligence Assistant",
  description: "Discover connections across music, film, dining, fashion, and more with Qloo's Taste AI™",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: ['/favicon-196x196.png'],
    apple: [
      { url: '/apple-icon.png' },
      { url: '/favicon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/favicon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/favicon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'apple-touch-icon', url: '/apple-icon.png' },
      { rel: 'mask-icon', url: '/favicon-512x512.png', color: '#000000' },
    ]
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Always include TavusVideoAI
  const tavusApiKey = process.env.NEXT_PUBLIC_TAVUS_API_KEY || '';
  
  console.log('Layout rendering, Tavus API key available:', !!tavusApiKey);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <div className="flex-grow">
                {children}
              </div>
              <Footer />
            </div>
            <ElevenLabsWidget />
            {/* Always render TavusVideoAI even if API key is empty */}
            <TavusVideoAI 
              replicaId="rb17cf590e15"
              personaId="p2f43cff6aac"
              apiKey={tavusApiKey}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
