import type { Metadata } from "next";
import "./globals.css";
import ErrorBoundary from "../components/ErrorBoundary";

export const metadata: Metadata = {
  title: "🎵 Sync Up - NYC Music Collaboration Search",
  description: "Connect with talented musicians, find perfect venues, and join the vibrant NYC music community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
