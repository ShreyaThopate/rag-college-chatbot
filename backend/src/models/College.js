import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema(
  {
    collegeId: {
      type: String,
      required: [true, 'College identifier is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'College full name is required'],
      trim: true,
    },
    shortName: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      default: '',
      trim: true,
    },
    dteCode: {
      type: String,
      default: '',
      trim: true,
    },
    affiliation: {
      type: String,
      default: '',
      trim: true,
    },
    approval: {
      type: String,
      default: '',
      trim: true,
    },
    accreditation: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    categories: {
      type: [String],
      default: [
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
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const College = mongoose.model('College', collegeSchema);
