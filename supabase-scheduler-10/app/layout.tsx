import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "R&S Scheduling",
  description: "R&S Tower Service scheduling board",
  // This helps Next build absolute URLs if you ever do OG images, sitemaps, etc.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://rnsweeklyboard.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
