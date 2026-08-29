/**
 * Central Multi-College Registry & Configuration
 * Enables CollegeGPT to support multiple colleges seamlessly with strict data isolation.
 */

export const DEFAULT_COLLEGE_ID = 'saoe_pune';

export const COLLEGES = {
  saoe_pune: {
    id: 'saoe_pune',
    name: 'Sinhgad Academy of Engineering, Pune',
    shortName: 'SAOE Pune',
    code: '6187',
    dteCode: 'EN6187',
    affiliation: 'Savitribai Phule Pune University (SPPU)',
    approval: 'AICTE New Delhi, Govt. of Maharashtra',
    accreditation: 'NAAC Accredited',
    address: 'S. No. 40, Kondhwa-Saswad Road, Kondhwa (Bk), Pune - 411048',
    website: 'https://saoe.sinhgad.edu',
    primaryColor: '#6366f1', // Indigo / Brand
    description:
      'Premier engineering college of Sinhgad Technical Education Society (STES), offering undergraduate and postgraduate degrees affiliated with SPPU.',
    categories: [
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
};

/**
 * Resolves college metadata by ID or returns default
 */
export const getCollege = (collegeId = DEFAULT_COLLEGE_ID) => {
  return COLLEGES[collegeId] || COLLEGES[DEFAULT_COLLEGE_ID];
};

/**
 * Checks if college ID exists in registry
 */
export const isValidCollegeId = (collegeId) => {
  return Boolean(COLLEGES[collegeId]);
};

/**
 * Returns list of all registered colleges
 */
export const getAllColleges = () => {
  return Object.values(COLLEGES);
};
