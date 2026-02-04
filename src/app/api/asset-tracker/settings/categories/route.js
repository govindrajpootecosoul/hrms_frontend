import { NextResponse } from 'next/server';
import { getAssetCategoriesCollection } from '@/lib/mongodb';

function defaultCategories() {
  return [
    {
      id: '1',
      name: 'Computer Assets',
      prefix: 'CA',
      subcategories: [
        { id: '1-1', name: 'Laptop', prefix: 'LAP', tagPrefix: 'CA-LAP' },
        { id: '1-2', name: 'Desktop', prefix: 'DESK', tagPrefix: 'CA-DESK' },
        { id: '1-3', name: 'Server', prefix: 'SRV', tagPrefix: 'CA-SRV' },
      ],
    },
    {
      id: '2',
      name: 'External Equipment',
      prefix: 'EE',
      subcategories: [
        { id: '2-1', name: 'Keyboard', prefix: 'KBD', tagPrefix: 'EE-KBD' },
        { id: '2-2', name: 'Mouse', prefix: 'MSE', tagPrefix: 'EE-MSE' },
        { id: '2-3', name: 'Charger', prefix: 'CHG', tagPrefix: 'EE-CHG' },
        { id: '2-4', name: 'LCD Monitor', prefix: 'LCD', tagPrefix: 'EE-LCD' },
        { id: '2-5', name: 'Bag', prefix: 'BAG', tagPrefix: 'EE-BAG' },
      ],
    },
    {
      id: '3',
      name: 'Office Supplies',
      prefix: 'OS',
      subcategories: [
        { id: '3-1', name: 'Printer', prefix: 'PRT', tagPrefix: 'OS-PRT' },
        { id: '3-2', name: 'Scanner', prefix: 'SCN', tagPrefix: 'OS-SCN' },
      ],
    },
  ];
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'default';

    const col = await getAssetCategoriesCollection();
    const doc = await col.findOne({ companyId });

    if (!doc) {
      const categories = defaultCategories();
      await col.insertOne({ companyId, categories, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      return NextResponse.json({ success: true, data: { companyId, categories } });
    }

    return NextResponse.json({ success: true, data: { companyId, categories: doc.categories || [] } });
  } catch (error) {
    console.error('Error fetching category settings:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const companyId = body.companyId || 'default';
    const categories = Array.isArray(body.categories) ? body.categories : null;

    if (!categories) {
      return NextResponse.json({ success: false, error: 'categories is required (array)' }, { status: 400 });
    }

    const col = await getAssetCategoriesCollection();
    await col.updateOne(
      { companyId },
      { $set: { categories, updatedAt: new Date().toISOString() }, $setOnInsert: { createdAt: new Date().toISOString() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Categories saved', data: { companyId, categories } });
  } catch (error) {
    console.error('Error saving category settings:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to save categories' }, { status: 500 });
  }
}


