const Groq = require('groq-sdk');

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
 * AI-Powered personalized action plan generator using Groq (Llama3-8b-8192)
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

  const prompt = `You are an AI Academic Counselor. A student named ${context.name} (${context.department}, Semester ${context.semester}) is struggling academically.
Here is their profile telemetry:
- CGPA: ${context.cgpa}
- Subject-wise Attendance: ${JSON.stringify(context.attendance)}
- Midterm / Assessment Marks: ${JSON.stringify(context.marks)}

Generate a personalized academic recovery and action plan as a JSON object. Ensure it has the following key structure, and output ONLY the JSON content (no conversational filler, no markdown blocks, just raw JSON).
CRITICAL GRADING STANDARDS (CGPA is graded on a 10.0 scale):
- CGPA < 6.5: Poor / critical / underperforming / struggling status. NEVER summarize this as 'performing well', 'good', or 'satisfactory'.
- CGPA 6.5 to 7.99: Average / satisfactory performance.
- CGPA 8.0 to 8.99: Good / strong performance.
- CGPA 9.0 to 10.0: Excellent / outstanding performance.

JSON Structure:
{
  "summary": "Short 2-sentence summary of the main issues, aligning strictly with the grading standards above.",
  "actions": [
    { "task": "Specific task name (e.g. Complete outstanding assignments)", "reason": "Why this task is suggested based on the data", "priority": "high/medium/low" }
  ],
  "learningResources": [
    { "subject": "Subject name", "topic": "Key topic to focus on", "resourceType": "Textbook/Video/Lab Exercise" }
  ]
}`;

  if (!groq) {
    return generateFallbackActionPlan(context);
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0].message.content;
    return JSON.parse(content);
  } catch (err) {
    console.error('Groq API call failed, using fallback:', err);
    return generateFallbackActionPlan(context);
  }
}

/**
 * AI-Powered Skill Gap Analysis using Groq
 */
