import type { Metadata } from "next";
import { Lora, Source_Code_Pro, Varela_Round } from "next/font/google";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${varelaRound.variable} ${lora.variable} ${sourceCodePro.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
