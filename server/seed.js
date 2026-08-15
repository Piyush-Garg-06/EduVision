const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');
const AcademicMark = require('./models/AcademicMark');
const Remediation = require('./models/Remediation');
const Notification = require('./models/Notification');
require('dotenv').config();

const coursesSeed = [
  // 6 Subjects
  { code: 'CS-501', name: 'Foundation of Blockchain', type: 'theory' },
  { code: 'CS-502', name: 'Operating System', type: 'theory' },
  { code: 'CS-503', name: 'Data Mining', type: 'theory' },
  { code: 'CS-504', name: 'Compiler Design', type: 'theory' },
  { code: 'CS-505', name: 'Analysis of Algorithm', type: 'theory' },
  { code: 'CS-506', name: 'Computer Graphics', type: 'theory' },
  // 4 Labs
  { code: 'CSL-501', name: 'Analysis of Algo Lab', type: 'lab' },
  { code: 'CSL-502', name: 'Compiler Design Lab', type: 'lab' },
  { code: 'CSL-503', name: 'Advanced Java Lab', type: 'lab' },
  { code: 'CSL-504', name: 'Computer Graphics Lab', type: 'lab' }
];

const studentsData = [
  {
    username: 'testuser',
    password: 'password123',
    email: 'aarav.singhal@college.edu',
    firstName: 'Aarav',
    lastName: 'Singhal',
    collegeId: 'CSE-2026-001',
    department: 'Computer Science & Engineering',
    semester: 5,
    cgpa: 5.60,
    sgpaHistory: [
      { semester: 1, sgpa: 6.10 },
      { semester: 2, sgpa: 5.80 },
      { semester: 3, sgpa: 5.95 },
      { semester: 4, sgpa: 5.20 }
    ],
    skills: [
      { name: 'HTML/CSS', level: 3, verified: true },
      { name: 'JavaScript', level: 2, verified: false }
    ],
    projects: [
      { title: 'Personal Portfolio', description: 'Simple HTML portfolio site', url: 'https://github.com/aaravs/portfolio' }
    ],
    certifications: [],
    internships: [],
    xp: 150,
    level: 1,
    badges: ['Newcomer'],
    attendanceConfig: {
      'CS-501': 0.65,
      'CS-502': 0.76,
      'CS-503': 0.81,
      'CS-504': 0.40, // Critical shortage
      'CS-505': 0.60, // Shortage
      'CS-506': 0.72,
      'CSL-501': 0.70,
      'CSL-502': 0.45, // Critical shortage
      'CSL-503': 0.80,
      'CSL-504': 0.75
    },
    marksConfig: {
      'CS-501': { i1: 11, i2: 10, prac: 19 },
      'CS-502': { i1: 13, i2: 12, prac: 20 },
      'CS-503': { i1: 14, i2: 13, prac: 21 },
      'CS-504': { i1: 6, i2: 7, prac: 12 }, // Failing
      'CS-505': { i1: 8, i2: 9, prac: 15 },
      'CS-506': { i1: 12, i2: 11, prac: 18 },
      'CSL-501': { i1: 10, i2: 11, prac: 16 },
      'CSL-502': { i1: 5, i2: 6, prac: 10 }, // Failing
      'CSL-503': { i1: 14, i2: 15, prac: 22 },
      'CSL-504': { i1: 13, i2: 12, prac: 20 }
    },
    riskLevel: 'high',
    riskScore: 81.5,
    reasons: [
      'Attendance below required threshold (40.0%) in CS-504 Compiler Design',
      'Attendance below required threshold (45.0%) in CSL-502 Compiler Design Lab',
      'Failing grades obtained in CS-504 Compiler Design internal assessments'
    ],
    parentName: 'Sanjay Singhal',
    parentUsername: 'parent',
    mentorIndex: 0 // Dr. Amit Sharma
  },
  {
    username: 'diya',
    password: 'password123',
    email: 'diya.sharma@college.edu',
    firstName: 'Diya',
    lastName: 'Sharma',
    collegeId: 'CSE-2026-002',
    department: 'Computer Science & Engineering',
    semester: 5,
    cgpa: 8.90,
    sgpaHistory: [
      { semester: 1, sgpa: 8.60 },
      { semester: 2, sgpa: 8.85 },
      { semester: 3, sgpa: 9.10 },
      { semester: 4, sgpa: 8.95 }
    ],
    skills: [
      { name: 'Python', level: 4, verified: true },
      { name: 'C++', level: 3, verified: true },
      { name: 'Data Structures', level: 4, verified: true }
    ],
    projects: [
      { title: 'Pathfinder Visualizer', description: 'Interactive algorithm visualizer tool', url: 'https://github.com/diya/pathfinder' }
    ],
    certifications: [
      { title: 'Google Advanced Python Certification', issuer: 'Google', date: new Date('2025-11-12') }
    ],
    internships: [
      { company: 'InnovateTech Systems', role: 'Software Engineer Intern', duration: '2 Months (Summer 2025)' }
    ],
    xp: 720,
    level: 3,
    badges: ['Verified Coder', 'Algorithmic Thinker'],
    attendanceConfig: {
      'CS-501': 0.92,
      'CS-502': 0.89,
      'CS-503': 0.94,
      'CS-504': 0.90,
      'CS-505': 0.95,
      'CS-506': 0.88,
      'CSL-501': 0.90,
      'CSL-502': 0.93,
      'CSL-503': 0.91,
      'CSL-504': 0.90
    },
    marksConfig: {
      'CS-501': { i1: 18, i2: 17, prac: 26 },
      'CS-502': { i1: 17, i2: 18, prac: 25 },
      'CS-503': { i1: 19, i2: 18, prac: 27 },
      'CS-504': { i1: 16, i2: 17, prac: 24 },
      'CS-505': { i1: 18, i2: 19, prac: 28 },
      'CS-506': { i1: 17, i2: 16, prac: 25 },
      'CSL-501': { i1: 18, i2: 18, prac: 27 },
      'CSL-502': { i1: 17, i2: 17, prac: 26 },
      'CSL-503': { i1: 19, i2: 18, prac: 28 },
      'CSL-504': { i1: 18, i2: 17, prac: 26 }
    },
    riskLevel: 'low',
    riskScore: 7.0,
    reasons: [],
    parentName: 'Rajesh Sharma',
    parentUsername: 'parent_diya',
    mentorIndex: 0
  },
  {
    username: 'kabir',
    password: 'password123',
    email: 'kabir.joshi@college.edu',
    firstName: 'Kabir',
    lastName: 'Joshi',
    collegeId: 'CSE-2026-003',
    department: 'Computer Science & Engineering',
    semester: 5,
    cgpa: 7.20,
    sgpaHistory: [
      { semester: 1, sgpa: 7.00 },
      { semester: 2, sgpa: 7.40 },
      { semester: 3, sgpa: 7.10 },
      { semester: 4, sgpa: 7.30 }
    ],
    skills: [
      { name: 'Java', level: 3, verified: true },
      { name: 'SQL', level: 3, verified: true }
    ],
    projects: [
      { title: 'Database Explorer', description: 'Desktop UI for running SQL procedures', url: 'https://github.com/kabir/db-explorer' }
    ],
    certifications: [],
    internships: [],
    xp: 340,
    level: 2,
    badges: ['SQL Pro'],
    attendanceConfig: {
      'CS-501': 0.78,
      'CS-502': 0.72, // Below 75%
      'CS-503': 0.80,
      'CS-504': 0.76,
      'CS-505': 0.73, // Below 75%
      'CS-506': 0.79,
      'CSL-501': 0.81,
      'CSL-502': 0.75,
      'CSL-503': 0.83,
      'CSL-504': 0.77
    },
    marksConfig: {
      'CS-501': { i1: 14, i2: 13, prac: 22 },
      'CS-502': { i1: 12, i2: 13, prac: 21 },
      'CS-503': { i1: 15, i2: 14, prac: 23 },
      'CS-504': { i1: 13, i2: 12, prac: 20 },
      'CS-505': { i1: 11, i2: 12, prac: 19 },
      'CS-506': { i1: 14, i2: 13, prac: 21 },
      'CSL-501': { i1: 13, i2: 14, prac: 20 },
      'CSL-502': { i1: 14, i2: 13, prac: 21 },
      'CSL-503': { i1: 15, i2: 14, prac: 22 },
      'CSL-504': { i1: 13, i2: 12, prac: 21 }
    },
    riskLevel: 'medium',
    riskScore: 35.0,
    reasons: [
      'Attendance slightly below threshold (72.0%) in CS-502 Operating System',
      'Attendance slightly below threshold (73.0%) in CS-505 Analysis of Algorithm'
    ],
    parentName: 'Anil Joshi',
    parentUsername: 'parent_kabir',
    mentorIndex: 0
  },
  {
    username: 'ananya',
    password: 'password123',
    email: 'ananya.sen@college.edu',
    firstName: 'Ananya',
    lastName: 'Sen',
    collegeId: 'CSE-2026-004',
    department: 'Computer Science & Engineering',
    semester: 5,
    cgpa: 9.40,
    sgpaHistory: [
      { semester: 1, sgpa: 9.20 },
      { semester: 2, sgpa: 9.50 },
      { semester: 3, sgpa: 9.35 },
      { semester: 4, sgpa: 9.55 }
    ],
    skills: [
      { name: 'Blockchain', level: 4, verified: true },
      { name: 'Solidity', level: 3, verified: true },
      { name: 'Web3.js', level: 3, verified: false }
    ],
    projects: [
      { title: 'DeFi Voting App', description: 'Ethereum smart contract backed transparent poll system', url: 'https://github.com/ananya/defivote' }
    ],
    certifications: [
      { title: 'Ethereum Developer Certification', issuer: 'ConsenSys Academy', date: new Date('2026-01-20') }
    ],
    internships: [
      { company: 'BlockChain Solutions', role: 'Smart Contract Developer Intern', duration: '3 Months (Winter 2025)' }
    ],
    xp: 980,
    level: 4,
    badges: ['Web3 Pioneer', 'Top Performer', 'Smart Contract Builder'],
    attendanceConfig: {
      'CS-501': 0.96,
      'CS-502': 0.94,
      'CS-503': 0.95,
      'CS-504': 0.92,
      'CS-505': 0.98,
      'CS-506': 0.90,
      'CSL-501': 0.94,
      'CSL-502': 0.93,
      'CSL-503': 0.96,
      'CSL-504': 0.95
    },
    marksConfig: {
      'CS-501': { i1: 19, i2: 19, prac: 29 },
      'CS-502': { i1: 18, i2: 19, prac: 28 },
      'CS-503': { i1: 19, i2: 18, prac: 29 },
      'CS-504': { i1: 18, i2: 18, prac: 27 },
      'CS-505': { i1: 19, i2: 19, prac: 29 },
      'CS-506': { i1: 17, i2: 18, prac: 28 },
      'CSL-501': { i1: 19, i2: 18, prac: 29 },
      'CSL-502': { i1: 18, i2: 19, prac: 28 },
      'CSL-503': { i1: 20, i2: 19, prac: 29 },
      'CSL-504': { i1: 19, i2: 18, prac: 28 }
    },
    riskLevel: 'low',
    riskScore: 4.5,
    reasons: [],
    parentName: 'Bikram Sen',
    parentUsername: 'parent_ananya',
    mentorIndex: 1 // Dr. Sunita Rao
  },
  {
    username: 'ishaan',
    password: 'password123',
    email: 'ishaan.gupta@college.edu',
    firstName: 'Ishaan',
    lastName: 'Gupta',
    collegeId: 'CSE-2026-005',
    department: 'Computer Science & Engineering',
    semester: 5,
    cgpa: 4.80,
    sgpaHistory: [
      { semester: 1, sgpa: 5.20 },
      { semester: 2, sgpa: 5.00 },
      { semester: 3, sgpa: 4.70 },
      { semester: 4, sgpa: 4.30 }
    ],
    skills: [
      { name: 'Java Basics', level: 2, verified: true }
    ],
    projects: [],
    certifications: [],
    internships: [],
    xp: 60,
    level: 1,
    badges: [],
    attendanceConfig: {
      'CS-501': 0.50,
      'CS-502': 0.45,
      'CS-503': 0.52,
      'CS-504': 0.48,
      'CS-505': 0.40,
      'CS-506': 0.43,
      'CSL-501': 0.45,
      'CSL-502': 0.42,
      'CSL-503': 0.50,
      'CSL-504': 0.48
    },
    marksConfig: {
      'CS-501': { i1: 7, i2: 8, prac: 14 },
      'CS-502': { i1: 6, i2: 6, prac: 12 },
      'CS-503': { i1: 8, i2: 7, prac: 13 },
      'CS-504': { i1: 6, i2: 5, prac: 11 },
      'CS-505': { i1: 5, i2: 6, prac: 10 },
      'CS-506': { i1: 6, i2: 7, prac: 12 },
      'CSL-501': { i1: 8, i2: 7, prac: 13 },
      'CSL-502': { i1: 5, i2: 6, prac: 11 },
      'CSL-503': { i1: 8, i2: 8, prac: 14 },
      'CSL-504': { i1: 7, i2: 6, prac: 12 }
    },
    riskLevel: 'high',
    riskScore: 94.0,
    reasons: [
      'Critical overall attendance shortage in all enrolled subjects (<60%)',
      'Extremely poor internal marks across the board (<35%)',
      'CGPA falls below academic probation threshold (<5.0)'
    ],
    parentName: 'Alok Gupta',
    parentUsername: 'parent_ishaan',
    mentorIndex: 1
  },
  {
    username: 'meera',
    password: 'password123',
    email: 'meera.iyer@college.edu',
    firstName: 'Meera',
    lastName: 'Iyer',
    collegeId: 'CSE-2026-006',
    department: 'Computer Science & Engineering',
    semester: 5,
    cgpa: 8.10,
    sgpaHistory: [
      { semester: 1, sgpa: 7.90 },
      { semester: 2, sgpa: 8.20 },
      { semester: 3, sgpa: 8.00 },
      { semester: 4, sgpa: 8.30 }
    ],
    skills: [
      { name: 'OpenGL', level: 3, verified: true },
      { name: 'Computer Graphics', level: 4, verified: true },
      { name: 'C++', level: 3, verified: false }
    ],
    projects: [
      { title: '3D Render Pipeline', description: 'Software renderer programmed from scratch in C++', url: 'https://github.com/meera/renderer' }
    ],
    certifications: [
      { title: 'Certified computer graphics engineer', issuer: 'VFX Academy', date: new Date('2026-02-18') }
    ],
    internships: [],
    xp: 590,
    level: 3,
    badges: ['Design Master'],
    attendanceConfig: {
      'CS-501': 0.85,
      'CS-502': 0.82,
      'CS-503': 0.84,
      'CS-504': 0.80,
      'CS-505': 0.88,
      'CS-506': 0.95, // Excel in Graphics
      'CSL-501': 0.83,
      'CSL-502': 0.85,
      'CSL-503': 0.86,
      'CSL-504': 0.94
    },
    marksConfig: {
      'CS-501': { i1: 15, i2: 14, prac: 23 },
      'CS-502': { i1: 14, i2: 15, prac: 24 },
      'CS-503': { i1: 16, i2: 15, prac: 25 },
      'CS-504': { i1: 14, i2: 14, prac: 22 },
      'CS-505': { i1: 16, i2: 16, prac: 24 },
      'CS-506': { i1: 19, i2: 18, prac: 29 }, // Excellent in Graphics
      'CSL-501': { i1: 15, i2: 16, prac: 23 },
      'CSL-502': { i1: 14, i2: 15, prac: 24 },
      'CSL-503': { i1: 16, i2: 16, prac: 25 },
      'CSL-504': { i1: 18, i2: 18, prac: 28 }
    },
    riskLevel: 'low',
    riskScore: 14.5,
    reasons: [],
    parentName: 'Raman Iyer',
    parentUsername: 'parent_meera',
    mentorIndex: 1
  },
  {
    username: 'rohan',
    password: 'password123',
    email: 'rohan.nair@college.edu',
    firstName: 'Rohan',
    lastName: 'Nair',
    collegeId: 'CSE-2026-007',
    department: 'Computer Science & Engineering',
    semester: 5,
    cgpa: 6.90,
    sgpaHistory: [
      { semester: 1, sgpa: 7.10 },
      { semester: 2, sgpa: 6.80 },
      { semester: 3, sgpa: 6.75 },
      { semester: 4, sgpa: 6.95 }
    ],
    skills: [
      { name: 'Java', level: 3, verified: true },
      { name: 'Spring Boot', level: 2, verified: false }
    ],
    projects: [
      { title: 'Rest API Client', description: 'Simple REST backend connector', url: 'https://github.com/rohan/restclient' }
    ],
    certifications: [],
    internships: [],
    xp: 280,
    level: 2,
    badges: ['Java Learner'],
    attendanceConfig: {
      'CS-501': 0.74, // Below 75%
      'CS-502': 0.76,
      'CS-503': 0.73, // Below 75%
      'CS-504': 0.78,
      'CS-505': 0.81,
      'CS-506': 0.77,
      'CSL-501': 0.80,
      'CSL-502': 0.78,
      'CSL-503': 0.71, // Below 75%
      'CSL-504': 0.80
    },
    marksConfig: {
      'CS-501': { i1: 13, i2: 12, prac: 20 },
      'CS-502': { i1: 12, i2: 13, prac: 19 },
      'CS-503': { i1: 14, i2: 13, prac: 21 },
      'CS-504': { i1: 12, i2: 13, prac: 18 },
      'CS-505': { i1: 13, i2: 12, prac: 20 },
      'CS-506': { i1: 12, i2: 13, prac: 19 },
      'CSL-501': { i1: 13, i2: 12, prac: 18 },
      'CSL-502': { i1: 12, i2: 13, prac: 19 },
      'CSL-503': { i1: 11, i2: 12, prac: 17 }, // Low marks in Java Lab
      'CSL-504': { i1: 13, i2: 14, prac: 20 }
    },
    riskLevel: 'medium',
    riskScore: 38.0,
    reasons: [
      'Attendance slightly below threshold (73.0%) in CS-503 Data Mining',
      'Attendance slightly below threshold (71.0%) in CSL-503 Advanced Java Lab'
    ],
    parentName: 'Murli Nair',
    parentUsername: 'parent_rohan',
    mentorIndex: 2 // Prof. Rajesh Patel
  },
  {
    username: 'siddharth',
    password: 'password123',
    email: 'siddharth.roy@college.edu',
    firstName: 'Siddharth',
    lastName: 'Roy',
    collegeId: 'CSE-2026-008',
    department: 'Computer Science & Engineering',
    semester: 5,
    cgpa: 8.30,
    sgpaHistory: [
      { semester: 1, sgpa: 8.00 },
      { semester: 2, sgpa: 8.20 },
      { semester: 3, sgpa: 8.50 },
      { semester: 4, sgpa: 8.50 }
    ],
    skills: [
      { name: 'Data Mining', level: 4, verified: true },
      { name: 'Python', level: 3, verified: true },
      { name: 'R Programming', level: 2, verified: false }
    ],
    projects: [
      { title: 'Twitter Sentiment Engine', description: 'Sentiment analysis on tweet feeds using Python', url: 'https://github.com/sidroy/sentiment' }
    ],
    certifications: [
      { title: 'Data Scientist Associate', issuer: 'DataCamp', date: new Date('2025-09-14') }
    ],
    internships: [
      { company: 'Analytics India Corp', role: 'Data Analyst Intern', duration: '2 Months (Summer 2025)' }
    ],
    xp: 640,
    level: 3,
    badges: ['Analytics Champ', 'Certified earner'],
    attendanceConfig: {
      'CS-501': 0.88,
      'CS-502': 0.86,
      'CS-503': 0.92,
      'CS-504': 0.85,
      'CS-505': 0.84,
      'CS-506': 0.87,
      'CSL-501': 0.89,
      'CSL-502': 0.86,
      'CSL-503': 0.90,
      'CSL-504': 0.88
    },
    marksConfig: {
      'CS-501': { i1: 16, i2: 17, prac: 24 },
      'CS-502': { i1: 15, i2: 16, prac: 25 },
      'CS-503': { i1: 18, i2: 17, prac: 27 }, // High in Data Mining
      'CS-504': { i1: 15, i2: 16, prac: 24 },
      'CS-505': { i1: 16, i2: 15, prac: 23 },
      'CS-506': { i1: 15, i2: 16, prac: 24 },
      'CSL-501': { i1: 16, i2: 17, prac: 25 },
      'CSL-502': { i1: 15, i2: 16, prac: 24 },
      'CSL-503': { i1: 17, i2: 17, prac: 26 },
      'CSL-504': { i1: 16, i2: 15, prac: 25 }
    },
    riskLevel: 'low',
    riskScore: 11.5,
    reasons: [],
    parentName: 'Debashis Roy',
    parentUsername: 'parent_siddharth',
    mentorIndex: 2
  },
  {
    username: 'neha',
    password: 'password123',
    email: 'neha.kapoor@college.edu',
    firstName: 'Neha',
    lastName: 'Kapoor',
    collegeId: 'CSE-2026-009',
    department: 'Computer Science & Engineering',
    semester: 5,
    cgpa: 7.95,
    sgpaHistory: [
      { semester: 1, sgpa: 7.70 },
      { semester: 2, sgpa: 7.90 },
      { semester: 3, sgpa: 8.10 },
      { semester: 4, sgpa: 8.10 }
    ],
    skills: [
      { name: 'C++', level: 3, verified: true },
      { name: 'OpenGL', level: 3, verified: true }
    ],
    projects: [
      { title: 'Interactive Paint App', description: 'Vector paint graphics tool written in C++/OpenGL', url: 'https://github.com/neha/paintapp' }
    ],
    certifications: [],
    internships: [],
    xp: 490,
    level: 2,
    badges: ['Creative Coder'],
    attendanceConfig: {
      'CS-501': 0.84,
      'CS-502': 0.81,
      'CS-503': 0.83,
      'CS-504': 0.82,
      'CS-505': 0.85,
      'CS-506': 0.88,
      'CSL-501': 0.84,
      'CSL-502': 0.83,
      'CSL-503': 0.85,
      'CSL-504': 0.87
    },
    marksConfig: {
      'CS-501': { i1: 14, i2: 15, prac: 22 },
      'CS-502': { i1: 15, i2: 14, prac: 23 },
      'CS-503': { i1: 14, i2: 15, prac: 22 },
      'CS-504': { i1: 13, i2: 14, prac: 21 },
      'CS-505': { i1: 15, i2: 14, prac: 22 },
      'CS-506': { i1: 16, i2: 15, prac: 24 },
      'CSL-501': { i1: 15, i2: 14, prac: 22 },
      'CSL-502': { i1: 14, i2: 15, prac: 23 },
      'CSL-503': { i1: 15, i2: 15, prac: 24 },
      'CSL-504': { i1: 16, i2: 15, prac: 25 }
    },
    riskLevel: 'low',
    riskScore: 15.0,
    reasons: [],
    parentName: 'Vijay Kapoor',
    parentUsername: 'parent_neha',
    mentorIndex: 3 // Dr. Vikram Malhotra
  },
  {
    username: 'varun',
    password: 'password123',
    email: 'varun.deshmukh@college.edu',
    firstName: 'Varun',
    lastName: 'Deshmukh',
    collegeId: 'CSE-2026-010',
    department: 'Computer Science & Engineering',
    semester: 5,
    cgpa: 5.10,
    sgpaHistory: [
      { semester: 1, sgpa: 5.50 },
      { semester: 2, sgpa: 5.20 },
      { semester: 3, sgpa: 5.00 },
      { semester: 4, sgpa: 4.70 }
    ],
    skills: [
      { name: 'C', level: 2, verified: true }
    ],
    projects: [],
    certifications: [],
    internships: [],
    xp: 90,
    level: 1,
    badges: [],
    attendanceConfig: {
      'CS-501': 0.60, // Below 75%
      'CS-502': 0.58, // Below 75%
      'CS-503': 0.64, // Below 75%
      'CS-504': 0.52, // Below 75%
      'CS-505': 0.48, // Below 75%
      'CS-506': 0.55, // Below 75%
      'CSL-501': 0.50, // Below 75%
      'CSL-502': 0.53, // Below 75%
      'CSL-503': 0.60, // Below 75%
      'CSL-504': 0.55  // Below 75%
    },
    marksConfig: {
      'CS-501': { i1: 9, i2: 8, prac: 16 },
      'CS-502': { i1: 8, i2: 7, prac: 15 },
      'CS-503': { i1: 9, i2: 9, prac: 16 },
      'CS-504': { i1: 8, i2: 7, prac: 14 },
      'CS-505': { i1: 7, i2: 6, prac: 13 },
      'CS-506': { i1: 8, i2: 7, prac: 15 },
      'CSL-501': { i1: 8, i2: 7, prac: 14 },
      'CSL-502': { i1: 7, i2: 8, prac: 13 },
      'CSL-503': { i1: 9, i2: 8, prac: 16 },
      'CSL-504': { i1: 8, i2: 7, prac: 15 }
    },
    riskLevel: 'high',
    riskScore: 88.0,
    reasons: [
      'Critical overall attendance shortage in all 6 subjects and 4 labs (<65%)',
      'Extremely poor midterm and internal marks logged across all courses (<45%)'
    ],
    parentName: 'Milind Deshmukh',
    parentUsername: 'parent_varun',
    mentorIndex: 3
  }
];

