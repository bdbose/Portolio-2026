import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import { profile, education } from "@/lib/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const SITE_URL = "https://bdbose.in";
const TITLE = "Bidipto Bose — Senior Software Engineer";
const DESCRIPTION =
  "Senior Software Engineer at SaffronStays (ex Nykaa, Trell). I build Go backends, booking & revenue engines, AI search and chatbots, custom DNS infrastructure, and buttery-smooth React/Next.js frontends.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — Bidipto Bose",
  },
  description: DESCRIPTION,
  keywords: [
    "Bidipto Bose",
    "Senior Software Engineer",
    "Full Stack Developer",
    "Golang Developer",
    "React Developer",
    "Next.js",
    "SaffronStays",
    "Booking Systems",
    "AI Chatbot",
    "Elasticsearch",
    "Kolkata",
    "India",
  ],
  authors: [{ name: profile.name, url: SITE_URL }],
  creator: profile.name,
  publisher: profile.name,
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Bidipto Bose",
    locale: "en_US",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#070707",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: SITE_URL,
  email: `mailto:${profile.email}`,
  jobTitle: profile.role,
  worksFor: {
    "@type": "Organization",
    name: "SaffronStays",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: education.school,
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kolkata",
    addressRegion: "West Bengal",
    addressCountry: "IN",
  },
  sameAs: [profile.linkedin, profile.github],
  knowsAbout: [
    "Golang",
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Python",
    "Elasticsearch",
    "NLP",
    "Kafka",
    "Redis",
    "AWS",
    "DNS Infrastructure",
    "Booking Systems",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Bidipto Bose — Portfolio",
  url: SITE_URL,
  author: { "@type": "Person", name: profile.name },
  description: DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} antialiased`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <SmoothScroll>
          {children}
          <Cursor />
          <div className="grain" aria-hidden />
        </SmoothScroll>
      </body>
    </html>
  );
}
