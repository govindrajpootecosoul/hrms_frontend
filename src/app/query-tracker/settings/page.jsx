'use client';

import React from 'react';
import Layout from '@/lib/query-tracker/components/Layout';
import ProtectedRoute from '@/lib/query-tracker/components/ProtectedRoute';
import Settings from '@/lib/query-tracker/pages/Settings';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <Settings />
      </Layout>
    </ProtectedRoute>
  );
}

