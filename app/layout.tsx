import type { Metadata } from "next";
import { Lora, Source_Code_Pro, Varela_Round } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const varelaRound = Varela_Round({
  variable: "--font-varela-round",
  subsets: ["latin"],
  weight: ["400"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-scp-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Altmeta.org",
  description: "Personal website and blog of Zack Spellman",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${varelaRound.variable} ${lora.variable} ${sourceCodePro.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-grow w-full max-w-4xl mx-auto px-6">
          {children}
        </main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
