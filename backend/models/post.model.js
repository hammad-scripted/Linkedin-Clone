import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';

const postSchema = new Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: { type: String },
    image: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        content: { type: String },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },//* owner of the comment
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Post = model('Post', postSchema);
