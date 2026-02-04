import { NextResponse } from 'next/server';
import { getAssetsCollection } from '@/lib/mongodb';

// GET - Fetch a single asset by ID or assetTag
export async function GET(request, { params }) {
  try {
    const { assetId } = params;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const company = searchParams.get('company');

    if (!assetId) {
      return NextResponse.json(
        { success: false, error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    const collection = await getAssetsCollection();
    
    // Build query - try to find by id, _id, or assetTag
    const query = {
      $or: [
        { id: String(assetId) },
        { _id: assetId },
        { assetTag: String(assetId) },
        // Case-insensitive assetTag match
        { assetTag: { $regex: new RegExp(`^${String(assetId).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
      ]
    };

    // Add company filters if provided
    if (companyId) {
      query.companyId = companyId;
    }
    if (company) {
      const escapedCompany = company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.company = { $regex: new RegExp(`^${escapedCompany}$`, 'i') };
    }

    console.log('[API] Fetching asset with query:', JSON.stringify(query));

    const asset = await collection.findOne(query);

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error('[API] Error fetching asset:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}

