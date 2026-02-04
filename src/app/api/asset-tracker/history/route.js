import { NextResponse } from 'next/server';
import { getAssetHistoryCollection } from '@/lib/mongodb';

// GET - Fetch asset history entries
// Query params:
// - companyId (optional)
// - company (optional, name)
// - type (optional): checkout | checkin | maintenance | broken | created | updated | deleted
// - limit (optional, default 50, max 200)
export async function GET(request) {
  try {
    const collection = await getAssetHistoryCollection();
    const { searchParams } = new URL(request.url);

    const companyId = searchParams.get('companyId');
    const company = searchParams.get('company');
    const type = (searchParams.get('type') || '').toLowerCase();
    const assetId = searchParams.get('assetId');
    const assetTag = searchParams.get('assetTag');
    const limitRaw = Number(searchParams.get('limit') || 50);
    const limit = Math.min(Math.max(limitRaw, 1), 200);
    const latestOnly = searchParams.get('latestOnly') === 'true';

    const query = {};
    if (companyId) query.companyId = companyId;
    if (company) {
      const escapedCompany = company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.company = { $regex: new RegExp(`^${escapedCompany}$`, 'i') };
    }
    if (type) query.type = type;
    // Search by assetId OR assetTag
    if (assetId || assetTag) {
      const searchValue = assetId || assetTag;
      query.$or = [
        { assetId: searchValue },
        { assetTag: searchValue }
      ];
    }

    let items;
    if (latestOnly) {
      // Group by assetId and get only the latest entry per asset
      const allItems = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      
      // Use Map to keep only latest per assetId
      const latestMap = new Map();
      for (const item of allItems) {
        const assetId = item.assetId || item.assetTag;
        if (assetId && !latestMap.has(assetId)) {
          latestMap.set(assetId, item);
        }
      }
      items = Array.from(latestMap.values()).slice(0, limit);
    } else {
      items = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
    }

    return NextResponse.json({ success: true, data: items, count: items.length });
  } catch (error) {
    console.error('[API] Error fetching asset history:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch asset history' },
      { status: 500 },
    );
  }
}

// POST - Create an asset history entry (internal use)
export async function POST(request) {
  try {
    const body = await request.json();
    const collection = await getAssetHistoryCollection();

    const historyItem = {
      ...body,
      type: (body.type || '').toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    const result = await collection.insertOne(historyItem);

    return NextResponse.json({
      success: true,
      data: { ...historyItem, _id: result.insertedId },
    });
  } catch (error) {
    console.error('[API] Error creating asset history:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create asset history' },
      { status: 500 },
    );
  }
}


