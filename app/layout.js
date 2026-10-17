import { Geist, Geist_Mono } from "next/font/google";

import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getThemeInlineScript } from "@/lib/theme/theme-inline-script";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SKNotes",
  description: "Personal notes — capture quickly, find reliably.",
  appleWebApp: {
    capable: true,
    title: "SKNotes",
    statusBarStyle: "default",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} min-h-dvh antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeInlineScript() }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <ServiceWorkerRegister />
          <div className="flex min-h-dvh flex-1 flex-col">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
