import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: true,
    },
    documentName: {
      type: String,
      required: true,
    },
    collegeId: {
      type: String,
      default: 'saoe_pune',
    },
    page: {
      type: Number,
      default: 1,
    },
    category: {
      type: String,
      default: 'General',
    },
    score: {
      type: Number,
      default: 0,
    },
    excerpt: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sources: [sourceSchema],
    retrievalScore: {
      type: Number,
      default: 0,
    },
    found: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model('Message', messageSchema);
