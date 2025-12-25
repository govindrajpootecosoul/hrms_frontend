'use client';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import './app.css';

export default function QueryTrackerLayout({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}
