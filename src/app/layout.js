import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { CompanyProvider } from "@/lib/context/CompanyContext";
import ToastProvider from "@/components/common/Toast";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "HRMS & Asset Tracker",
  description: "Modern HRMS and Asset Tracker application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>
            <CompanyProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </CompanyProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
