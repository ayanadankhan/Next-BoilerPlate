import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import MediaAsset from '@/models/MediaAsset';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const mediaAsset = await MediaAsset.findById(params.id);
    
    if (!mediaAsset) {
      return NextResponse.json({ error: 'Media asset not found' }, { status: 404 });
    }
    
    return NextResponse.json({ mediaAsset }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch media asset' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    await dbConnect();
    
    const mediaAsset = await MediaAsset.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!mediaAsset) {
      return NextResponse.json({ error: 'Media asset not found' }, { status: 404 });
    }
    
    return NextResponse.json({ mediaAsset }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update media asset' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const mediaAsset = await MediaAsset.findByIdAndDelete(params.id);
    
    if (!mediaAsset) {
      return NextResponse.json({ error: 'Media asset not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Media asset deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete media asset' }, { status: 500 });
  }
}