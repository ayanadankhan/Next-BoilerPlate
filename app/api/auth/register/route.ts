import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db/mongodb';
import User, { IUser } from '@/models/User';

// Simulating a password hashing function (in a real app, use bcrypt)
// const hashPassword = (password: string) => { ... return hash; }

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { name }] });
    console.log("existingUser", existingUser);
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email or name already exists' }, { status: 409 });
    }

    // --- In a real app, use a proper hashing library like bcrypt here ---
    // const hashedPassword = await hashPassword(password);
    
    // Create the new user
    const newUser = await User.create({
      name,
      email,
      password, // Storing plain text for this environment ONLY
      role: 'client', // Default to client role
    });

    // Strip password before sending the user object back
    const userObject = newUser.toObject();
    delete userObject.password;

    return NextResponse.json({ message: 'Registration successful', user: userObject }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    // Handle validation errors or duplicate key errors gracefully
    if (error.code === 11000) {
       return NextResponse.json({ error: 'Duplicate name or email' }, { status: 409 });
    }
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}