'use client';

import React from 'react';
import Layout from '@/lib/query-tracker/components/Layout';
import ProtectedRoute from '@/lib/query-tracker/components/ProtectedRoute';
import Reports from '@/lib/query-tracker/pages/Reports';

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <Reports />
      </Layout>
    </ProtectedRoute>
  );
}

