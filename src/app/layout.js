import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { CompanyProvider } from "@/lib/context/CompanyContext";
import ToastProvider from "@/components/common/Toast";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans", // reuse existing CSS variable wiring
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "HRMS & Asset Tracker",
  description: "Modern HRMS and Asset Tracker application",
  icons: {
    icon: '/VectorAIStudioWhite.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body
        className={`${jakartaSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <CompanyProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </CompanyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
