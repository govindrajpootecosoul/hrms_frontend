import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { CompanyProvider } from "@/lib/context/CompanyContext";
import ToastProvider from "@/components/common/Toast";
import ErrorBoundary from "@/components/common/ErrorBoundary";

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
    <html lang="en">
      <body
        className={`${jakartaSans.variable} ${geistMono.variable} antialiased`}
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
