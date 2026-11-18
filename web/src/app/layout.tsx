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
  title: "Zaaz B - Pakistan's Premier Verified Marketplace",
  description:
    "Buy and sell luxury vehicles, mobile devices, electronics, premium real estate, and goods across Pakistan with real-time in-app chat and verified seller protection on Zaaz B.",
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
