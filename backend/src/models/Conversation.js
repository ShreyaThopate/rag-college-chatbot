import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    collegeId: {
      type: String,
      default: 'saoe_pune',
      index: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Conversation = mongoose.model('Conversation', conversationSchema);