async function analyzeSkillGap(targetRole, currentSkills) {
  const prompt = `You are a Career Path Advisor. Analyze a student's skills for the career role: "${targetRole}".
Student's current skills: ${JSON.stringify(currentSkills)}.

Compare current skills with the selected career role requirements. Identify missing critical skills and outline a learning path as a JSON object. Return ONLY raw JSON (no conversational filler or markdown blocks):
{
  "roleMatchPercentage": 75, // integer percentage
  "missingSkills": [
    { "name": "Skill Name", "importance": "high/medium/low" }
  ],
  "recommendedRoadmap": [
    { "phase": "Phase 1: Foundations", "actions": ["Learn X tool", "Build Y project"] }
  ]
}`;

  if (!groq) {
    return generateFallbackSkillGap(targetRole, currentSkills);
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
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
 * Fallback action plan generator in case Groq is unavailable
 */
function generateFallbackActionPlan(context) {
  const actions = [];
  const learningResources = [];
  let summary = `Student is performing at CGPA ${context.cgpa}.`;

  // Scan attendance issues
  const lowAttendance = context.attendance.filter(a => parseFloat(a.percentage) < 75);
  if (lowAttendance.length > 0) {
    summary += ` Attendance is critically low (<75%) in ${lowAttendance.map(a => a.course).join(', ')}.`;
    lowAttendance.forEach(a => {
      actions.push({
        task: `Attend extra classes for ${a.course}`,
        reason: `Current attendance is ${a.percentage}% (below 75% requirement)`,
        priority: 'high'
      });
      learningResources.push({
        subject: a.course,
        topic: 'Classroom Lectures & Notes Review',
        resourceType: 'Class Notes'
      });
    });
  }

  // Scan academic marks issues
  const poorMarks = [];
  context.marks.forEach(m => {
    m.scores.forEach(s => {
      const parts = s.score.split('/');
      const pct = parseFloat(parts[0]) / parseFloat(parts[1]);
      if (pct < 0.5) {
        poorMarks.push(m.course);
      }
    });
  });

  if (poorMarks.length > 0) {
    summary += ` Academic scores are weak in ${[...new Set(poorMarks)].join(', ')}.`;
    [...new Set(poorMarks)].forEach(course => {
      actions.push({
        task: `Complete practice tests for ${course}`,
        reason: `Sub-optimal marks in internal evaluations`,
        priority: 'high'
      });
      learningResources.push({
        subject: course,
        topic: 'Fundamental Practice Modules',
        resourceType: 'Self-study Exercises'
      });
    });
  }

  if (actions.length === 0) {
    summary += " Student has stable attendance and solid academic performance.";
    actions.push({
      task: "Participate in advanced research work",
      reason: "Excellent overall performance",
      priority: 'low'
    });
  }

  return { summary, actions, learningResources };
}

/**
 * Fallback skill gap generator in case Groq is unavailable
 */
function generateFallbackSkillGap(targetRole, currentSkills) {
  const skillNames = currentSkills.map(s => s.name.toLowerCase());
  const role = targetRole.toLowerCase();

  let missingSkills = [];
  let roadmap = [];
  let matchPct = 50;

  if (role.includes('developer') || role.includes('engineer') || role.includes('frontend') || role.includes('backend')) {
    const required = ['react', 'node.js', 'mongodb', 'git', 'datastructures'];
    missingSkills = required
      .filter(s => !skillNames.includes(s))
      .map(s => ({ name: s.toUpperCase(), importance: 'high' }));
    
    matchPct = Math.round(( (required.length - missingSkills.length) / required.length ) * 100);
    
    roadmap = [
      {
        phase: "Phase 1: core programming skills",
        actions: missingSkills.slice(0, 2).map(s => `Complete online tutorials for ${s.name}`)
      },
      {
        phase: "Phase 2: hands-on coding",
        actions: ["Build 2 full-stack projects using current stack", "Host projects on GitHub"]
      }
    ];
  } else {
    // Default fallback
    missingSkills = [
      { name: "SQL Database Queries", importance: "high" },
      { name: "Python Programming", importance: "high" },
      { name: "API Documentation", importance: "medium" }
    ];
    roadmap = [
      { phase: "Phase 1: Basic Foundations", actions: ["Learn Python basics", "Study SQL queries"] },
      { phase: "Phase 2: Project Work", actions: ["Perform basic data analysis on Kaggle dataset"] }
    ];
  }

  return { roleMatchPercentage: matchPct, missingSkills, recommendedRoadmap: roadmap };
}

async function chatWithAi(student, attendance, marks, remediation, message, chatHistory = []) {
  const context = {
    name: `${student.userId.firstName} ${student.userId.lastName}`,
    cgpa: student.cgpa,
    semester: student.semester,
    department: student.department,
    skills: student.skills?.map(s => `${s.name} (Level ${s.level}/5)`).join(', ') || 'None logged',
    projects: student.portfolio?.projects?.map(p => p.title).join(', ') || 'None logged',
    certifications: student.portfolio?.certifications?.map(c => c.title).join(', ') || 'None logged',
    internships: student.portfolio?.internships?.map(i => `${i.role} at ${i.company}`).join(', ') || 'None logged',
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
      actions: remediation.assignedActions.map(a => `${a.task} [status: ${a.status}]`).join(', '),
      remarks: remediation.mentorRemarks || 'None'
    } : { riskLevel: 'low', riskScore: 0, reasons: 'None', actions: 'None', remarks: 'None' }
  };

  const systemPrompt = `You are EduVision AI, the student's personal intelligent counselor chatbot.
You have access to the complete student profile of ${context.name} (${context.department}, Semester ${context.semester}).
Here is the student's current profile telemetry:
- CGPA: ${context.cgpa}
- Skills: ${context.skills}
- Projects: ${context.projects}
- Certifications: ${context.certifications}
- Internships: ${context.internships}
- Gamification: ${context.gamification}
- Course-wise Attendance: ${context.attendance}
- Academic Marks/Grades: ${context.marks}
- Risk Level: ${context.remediation.riskLevel} (Score: ${context.remediation.riskScore}/100)
- Risk Reasons: ${context.remediation.reasons}
- Action Plan Checklist: ${context.remediation.actions}
- Mentor Remarks: ${context.remediation.remarks}

Provide helpful, encouraging, yet strictly accurate answers to the user's questions about this student.
CRITICAL GRADING STANDARDS (CGPA is graded on a 10.0 scale):
- CGPA < 6.5: Poor / critical / underperforming / struggling status. NEVER describe this as 'performing well', 'good', or 'satisfactory'. Guide the student to focus on improvement or warn teachers/parents about critical status.
- CGPA 6.5 to 7.99: Average / satisfactory performance.
- CGPA 8.0 to 8.99: Good / strong performance.
- CGPA 9.0 to 10.0: Excellent / outstanding performance.

If a student is asking, be motivating and guide them. If a teacher or parent is asking, provide professional academic insights. Keep your responses concise (under 4-5 sentences) and highly relevant.`;

  if (!groq) {
    console.log('\x1b[33m%s\x1b[0m', '⚠️ [EduVision AI CHAT] Groq Client not initialized. Returning Rule-Engine Fallback response.');
    return { response: generateFallbackChatResponse(context, message), isAiPowered: false };
  }

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 512
    });

    console.log('\x1b[32m%s\x1b[0m', '✨ [EduVision AI CHAT] Response successfully generated via GROQ API (llama-3.1-8b-instant).');
    return { response: chatCompletion.choices[0].message.content, isAiPowered: true };
  } catch (err) {
    console.log('\x1b[31m%s\x1b[0m', '❌ [EduVision AI CHAT] Groq API call failed. Falling back to local rules.');
    console.error('Groq Chat call failed, using fallback:', err.message || err);
    return { response: generateFallbackChatResponse(context, message), isAiPowered: false };
  }
}

