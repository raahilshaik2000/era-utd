import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import FluidBackground from "@/components/FluidBackground";
import Cursor from "@/components/Cursor";
import Preloader from "@/components/Preloader";
import Nav from "@/components/Nav";
import { TAGLINE } from "@/lib/content";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "ERA at UT Dallas",
  description: `${TAGLINE} We connect students with internships and the companies offering them.`,
  openGraph: {
    title: "ERA at UT Dallas",
    description: TAGLINE,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#020606",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} font-sans antialiased`}>
        <FluidBackground />
        <SmoothScroll />
        <Preloader />
        <Cursor />
        <Nav />
        {children}
      </body>
    </html>
  );
}
