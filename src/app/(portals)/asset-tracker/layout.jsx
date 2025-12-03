'use client';

import Navbar from '@/components/layout/Navbar';

export default function AssetTrackerLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar onMenuToggle={() => {}} isMenuOpen={false} />
      
      <main className="w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
