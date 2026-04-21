import { IBM_Plex_Sans, Libre_Baskerville, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm-sans",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre-baskerville",
});

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-mono",
});

export const metadata = {
  title: "FirmEdge CRM — CA & Consulting",
  description: "Advanced CRM for Chartered Accountants and Consulting Firms",
};

import { Toaster } from "@/components/ui/toaster";
import ProgressBar from "@/components/ProgressBar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${ibmSans.variable} ${libreBaskerville.variable} ${ibmMono.variable} font-sans`}
      >
        <ProgressBar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
