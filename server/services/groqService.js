const Groq = require('groq-sdk');
const GROQ_MODEL = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';

// Initialize Groq SDK if key is provided, otherwise log a warning
let groq = null;
if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'placeholder_key') {
  try {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  } catch (err) {
    console.error('Error initializing Groq SDK:', err);
  }
} else {
  console.warn('Groq API Key not found. Falling back to structured rule-based recommendations.');
}

/**
 * AI-Powered personalized study and recovery plan generator using Groq
 */
async function generateActionPlan(student, attendance, marks) {
  const context = {
    name: `${student.userId.firstName} ${student.userId.lastName}`,
    cgpa: student.cgpa,
    semester: student.semester,
    department: student.department,
    attendance: attendance.map(a => {
      const presentCount = a.records.filter(r => r.status === 'present').length;
      const totalCount = a.records.length;
      const pct = totalCount > 0 ? (presentCount / totalCount) * 100 : 100;
      return { course: a.courseName, code: a.courseCode, percentage: pct.toFixed(1) };
    }),
    marks: marks.map(m => {
      return {
        course: m.courseName,
        code: m.courseCode,
        scores: m.evaluations.map(e => ({ type: e.type, score: `${e.obtained}/${e.maxMarks}` }))
      };
    })
  };

  const prompt = `You are an expert AI Academic Counselor and Study Strategist. A student named ${context.name} (${context.department}, Semester ${context.semester}) needs a personalized academic recovery and study schedule.
Student profile telemetry:
- CGPA: ${context.cgpa} (Scale of 10.0)
- Subject-wise Attendance: ${JSON.stringify(context.attendance)}
- Midterm / Assessment Marks: ${JSON.stringify(context.marks)}

Generate a comprehensive academic recovery plan and a realistic 7-day study timetable.
Return ONLY valid JSON matching this schema (no markdown, no preamble):
{
  "summary": "2-3 sentence honest diagnostic summary highlighting critical weak areas.",
  "urgentFocusAreas": ["Subject & topic requiring immediate intervention", "Another urgent focus"],
  "actions": [
    { "task": "Actionable task name", "reason": "Why this task is necessary", "priority": "high" }
  ],
  "weeklyTimetable": [
    { "day": "Monday", "focusSubject": "Subject Name", "targetTopic": "Core topic to master", "durationMinutes": 90 },
    { "day": "Tuesday", "focusSubject": "Subject Name", "targetTopic": "Core topic to master", "durationMinutes": 75 },
    { "day": "Wednesday", "focusSubject": "Subject Name", "targetTopic": "Core topic to master", "durationMinutes": 90 },
    { "day": "Thursday", "focusSubject": "Subject Name", "targetTopic": "Core topic to master", "durationMinutes": 60 },
    { "day": "Friday", "focusSubject": "Subject Name", "targetTopic": "Core topic to master", "durationMinutes": 90 },
    { "day": "Saturday", "focusSubject": "Subject Name", "targetTopic": "Revision & Practice Problems", "durationMinutes": 120 },
    { "day": "Sunday", "focusSubject": "Subject Name", "targetTopic": "Mock Quiz & Assessment Review", "durationMinutes": 60 }
  ],
  "learningResources": [
    { "subject": "Subject Name", "topic": "Key topic", "resourceType": "Video Lecture / Textbook / Practice Problem Set", "recommendedLink": "https://geeksforgeeks.org or https://nptel.ac.in" }
  ]
}`;

  if (!groq) {
    return generateFallbackActionPlan(context);
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0].message.content;
    const parsed = JSON.parse(content);
    // Ensure weeklyTimetable exists
    if (!parsed.weeklyTimetable || parsed.weeklyTimetable.length === 0) {
      parsed.weeklyTimetable = generateFallbackTimetable(context);
    }
    return parsed;
  } catch (err) {
    console.error('Groq API call failed, using fallback:', err);
    return generateFallbackActionPlan(context);
  }
}

