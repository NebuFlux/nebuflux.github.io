import type { Metadata } from "next";
import { Fira_Code, Inter } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nebuflux.github.io"),
  title: "Joshua Shoemaker",
  description: "Joshua Shoemaker | Computer Science ePortfolio — showcasing software development projects and academic artifacts from a BS in Computer Science at Southern New Hampshire University. Built with Next.js.",
  keywords: ["Joshua Shoemaker", "Computer Science", "software developer", "ePortfolio", "SNHU", "Southern New Hampshire University", "Next.js", "web development", "AI", "state machine", "backend"],
  authors: [{ name: "Joshua Shoemaker", url: "https://github.com/NebuFlux" }],
  robots: { index: true, follow: true },
  openGraph: {
    title: "Joshua Shoemaker | CS ePortfolio",
    description: "Software development projects and academic artifacts from a BS in Computer Science at SNHU.",
    url: "https://nebuflux.github.io",
    siteName: "Joshua Shoemaker Portfolio",
    type: "website",
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
        className={`${firaCode.variable} ${inter.variable} antialiased flex flex-col min-h-screen`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}

