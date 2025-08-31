import type { Metadata } from "next";
import { PT_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { DataProvider } from "@/context/data-context";
import { ThemeProvider } from "@/context/theme-context";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Family Manager",
  description: "A smart family management app for budgeting, grocery planning, and health tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${ptSans.variable} font-body antialiased`}>
        <ThemeProvider>
          <DataProvider>
            {children}
          </DataProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