function generateFallbackTimetable(context) {
  const weakCourse = context.marks.find(m => {
    return m.scores.some(s => {
      const [got, max] = s.score.split('/').map(Number);
      return got / (max || 1) < 0.6;
    });
  })?.course || 'Core Engineering Subject';

  return [
    { day: "Monday", focusSubject: weakCourse, targetTopic: "Fundamentals & Concept Clarity", durationMinutes: 90, isCompleted: false },
    { day: "Tuesday", focusSubject: weakCourse, targetTopic: "Solved Examples & Key Theorems", durationMinutes: 75, isCompleted: false },
    { day: "Wednesday", focusSubject: "Computer Systems / OS", targetTopic: "Process Management & Scheduling", durationMinutes: 90, isCompleted: false },
    { day: "Thursday", focusSubject: weakCourse, targetTopic: "Previous Year Exam Questions", durationMinutes: 60, isCompleted: false },
    { day: "Friday", focusSubject: "Algorithms & Logic", targetTopic: "Design Patterns & Complexity", durationMinutes: 90, isCompleted: false },
    { day: "Saturday", focusSubject: weakCourse, targetTopic: "Mock Midterm Practice Test", durationMinutes: 120, isCompleted: false },
    { day: "Sunday", focusSubject: "Review & Self-Assessment", targetTopic: "Weekly Quiz & Mentor Doubt Clearance", durationMinutes: 60, isCompleted: false }
  ];
}

/**
 * Fallback action plan generator
 */
function generateFallbackActionPlan(context) {
  const actions = [];
  const learningResources = [];
  const urgentFocusAreas = [];
  let summary = `Student ${context.name} has a current CGPA of ${context.cgpa}.`;

  const lowAttendance = context.attendance.filter(a => parseFloat(a.percentage) < 75);
  if (lowAttendance.length > 0) {
    summary += ` Attendance is critically low (<75%) in ${lowAttendance.map(a => a.course).join(', ')}.`;
    lowAttendance.forEach(a => {
      urgentFocusAreas.push(`${a.course} (${a.code}): Attendance at ${a.percentage}%`);
      actions.push({
        task: `Attend extra doubt sessions for ${a.course}`,
        reason: `Current attendance is ${a.percentage}% (below 75% college requirement)`,
        priority: 'high'
      });
      learningResources.push({
        subject: a.course,
        topic: 'Classroom Lecture Notes & Recorded Sessions',
        resourceType: 'University Portal',
        recommendedLink: 'https://nptel.ac.in'
      });
    });
  }

  const poorMarks = [];
  context.marks.forEach(m => {
    m.scores.forEach(s => {
      const parts = s.score.split('/');
      const pct = parseFloat(parts[0]) / parseFloat(parts[1]);
      if (pct < 0.6) {
        poorMarks.push(m.course);
      }
    });
  });

  if (poorMarks.length > 0) {
    const uniqueCourses = [...new Set(poorMarks)];
    summary += ` Academic scores require remediation in ${uniqueCourses.join(', ')}.`;
    uniqueCourses.forEach(course => {
      urgentFocusAreas.push(`${course}: Below 60% in internal assessments`);
      actions.push({
        task: `Solve previous 3 years exam papers for ${course}`,
        reason: `Sub-optimal marks in internal evaluations`,
        priority: 'high'
      });
      learningResources.push({
        subject: course,
        topic: 'Core Theory & Diagnostic Problems',
        resourceType: 'Video Series / Practice Problems',
        recommendedLink: 'https://geeksforgeeks.org'
      });
    });
  }

  if (actions.length === 0) {
    summary += " Student has stable attendance and solid academic performance.";
    actions.push({
      task: "Participate in competitive programming or hackathons",
      reason: "Performance is on track; level up skills for placement",
      priority: 'low'
    });
  }

  return {
    summary,
    urgentFocusAreas: urgentFocusAreas.length > 0 ? urgentFocusAreas : ["Maintain current GPA and attendance above 85%"],
    actions,
    weeklyTimetable: generateFallbackTimetable(context),
    learningResources
  };
}

/**
 * AI-Powered Skill Gap Analysis using Groq
 */
async function analyzeSkillGap(targetRole, currentSkills) {
  const prompt = `You are an elite Tech Career Counselor and Skill Strategist. Analyze a student's skills for the career role: "${targetRole}".
Student's current logged skills: ${JSON.stringify(currentSkills)}.

Compare their current skills with the latest industry job requirements for "${targetRole}".
Return ONLY valid JSON matching this structure (no markdown, no conversational filler):
{
  "roleMatchPercentage": 68,
  "matchedSkills": [
    { "name": "Skill Name", "level": 3, "status": "Strong" }
  ],
  "missingSkills": [
    { "name": "Skill Name", "importance": "high", "description": "Why this skill is required" },
    { "name": "Skill Name", "importance": "medium", "description": "Why this skill is required" }
  ],
  "recommendedRoadmap": [
    { 
      "phase": "Phase 1: Foundation (Weeks 1-4)", 
      "actions": ["Learn core tool X", "Complete interactive tutorial Y"] 
    },
    { 
      "phase": "Phase 2: Real-World Implementation (Weeks 5-8)", 
      "actions": ["Build full-stack project Z", "Integrate automated testing"] 
    },
    { 
      "phase": "Phase 3: Portfolio & Production (Weeks 9-12)", 
      "actions": ["Deploy project to cloud", "Add technical write-up to digital resume"] 
    }
  ],
  "recommendedCertifications": [
    { "title": "Certification Name", "provider": "Provider Name (e.g. AWS, Meta, Google)" }
  ]
}`;

  if (!groq) {
    return generateFallbackSkillGap(targetRole, currentSkills);
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0].message.content;
    return JSON.parse(content);
  } catch (err) {
    console.error('Groq API Skill Gap call failed, using fallback:', err);
    return generateFallbackSkillGap(targetRole, currentSkills);
  }
}

