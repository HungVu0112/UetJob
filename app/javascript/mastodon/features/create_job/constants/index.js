// Job Types
export const JOB_TYPES = {
  value: [
    'full_time',
    'part_time', 
    'internship', 
    'contract', 
    'remote',
    'freelance',
    'temporary',
    'seasonal'
  ],
  human_value: [
    'Full-time',
    'Part-time', 
    'Internship', 
    'Contract', 
    'Remote',
    'Freelance',
    'Temporary',
    'Seasonal'
  ]
};

// Job Categories
export const JOB_CATEGORIES = [
  {
    key:  'Technology',
    value: [
      'software_engineering',
      'web_development',
      'mobile_development',
      'data_science',
      'artificial_intelligence',
      'cybersecurity',
      'cloud_computing',
      'network_engineering',
    ],
    human_value: [
      'Engineering',
      'Web Development',
      'Mobile Development',
      'Data Science',
      'AI',
      'Cybersecurity',
      'Cloud Computing',
      'Network Engineering',
    ]
  },
  {
    key: 'Business',
    value: [
      'marketing',
      'sales',
      'finance',
      'human_resources',
      'project_management',
      'business_analysis',
      'consulting',
      'entrepreneurship',
    ],
    human_value: [
      'Marketing',
      'Sales',
      'Finance',
      'HR',
      'Project Management',
      'Business Analysis',
      'Consulting',
      'Entrepreneurship',
    ]
  },
  {
    key: 'Creative',
    value: [
      'graphic_design',
      'ux_ui_design',
      'content_creation',
      'digital_marketing',
      'video_production',
      'photography',
      'writing',
      'animation',
    ],
    human_value: [
      'Graphic Design',
      'UX/UI Design',
      'Content Creation',
      'Digital Marketing',
      'Video Production',
      'Photography',
      'Writing',
      'Animation',
    ]
  },
  {
    key: 'Education',
    value: [
      'teaching',
      'academic_research',
      'curriculum_development',
      'educational_technology',
      'tutoring',
      'administration',
    ],
    human_value: [
      'Teaching',
      'Academic Research',
      'Curriculum Development',
      'Educational Technology',
      'Tutoring',
      'Administration',
    ]
  },
  {
    key: 'Healthcare',
    value: [
      'nursing',
      'medical_research',
      'healthcare_administration',
      'medical_technology',
      'pharmacy',
      'mental_health',
    ],
    human_value: [
      'Nursing',
      'Medical Research',
      'Healthcare Administration',
      'Medical Technology',
      'Pharmacy',
      'Mental Health',
    ]
  },
  {
    key: 'Others',
    value: [
      'customer_service',
      'administration',
      'retail',
      'hospitality',
      'engineering',
      'manufacturing',
      'transportation',
      'agriculture',
      'nonprofit',
    ],
    human_value: [
      'Customer Service',
      'Administration',
      'Retail',
      'Hospitality',
      'Engineering',
      'Manufacturing',
      'Transportation',
      'Agriculture',
      'Nonprofit',
    ]
  }
];