import type { Metadata } from "next";
import { Inter, Orbitron, Tangerine } from "next/font/google";
import "./globals.css";
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { NextAuthProvider } from "./components/Providers";
import { Toaster } from 'sonner';
import CookieBanner from './components/CookieBanner';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "700", "900"], variable: '--font-orbitron' });
const tangerine = Tangerine({ subsets: ["latin"], weight: ["400", "700"], variable: '--font-tangerine' });

export const metadata: Metadata = {
  title: "Fonzu Wiki",
  description: "A wiki for gacha game news, guides, and information.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
        </NextAuthProvider>
      </body>
    </html>
  );
}