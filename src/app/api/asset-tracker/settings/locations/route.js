import { NextResponse } from 'next/server';
import { getAssetLocationsCollection } from '@/lib/mongodb';

function defaultLocations() {
  return [
    { id: '1', name: 'Head Office', type: 'Site', address: '', country: '', parentSite: '' },
    { id: '2', name: 'Branch Office', type: 'Site', address: '', country: '', parentSite: '' },
    { id: '3', name: 'Warehouse', type: 'Site', address: '', country: '', parentSite: '' },
    { id: '4', name: 'Floor 1', type: 'Location', address: '', country: '', parentSite: 'Head Office' },
    { id: '5', name: 'Floor 2', type: 'Location', address: '', country: '', parentSite: 'Head Office' },
    { id: '6', name: 'Floor 3', type: 'Location', address: '', country: '', parentSite: 'Head Office' },
  ];
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'default';

    const col = await getAssetLocationsCollection();
    const doc = await col.findOne({ companyId });

    if (!doc) {
      const locations = defaultLocations();
      await col.insertOne({ companyId, locations, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      return NextResponse.json({ success: true, data: { companyId, locations } });
    }

    return NextResponse.json({ success: true, data: { companyId, locations: doc.locations || [] } });
  } catch (error) {
    console.error('Error fetching location settings:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch locations' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const companyId = body.companyId || 'default';
    const locations = Array.isArray(body.locations) ? body.locations : null;

    if (!locations) {
      return NextResponse.json({ success: false, error: 'locations is required (array)' }, { status: 400 });
    }

    const col = await getAssetLocationsCollection();
    await col.updateOne(
      { companyId },
      { $set: { locations, updatedAt: new Date().toISOString() }, $setOnInsert: { createdAt: new Date().toISOString() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Locations saved', data: { companyId, locations } });
  } catch (error) {
    console.error('Error saving location settings:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to save locations' }, { status: 500 });
  }
}


