import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db/mongodb';
import User, { IUser } from '@/models/User';

// Simulating a password hashing function (in a real app, use bcrypt)
const comparePassword = (inputPass: string, storedPass: string) => {
    return inputPass === storedPass;
};

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email }).select('+password').exec();

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // --- In a real app, use bcrypt.compare(password, user.password) ---
    const isMatch = comparePassword(password, user.password!); 

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Successfully logged in. Strip password and return user object.
    const userObject = user.toObject();
    delete userObject.password;
    
    // In a real app, you would set a secure HTTP-only cookie here.
    return NextResponse.json({ message: 'Login successful', user: userObject }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}