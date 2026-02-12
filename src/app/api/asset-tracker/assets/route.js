import { NextResponse } from 'next/server';
import { getAssetsCollection, getAssetHistoryCollection } from '@/lib/mongodb';

async function logAssetHistory(entry, company = null) {
  try {
    console.log('[API] Logging asset history:', { type: entry.type, action: entry.action, company, assetTag: entry.assetTag });
    const history = await getAssetHistoryCollection(company);
    const historyEntry = { ...entry, createdAt: new Date().toISOString() };
    const result = await history.insertOne(historyEntry);
    console.log('[API] Asset history logged successfully:', result.insertedId);
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

    // Company name is REQUIRED for proper data isolation
    // Without company name, we cannot determine which database to use
    if (!company || company.trim() === '') {
      console.warn('[API] No company name provided - returning empty array for safety');
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'Company name is required to fetch assets'
      });
    }

    // Get company-specific collection (this automatically uses the correct database)
    // e.g., 'thrive_asset_tracker' or 'ecosoul_asset_tracker'
    const collection = await getAssetsCollection(company);

    // Build query - Since we're using company-specific databases, we don't need to filter by company field
    // The database itself is already isolated by company
    // We'll only filter by companyId if provided (for extra safety)
    const query = {};
    
    if (companyId) {
      query.companyId = companyId;
    }
    
    console.log(`[API] Fetching assets from company DB: ${company}, query:`, JSON.stringify(query));
    console.log(`[API] CompanyId from params: ${companyId}, Company: ${company}`);
    console.log(`[API] Using database collection for company: ${company}`);

    const assets = await collection.find(query).sort({ createdAt: -1 }).toArray();
    
    console.log(`[API] Found ${assets.length} assets in database for company: ${company}`);
    
    // Debug: Log first asset's company field if available
    if (assets.length > 0) {
      console.log(`[API] Sample asset company field:`, assets[0].company);
    }

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
    // Default status to 'available' if not provided or empty
    const asset = {
      ...body,
      status: body.status && body.status.trim() ? body.status : 'available',
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

