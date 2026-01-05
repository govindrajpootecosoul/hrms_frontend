'use client';

import React from 'react';
import Layout from '@/lib/query-tracker/components/Layout';
import ProtectedRoute from '@/lib/query-tracker/components/ProtectedRoute';
import QueriesList from '@/lib/query-tracker/pages/QueriesList';

export default function QueriesPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <QueriesList />
      </Layout>
    </ProtectedRoute>
  );
}

