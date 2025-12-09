import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { CompanyProvider } from "@/lib/context/CompanyContext";
import ToastProvider from "@/components/common/Toast";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Finance Portal - Worklytics",
  description: "Financial Operations and Accounting Portal",
  icons: {
    icon: '/VectorAIStudioWhite.svg',
  },
};

export default function FinanceLayout({ children }) {
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

