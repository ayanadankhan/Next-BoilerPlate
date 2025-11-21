import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IMediaAsset extends Document {
  categoryId: mongoose.Types.ObjectId; // Link to the subcategory
  genre: string;  // Will store Main Category Name
  item: string;   // Will store Subcategory Name
  subject: string; // The actual subject name
  duration: string;
  creationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MediaAssetSchema: Schema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: false, // Optional for backward compatibility
    },
    genre: {
      type: String,
      required: true,
    },
    item: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
    },
    duration: {
      type: String,
      required: [true, 'Please provide duration'],
    },
    creationDate: {
      type: Date,
      required: [true, 'Please provide a creation date'],
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default models.MediaAsset || model<IMediaAsset>('MediaAsset', MediaAssetSchema);