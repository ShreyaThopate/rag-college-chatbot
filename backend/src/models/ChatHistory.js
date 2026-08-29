import mongoose from 'mongoose';

const sourceReferenceSchema = new mongoose.Schema(
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

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      index: true,
    },
    collegeId: {
      type: String,
      default: 'saoe_pune',
      index: true,
    },
    userQuery: {
      type: String,
      required: true,
      trim: true,
    },
    assistantResponse: {
      type: String,
      required: true,
      trim: true,
    },
    sources: [sourceReferenceSchema],
    retrievalScore: {
      type: Number,
      default: 0,
    },
    found: {
      type: Boolean,
      default: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
