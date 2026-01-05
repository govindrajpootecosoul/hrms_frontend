'use client';

import React from 'react';
import Layout from '@/lib/query-tracker/components/Layout';
import ProtectedRoute from '@/lib/query-tracker/components/ProtectedRoute';
import Dashboard from '@/lib/query-tracker/pages/Dashboard';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <Dashboard />
      </Layout>
    </ProtectedRoute>
  );
}