async function seed() {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // Clear existing database
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await Attendance.deleteMany({});
    await AcademicMark.deleteMany({});
    await Remediation.deleteMany({});
    await Notification.deleteMany({});
    console.log('Database cleared.');

    // 1. Create Admin Account
    console.log('Creating Admin Account...');
    const adminUser = new User({
      username: 'admin',
      password: 'admin123',
      email: 'admin@college.edu',
      role: 'admin',
      firstName: 'Dean',
      lastName: 'Office',
      phone: '9988776655'
    });
    await adminUser.save();

    // 2. Create 4 Faculty Members (Indian names)
    console.log('Creating Faculty/Mentors...');
    const facultyMembers = [
      {
        username: 'faculty',
        password: 'faculty123',
        email: 'amit.sharma@college.edu',
        role: 'faculty',
        firstName: 'Dr. Amit',
        lastName: 'Sharma',
        phone: '8877665544'
      },
      {
        username: 'faculty2',
        password: 'password123',
        email: 'sunita.rao@college.edu',
        role: 'faculty',
        firstName: 'Dr. Sunita',
        lastName: 'Rao',
        phone: '8899001122'
      },
      {
        username: 'faculty3',
        password: 'password123',
        email: 'rajesh.patel@college.edu',
        role: 'faculty',
        firstName: 'Prof. Rajesh',
        lastName: 'Patel',
        phone: '8899112233'
      },
      {
        username: 'faculty4',
        password: 'password123',
        email: 'vikram.malhotra@college.edu',
        role: 'faculty',
        firstName: 'Dr. Vikram',
        lastName: 'Malhotra',
        phone: '8899223344'
      }
    ];

    const seededMentors = [];
    for (const f of facultyMembers) {
      const u = new User(f);
      await u.save();
      seededMentors.push(u);
    }

    // 3. Seed Students, Parents, and Records
    for (const data of studentsData) {
      console.log(`Processing student: ${data.firstName} ${data.lastName}...`);

      // Create parent
      const parentUser = new User({
        username: data.parentUsername,
        password: data.password,
        email: `parent.${data.username}@college.edu`,
        role: 'parent',
        firstName: data.parentName.split(' ')[0],
        lastName: data.parentName.split(' ')[1] || 'Parent',
        phone: '7766554433'
      });
      await parentUser.save();

      // Create student user
      const studentUser = new User({
        username: data.username,
        password: data.password,
        email: data.email,
        role: 'student',
        firstName: data.firstName,
        lastName: data.lastName,
        phone: '9876543210'
      });
      await studentUser.save();

      // Get mentor ID based on index
      const mentor = seededMentors[data.mentorIndex] || seededMentors[0];

      // Create student profile
      const studentProfile = new Student({
        userId: studentUser._id,
        collegeId: data.collegeId,
        department: data.department,
        semester: data.semester,
        mentorId: mentor._id,
        parentId: parentUser._id,
        cgpa: data.cgpa,
        sgpaHistory: data.sgpaHistory,
        skills: data.skills,
        portfolio: {
          projects: data.projects,
          certifications: data.certifications,
          internships: data.internships
        },
        gamification: {
          xp: data.xp,
          level: data.level,
          badges: data.badges
        }
      });
      await studentProfile.save();

      // Seed Attendance logs (10 sessions per subject/lab)
      for (const course of coursesSeed) {
        const targetPct = data.attendanceConfig[course.code] || 0.8;
        const records = [];
        const baseDate = new Date('2026-08-01');

        for (let i = 0; i < 10; i++) {
          const date = new Date(baseDate);
          date.setDate(baseDate.getDate() + i + (i > 4 ? 2 : 0)); // Skip weekend
          
          // randomize present status based on percentage target
          const isPresent = Math.random() < targetPct;
          records.push({
            date: date,
            status: isPresent ? 'present' : 'absent'
          });
        }

        const att = new Attendance({
          studentId: studentUser._id,
          courseCode: course.code,
          courseName: course.name,
          records: records
        });
        await att.save();
      }

      // Seed Academic Marks
      for (const course of coursesSeed) {
        const cfg = data.marksConfig[course.code] || { i1: 15, i2: 15, prac: 24 };
        const marks = new AcademicMark({
          studentId: studentUser._id,
          courseCode: course.code,
          courseName: course.name,
          evaluations: [
            { type: 'internal_1', maxMarks: 20, obtained: cfg.i1 },
            { type: 'internal_2', maxMarks: 20, obtained: cfg.i2 },
            { type: 'practical', maxMarks: 30, obtained: cfg.prac }
          ]
        });
        await marks.save();
      }

      // Seed Remediation Actions if not low risk
      if (data.riskLevel !== 'low' || data.reasons.length > 0) {
        const remediation = new Remediation({
          studentId: studentUser._id,
          riskLevel: data.riskLevel,
          riskScore: data.riskScore,
          reasons: data.reasons,
          assignedActions: [
            {
              task: `Attend remedial support sessions for ${data.reasons[0]?.split('in ')[1] || 'weak subjects'}`,
              status: 'in_progress',
              assignedDate: new Date()
            },
            {
              task: `Submit outstanding assignments & mock tests in lab courses`,
              status: 'assigned',
              assignedDate: new Date()
            },
            {
              task: `Schedule monthly progress evaluation meeting with Faculty Mentor ${mentor.firstName} ${mentor.lastName}`,
              status: 'completed',
              assignedDate: new Date(),
              completedDate: new Date()
            }
          ],
          mentorRemarks: `${data.firstName} is showing gaps in learning parameters. Focused peer mentoring and regular counseling is recommended.`,
          lastEvaluated: new Date()
        });
        await remediation.save();
      }

      // Seed notifications
      if (data.riskLevel === 'high') {
        await new Notification({
          recipientId: studentUser._id,
          type: 'attendance_shortage',
          message: `Attendance Alert: Overall attendance requirement of 75% not met in theory or lab courses.`
        }).save();

        await new Notification({
          recipientId: studentUser._id,
          type: 'warning',
          message: `Academic Alert: Flagged in HIGH RISK tier due to attendance/midterm marks.`
        }).save();

        // Parent
        await new Notification({
          recipientId: parentUser._id,
          type: 'warning',
          message: `Academic Warning: Your ward ${data.firstName} ${data.lastName} is flagged in HIGH RISK tier.`
        }).save();

        // Mentor
        await new Notification({
          recipientId: mentor._id,
          type: 'warning',
          message: `Mentee Alert: ${data.firstName} (${data.collegeId}) is flagged in HIGH RISK category.`
        }).save();
      } else if (data.riskLevel === 'medium') {
        await new Notification({
          recipientId: studentUser._id,
          type: 'warning',
          message: `Academic Alert: You are in the MEDIUM RISK tier. Try to raise your attendance to above 75%.`
        }).save();
      }
    }

    console.log('Database Seeding Completed Successfully with 10 Indian students and related entities!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding process crashed:', err);
    process.exit(1);
  }
}

seed();
