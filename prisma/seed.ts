import { PrismaClient, UserRole, UserStatus, Difficulty, ModuleCategory, LessonType, QuizStatus, CampaignStatus, CampaignType, ContactStatus, ActivityType, BadgeColor } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.activity.deleteMany(),
    prisma.lessonProgress.deleteMany(),
    prisma.moduleProgress.deleteMany(),
    prisma.quizResult.deleteMany(),
    prisma.quizAssignment.deleteMany(),
    prisma.quizDepartment.deleteMany(),
    prisma.questionOption.deleteMany(),
    prisma.question.deleteMany(),
    prisma.campaignQuiz.deleteMany(),
    prisma.campaignModule.deleteMany(),
    prisma.campaignUser.deleteMany(),
    prisma.campaignDepartment.deleteMany(),
    prisma.campaign.deleteMany(),
    prisma.certificate.deleteMany(),
    prisma.userBadge.deleteMany(),
    prisma.badge.deleteMany(),
    prisma.lesson.deleteMany(),
    prisma.quiz.deleteMany(),
    prisma.module.deleteMany(),
    prisma.phishingExample.deleteMany(),
    prisma.contactRequest.deleteMany(),
    prisma.user.deleteMany(),
    prisma.department.deleteMany(),
  ]);

  // ============================================
  // DEPARTMENTS
  // ============================================
  const departments = await Promise.all([
    prisma.department.create({ data: { name: "Engineering", description: "Software development and IT operations", employeeCount: 45, averageScore: 82, riskScore: 25, completionRate: 78 } }),
    prisma.department.create({ data: { name: "Marketing", description: "Marketing and communications", employeeCount: 22, averageScore: 68, riskScore: 42, completionRate: 62 } }),
    prisma.department.create({ data: { name: "Finance", description: "Financial operations and accounting", employeeCount: 18, averageScore: 75, riskScore: 35, completionRate: 71 } }),
    prisma.department.create({ data: { name: "Human Resources", description: "HR and talent management", employeeCount: 12, averageScore: 71, riskScore: 38, completionRate: 65 } }),
    prisma.department.create({ data: { name: "Sales", description: "Sales and business development", employeeCount: 35, averageScore: 64, riskScore: 48, completionRate: 55 } }),
    prisma.department.create({ data: { name: "Operations", description: "Business operations and logistics", employeeCount: 28, averageScore: 70, riskScore: 40, completionRate: 60 } }),
    prisma.department.create({ data: { name: "Legal", description: "Legal affairs and compliance", employeeCount: 8, averageScore: 85, riskScore: 20, completionRate: 88 } }),
    prisma.department.create({ data: { name: "Executive", description: "Executive leadership team", employeeCount: 6, averageScore: 78, riskScore: 30, completionRate: 75 } }),
  ]);
  console.log(`  ✅ ${departments.length} departments created`);

  // ============================================
  // USERS
  // ============================================
  const adminPassword = await hash("Admin123!", 12);
  const employeePassword = await hash("Employee123!", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@secureaware.com",
      name: "Sarah Chen",
      passwordHash: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
      jobTitle: "Chief Security Officer",
      riskScore: 15,
      departmentId: departments[0].id,
      lastLoginAt: new Date(),
    },
  });

  const employee = await prisma.user.create({
    data: {
      email: "employee@secureaware.com",
      name: "Alex Johnson",
      passwordHash: employeePassword,
      role: "EMPLOYEE",
      status: "ACTIVE",
      jobTitle: "Software Engineer",
      riskScore: 35,
      departmentId: departments[0].id,
      lastLoginAt: new Date(),
    },
  });

  // Additional employees
  const moreUsers = await Promise.all([
    prisma.user.create({ data: { email: "maria.garcia@secureaware.com", name: "Maria Garcia", passwordHash: employeePassword, role: "EMPLOYEE", jobTitle: "Marketing Manager", riskScore: 45, departmentId: departments[1].id } }),
    prisma.user.create({ data: { email: "james.wilson@secureaware.com", name: "James Wilson", passwordHash: employeePassword, role: "EMPLOYEE", jobTitle: "Financial Analyst", riskScore: 30, departmentId: departments[2].id } }),
    prisma.user.create({ data: { email: "emma.brown@secureaware.com", name: "Emma Brown", passwordHash: employeePassword, role: "EMPLOYEE", jobTitle: "HR Specialist", riskScore: 40, departmentId: departments[3].id } }),
    prisma.user.create({ data: { email: "david.lee@secureaware.com", name: "David Lee", passwordHash: employeePassword, role: "EMPLOYEE", jobTitle: "Sales Representative", riskScore: 55, departmentId: departments[4].id } }),
    prisma.user.create({ data: { email: "lisa.taylor@secureaware.com", name: "Lisa Taylor", passwordHash: employeePassword, role: "EMPLOYEE", jobTitle: "Operations Manager", riskScore: 38, departmentId: departments[5].id } }),
    prisma.user.create({ data: { email: "michael.clark@secureaware.com", name: "Michael Clark", passwordHash: employeePassword, role: "EMPLOYEE", jobTitle: "Senior Developer", riskScore: 20, departmentId: departments[0].id } }),
    prisma.user.create({ data: { email: "sophia.martinez@secureaware.com", name: "Sophia Martinez", passwordHash: employeePassword, role: "EMPLOYEE", jobTitle: "Legal Counsel", riskScore: 18, departmentId: departments[6].id } }),
    prisma.user.create({ data: { email: "ryan.davis@secureaware.com", name: "Ryan Davis", passwordHash: employeePassword, role: "EMPLOYEE", jobTitle: "VP of Engineering", riskScore: 22, departmentId: departments[7].id } }),
    prisma.user.create({ data: { email: "jennifer.white@secureaware.com", name: "Jennifer White", passwordHash: employeePassword, role: "EMPLOYEE", jobTitle: "Content Writer", riskScore: 50, departmentId: departments[1].id } }),
    prisma.user.create({ data: { email: "chris.anderson@secureaware.com", name: "Chris Anderson", passwordHash: employeePassword, role: "EMPLOYEE", status: "INACTIVE", jobTitle: "Former Intern", riskScore: 65, departmentId: departments[4].id } }),
  ]);
  const allUsers = [admin, employee, ...moreUsers];
  console.log(`  ✅ ${allUsers.length} users created`);

  // ============================================
  // BADGES
  // ============================================
  const badges = await Promise.all([
    prisma.badge.create({ data: { name: "First Steps", description: "Complete your first training module", icon: "Footprints", color: "GREEN", criteria: "Complete 1 module" } }),
    prisma.badge.create({ data: { name: "Quick Learner", description: "Complete 3 training modules", icon: "Zap", color: "BLUE", criteria: "Complete 3 modules" } }),
    prisma.badge.create({ data: { name: "Security Champion", description: "Complete all training modules", icon: "Shield", color: "GOLD", criteria: "Complete all modules" } }),
    prisma.badge.create({ data: { name: "Quiz Master", description: "Score 100% on any quiz", icon: "Target", color: "PURPLE", criteria: "Perfect quiz score" } }),
    prisma.badge.create({ data: { name: "Phishing Detective", description: "Identify 10 phishing attempts", icon: "Search", color: "RED", criteria: "Report 10 phishing emails" } }),
    prisma.badge.create({ data: { name: "Streak Runner", description: "Complete training 5 days in a row", icon: "Flame", color: "CYAN", criteria: "5-day streak" } }),
  ]);
  console.log(`  ✅ ${badges.length} badges created`);

  // Award some badges
  await prisma.userBadge.createMany({
    data: [
      { userId: employee.id, badgeId: badges[0].id },
      { userId: employee.id, badgeId: badges[1].id },
      { userId: employee.id, badgeId: badges[5].id },
      { userId: moreUsers[5].id, badgeId: badges[0].id },
      { userId: moreUsers[5].id, badgeId: badges[1].id },
      { userId: moreUsers[5].id, badgeId: badges[2].id },
      { userId: moreUsers[5].id, badgeId: badges[3].id },
    ],
  });

  // ============================================
  // TRAINING MODULES & LESSONS
  // ============================================
  const modulesData = [
    {
      title: "Phishing Awareness", description: "Learn to identify and report phishing emails, SMS, and voice calls",
      category: "PHISHING" as ModuleCategory, difficulty: "BEGINNER" as Difficulty, durationMins: 30, order: 1,
      keyTakeaways: ["Verify sender email addresses carefully", "Never click suspicious links", "Report phishing attempts immediately", "Check for urgency language and threats"],
      realExamples: ["2023 MGM Resorts breach started with a social engineering call", "Google and Facebook lost $100M to phishing invoices"],
      lessons: [
        { title: "What is Phishing?", type: "READING" as LessonType, durationMins: 8, content: "Phishing is a type of social engineering attack that uses deceptive messages to trick individuals into revealing sensitive information." },
        { title: "Types of Phishing Attacks", type: "VIDEO" as LessonType, durationMins: 12, content: "Learn about email phishing, spear phishing, whaling, smishing, and vishing." },
        { title: "Identifying Red Flags", type: "INTERACTIVE" as LessonType, durationMins: 10, content: "Practice identifying common phishing red flags in realistic email examples." },
      ],
    },
    {
      title: "Password Security", description: "Master the art of creating and managing strong passwords",
      category: "PASSWORDS" as ModuleCategory, difficulty: "BEGINNER" as Difficulty, durationMins: 25, order: 2,
      keyTakeaways: ["Use unique passwords for every account", "Enable password managers", "Minimum 12 characters with complexity", "Never share passwords"],
      realExamples: ["SolarWinds breach used the password solarwinds123", "Collection #1 exposed 773 million email/password pairs"],
      lessons: [
        { title: "Why Passwords Matter", type: "READING" as LessonType, durationMins: 7, content: "Understanding why strong passwords are the first line of defense." },
        { title: "Creating Strong Passwords", type: "VIDEO" as LessonType, durationMins: 10, content: "Techniques for creating memorable but secure passwords." },
        { title: "Password Manager Setup", type: "INTERACTIVE" as LessonType, durationMins: 8, content: "Hands-on guide to setting up and using a password manager." },
      ],
    },
    {
      title: "Multi-Factor Authentication", description: "Understand and implement MFA across all accounts",
      category: "PASSWORDS" as ModuleCategory, difficulty: "INTERMEDIATE" as Difficulty, durationMins: 20, order: 3,
      keyTakeaways: ["Always enable MFA when available", "Use authenticator apps over SMS", "Keep backup codes secure", "Hardware keys offer strongest protection"],
      realExamples: ["Twitter 2020 hack bypassed accounts without MFA", "Microsoft reports MFA blocks 99.9% of automated attacks"],
      lessons: [
        { title: "MFA Fundamentals", type: "READING" as LessonType, durationMins: 8, content: "What is multi-factor authentication and why is it critical." },
        { title: "Setting Up MFA", type: "INTERACTIVE" as LessonType, durationMins: 12, content: "Step-by-step guide to enabling MFA on common platforms." },
      ],
    },
    {
      title: "Safe Web Browsing", description: "Navigate the internet safely and avoid common threats",
      category: "BROWSING" as ModuleCategory, difficulty: "BEGINNER" as Difficulty, durationMins: 25, order: 4,
      keyTakeaways: ["Check for HTTPS before entering data", "Avoid downloading from untrusted sources", "Use ad blockers and privacy extensions", "Clear cookies and cache regularly"],
      realExamples: ["Watering hole attacks targeted Forbes.com visitors", "Malvertising campaigns on major news websites"],
      lessons: [
        { title: "Browser Security Basics", type: "READING" as LessonType, durationMins: 8, content: "Essential browser security settings and configurations." },
        { title: "Recognizing Malicious Websites", type: "VIDEO" as LessonType, durationMins: 10, content: "How to spot fake and malicious websites." },
        { title: "Safe Download Practices", type: "READING" as LessonType, durationMins: 7, content: "Best practices for downloading files safely." },
      ],
    },
    {
      title: "Social Engineering Defense", description: "Protect against manipulation and deception tactics",
      category: "SOCIAL_ENGINEERING" as ModuleCategory, difficulty: "INTERMEDIATE" as Difficulty, durationMins: 35, order: 5,
      keyTakeaways: ["Verify identities through official channels", "Be skeptical of unexpected requests", "Never reveal sensitive info under pressure", "Report suspicious interactions"],
      realExamples: ["The 2020 Twitter hack used phone-based social engineering", "Deepfake CEO voice used to steal $243,000"],
      lessons: [
        { title: "Understanding Social Engineering", type: "READING" as LessonType, durationMins: 10, content: "The psychology behind social engineering attacks." },
        { title: "Common Attack Vectors", type: "VIDEO" as LessonType, durationMins: 15, content: "Pretexting, baiting, tailgating, and quid pro quo attacks." },
        { title: "Defense Strategies", type: "INTERACTIVE" as LessonType, durationMins: 10, content: "Practice responding to social engineering scenarios." },
      ],
    },
    {
      title: "Ransomware Protection", description: "Understand ransomware threats and prevention strategies",
      category: "MALWARE" as ModuleCategory, difficulty: "INTERMEDIATE" as Difficulty, durationMins: 30, order: 6,
      keyTakeaways: ["Maintain regular offline backups", "Keep software and systems updated", "Never pay the ransom", "Report incidents immediately"],
      realExamples: ["Colonial Pipeline paid $4.4M in ransomware", "WannaCry affected 200,000+ systems in 150 countries"],
      lessons: [
        { title: "Ransomware Explained", type: "VIDEO" as LessonType, durationMins: 12, content: "How ransomware works and its devastating impact." },
        { title: "Prevention Best Practices", type: "READING" as LessonType, durationMins: 10, content: "Practical steps to prevent ransomware infections." },
        { title: "Incident Response", type: "READING" as LessonType, durationMins: 8, content: "What to do if you suspect a ransomware infection." },
      ],
    },
    {
      title: "Mobile Device Security", description: "Secure your smartphones and tablets",
      category: "MOBILE" as ModuleCategory, difficulty: "BEGINNER" as Difficulty, durationMins: 20, order: 7,
      keyTakeaways: ["Keep OS and apps updated", "Only install from official stores", "Enable device encryption", "Use screen lock with biometrics"],
      realExamples: ["Pegasus spyware infected devices through zero-click exploits", "Fake apps on Google Play stole banking credentials"],
      lessons: [
        { title: "Mobile Threat Landscape", type: "READING" as LessonType, durationMins: 8, content: "Current threats targeting mobile devices." },
        { title: "Securing Your Device", type: "INTERACTIVE" as LessonType, durationMins: 12, content: "Step-by-step mobile security hardening guide." },
      ],
    },
    {
      title: "Public Wi-Fi Safety", description: "Stay safe when using public wireless networks",
      category: "NETWORK" as ModuleCategory, difficulty: "ADVANCED" as Difficulty, durationMins: 25, order: 8,
      keyTakeaways: ["Always use VPN on public networks", "Avoid accessing sensitive accounts on public Wi-Fi", "Disable auto-connect to networks", "Use mobile hotspot when possible"],
      realExamples: ["Evil twin attacks at airports captured login credentials", "KRACK vulnerability affected all WPA2 networks"],
      lessons: [
        { title: "Risks of Public Wi-Fi", type: "VIDEO" as LessonType, durationMins: 10, content: "Understanding man-in-the-middle and evil twin attacks." },
        { title: "VPN and Encryption", type: "READING" as LessonType, durationMins: 8, content: "How VPNs protect your data on public networks." },
        { title: "Safe Practices", type: "READING" as LessonType, durationMins: 7, content: "Practical tips for safely using public Wi-Fi." },
      ],
    },
  ];

  const modules = [];
  for (const mod of modulesData) {
    const { lessons: lessonsData, ...modData } = mod;
    const createdModule = await prisma.module.create({
      data: {
        ...modData,
        lessons: {
          create: lessonsData.map((l, i) => ({ ...l, order: i + 1 })),
        },
      },
      include: { lessons: true },
    });
    modules.push(createdModule);
  }
  console.log(`  ✅ ${modules.length} modules with ${modules.reduce((a, m) => a + m.lessons.length, 0)} lessons created`);

  // ============================================
  // QUIZZES & QUESTIONS
  // ============================================
  const quizzesData = [
    {
      title: "Phishing Awareness Quiz", moduleId: modules[0].id, difficulty: "BEGINNER" as Difficulty, category: "PHISHING" as ModuleCategory, passingScore: 70, timeLimitMins: 10, status: "PUBLISHED" as QuizStatus,
      questions: [
        { text: "What is the most common type of phishing attack?", explanation: "Email phishing remains the most prevalent form, accounting for over 90% of phishing attempts.",
          options: [{ text: "Email phishing", isCorrect: true }, { text: "Voice phishing", isCorrect: false }, { text: "SMS phishing", isCorrect: false }, { text: "Social media phishing", isCorrect: false }] },
        { text: "Which of these is a red flag in a suspicious email?", explanation: "Urgent language creates pressure to act without thinking, a classic social engineering tactic.",
          options: [{ text: "Professional formatting", isCorrect: false }, { text: "Urgent language demanding immediate action", isCorrect: true }, { text: "Company logo in the header", isCorrect: false }, { text: "Sent during business hours", isCorrect: false }] },
        { text: "What should you do if you receive a suspicious email?", explanation: "Always report suspicious emails to your security team for investigation.",
          options: [{ text: "Delete it immediately", isCorrect: false }, { text: "Forward it to colleagues", isCorrect: false }, { text: "Report it to your security team", isCorrect: true }, { text: "Reply to verify the sender", isCorrect: false }] },
        { text: "How can you verify a legitimate link in an email?", explanation: "Hovering reveals the actual URL without clicking, which could trigger malware or phishing pages.",
          options: [{ text: "Click it to see where it goes", isCorrect: false }, { text: "Hover over it to see the actual URL", isCorrect: true }, { text: "Ask the sender to confirm", isCorrect: false }, { text: "Check the email header", isCorrect: false }] },
      ],
    },
    {
      title: "Password Security Quiz", moduleId: modules[1].id, difficulty: "BEGINNER" as Difficulty, category: "PASSWORDS" as ModuleCategory, passingScore: 70, timeLimitMins: 10, status: "PUBLISHED" as QuizStatus,
      questions: [
        { text: "What is the minimum recommended password length?", explanation: "NIST recommends at least 12 characters for strong passwords.",
          options: [{ text: "6 characters", isCorrect: false }, { text: "8 characters", isCorrect: false }, { text: "12 characters", isCorrect: true }, { text: "16 characters", isCorrect: false }] },
        { text: "Which is the strongest password?", explanation: "Long passphrases with mixed characters are the strongest while remaining memorable.",
          options: [{ text: "Password123!", isCorrect: false }, { text: "Tr0ub4dor&3", isCorrect: false }, { text: "correcthorsebatterystaple", isCorrect: false }, { text: "P@ssw0rd$eCur3!2024", isCorrect: true }] },
        { text: "What is a password manager?", explanation: "Password managers securely store and generate unique passwords for all your accounts.",
          options: [{ text: "A browser feature that saves passwords", isCorrect: false }, { text: "A dedicated tool that securely stores and generates passwords", isCorrect: true }, { text: "A sticky note system", isCorrect: false }, { text: "A shared spreadsheet", isCorrect: false }] },
      ],
    },
    {
      title: "Social Engineering Defense Quiz", moduleId: modules[4].id, difficulty: "INTERMEDIATE" as Difficulty, category: "SOCIAL_ENGINEERING" as ModuleCategory, passingScore: 75, timeLimitMins: 12, status: "PUBLISHED" as QuizStatus,
      questions: [
        { text: "What is pretexting?", explanation: "Pretexting involves creating a fabricated scenario to gain trust and extract information.",
          options: [{ text: "Sending fake emails", isCorrect: false }, { text: "Creating a false scenario to extract information", isCorrect: true }, { text: "Following someone into a building", isCorrect: false }, { text: "Leaving USB drives in parking lots", isCorrect: false }] },
        { text: "Someone calls claiming to be from IT support and needs your password. What should you do?", explanation: "Legitimate IT staff will never ask for your password. Always verify through official channels.",
          options: [{ text: "Give them your password to fix the issue", isCorrect: false }, { text: "Hang up and call IT through the official number", isCorrect: true }, { text: "Give them a fake password", isCorrect: false }, { text: "Ask them to email you instead", isCorrect: false }] },
        { text: "What is tailgating in physical security?", explanation: "Tailgating is following authorized personnel through secure doors without using your own credentials.",
          options: [{ text: "Following someone through a secure door", isCorrect: true }, { text: "Parking too close to another car", isCorrect: false }, { text: "Listening to conversations", isCorrect: false }, { text: "Reading over someone’s shoulder", isCorrect: false }] },
      ],
    },
  ];

  // Custom quiz (not linked to module)
  quizzesData.push({
    title: "General Cybersecurity Assessment", moduleId: undefined as any, difficulty: "INTERMEDIATE" as Difficulty, category: "GENERAL" as ModuleCategory, passingScore: 80, timeLimitMins: 15, status: "PUBLISHED" as QuizStatus,
    questions: [
      { text: "What does HTTPS stand for?", explanation: "HTTPS provides encrypted communication over a computer network.",
        options: [{ text: "HyperText Transfer Protocol Secure", isCorrect: true }, { text: "High Tech Transfer Protocol System", isCorrect: false }, { text: "HyperText Transport Protocol Safe", isCorrect: false }, { text: "Hybrid Text Transfer Protocol Secure", isCorrect: false }] },
      { text: "Which of these is NOT a type of malware?", explanation: "Firewall is a security tool, not a type of malware.",
        options: [{ text: "Trojan", isCorrect: false }, { text: "Worm", isCorrect: false }, { text: "Firewall", isCorrect: true }, { text: "Ransomware", isCorrect: false }] },
      { text: "What is two-factor authentication?", explanation: "2FA adds a second verification method beyond just a password.",
        options: [{ text: "Using two different passwords", isCorrect: false }, { text: "Verification using two different methods", isCorrect: true }, { text: "Logging in from two devices", isCorrect: false }, { text: "Having two admin accounts", isCorrect: false }] },
    ],
  });

  // Draft quiz
  quizzesData.push({
    title: "Advanced Threat Detection", moduleId: undefined as any, difficulty: "ADVANCED" as Difficulty, category: "MALWARE" as ModuleCategory, passingScore: 85, timeLimitMins: 20, status: "DRAFT" as QuizStatus,
    questions: [
      { text: "What is a zero-day vulnerability?", explanation: "A zero-day is a vulnerability unknown to the vendor, leaving zero days to patch.",
        options: [{ text: "A bug fixed on day one", isCorrect: false }, { text: "A vulnerability with no available patch", isCorrect: true }, { text: "An attack that takes zero effort", isCorrect: false }, { text: "A security audit finding", isCorrect: false }] },
    ],
  });

  const quizzes = [];
  for (const q of quizzesData) {
    const { questions: questionsData, moduleId, ...quizData } = q;
    const isCustom = !moduleId;
    const created = await prisma.quiz.create({
      data: {
        ...quizData,
        moduleId: moduleId || null,
        isCustom,
        createdBy: admin.id,
        questions: {
          create: questionsData.map((question, qi) => ({
            text: question.text,
            explanation: question.explanation,
            order: qi + 1,
            options: {
              create: question.options.map((opt, oi) => ({
                text: opt.text,
                isCorrect: opt.isCorrect,
                order: oi + 1,
              })),
            },
          })),
        },
      },
    });
    quizzes.push(created);
  }
  console.log(`  ✅ ${quizzes.length} quizzes created`);

  // Assign quizzes to departments
  await prisma.quizDepartment.createMany({
    data: [
      { quizId: quizzes[3].id, departmentId: departments[0].id },
      { quizId: quizzes[3].id, departmentId: departments[1].id },
      { quizId: quizzes[3].id, departmentId: departments[2].id },
      { quizId: quizzes[0].id, departmentId: departments[4].id },
    ],
  });

  // Assign quizzes to specific users
  await prisma.quizAssignment.createMany({
    data: [
      { quizId: quizzes[3].id, userId: employee.id, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { quizId: quizzes[0].id, userId: employee.id },
    ],
  });

  // ============================================
  // QUIZ RESULTS
  // ============================================
  await prisma.quizResult.createMany({
    data: [
      { userId: employee.id, quizId: quizzes[0].id, score: 75, passed: true, timeTaken: 420, answers: JSON.parse('[{"questionId":"q1","correct":true},{"questionId":"q2","correct":true},{"questionId":"q3","correct":true},{"questionId":"q4","correct":false}]') },
      { userId: moreUsers[5].id, quizId: quizzes[0].id, score: 100, passed: true, timeTaken: 300, answers: JSON.parse('[{"questionId":"q1","correct":true},{"questionId":"q2","correct":true},{"questionId":"q3","correct":true},{"questionId":"q4","correct":true}]') },
      { userId: moreUsers[0].id, quizId: quizzes[1].id, score: 67, passed: false, timeTaken: 500, answers: JSON.parse('[{"questionId":"q1","correct":true},{"questionId":"q2","correct":false},{"questionId":"q3","correct":true}]') },
      { userId: moreUsers[3].id, quizId: quizzes[2].id, score: 33, passed: false, timeTaken: 600, answers: JSON.parse('[{"questionId":"q1","correct":true},{"questionId":"q2","correct":false},{"questionId":"q3","correct":false}]') },
    ],
  });

  // ============================================
  // MODULE PROGRESS
  // ============================================
  await prisma.moduleProgress.createMany({
    data: [
      { userId: employee.id, moduleId: modules[0].id, progress: 100, isCompleted: true, completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { userId: employee.id, moduleId: modules[1].id, progress: 66, isCompleted: false },
      { userId: employee.id, moduleId: modules[3].id, progress: 33, isCompleted: false },
      { userId: moreUsers[5].id, moduleId: modules[0].id, progress: 100, isCompleted: true, completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { userId: moreUsers[5].id, moduleId: modules[1].id, progress: 100, isCompleted: true, completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
      { userId: moreUsers[5].id, moduleId: modules[2].id, progress: 100, isCompleted: true, completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    ],
  });

  // ============================================
  // CERTIFICATES
  // ============================================
  await prisma.certificate.createMany({
    data: [
      { userId: employee.id, moduleId: modules[0].id, moduleName: "Phishing Awareness", quizScore: 75 },
      { userId: moreUsers[5].id, moduleId: modules[0].id, moduleName: "Phishing Awareness", quizScore: 100 },
      { userId: moreUsers[5].id, moduleId: modules[1].id, moduleName: "Password Security", quizScore: 90 },
    ],
  });

  // ============================================
  // CAMPAIGNS
  // ============================================
  const campaigns = await Promise.all([
    prisma.campaign.create({
      data: {
        name: "Q1 2026 Security Awareness", description: "Mandatory security awareness training for all employees",
        type: "TRAINING", status: "ACTIVE", startDate: new Date("2026-01-01"), endDate: new Date("2026-03-31"), completionRate: 65, createdBy: admin.id,
        campaignModules: { create: [{ moduleId: modules[0].id }, { moduleId: modules[1].id }, { moduleId: modules[3].id }] },
        campaignDepartments: { create: [{ departmentId: departments[0].id }, { departmentId: departments[1].id }, { departmentId: departments[2].id }] },
      },
    }),
    prisma.campaign.create({
      data: {
        name: "Phishing Resilience Program", description: "Targeted phishing simulation and training campaign",
        type: "PHISHING_SIMULATION", status: "ACTIVE", startDate: new Date("2026-02-01"), endDate: new Date("2026-04-30"), completionRate: 42, createdBy: admin.id,
        campaignModules: { create: [{ moduleId: modules[0].id }, { moduleId: modules[4].id }] },
        campaignDepartments: { create: [{ departmentId: departments[4].id }, { departmentId: departments[1].id }] },
      },
    }),
    prisma.campaign.create({
      data: {
        name: "Executive Security Briefing", description: "Advanced security training for leadership team",
        type: "AWARENESS", status: "COMPLETED", startDate: new Date("2025-11-01"), endDate: new Date("2025-12-31"), completionRate: 100, createdBy: admin.id,
        campaignModules: { create: [{ moduleId: modules[4].id }, { moduleId: modules[5].id }, { moduleId: modules[7].id }] },
        campaignDepartments: { create: [{ departmentId: departments[7].id }] },
      },
    }),
    prisma.campaign.create({
      data: {
        name: "New Employee Onboarding", description: "Security fundamentals for new hires",
        type: "TRAINING", status: "DRAFT", createdBy: admin.id,
        campaignModules: { create: [{ moduleId: modules[0].id }, { moduleId: modules[1].id }, { moduleId: modules[2].id }, { moduleId: modules[6].id }] },
      },
    }),
  ]);
  console.log(`  ✅ ${campaigns.length} campaigns created`);

  // ============================================
  // PHISHING EXAMPLES
  // ============================================
  await prisma.phishingExample.createMany({
    data: [
      { subject: "Urgent: Your Account Has Been Compromised", sender: "Security Team", senderEmail: "security@g00gle-support.com", body: "Dear User,\n\nWe have detected unauthorized access to your account. Click the link below immediately to verify your identity and secure your account.\n\nVerify Now: http://g00gle-support.com/verify\n\nFailure to act within 24 hours will result in permanent account suspension.\n\nGoogle Security Team", redFlags: ["Misspelled domain (g00gle)", "Creates false urgency", "Suspicious link URL", "Threatens account suspension", "Generic greeting"], difficulty: "BEGINNER" },
      { subject: "Invoice #INV-2026-4891 - Payment Overdue", sender: "Accounts Payable", senderEmail: "billing@company-invoices.net", body: "Dear Valued Customer,\n\nThis is a reminder that invoice #INV-2026-4891 for $3,750.00 is now 15 days overdue. Please process payment immediately to avoid late fees.\n\nView Invoice: http://company-invoices.net/pay/inv-4891\n\nPayment must be received within 48 hours.", redFlags: ["Unknown sender domain", "Unexpected invoice", "Urgency pressure", "External payment link", "No specific company name"], difficulty: "INTERMEDIATE" },
      { subject: "Congratulations! You Won a $500 Gift Card", sender: "Rewards Center", senderEmail: "rewards@amaz0n-prizes.com", body: "Congratulations!\n\nYou have been selected as this month's lucky winner! Claim your $500 Amazon Gift Card now.\n\nClaim Now: http://amaz0n-prizes.com/claim\n\nOffer expires in 2 hours!", redFlags: ["Too good to be true offer", "Misspelled brand name", "Extreme urgency", "Unknown reward program", "Suspicious domain"], difficulty: "BEGINNER" },
      { subject: "Re: Q4 Budget Review - Updated Figures", sender: "CFO - Michael Roberts", senderEmail: "m.roberts@company-finance.org", body: "Hi,\n\nPlease review the updated Q4 budget figures I've attached. The board needs these approved by EOD.\n\nI'm in meetings all day so please just process the wire transfer for the new vendor using the attached instructions.\n\nThanks,\nMichael", redFlags: ["Spoofed executive name", "Urgency to bypass review", "Request for wire transfer", "External domain not matching company", "Vague reference to attachment", "Avoids direct communication"], difficulty: "ADVANCED" },
      { subject: "IT Department: Mandatory Password Reset", sender: "IT Help Desk", senderEmail: "helpdesk@yourcompany.com.biz", body: "Dear Employee,\n\nDue to a recent security update, all employees must reset their passwords within 24 hours.\n\nClick here to reset: http://yourcompany.com.biz/reset-password\n\nYou will need to enter your current password to proceed.\n\nIT Help Desk", redFlags: ["Extra TLD (.com.biz)", "Requests current password", "Mass mandatory action", "24-hour deadline", "Impersonates internal department"], difficulty: "INTERMEDIATE" },
      { subject: "Shared Document: Project Roadmap 2026", sender: "John Smith via SharePoint", senderEmail: "noreply@sharepoinnt-online.com", body: "John Smith has shared a document with you:\n\nProject Roadmap 2026.xlsx\n\nOpen in SharePoint: http://sharepoinnt-online.com/doc/roadmap\n\nThis link will expire in 7 days.", redFlags: ["Double n in sharepoint", "External domain mimicking SharePoint", "Unexpected shared document", "Fake Microsoft branding"], difficulty: "INTERMEDIATE" },
    ],
  });
  console.log("  ✅ 6 phishing examples created");

  // ============================================
  // ACTIVITIES
  // ============================================
  const now = Date.now();
  await prisma.activity.createMany({
    data: [
      { userId: employee.id, type: "MODULE_COMPLETED", target: "Phishing Awareness", details: "Completed with 100% progress", createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000) },
      { userId: employee.id, type: "QUIZ_COMPLETED", target: "Phishing Awareness Quiz", details: "Score: 75%", createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000) },
      { userId: employee.id, type: "BADGE_EARNED", target: "First Steps", details: "Earned for completing first module", createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000) },
      { userId: employee.id, type: "MODULE_STARTED", target: "Password Security", details: "Started module", createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000) },
      { userId: employee.id, type: "LOGIN", target: "System", details: "User logged in", createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000) },
      { userId: moreUsers[5].id, type: "MODULE_COMPLETED", target: "MFA Training", details: "Completed with 100% progress", createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000) },
      { userId: moreUsers[5].id, type: "BADGE_EARNED", target: "Security Champion", details: "Completed all modules", createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000) },
      { userId: moreUsers[0].id, type: "QUIZ_FAILED", target: "Password Security Quiz", details: "Score: 67%", createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000) },
      { userId: moreUsers[3].id, type: "QUIZ_FAILED", target: "Social Engineering Quiz", details: "Score: 33%", createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000) },
      { userId: admin.id, type: "LOGIN", target: "System", details: "Admin logged in", createdAt: new Date(now - 60 * 60 * 1000) },
    ],
  });
  console.log("  ✅ 10 activities created");

  // ============================================
  // CONTACT REQUESTS
  // ============================================
  await prisma.contactRequest.createMany({
    data: [
      { name: "Robert Thompson", email: "robert@techcorp.com", company: "TechCorp Inc.", message: "We're looking for a security awareness solution for our 500+ employees. Can we schedule a demo?", status: "NEW" },
      { name: "Amanda Foster", email: "amanda.f@globalbank.com", company: "Global Banking Group", phone: "+1-555-0142", message: "Interested in your phishing simulation features. We need compliance training for our financial services team.", status: "IN_REVIEW", internalNotes: "Enterprise client, schedule call with sales" },
      { name: "Tom Nakamura", email: "t.nakamura@healthplus.org", company: "HealthPlus", message: "Looking for HIPAA-compliant security training. Do you support healthcare industry requirements?", status: "CONTACTED", internalNotes: "Sent healthcare compliance deck. Follow up next week." },
    ],
  });
  console.log("  ✅ 3 contact requests created");

  // ============================================
  // AUDIT LOGS
  // ============================================
  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: "CREATE", entity: "Campaign", entityId: campaigns[0].id, newValues: { name: "Q1 2026 Security Awareness" } },
      { userId: admin.id, action: "CREATE", entity: "Quiz", entityId: quizzes[3].id, newValues: { title: "General Cybersecurity Assessment" } },
      { userId: admin.id, action: "SEED", entity: "System", entityId: "seed", newValues: { message: "Database seeded with demo data" } },
    ],
  });
  console.log("  ✅ Audit logs created");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Demo Accounts:");
  console.log("   Admin:    admin@secureaware.com / Admin123!");
  console.log("   Employee: employee@secureaware.com / Employee123!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
