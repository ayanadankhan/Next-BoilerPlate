import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import MediaAsset from '@/models/MediaAsset';
import { FilterQuery } from 'mongoose';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // 1. Setup Query and Pagination Parameters
        const url = new URL(req.url);
        const searchParams = url.searchParams;

        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Filtering
        const filterSubject = searchParams.get('subject') || '';
        const filterMainCatId = searchParams.get('mainCat') || 'all';
        const filterSubCatId = searchParams.get('subCat') || 'all';
        const minDuration = searchParams.get('minDuration') || '';
        const maxDuration = searchParams.get('maxDuration') || '';
        const dateFrom = searchParams.get('dateFrom') || '';
        const dateTo = searchParams.get('dateTo') || '';
        const sortOrder = searchParams.get('sort') || 'createdAt'; // Default sort

        // 2. Build the MongoDB Query Object
        const query: FilterQuery<any> = {};

        // Subject Filter (Case-insensitive partial match)
        if (filterSubject) {
            query.subject = { $regex: filterSubject, $options: 'i' };
        }

        // Category Filters (Assuming you get Category IDs from the client)
        // **NOTE**: This logic depends heavily on your Category model structure.
        // It's often easier if the client sends the *name* or an array of *Category IDs*.
        if (filterSubCatId !== 'all') {
            // Priority to sub-category ID
            query.categoryId = filterSubCatId;
        } else if (filterMainCatId !== 'all') {
            // Find assets by main category name (if sub-category is 'all')
            // This requires you to pass the main category *name* (genre) to the asset
            // or perform a lookup in the Category model first.
            // For this simplified example, we'll assume the client sends the Category ID
            // or you'll handle a lookup. For now, let's keep it simple with categoryId.
            // If you need filtering by parent/main category name, that logic is more complex.
            // Example:
            // query.$or = [
            //     { categoryId: filterMainCatId }, // Matches the main category itself if assets link directly
            //     { categoryId: { $in: subCategoryIdsOfMainCat } } // Requires a separate fetch/lookup for sub-category IDs
            // ];
            query.$or = [
                { categoryId: filterMainCatId }
                // For a proper Main Category filter, you'd need to fetch all sub-category IDs
                // belonging to the main category ID and add them to this $or array.
                // Since this is a guide, we'll skip the Category lookup complexity for now.
            ];
        }

        if (minDuration || maxDuration) {
            query.duration = {};
            if (minDuration) query.duration.$gte = minDuration;
            if (maxDuration) query.duration.$lte = maxDuration;
        }

        // Date Range Filter
        if (dateFrom || dateTo) {
            query.creationDate = {};
            if (dateFrom) {
                // $gte: greater than or equal to the start of the 'from' day
                query.creationDate.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                // $lte: less than or equal to the end of the 'to' day
                const endOfDay = new Date(dateTo);
                endOfDay.setHours(23, 59, 59, 999);
                query.creationDate.$lte = endOfDay;
            }
        }

        // 3. Execute the Database Query
        const totalAssets = await MediaAsset.countDocuments(query);
        const mediaAssets = await MediaAsset.find(query)
            .sort({ [sortOrder]: -1 }) // Sort order (e.g., createdAt: -1 for newest first)
            .skip(skip)
            .limit(limit);

        // 4. Return Data
        return NextResponse.json({
            mediaAssets,
            totalAssets,
            page,
            limit,
            totalPages: Math.ceil(totalAssets / limit),
        }, { status: 200 });

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: 'Failed to fetch media assets: ' + error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        await dbConnect();

        if (Array.isArray(body)) {
            const mediaAssets = await MediaAsset.insertMany(body);
            return NextResponse.json({ mediaAssets }, { status: 201 });
        } else {
            const mediaAsset = await MediaAsset.create(body);
            return NextResponse.json({ mediaAsset }, { status: 201 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create media asset' }, { status: 500 });
    }
}