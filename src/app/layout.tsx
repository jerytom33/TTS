import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { TranslationProvider } from "@/contexts/translation-context";
import { PuterProvider } from "@/contexts/puter-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VoiceVideo AI - Malayalam TTS Video Generation Platform",
  description: "Transform text into professional videos with AI-powered Text-to-Speech technology. Supporting Malayalam and English languages with premium voice quality.",
  keywords: ["TTS", "Video Generation", "Malayalam", "Text to Speech", "AI", "Puter.js", "Voice Synthesis"],
  authors: [{ name: "VoiceVideo AI Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "VoiceVideo AI - Malayalam TTS Video Generation",
    description: "Create stunning videos from text using AI-powered Malayalam Text-to-Speech technology",
    url: "https://voicevideo.ai",
    siteName: "VoiceVideo AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VoiceVideo AI - Malayalam TTS Video Generation",
    description: "Create stunning videos from text using AI-powered Malayalam Text-to-Speech technology",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <PuterProvider>
          <AuthProvider>
            <TranslationProvider>
              {children}
              <Toaster />
            </TranslationProvider>
          </AuthProvider>
        </PuterProvider>
      </body>
    </html>
  );
}
