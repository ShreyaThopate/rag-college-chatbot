import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    collegeId: {
      type: String,
      default: 'saoe_pune',
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Admissions',
        'Courses & Academics',
        'Departments & Faculty',
        'Fees',
        'Scholarships',
        'Placements',
        'Campus Facilities',
        'Rules & Policies',
        'Notices & Announcements',
        'Important Contacts',
        'Student FAQs',
        'Academics',
        'Departments',
        'Courses',
        'Examinations',
        'Academic Calendar',
        'Hostel',
        'Library',
        'Clubs',
        'Policies',
        'Events',
        'General',
      ],
      default: 'General',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    version: {
      type: String,
      default: '1.0',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    processingStatus: {
      type: String,
      enum: ['UPLOADED', 'PROCESSING', 'READY', 'FAILED'],
      default: 'UPLOADED',
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    filePath: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Document = mongoose.model('Document', documentSchema);
