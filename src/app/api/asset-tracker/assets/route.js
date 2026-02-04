import { NextResponse } from 'next/server';
import { getAssetsCollection, getAssetHistoryCollection } from '@/lib/mongodb';

async function logAssetHistory(entry, company = null) {
  try {
    const history = await getAssetHistoryCollection(company);
    await history.insertOne({ ...entry, createdAt: new Date().toISOString() });
  } catch (e) {
    // Never fail the main request because of history logging
    console.error('[API] Failed to write asset history:', e);
  }
}

// GET - Fetch all assets
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const company = searchParams.get('company'); // Company name filter (Thrive, Ecosoul Home, etc.)

    // Get company-specific collection (this automatically uses the correct database)
    // If company is provided, it uses e.g., 'thrive_asset_tracker' or 'ecosoul_asset_tracker'
    // If no company, it uses default 'asset_tracker' database
    const collection = await getAssetsCollection(company);

    // Build query - filter by companyId if provided
    // Note: We don't need to filter by company name in the query since we're already
    // using company-specific databases (thrive_asset_tracker vs ecosoul_asset_tracker)
    const query = {};
    
    if (companyId) {
      query.companyId = companyId;
    }
    
    // Optional: Also filter by company field for extra safety (in case data is mixed)
    if (company) {
      const escapedCompany = company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.company = { $regex: new RegExp(`^${escapedCompany}$`, 'i') };
    }
    
    console.log(`[API] Fetching assets from company DB: ${company || 'default'}, query:`, JSON.stringify(query));
    console.log(`[API] CompanyId from params: ${companyId}, Company: ${company}`);

    const assets = await collection.find(query).sort({ createdAt: -1 }).toArray();
    
    console.log(`[API] Found ${assets.length} assets in database`);

    return NextResponse.json({
      success: true,
      data: assets,
      count: assets.length,
    });
  } catch (error) {
    console.error('[API] Error fetching assets:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

// POST - Create a new asset
export async function POST(request) {
  try {
    const body = await request.json();
    const company = body.company || ''; // Get company from request body
    
    // Get company-specific collection
    const collection = await getAssetsCollection(company);

    // Add timestamps and ensure company field is stored
    const asset = {
      ...body,
      company: company, // Ensure company field is stored (from sessionStorage)
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('[API] Creating asset with company:', asset.company, 'in DB:', company || 'default');

    const result = await collection.insertOne(asset);

    // Get company-specific history collection
    const historyCollection = await getAssetHistoryCollection(company);
    await historyCollection.insertOne({
      type: 'created',
      action: 'created',
      companyId: asset.companyId,
      company: asset.company,
      assetId: asset.id,
      assetTag: asset.assetTag,
      description: asset.model || asset.category || '',
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: { ...asset, _id: result.insertedId },
      message: 'Asset created successfully',
    });
  } catch (error) {
    console.error('[API] Error creating asset:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create asset' },
      { status: 500 }
    );
  }
}

// PUT - Update an asset
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    const company = updateData.company || body.company || '';

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    // Get company-specific collection
    const collection = await getAssetsCollection(company);

    // Fetch current asset for history diffing
    const prev = await collection.findOne({ id: id });

    const result = await collection.updateOne(
      { id: id },
      {
        $set: {
          ...updateData,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    // History event mapping for the dashboard "Feeds"
    const prevAssignedTo = prev?.assignedTo || null;
    const nextAssignedTo = updateData.assignedTo ?? prevAssignedTo;
    const prevStatus = (prev?.status || '').toLowerCase();
    const nextStatus = (((updateData.status ?? prevStatus) || '')).toLowerCase();

    let type = 'updated';
    let action = 'updated';

    if (!prevAssignedTo && nextAssignedTo) {
      type = 'checkout';
      action = 'checked out';
    } else if (prevAssignedTo && !nextAssignedTo) {
      type = 'checkin';
      action = 'checked in';
    } else if (prevAssignedTo && nextAssignedTo && prevAssignedTo !== nextAssignedTo) {
      type = 'checkout';
      action = 're-assigned';
    } else if (prevStatus !== nextStatus && nextStatus === 'maintenance') {
      type = 'maintenance';
      action = 'moved to maintenance';
    } else if (prevStatus !== nextStatus && nextStatus === 'broken') {
      type = 'broken';
      action = 'marked broken';
    }

    await logAssetHistory({
      type,
      action,
      companyId: updateData.companyId || prev?.companyId,
      company: updateData.company || prev?.company,
      assetId: id,
      assetTag: prev?.assetTag,
      description: prev?.model || prev?.category || '',
      assignedTo: nextAssignedTo,
      assignedFrom: prevAssignedTo,
      status: nextStatus,
      department: updateData.department ?? prev?.department ?? null,
    }, company);

    return NextResponse.json({
      success: true,
      message: 'Asset updated successfully',
    });
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update asset' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an asset
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const company = searchParams.get('company') || '';

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    // Get company-specific collection
    const collection = await getAssetsCollection(company);
    const prev = await collection.findOne({ id: id });
    const result = await collection.deleteOne({ id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    await logAssetHistory({
      type: 'deleted',
      action: 'deleted',
      companyId: prev?.companyId,
      company: prev?.company,
      assetId: id,
      assetTag: prev?.assetTag,
      description: prev?.model || prev?.category || '',
      assignedTo: prev?.assignedTo || null,
      status: (prev?.status || '').toLowerCase(),
      department: prev?.department || null,
    }, company || prev?.company);

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete asset' },
      { status: 500 }
    );
  }
}

