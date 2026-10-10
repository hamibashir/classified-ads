import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { GeolocationProvider } from "@/hooks/useGeolocation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Classified Ads PK - Pakistan's #1 Local Marketplace",
  description:
    "Buy and sell vehicles, electronics, mobile phones, real estate, and goods across all Pakistani cities with real-time chat and direct contact.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col bg-background text-foreground antialiased`}>
        <AuthProvider>
          <GeolocationProvider>
            <Navbar />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </GeolocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
