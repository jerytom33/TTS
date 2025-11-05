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
  title: "VoiceVideo AI - TTS Platform",
  description: "Transform text into high-quality audio with AI-powered Text-to-Speech technology. Supporting Malayalam and English languages.",
  keywords: ["TTS", "Text to Speech", "Malayalam", "AI", "Puter.js", "Voice Synthesis", "Audio Generation"],
  authors: [{ name: "VoiceVideo AI Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "VoiceVideo AI - TTS Platform",
    description: "Create high-quality audio from text using AI-powered Text-to-Speech technology",
    url: "https://voicevideo.ai",
    siteName: "VoiceVideo AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VoiceVideo AI - TTS Platform",
    description: "Create high-quality audio from text using AI-powered Text-to-Speech technology",
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
