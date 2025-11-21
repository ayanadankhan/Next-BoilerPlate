import mongoose, { Schema, Document, models, model } from 'mongoose';

// Interface for the User document
export interface IUser extends Document {
  username: string;
  email: string;
  password?: string; // Stored hash
  role: 'client' | 'admin';
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      maxlength: [40, 'Username cannot be more than 40 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
    },
    role: {
      type: String,
      enum: ['client', 'admin'],
      default: 'client',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate model error in development with hot reloading
export default models.User || model<IUser>('User', UserSchema);