/**
 * Fallback skill gap generator
 */
function generateFallbackSkillGap(targetRole, currentSkills) {
  const skillNames = (currentSkills || []).map(s => s.name.toLowerCase());
  const role = targetRole.toLowerCase();

  let required = ['Data Structures & Algorithms', 'System Design', 'Git & GitHub', 'REST APIs', 'Cloud Basics'];
  if (role.includes('software') || role.includes('developer') || role.includes('full stack')) {
    required = ['React.js', 'Node.js', 'Express', 'MongoDB / SQL', 'Data Structures & Algorithms', 'Docker Basics'];
  } else if (role.includes('data') || role.includes('ai') || role.includes('machine learning')) {
    required = ['Python', 'Pandas & NumPy', 'Machine Learning Algorithms', 'SQL', 'TensorFlow / PyTorch', 'Data Visualization'];
  } else if (role.includes('devops') || role.includes('cloud')) {
    required = ['Linux', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'AWS / Azure', 'Terraform'];
  }

  const matched = [];
  const missing = [];

  required.forEach(req => {
    const found = skillNames.some(s => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s));
    if (found) {
      matched.push({ name: req, level: 3, status: "Proficient" });
    } else {
      missing.push({ name: req, importance: missing.length < 2 ? 'high' : 'medium', description: `Essential standard requirement for ${targetRole}` });
    }
  });

  const matchPct = Math.max(30, Math.round((matched.length / required.length) * 100));

  return {
    roleMatchPercentage: matchPct,
    matchedSkills: matched,
    missingSkills: missing,
    recommendedRoadmap: [
      {
        phase: "Phase 1: Core Fundamentals & Theory (Month 1)",
        actions: missing.slice(0, 2).map(s => `Master essential concepts of ${s.name}`)
      },
      {
        phase: "Phase 2: Project Building & Hands-on (Month 2)",
        actions: [`Build an end-to-end portfolio project applying ${missing[0]?.name || 'new skills'}`]
      },
      {
        phase: "Phase 3: Verification & Industry Readiness (Month 3)",
        actions: [`Publish project to GitHub with README`, `Add verified skill badge to EduVision Portfolio`]
      }
    ],
    recommendedCertifications: [
      { title: `${targetRole} Professional Certificate`, provider: "Coursera / Meta / Google" }
    ]
  };
}

/**
 * Context-Aware AI Counselor with Hinglish & English Support
 */
