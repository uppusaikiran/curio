import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Footer } from '@/components/ui/footer';
import ElevenLabsWidget from '@/components/ElevenLabsWidget';

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
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
