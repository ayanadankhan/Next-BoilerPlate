import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const users = await User.find({});
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await dbConnect();

    // Debugging: Log what the server actually receives
    console.log("Server received body:", body);

    // Optional: If you want to set a default password for new users
    if (!body.password) {
        body.password = "tempPassword123!"; 
    }
    
    const user = new User(body);
    await user.save();
    
    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error("Database Error:", error); // Check your terminal for this log
    
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    
    // Send the actual error message back to the frontend for better debugging
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
  }
}
