import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Category from '@/models/Category';

export async function GET() {
  try {
    await dbConnect();
    // We fetch all categories. The frontend will decide how to display the hierarchy.
    const categories = await Category.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await dbConnect();
    
    // Sanitize parentId: if it's an empty string, convert to null
    if (body.parentId === '') {
      body.parentId = null;
    }

    const category = await Category.create(body);
    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}