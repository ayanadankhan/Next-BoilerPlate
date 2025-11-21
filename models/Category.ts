import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  episodes: number; // Assuming this is a count
  parentId?: mongoose.Types.ObjectId | string | null; // Optional reference
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    episodes: {
      type: Number,
      default: 0,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // Important: default to null if no parent
    },
  },
  {
    timestamps: true,
  }
);

export default models.Category || model<ICategory>('Category', CategorySchema);