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
      { url: '/curio_logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/curio_logo.png' }
    ]
  }
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
