import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IUser extends Document {
  name: string;      // CHANGED: username -> name
  email: string;
  password?: string; // CHANGED: Made optional (?)
  role: 'user' | 'admin' | 'editor'; // CHANGED: Updated roles
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [40, 'Name cannot be more than 40 characters'],
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
      required: false, // CHANGED: Set to false so you can create users without passwords
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'editor'], // CHANGED: Added 'user' and 'editor'
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Important: Next.js hot reloading can sometimes mess up model re-compilation.
// If this still fails, try restarting your dev server.
export default models.User || model<IUser>('User', UserSchema);