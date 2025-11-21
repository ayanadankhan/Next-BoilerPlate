import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import MediaAsset from '@/models/MediaAsset';

export async function GET() {
  try {
    await dbConnect();
    const mediaAssets = await MediaAsset.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ mediaAssets }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch media assets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await dbConnect();
    
    const mediaAsset = await MediaAsset.create(body);
    return NextResponse.json({ mediaAsset }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create media asset' }, { status: 500 });
  }
}