async function chatWithAi(student, attendance, marks, remediation, message, chatHistory = []) {
  const context = {
    name: `${student.userId.firstName} ${student.userId.lastName}`,
    cgpa: student.cgpa,
    semester: student.semester,
    department: student.department,
    skills: student.skills?.map(s => `${s.name} (Lvl ${s.level})`).join(', ') || 'None logged',
    projects: student.portfolio?.projects?.map(p => p.title).join(', ') || 'None',
    certifications: student.portfolio?.certifications?.map(c => c.title).join(', ') || 'None',
    internships: student.portfolio?.internships?.map(i => `${i.role} at ${i.company}`).join(', ') || 'None',
    gamification: `Level ${student.gamification?.level || 1}, XP: ${student.gamification?.xp || 0}`,
    attendance: attendance.map(a => {
      const presentCount = a.records.filter(r => r.status === 'present').length;
      const totalCount = a.records.length;
      const pct = totalCount > 0 ? (presentCount / totalCount) * 100 : 100;
      return `${a.courseName} (${a.courseCode}): ${pct.toFixed(1)}%`;
    }).join('; '),
    marks: marks.map(m => {
      const evals = m.evaluations.map(e => `${e.type}: ${e.obtained}/${e.maxMarks}`).join(', ');
      return `${m.courseName} (${m.courseCode}) -> ${evals}`;
    }).join('; '),
    remediation: remediation ? {
      riskLevel: remediation.riskLevel,
      riskScore: remediation.riskScore,
      reasons: remediation.reasons.join(', '),
      actions: remediation.assignedActions.map(a => `${a.task} [${a.status}]`).join(', '),
      remarks: remediation.mentorRemarks || 'None'
    } : { riskLevel: 'low', riskScore: 0, reasons: 'None', actions: 'None', remarks: 'None' }
  };

  const systemPrompt = `You are EduVision AI — an empathetic, ultra-smart 24/7 Academic Counselor and Career Mentor for college students.
You are talking to or advising on behalf of student: ${context.name} (${context.department}, Semester ${context.semester}).

Student's Real-Time Academic Telemetry:
- CGPA: ${context.cgpa} (10.0 scale. <6.5 is critical/struggling; 6.5-7.99 is average; 8.0+ is strong)
- Course-wise Attendance: ${context.attendance} (Mandatory college cutoff: 75%)
- Exam / Internal Marks: ${context.marks}
- Current Risk Status: ${context.remediation.riskLevel.toUpperCase()} (Risk Index: ${context.remediation.riskScore}/100)
- Risk Causes: ${context.remediation.reasons}
- Active Remedial Tasks: ${context.remediation.actions}
- Mentor Teacher Remarks: ${context.remediation.remarks}
- Skills: ${context.skills}
- Portfolio: Projects (${context.projects}), Certifications (${context.certifications})
- Gamification: ${context.gamification}

COMMUNICATION INSTRUCTIONS:
1. Communicate in professional, supportive, and formal academic English. Do not use slang, colloquialisms, or informal filler words.
2. Be encouraging, realistic, and highly practical. Give specific bullet points or step-by-step advice.
3. If attendance is under 75% or CGPA is below 6.5, address the problem directly with a clear recovery path rather than false praise.
4. Keep answers concise, actionable, and structured (under 4-6 sentences or 3 crisp bullet points).
5. Output clean markdown directly without enclosing the entire response in extra quotation marks.`;

  if (!groq) {
    return { response: generateFallbackChatResponse(context, message), isAiPowered: false };
  }

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-4).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 600
    });

    let content = chatCompletion.choices[0].message.content.trim();
    if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) {
      content = content.slice(1, -1).trim();
    }
    return { response: content, isAiPowered: true };
  } catch (err) {
    console.error('Groq Chat call failed, using fallback:', err.message || err);
    return { response: generateFallbackChatResponse(context, message), isAiPowered: false };
  }
}

function generateFallbackChatResponse(context, message) {
  const query = message.toLowerCase();

  if (query.includes('attendance') || query.includes('class') || query.includes('absence') || query.includes('shortage')) {
    return `Reviewing your attendance profile: Your current course-wise attendance status is: ${context.attendance || 'No active records logged'}.\n\nUnder college academic regulations, maintaining at least 75% attendance is strictly mandatory for semester examination eligibility. If your attendance is below 75%, please ensure regular presence in all upcoming lectures and consult your faculty mentor regarding tutorial sessions.`;
  }

  if (query.includes('grade') || query.includes('mark') || query.includes('score') || query.includes('exam') || query.includes('cgpa')) {
    return `Your recorded cumulative CGPA is **${context.cgpa} / 10.0**.\n\nCurrent evaluation summary: ${context.marks || 'No evaluation marks recorded yet'}.\n\nTo raise your semester GPA, prioritize fundamental concepts in your underperforming subjects, solve previous examination papers, and ensure all assignment submissions are completed on time.`;
  }

  if (query.includes('risk') || query.includes('warning') || query.includes('remedial') || query.includes('remediation')) {
    return `Your current academic risk tier is **${context.remediation.riskLevel.toUpperCase()}** (Risk Index: ${context.remediation.riskScore}/100).\n\nIdentified risk factors: ${context.remediation.reasons || 'All academic standards are currently satisfied'}.\n\nAssigned remedial actions: ${context.remediation.actions || 'None pending'}. Completing assigned actions will earn academic XP and clear risk flags.`;
  }

  if (query.includes('career') || query.includes('job') || query.includes('placement') || query.includes('resume') || query.includes('skill')) {
    return `Your cataloged technical competencies: ${context.skills}.\n\nProject portfolio: ${context.projects}.\n\nTo maximize recruitment readiness, prioritize completing 2 production-grade applications, practicing data structure problems regularly, and logging industry certifications on your EduVision profile.`;
  }

  return `Hello ${context.name}. I am your EduVision Academic Counselor. Your current recorded CGPA is ${context.cgpa}, your attendance is actively monitored against the 75% threshold, and your current risk level is ${context.remediation.riskLevel}.\n\nPlease let me know how I can assist you with examination preparation, attendance restoration, or technical skill roadmaps.`;
}

module.exports = {
  generateActionPlan,
  analyzeSkillGap,
  chatWithAi
};
