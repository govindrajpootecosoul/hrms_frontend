import { NextResponse } from 'next/server';
import { getAssetsCollection } from '@/lib/mongodb';

// POST - Bulk insert assets (used by Excel upload)
export async function POST(request) {
  try {
    const body = await request.json();
    const { assets } = body;

    if (!Array.isArray(assets) || assets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Assets array is required' },
        { status: 400 }
      );
    }

    const collection = await getAssetsCollection();

    // Add timestamps to each asset
    const assetsWithTimestamps = assets.map(asset => ({
      ...asset,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const result = await collection.insertMany(assetsWithTimestamps);

    return NextResponse.json({
      success: true,
      insertedCount: result.insertedCount,
      insertedIds: Object.values(result.insertedIds),
      message: `Successfully inserted ${result.insertedCount} assets`,
    });
  } catch (error) {
    console.error('Error bulk inserting assets:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to bulk insert assets' },
      { status: 500 }
    );
  }
}