function generateFallbackChatResponse(context, message) {
  const query = message.toLowerCase();
  
  if (query.includes('attendance') || query.includes('class') || query.includes('present')) {
    return `Hello! Regarding attendance: ${context.name} has a current course-wise status of: ${context.attendance || 'No records logged'}. Under the college guidelines, keeping attendance above 75% is critical. Please let me know if you need to plan recovery sessions!`;
  }
  
  if (query.includes('grade') || query.includes('mark') || query.includes('score') || query.includes('exam') || query.includes('cgpa')) {
    return `Looking at academic grades: ${context.name} has an overall CGPA of ${context.cgpa}. Subject evaluation breakdown: ${context.marks || 'No marks logged yet'}. Let me know if you need study materials or focus areas for weaker subjects.`;
  }

  if (query.includes('risk') || query.includes('remediation') || query.includes('warning') || query.includes('status')) {
    return `For academic risk: the student is currently flagged in the **${context.remediation.riskLevel.toUpperCase()}** tier (Risk Index Score: ${context.remediation.riskScore.toFixed(0)}/100). The recorded reasons include: ${context.remediation.reasons || 'None'}. Actions assigned: ${context.remediation.actions || 'None'}.`;
  }

  if (query.includes('skill') || query.includes('project') || query.includes('portfolio') || query.includes('resume') || query.includes('job')) {
    return `${context.name}'s professional profile shows skills like: ${context.skills}. Projects logged: ${context.projects || 'None'}. Internships: ${context.internships || 'None'}. I recommend adding certifications to make the profile placement-ready!`;
  }

  // Default response
  return `Hello! I am EduVision AI, your Academic Counselor. Here is a quick snapshot of ${context.name}'s profile: CGPA is ${context.cgpa}, attendance status is ${context.attendance ? 'active' : 'inactive'}, and current risk level is ${context.remediation.riskLevel}. Let me know if you have specific questions about subjects, marks, or career pathways!`;
}

module.exports = {
  generateActionPlan,
  analyzeSkillGap,
  chatWithAi
};
