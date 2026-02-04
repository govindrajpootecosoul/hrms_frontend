import { NextResponse } from 'next/server';
import { getAssetsCollection } from '@/lib/mongodb';

// GET - Get asset counts by category and subcategory
export async function GET(request) {
  try {
    const collection = await getAssetsCollection();
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    // Build query - filter by companyId if provided
    const query = companyId ? { companyId } : {};

    // Fetch all assets
    const assets = await collection.find(query).toArray();

    // Count assets by category and subcategory
    const categoryCounts = {};
    const subcategoryCounts = {};

    assets.forEach(asset => {
      const category = asset.category || 'Unknown';
      const subcategory = asset.subcategory || 'Unknown';
      const assetTag = asset.assetTag || '';
      
      // Count by category
      if (!categoryCounts[category]) {
        categoryCounts[category] = 0;
      }
      categoryCounts[category]++;

      // Extract tag prefix from assetTag (e.g., "CA-LAP-828" -> "CA-LAP")
      let tagPrefix = '';
      if (assetTag) {
        const parts = assetTag.split('-');
        if (parts.length >= 2) {
          tagPrefix = `${parts[0]}-${parts[1]}`;
        }
      }
      
      // If no tag prefix from assetTag, try to construct from category/subcategory
      if (!tagPrefix && category && subcategory) {
        // Map category names to prefixes
        const categoryPrefixMap = {
          'Computer Assets': 'CA',
          'External Equipment': 'EE',
          'Office Supplies': 'OS',
        };
        
        // Map subcategory names to codes
        const subcategoryCodeMap = {
          'Laptop': 'LAP',
          'Desktop': 'DESK',
          'Server': 'SRV',
          'Keyboard': 'KBD',
          'Mouse': 'MSE',
          'Charger': 'CHG',
          'LCD Monitor': 'LCD',
          'LCD-Monitors': 'LCD',
          'Bag': 'BAG',
          'Printer': 'PRT',
          'Scanner': 'SCN',
        };
        
        const catPrefix = categoryPrefixMap[category] || category.substring(0, 2).toUpperCase();
        const subCode = subcategoryCodeMap[subcategory] || subcategory.substring(0, 3).toUpperCase();
        tagPrefix = `${catPrefix}-${subCode}`;
      }
      
      // Count by tag prefix (e.g., "CA-LAP", "EE-KBD")
      if (tagPrefix) {
        if (!subcategoryCounts[tagPrefix]) {
          subcategoryCounts[tagPrefix] = 0;
        }
        subcategoryCounts[tagPrefix]++;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        categoryCounts,
        subcategoryCounts,
      },
    });
  } catch (error) {
    console.error('Error fetching category counts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch category counts' },
      { status: 500 }
    );
  }
}

