import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthProvider";
import { AppDataProvider } from "./context/AppDataProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chamo Chat",
  description: "A real-time messaging application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add simple script to detect and apply dark mode based on system preference only */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // On page load or when changing themes, best to add inline in 'head' to avoid FOUC
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }

            // Listen for changes in system color scheme
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
              if (e.matches) {
                document.documentElement.classList.add('dark')
              } else {
                document.documentElement.classList.remove('dark')
              }
            })
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <AppDataProvider>
            {children}
          </AppDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
