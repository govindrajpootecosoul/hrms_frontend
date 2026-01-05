'use client';

// Query Tracker uses the main AuthContext from the root layout
// No need for separate AuthProvider here
export default function QueryTrackerLayout({ children }) {
  return <>{children}</>;
}

