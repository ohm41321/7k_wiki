import type { Metadata } from "next";
import { Inter, Orbitron, Tangerine } from "next/font/google";
import "./globals.css";
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { NextAuthProvider } from "./components/Providers";
import { Toaster } from 'sonner';
import CookieBanner from './components/CookieBanner';
import { ToastContainer } from './components/Toast';
import PWAProvider from './components/PWAProvider';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "700", "900"], variable: '--font-orbitron' });
const tangerine = Tangerine({ subsets: ["latin"], weight: ["400", "700"], variable: '--font-tangerine' });

export const metadata: Metadata = {
  title: "Fonzu Wiki - สารานุกรมเกมกาชา",
  description: "สารานุกรมข่าวสาร ไกด์ และข้อมูลเกมกาชา รวมทุกอย่างที่คุณต้องการรู้เกี่ยวกับเกมโปรดของคุณ",
  keywords: "เกมกาชา, gacha game, ไกด์เกม, ข่าวสารเกม, Fonzu Wiki, Seven Knights, Wuthering Waves, Genshin Impact, Honkai Star Rail",
  authors: [{ name: "Fonzu Wiki Team" }],
  creator: "Fonzu Wiki",
  publisher: "Fonzu Wiki",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://fonzu-wiki.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Fonzu Wiki - สารานุกรมเกมกาชา",
    description: "สารานุกรมข่าวสาร ไกด์ และข้อมูลเกมกาชา รวมทุกอย่างที่คุณต้องการรู้เกี่ยวกับเกมโปรดของคุณ",
    url: "https://fonzu-wiki.vercel.app",
    siteName: "Fonzu Wiki",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/pic/7k_banner.webp",
        width: 1200,
        height: 630,
        alt: "Fonzu Wiki Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fonzu Wiki - สารานุกรมเกมกาชา",
    description: "สารานุกรมข่าวสาร ไกด์ และข้อมูลเกมกาชา รวมทุกอย่างที่คุณต้องการรู้เกี่ยวกับเกมโปรดของคุณ",
    images: ["/pic/7k_banner.webp"],
    creator: "@fonzuwiki",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ff6b35" />
        <meta name="msapplication-TileColor" content="#ff6b35" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Fonzu Wiki" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/vercel.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/vercel.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/vercel.svg" />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileImage" content="/vercel.svg" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Viewport for PWA */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${orbitron.variable} ${tangerine.variable} font-sans flex flex-col min-h-screen`} suppressHydrationWarning>
        <NextAuthProvider>
          <Navbar />
          <main className="flex-grow w-full mx-auto pt-16">
            {children}
          </main>
          {modal}
          <Footer />
          <CookieBanner />
          <Toaster theme="dark" />
          <ToastContainer />
          <PWAProvider />
        </NextAuthProvider>
      </body>
    </html>
  );
}