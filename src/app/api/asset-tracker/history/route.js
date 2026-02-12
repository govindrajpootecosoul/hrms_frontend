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
    const { searchParams } = new URL(request.url);

    const companyId = searchParams.get('companyId');
    const company = searchParams.get('company');
    const type = (searchParams.get('type') || '').toLowerCase();
    const assetId = searchParams.get('assetId');
    const assetTag = searchParams.get('assetTag');
    const limitRaw = Number(searchParams.get('limit') || 50);
    const limit = Math.min(Math.max(limitRaw, 1), 200);
    const latestOnly = searchParams.get('latestOnly') === 'true';

    // Get company-specific collection
    const collection = await getAssetHistoryCollection(company);

    console.log('[History API] Fetching history:', { companyId, company, type, limit });

    const query = {};
    if (companyId) query.companyId = companyId;
    // Note: Since we're using company-specific databases, we don't need to filter by company field
    // But we'll keep it for extra safety if company field exists in records
    if (type) query.type = type;
    // Search by assetId OR assetTag
    if (assetId || assetTag) {
      const searchValue = assetId || assetTag;
      query.$or = [
        { assetId: searchValue },
        { assetTag: searchValue }
      ];
    }

    console.log('[History API] Query:', JSON.stringify(query));

    let items;
    if (latestOnly) {
      // Group by assetId and get only the latest entry per asset
      const allItems = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      
      console.log('[History API] Found items (latestOnly):', allItems.length);
      
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
      
      console.log('[History API] Found items:', items.length);
    }

    console.log('[History API] Returning items:', items.length);

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


