import { PrismaClient, UserRole, UserStatus, Difficulty, ModuleCategory, LessonType, QuizStatus, CampaignStatus, CampaignType, ContactStatus, ActivityType, BadgeColor, OrganizationPlan } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding production database...");

  // Clear existing data
  await prisma.subscriptionEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.moduleProgress.deleteMany();
  await prisma.quizResult.deleteMany();
  await prisma.quizAssignment.deleteMany();
  await prisma.quizDepartment.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.campaignQuiz.deleteMany();
  await prisma.campaignModule.deleteMany();
  await prisma.campaignUser.deleteMany();
  await prisma.phishingEvent.deleteMany();
  await prisma.phishingTemplate.deleteMany();
  await prisma.campaignDepartment.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.module.deleteMany();
  await prisma.phishingExample.deleteMany();
  await prisma.contactRequest.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.orgSetting.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.organization.deleteMany();
  console.log("Cleared existing data");

  // =============================================
  // SUPER ADMIN (Platform-level, no organization)
  // =============================================
  const superAdminHash = await bcrypt.hash("SuperAdmin123!@#", 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@secureaware.online" },
    update: {},
    create: {
      email: "superadmin@secureaware.online",
      name: "Super Administrator",
      passwordHash: superAdminHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      jobTitle: "Platform Super Administrator",
      organizationId: null,
    },
  });
  console.log("Created Super Admin: " + superAdmin.email);

  // =============================================
  // DEFAULT ORGANIZATION
  // =============================================
  const organization = await prisma.organization.create({
    data: {
      name: "SecureAware Demo Corp",
      slug: "secureaware-demo",
      domain: "secureaware.online",
      plan: OrganizationPlan.ENTERPRISE,
      maxUsers: 100,
      billingEmail: "billing@secureaware.online",
      subscriptionStartDate: new Date("2026-01-01"),
      subscriptionEndDate: new Date("2027-01-01"),
    },
  });
  console.log("Created default organization: " + organization.name);

  // =============================================
  // SUBSCRIPTION EVENTS
  // =============================================
  const subscriptionEvents = [
    {
      organizationId: organization.id,
      type: "TRIAL_START",
      description: "14-day free trial started",
      createdAt: new Date("2025-12-15"),
    },
    {
      organizationId: organization.id,
      type: "TRIAL_END",
      description: "Trial period ended",
      createdAt: new Date("2025-12-29"),
    },
    {
      organizationId: organization.id,
      type: "UPGRADE",
      description: "Upgraded from FREE to STARTER plan",
      planFrom: OrganizationPlan.FREE,
      planTo: OrganizationPlan.STARTER,
      amount: 49.99,
      currency: "USD",
      createdAt: new Date("2025-12-29"),
    },
    {
      organizationId: organization.id,
      type: "PAYMENT",
      description: "Monthly subscription payment",
      amount: 49.99,
      currency: "USD",
      createdAt: new Date("2026-01-01"),
    },
    {
      organizationId: organization.id,
      type: "UPGRADE",
      description: "Upgraded from STARTER to PROFESSIONAL plan",
      planFrom: OrganizationPlan.STARTER,
      planTo: OrganizationPlan.PROFESSIONAL,
      amount: 149.99,
      currency: "USD",
      createdAt: new Date("2026-02-01"),
    },
    {
      organizationId: organization.id,
      type: "PAYMENT",
      description: "Monthly subscription payment",
      amount: 149.99,
      currency: "USD",
      createdAt: new Date("2026-02-01"),
    },
    {
      organizationId: organization.id,
      type: "UPGRADE",
      description: "Upgraded from PROFESSIONAL to ENTERPRISE plan",
      planFrom: OrganizationPlan.PROFESSIONAL,
      planTo: OrganizationPlan.ENTERPRISE,
      amount: 399.99,
      currency: "USD",
      createdAt: new Date("2026-03-01"),
    },
    {
      organizationId: organization.id,
      type: "PAYMENT",
      description: "Monthly subscription payment",
      amount: 399.99,
      currency: "USD",
      createdAt: new Date("2026-03-01"),
    },
    {
      organizationId: organization.id,
      type: "RENEWAL",
      description: "Annual subscription renewed",
      amount: 3999.99,
      currency: "USD",
      createdAt: new Date("2026-04-01"),
    },
  ];

  for (const event of subscriptionEvents) {
    await prisma.subscriptionEvent.create({ data: event });
  }
  console.log("Created " + subscriptionEvents.length + " subscription events");

  // =============================================
  // DEPARTMENTS
  // =============================================
  const deptData = [
    { name: "Information Technology", description: "IT infrastructure, development, and support teams", employeeCount: 45, averageScore: 82, riskScore: 25, completionRate: 78 },
    { name: "Human Resources", description: "People operations, talent acquisition, and employee relations", employeeCount: 18, averageScore: 74, riskScore: 35, completionRate: 65 },
    { name: "Finance & Accounting", description: "Financial planning, reporting, and treasury operations", employeeCount: 22, averageScore: 79, riskScore: 30, completionRate: 72 },
    { name: "Sales & Marketing", description: "Business development, client relations, and brand management", employeeCount: 35, averageScore: 68, riskScore: 42, completionRate: 58 },
    { name: "Operations", description: "Supply chain, logistics, and business operations", employeeCount: 30, averageScore: 71, riskScore: 38, completionRate: 62 },
    { name: "Legal & Compliance", description: "Legal affairs, regulatory compliance, and governance", employeeCount: 12, averageScore: 85, riskScore: 20, completionRate: 88 },
    { name: "Customer Support", description: "Client support, helpdesk, and service delivery", employeeCount: 25, averageScore: 70, riskScore: 40, completionRate: 60 },
    { name: "Executive Leadership", description: "C-suite and senior management team", employeeCount: 8, averageScore: 88, riskScore: 15, completionRate: 92 },
  ];
  const departments = [];
  for (const d of deptData) {
    const dept = await prisma.department.create({ data: { ...d, organizationId: organization.id } });
    departments.push(dept);
  }
  console.log("Created " + departments.length + " departments");

  // =============================================
  // USERS
  // =============================================
  const adminHash = await bcrypt.hash("Admin123!", 12);
  const empHash = await bcrypt.hash("Employee123!", 12);

  const admin = await prisma.user.create({
    data: { email: "admin@secureaware.online", name: "Security Administrator", passwordHash: adminHash, role: "ADMIN", status: "ACTIVE", jobTitle: "Chief Information Security Officer", riskScore: 12, departmentId: departments[0].id, organizationId: organization.id }
  });
  const employee = await prisma.user.create({
    data: { email: "employee@secureaware.online", name: "Sarah Johnson", passwordHash: empHash, role: "EMPLOYEE", status: "ACTIVE", jobTitle: "Marketing Specialist", riskScore: 45, departmentId: departments[3].id, organizationId: organization.id }
  });
  const extraEmployees = [
    { email: "james.wilson@company.com", name: "James Wilson", jobTitle: "Software Engineer", dept: 0, risk: 22 },
    { email: "maria.garcia@company.com", name: "Maria Garcia", jobTitle: "HR Manager", dept: 1, risk: 38 },
    { email: "david.chen@company.com", name: "David Chen", jobTitle: "Financial Analyst", dept: 2, risk: 28 },
    { email: "emily.brown@company.com", name: "Emily Brown", jobTitle: "Sales Representative", dept: 3, risk: 55 },
    { email: "michael.taylor@company.com", name: "Michael Taylor", jobTitle: "Operations Manager", dept: 4, risk: 33 },
    { email: "lisa.anderson@company.com", name: "Lisa Anderson", jobTitle: "Compliance Officer", dept: 5, risk: 18 },
    { email: "robert.martinez@company.com", name: "Robert Martinez", jobTitle: "Support Specialist", dept: 6, risk: 48 },
    { email: "jennifer.lee@company.com", name: "Jennifer Lee", jobTitle: "VP Engineering", dept: 7, risk: 15 },
    { email: "thomas.wright@company.com", name: "Thomas Wright", jobTitle: "Network Administrator", dept: 0, risk: 20 },
    { email: "amanda.clark@company.com", name: "Amanda Clark", jobTitle: "Accountant", dept: 2, risk: 42 },
  ];
  const employees = [employee];
  for (const e of extraEmployees) {
    const u = await prisma.user.create({ data: { email: e.email, name: e.name, passwordHash: empHash, role: "EMPLOYEE", status: "ACTIVE", jobTitle: e.jobTitle, riskScore: e.risk, departmentId: departments[e.dept].id, organizationId: organization.id } });
    employees.push(u);
  }
  console.log("Created " + (employees.length + 1) + " users");

  // =============================================
  // BADGES
  // =============================================
  const badgeData = [
    { name: "Security Rookie", description: "Completed your first security awareness module", icon: "Shield", color: BadgeColor.BLUE, criteria: "Complete 1 training module" },
    { name: "Phishing Spotter", description: "Successfully identified phishing attempts in training", icon: "Eye", color: BadgeColor.GREEN, criteria: "Pass phishing awareness training with 80%+" },
    { name: "Password Guardian", description: "Mastered password security best practices", icon: "Lock", color: BadgeColor.PURPLE, criteria: "Score 90%+ on password security quiz" },
    { name: "Security Champion", description: "Completed 5 or more training modules with distinction", icon: "Trophy", color: BadgeColor.GOLD, criteria: "Complete 5 modules with 85%+ average score" },
    { name: "Threat Hunter", description: "Demonstrated advanced threat detection capabilities", icon: "Target", color: BadgeColor.RED, criteria: "Pass all advanced-level quizzes" },
    { name: "Cyber Defender", description: "Achieved full compliance across all training modules", icon: "ShieldCheck", color: BadgeColor.CYAN, criteria: "Complete all available training modules" },
    { name: "Quick Learner", description: "Completed 3 modules within your first week", icon: "Zap", color: BadgeColor.BLUE, criteria: "Complete 3 modules in 7 days" },
    { name: "Perfect Score", description: "Achieved 100% on any security quiz", icon: "Star", color: BadgeColor.GOLD, criteria: "Score 100% on any quiz" },
  ];
  const badges = [];
  for (const b of badgeData) {
    const badge = await prisma.badge.create({ data: { ...b, organizationId: organization.id, isGlobal: true } });
    badges.push(badge);
  }
  console.log("Created " + badges.length + " badges");

  // =============================================
  // TRAINING MODULES WITH LESSONS AND QUIZZES
  // =============================================
  interface ModuleSeed {
  title: string;
  description: string;
  category: ModuleCategory;
  difficulty: Difficulty;
  durationMins: number;
  order: number;
  keyTakeaways: string[];
  realExamples: string[];
  lessons: LessonSeed[];
  quiz: QuizSeed;
}

interface LessonSeed {
  title: string;
  description: string;
  type: LessonType;
  durationMins: number;
  order: number;
  content: string;
}

interface QuizSeed {
  title: string;
  description: string;
  passingScore: number;
  timeLimitMins: number;
  questions: QuestionSeed[];
}

interface QuestionSeed {
  text: string;
  explanation: string;
  order: number;
  options: { text: string; isCorrect: boolean; order: number }[];
}

// =============================================================================
// MODULE 1: PHISHING RECOGNITION
// =============================================================================

const module1: ModuleSeed = {
  title: "Phishing Recognition Fundamentals",
  description:
    "Learn to identify phishing emails, messages, and websites. Understand the tactics attackers use and build the instincts to spot deception before you click.",
  category: "PHISHING",
  difficulty: "BEGINNER",
  durationMins: 20,
  order: 1,
  keyTakeaways: [
    "Verify sender email addresses — display names can be spoofed",
    "Hover over links before clicking to check the real URL",
    "Legitimate organizations never ask for passwords via email",
    "Urgency and threats are classic manipulation tactics",
    "When in doubt, contact the supposed sender through a separate channel",
  ],
  realExamples: [
    "In 2020, Twitter employees received spear-phishing calls that led to the compromise of 130 high-profile accounts including Barack Obama and Elon Musk.",
    "The 2016 DNC email breach started with a single phishing email disguised as a Google security alert asking a staffer to reset their password.",
    "In 2023, MGM Resorts lost over $100 million after an attacker social-engineered the IT help desk using information found on LinkedIn.",
  ],
  lessons: [
    {
      title: "What is phishing and why it works",
      description: "Understanding the psychology behind phishing attacks",
      type: "READING",
      durationMins: 5,
      order: 1,
      content: `# What is phishing?

Phishing is a social engineering attack where criminals impersonate trusted entities to trick you into revealing sensitive information, clicking malicious links, or downloading malware.

## Why phishing works

Phishing exploits fundamental human psychology, not technical vulnerabilities:

**Authority**: Emails that appear to come from your CEO, IT department, or a bank carry implicit trust. Attackers exploit this by spoofing sender names and using official-looking templates.

**Urgency**: "Your account will be locked in 24 hours" or "Immediate action required" — these phrases short-circuit your critical thinking. Attackers want you to act before you think.

**Fear**: "Suspicious login detected" or "Your payment was declined" triggers anxiety. When you're worried, you're less likely to scrutinize the email.

**Curiosity**: "You have a package waiting" or "Someone shared a document with you" — these appeal to your natural desire to know more.

**Helpfulness**: "Can you do me a quick favor?" from what appears to be a colleague. People naturally want to help, especially when the request seems easy.

## The scale of the problem

Phishing is the most common initial attack vector in data breaches. Over 80% of reported security incidents involve phishing. The average cost of a phishing-driven breach exceeds $4.7 million.

The good news: phishing is also the most preventable attack. Once you learn to recognize the patterns, the vast majority of phishing attempts become obvious.`,
    },
    {
      title: "Anatomy of a phishing email",
      description: "Breaking down the red flags in phishing messages",
      type: "READING",
      durationMins: 7,
      order: 2,
      content: `# Anatomy of a phishing email

Every phishing email contains detectable red flags. Here's how to systematically evaluate any suspicious message.

## Red flag 1: Sender address mismatch

The display name might say "Microsoft Support" but the actual email address is support@m1crosoft-security.com. Always check the full email address, not just the name.

**How to check**: Click or hover on the sender name to reveal the full address. Look for misspellings, extra characters, or unfamiliar domains.

Common tricks:
- Replacing letters with numbers: amaz0n.com, g00gle.com
- Adding words: microsoft-security.com, apple-support-center.com
- Using subdomains: login.microsoft.com.attacker.com (the real domain here is attacker.com)

## Red flag 2: Suspicious links

Hover over any link WITHOUT clicking it. Your email client will show you the actual URL.

What to look for:
- Does the URL domain match the supposed sender? An email from "PayPal" should link to paypal.com, not paypa1-verify.com
- Is HTTPS present? While not a guarantee of safety, legitimate sites use HTTPS
- Are there excessive subdomains or long random strings?

## Red flag 3: Urgency and threats

"Your account will be suspended", "Verify within 24 hours", "Unauthorized access detected" — legitimate companies rarely threaten immediate consequences via email. They give you time and multiple ways to respond.

## Red flag 4: Generic greetings

"Dear Customer", "Dear User", "Dear Account Holder" — if a company has your account, they know your name. Generic greetings suggest the email was sent in bulk.

## Red flag 5: Requests for sensitive information

No legitimate organization will ask you to send your password, Social Security number, or credit card number via email. Ever. If you receive such a request, it's phishing.

## Red flag 6: Attachments you didn't expect

Unexpected attachments, especially .zip, .exe, .docm, or .js files, are a major risk. Even PDFs can contain malicious links. Never open attachments from unknown senders.

## What to do when you spot a phishing email

1. **Do not click** any links or download any attachments
2. **Report it** using your organization's phishing report button or forward it to your security team
3. **Delete it** from your inbox
4. If you already clicked, **change your password immediately** and notify IT`,
    },
    {
      title: "Beyond email: other phishing channels",
      description:
        "Recognizing phishing via SMS, voice calls, QR codes, and social media",
      type: "READING",
      durationMins: 5,
      order: 3,
      content: `# Beyond email: other phishing channels

Phishing isn't limited to email. Attackers use every communication channel available.

## Smishing (SMS phishing)

Text messages claiming to be from banks, delivery services, or government agencies. Examples:
- "Your package delivery failed. Reschedule here: [link]"
- "Unusual activity on your bank account. Verify: [link]"
- "Your IRS refund of $3,847 is ready. Claim now: [link]"

**Defense**: Never click links in unexpected text messages. Go directly to the company's app or website instead.

## Vishing (Voice phishing)

Phone calls from people claiming to be tech support, your bank, or law enforcement. They may spoof caller ID to appear legitimate.

Common scripts:
- "This is Microsoft support. We detected a virus on your computer."
- "This is your bank's fraud department. We need to verify your account."
- "This is the IRS. You owe back taxes and must pay immediately."

**Defense**: Hang up and call the organization back using the number on their official website or your card.

## QR code phishing (Quishing)

Malicious QR codes placed over legitimate ones in public spaces, or sent in emails/documents. When scanned, they redirect to phishing sites.

Common locations: parking meters, restaurant menus, conference materials, printed mail.

**Defense**: Preview the URL before opening it. If your phone's camera shows the URL, check the domain before proceeding.

## Social media phishing

Fake profiles, direct messages with malicious links, or posts promising prizes and giveaways.

**Defense**: Be skeptical of unsolicited messages on any platform, even from accounts that appear to belong to people you know.`,
    },
    {
      title: "Phishing simulation exercise",
      description: "Practice identifying phishing in realistic scenarios",
      type: "INTERACTIVE",
      durationMins: 3,
      order: 4,
      content: `# Practice: Can you spot the phishing?

Review each email scenario below and identify all the red flags.

---

## Scenario 1

**From**: IT Support <it.support@yourcompany-helpdesk.net>
**Subject**: Urgent: Password Reset Required

"Dear Employee, your email password will expire today. Click the link below to reset it immediately or you will lose access to all company systems. [Reset Password Now]"

**Red flags to identify**:
- External domain (yourcompany-helpdesk.net instead of your actual company domain)
- Generic greeting ("Dear Employee")
- Extreme urgency ("will expire today", "lose access to all company systems")
- No personalization (no name, no ticket number)

---

## Scenario 2

**From**: Jennifer Martinez, CEO <j.martinez@company.com>
**Subject**: Quick favor needed

"Hi, are you available right now? I need you to purchase some gift cards for a client appreciation event. I'll reimburse you. Please keep this quiet as it's a surprise for the team. Can you get 5x $200 Amazon gift cards and send me the codes?"

**Red flags to identify**:
- CEO wouldn't typically email a random employee for gift card purchases
- Request for secrecy ("keep this quiet")
- Gift cards are a hallmark of scams — they're untraceable
- Urgency and unusual request
- No use of normal purchasing channels

---

## Scenario 3

**From**: DocuSign <noreply@docusign.com>
**Subject**: You have a new document to review and sign

"John Smith shared a document with you via DocuSign. Please review and sign: Quarterly Report Q3 2024. [Review Document]"

**Analysis**: This one is harder. The sender domain is legitimate (docusign.com), uses your name, and references a plausible document. To evaluate:
- Were you expecting this document?
- Can you verify with John Smith through another channel?
- Hover over the "Review Document" link — does it actually go to docusign.com?

Not every suspicious email is phishing, but verification takes 30 seconds and could save your organization millions.`,
    },
  ],
  quiz: {
    title: "Phishing Recognition Assessment",
    description:
      "Test your ability to identify phishing attacks across different channels and scenarios.",
    passingScore: 70,
    timeLimitMins: 10,
    questions: [
      {
        text: "You receive an email from 'support@amaz0n-security.com' about suspicious activity on your account. What is the most important red flag?",
        explanation:
          "The domain 'amaz0n-security.com' uses a zero instead of the letter 'o' and adds '-security' — this is not Amazon's real domain (amazon.com). Always check the actual sender email address.",
        order: 1,
        options: [
          {
            text: "The email mentions suspicious activity",
            isCorrect: false,
            order: 1,
          },
          {
            text: "The sender domain is misspelled and not amazon.com",
            isCorrect: true,
            order: 2,
          },
          {
            text: "The email was received outside business hours",
            isCorrect: false,
            order: 3,
          },
          {
            text: "The email contains a link",
            isCorrect: false,
            order: 4,
          },
        ],
      },
      {
        text: "Your CEO sends you an urgent email asking you to buy gift cards and send the codes. What should you do?",
        explanation:
          "Gift card requests via email are a classic business email compromise (BEC) scam. Legitimate executives never ask employees to buy gift cards and send codes. Always verify through a separate channel.",
        order: 2,
        options: [
          {
            text: "Buy the gift cards quickly since the CEO asked",
            isCorrect: false,
            order: 1,
          },
          {
            text: "Reply to the email asking for more details",
            isCorrect: false,
            order: 2,
          },
          {
            text: "Verify the request by calling or messaging the CEO directly through a separate channel",
            isCorrect: true,
            order: 3,
          },
          {
            text: "Forward the email to your colleagues for their opinion",
            isCorrect: false,
            order: 4,
          },
        ],
      },
      {
        text: "What is 'smishing'?",
        explanation:
          "Smishing is phishing conducted via SMS (text messages). Attackers send texts impersonating banks, delivery services, or government agencies with links to malicious websites.",
        order: 3,
        options: [
          {
            text: "Phishing conducted through social media platforms",
            isCorrect: false,
            order: 1,
          },
          {
            text: "Phishing conducted through SMS text messages",
            isCorrect: true,
            order: 2,
          },
          {
            text: "Phishing that uses fake QR codes",
            isCorrect: false,
            order: 3,
          },
          {
            text: "Phishing conducted through phone calls",
            isCorrect: false,
            order: 4,
          },
        ],
      },
      {
        text: "You hover over a link in an email from 'PayPal' and see the URL is https://paypal.account-verify.com/login. Is this legitimate?",
        explanation:
          "The actual domain is account-verify.com, not paypal.com. 'paypal' is just a subdomain of the attacker's domain. Always look at the root domain (the part right before .com/.org/.net).",
        order: 4,
        options: [
          {
            text: "Yes, it contains 'paypal' and uses HTTPS",
            isCorrect: false,
            order: 1,
          },
          {
            text: "No, the real domain is account-verify.com, not paypal.com",
            isCorrect: true,
            order: 2,
          },
          {
            text: "Yes, any URL with HTTPS is safe",
            isCorrect: false,
            order: 3,
          },
          {
            text: "It depends on whether you have a PayPal account",
            isCorrect: false,
            order: 4,
          },
        ],
      },
      {
        text: "Which of the following is the BEST action to take when you receive a suspicious email?",
        explanation:
          "The correct action is to report the email using your organization's phishing report tool, then delete it. Never reply to, forward, or click anything in a suspected phishing email.",
        order: 5,
        options: [
          {
            text: "Reply asking the sender to verify their identity",
            isCorrect: false,
            order: 1,
          },
          {
            text: "Report it using the phishing report button and delete it",
            isCorrect: true,
            order: 2,
          },
          {
            text: "Forward it to all your colleagues as a warning",
            isCorrect: false,
            order: 3,
          },
          {
            text: "Open any attachments in a sandbox to investigate",
            isCorrect: false,
            order: 4,
          },
        ],
      },
      {
        text: "What psychological tactic do phishing emails most commonly exploit?",
        explanation:
          "While phishing emails use many tactics, urgency is the most prevalent. Phrases like 'act now', 'expires today', and 'immediate action required' are designed to make you act before you think critically.",
        order: 6,
        options: [
          {
            text: "Humor and entertainment",
            isCorrect: false,
            order: 1,
          },
          {
            text: "Urgency and time pressure",
            isCorrect: true,
            order: 2,
          },
          {
            text: "Technical complexity",
            isCorrect: false,
            order: 3,
          },
          {
            text: "Long, detailed explanations",
            isCorrect: false,
            order: 4,
          },
        ],
      },
    ],
  },
};

// =============================================================================
// MODULE 2: PASSWORD SECURITY
// =============================================================================

const module2: ModuleSeed = {
  title: "Password Security & Authentication",
  description:
    "Master the principles of strong authentication. Learn to create secure passwords, use password managers effectively, and understand multi-factor authentication.",
  category: "PASSWORDS",
  difficulty: "BEGINNER",
  durationMins: 15,
  order: 2,
  keyTakeaways: [
    "Use a unique password for every account — never reuse",
    "Use a password manager to generate and store strong passwords",
    "Enable multi-factor authentication (MFA) on all critical accounts",
    "Passphrases (4+ random words) are stronger and easier to remember than complex short passwords",
    "Never share passwords via email, chat, or phone",
  ],
  realExamples: [
    "The Colonial Pipeline ransomware attack in 2021 began with a single compromised VPN password that had been reused from a previous breach.",
    "The Dropbox breach of 2012 exposed 68 million user credentials because an employee reused their LinkedIn password at work.",
    "In 2024, the Snowflake customer data breaches (affecting AT&T, Ticketmaster, and others) succeeded because victim accounts lacked multi-factor authentication.",
  ],
  lessons: [
    {
      title: "Why passwords fail",
      description: "Understanding how attackers crack and steal passwords",
      type: "READING",
      durationMins: 4,
      order: 1,
      content: `# Why passwords fail

## How attackers get your passwords

**Credential stuffing**: Attackers take email/password pairs leaked from one breach and try them on other services. If you reuse your Netflix password on your work email, a Netflix breach gives attackers your work access.

**Brute force attacks**: Automated tools try millions of combinations per second. A 6-character password with only lowercase letters has about 309 million combinations — crackable in seconds. An 8-character password with mixed case, numbers, and symbols has 6 quadrillion combinations — but modern GPUs can still crack it in hours.

**Dictionary attacks**: Attackers try common words, names, dates, and known password patterns. "Password123!", "Summer2024!", and "Company@123" are all in attacker dictionaries.

**Phishing and social engineering**: The simplest method — just ask for it. Fake login pages capture credentials directly.

**Keyloggers and malware**: Software installed on compromised machines records every keystroke.

## What makes a password weak

- Any word found in a dictionary, in any language
- Personal information: names, birthdays, pet names, addresses
- Common substitutions: p@ssw0rd, h3llo, s3cur1ty (attackers know these patterns)
- Keyboard patterns: qwerty, 123456, asdfgh
- Short length: anything under 12 characters is increasingly vulnerable
- Reused passwords: using the same password across multiple accounts`,
    },
    {
      title: "Building strong passwords",
      description: "Practical techniques for creating uncrackable passwords",
      type: "READING",
      durationMins: 4,
      order: 2,
      content: `# Building strong passwords

## The passphrase method (recommended)

Instead of a complex short password, use a passphrase — four or more random, unrelated words:

**Examples**:
- correct horse battery staple (from the famous XKCD comic)
- marble penguin telescope furnace
- sidewalk cactus umbrella molecule

**Why this works**: "marble penguin telescope furnace" is 33 characters long. Even without special characters, it would take centuries to brute-force. And it's far easier to remember than "X#9mK!2pQ".

**Rules for good passphrases**:
- Use at least 4 words
- Choose truly random words (don't use song lyrics, quotes, or phrases)
- Words should not be related to each other
- Add a number or special character between words if required by the system

## Password managers

The only practical way to have unique, strong passwords for every account is a password manager.

**How they work**: You remember one strong master password. The manager generates, stores, and auto-fills unique random passwords for every site.

**Recommended password managers**: 1Password, Bitwarden, KeePass. Your organization may provide one — check with IT.

**What to store in a password manager**:
- All website and application passwords
- WiFi passwords
- Software license keys
- Security questions and answers (generate random answers — "What is your mother's maiden name?" → "7hG$kL9mNp")

**What NOT to store in a password manager**:
- The master password itself (memorize it)
- Recovery codes (print and store physically)`,
    },
    {
      title: "Multi-factor authentication (MFA)",
      description: "Adding layers of security beyond passwords",
      type: "READING",
      durationMins: 4,
      order: 3,
      content: `# Multi-factor authentication (MFA)

MFA requires two or more verification methods from different categories:

1. **Something you know**: password, PIN
2. **Something you have**: phone, security key, smart card
3. **Something you are**: fingerprint, face scan

Even if an attacker steals your password, they still can't access your account without the second factor.

## MFA methods ranked by security

**Most secure — Hardware security keys (YubiKey, Google Titan)**:
A physical device you plug in or tap. Immune to phishing because the key verifies the website's identity. If possible, use this for your most critical accounts.

**Very secure — Authenticator apps (Google Authenticator, Authy, Microsoft Authenticator)**:
Generate a time-based one-time password (TOTP) that changes every 30 seconds. Better than SMS because it doesn't rely on phone networks.

**Moderate — Push notifications**:
Your phone receives a "Was this you?" prompt. Convenient, but vulnerable to "MFA fatigue" attacks where attackers spam you with prompts until you accidentally approve one.

**Least secure — SMS codes**:
A code sent via text message. Vulnerable to SIM swapping (attacker convinces your carrier to transfer your number to their SIM). Use this only when no other option exists.

## Where to enable MFA (priority order)

1. Work email and collaboration tools
2. Password manager
3. Banking and financial accounts
4. Personal email (often used for password resets)
5. Social media accounts
6. Any account with access to sensitive data`,
    },
  ],
  quiz: {
    title: "Password Security Assessment",
    description: "Test your knowledge of password security and authentication best practices.",
    passingScore: 70,
    timeLimitMins: 8,
    questions: [
      {
        text: "Which password is the STRONGEST?",
        explanation: "A passphrase of four random, unrelated words is the strongest option. It has high entropy (randomness) due to length while being memorable. The others are all common patterns attackers check first.",
        order: 1,
        options: [
          { text: "P@ssw0rd123!", isCorrect: false, order: 1 },
          { text: "marble penguin telescope furnace", isCorrect: true, order: 2 },
          { text: "JohnSmith1990!", isCorrect: false, order: 3 },
          { text: "Qwerty!@#$%", isCorrect: false, order: 4 },
        ],
      },
      {
        text: "What is the PRIMARY risk of reusing passwords across accounts?",
        explanation: "When you reuse passwords, a breach at one service exposes all your other accounts. Attackers routinely test leaked credentials against banking, email, and corporate systems — this is called credential stuffing.",
        order: 2,
        options: [
          { text: "It makes passwords harder to remember", isCorrect: false, order: 1 },
          { text: "A breach at one service compromises all accounts using that password", isCorrect: true, order: 2 },
          { text: "It slows down login speed", isCorrect: false, order: 3 },
          { text: "It violates most websites' terms of service", isCorrect: false, order: 4 },
        ],
      },
      {
        text: "Which MFA method is MOST resistant to phishing attacks?",
        explanation: "Hardware security keys (like YubiKey) verify the identity of the website before responding, making them immune to phishing. Even if you're on a fake login page, the key won't respond because the domain doesn't match.",
        order: 3,
        options: [
          { text: "SMS codes sent to your phone", isCorrect: false, order: 1 },
          { text: "Email verification codes", isCorrect: false, order: 2 },
          { text: "Hardware security keys (YubiKey)", isCorrect: true, order: 3 },
          { text: "Security questions", isCorrect: false, order: 4 },
        ],
      },
      {
        text: "Why is SMS-based MFA considered the least secure MFA option?",
        explanation: "SMS messages can be intercepted through SIM swapping, where an attacker convinces your mobile carrier to transfer your phone number to their device. This gives them access to all your SMS codes.",
        order: 4,
        options: [
          { text: "SMS codes expire too quickly", isCorrect: false, order: 1 },
          { text: "SMS codes are too short", isCorrect: false, order: 2 },
          { text: "SMS is vulnerable to SIM swapping and interception", isCorrect: true, order: 3 },
          { text: "SMS only works with certain phone brands", isCorrect: false, order: 4 },
        ],
      },
      {
        text: "What is the recommended way to handle security questions (e.g., 'What is your mother's maiden name')?",
        explanation: "Security question answers are often publicly available (social media, public records). Using random, generated answers stored in your password manager prevents attackers from guessing or researching the answers.",
        order: 5,
        options: [
          { text: "Answer truthfully for easy recall", isCorrect: false, order: 1 },
          { text: "Use variations of the real answer", isCorrect: false, order: 2 },
          { text: "Generate random answers and store them in your password manager", isCorrect: true, order: 3 },
          { text: "Use the same answer for all security questions", isCorrect: false, order: 4 },
        ],
      },
    ],
  },
};

// =============================================================================
// MODULES 3-10: Defined with the same level of detail
// =============================================================================

const module3: ModuleSeed = {
  title: "Social Engineering Awareness",
  description: "Understand how attackers manipulate human psychology to bypass security. Learn to recognize pretexting, baiting, tailgating, and other manipulation techniques used in the workplace.",
  category: "SOCIAL_ENGINEERING",
  difficulty: "INTERMEDIATE",
  durationMins: 20,
  order: 3,
  keyTakeaways: [
    "Verify identity through official channels before sharing information",
    "Social engineers exploit helpfulness, authority, and urgency",
    "Physical security is part of information security — challenge unfamiliar people in secure areas",
    "Never let someone pressure you into bypassing security procedures",
    "If a request feels unusual, trust your instincts and verify",
  ],
  realExamples: [
    "The 2020 Twitter hack: an attacker called Twitter employees, posed as IT support, and convinced them to enter credentials on a fake internal VPN page.",
    "Frank Abagnale (Catch Me If You Can) impersonated pilots, doctors, and lawyers using nothing but confidence and forged documents.",
    "In the MGM Resorts 2023 attack, an attacker called the help desk posing as an employee using details found on LinkedIn, then got them to reset MFA credentials.",
  ],
  lessons: [
    {
      title: "The social engineering playbook",
      description: "Core tactics attackers use to manipulate people",
      type: "READING", durationMins: 6, order: 1,
      content: `# The social engineering playbook

Social engineering attacks all follow a predictable pattern: research, build rapport, exploit, and exit.

## Phase 1: Research (Reconnaissance)

Before contacting you, an attacker gathers information. Sources include LinkedIn profiles (job titles, reporting chains, team members), company websites (org charts, leadership names, office locations), social media (personal interests, recent events, vacation posts), job postings (which technologies and tools a company uses), and public records.

## Phase 2: Build rapport (Pretexting)

The attacker creates a believable scenario. They might pose as a new IT contractor, a vendor, a fellow employee from a different office, or a delivery person. The pretext gives them a reason to be talking to you and asking questions.

## Phase 3: Exploit

With trust established, the attacker makes their move. This could be asking for credentials to "fix a system issue," requesting a door be held open, asking you to install software for "troubleshooting," or requesting a wire transfer or sensitive document.

## Phase 4: Exit

The attacker disappears before anyone realizes what happened. They may create a reason to leave quickly ("I have another meeting") or maintain the pretext long enough to complete their objective.

## Common social engineering techniques

**Pretexting**: Creating a fabricated scenario to engage a victim. "Hi, I'm from the audit team and I need to verify your access permissions."

**Baiting**: Leaving infected USB drives in parking lots, lobbies, or on desks. Curiosity drives people to plug them in.

**Tailgating/Piggybacking**: Following an authorized person through a secure door. "Hey, can you hold the door? My badge is in my other jacket."

**Quid pro quo**: Offering something in exchange for information. "I'm doing a survey for HR — complete it and you'll be entered to win a $500 gift card."

**Watering hole**: Compromising a website frequently visited by the target group rather than attacking individuals directly.`,
    },
    {
      title: "Recognizing manipulation in real time",
      description: "Red flags that indicate social engineering attempts",
      type: "READING", durationMins: 6, order: 2,
      content: `# Recognizing manipulation in real time

## Verbal red flags

Watch for these in phone calls, in-person conversations, and messages:

**Unusual urgency**: "I need this done in the next 10 minutes or we'll lose the deal." Legitimate requests allow time for verification.

**Name-dropping**: "I was just on the phone with [CEO name] and she told me to contact you directly." Verify by calling the named person.

**Vague credentials**: "I'm with IT" or "I'm from corporate" without a name, employee ID, or ticket number.

**Resistance to verification**: "I don't have time for you to call my manager." Legitimate people welcome verification.

**Emotional pressure**: Flattery ("You're the only person who can help me"), sympathy ("I'll lose my job if this isn't fixed"), or intimidation ("I'll have to escalate this to your VP").

**Request escalation**: Starting with a small, innocent request, then gradually escalating. "Can you tell me which floor the server room is on?" → "Can you let me in? I left my badge upstairs."

## How to respond

1. **Slow down**: Don't let urgency override your judgment
2. **Verify identity**: Ask for their name, department, employee ID, and ticket number. Call them back on a verified number
3. **Check authorization**: "Let me verify this request with my manager"
4. **Document**: Note what was asked, when, and by whom
5. **Report**: Tell your security team, even if you're not sure it was an attack`,
    },
    {
      title: "Physical social engineering",
      description: "Protecting against in-person manipulation and unauthorized access",
      type: "READING", durationMins: 5, order: 3,
      content: `# Physical social engineering

## Tailgating and piggybacking

An attacker waits near a secure entrance and follows an authorized person through. They might carry boxes (to look like a delivery), wear a hi-vis vest (to look like maintenance), or simply ask you to hold the door.

**Defense**: Always badge in individually. Don't hold doors for people you don't recognize. If someone says they forgot their badge, direct them to reception — don't let them in yourself.

## Shoulder surfing

Watching someone enter their password, PIN, or read sensitive information on their screen, often in coffee shops, airports, or open-plan offices.

**Defense**: Use a privacy screen filter on your laptop. Be aware of who can see your screen in public. Shield PIN pads when entering codes.

## Dumpster diving

Searching through trash for documents containing sensitive information: org charts, client lists, printed emails, network diagrams, discarded hardware.

**Defense**: Shred sensitive documents before disposal. Wipe hard drives and USB devices before discarding. Use secure disposal bins.

## Baiting (USB drops)

Attackers leave USB drives labeled "Salary Data Q4" or "Layoff Plans" in parking lots and common areas. Curiosity drives people to plug them into their work computers, which can install malware immediately.

**Defense**: Never plug in USB drives you find. Report found USB drives to your security team. Disable USB auto-run in your organization's policy.

## The clean desk policy

At the end of each day, lock away sensitive documents, lock your computer (Win+L or Cmd+Control+Q), and don't leave sticky notes with passwords on your monitor. An after-hours cleaning crew, visitor, or tailgater can photograph everything on an unattended desk.`,
    },
  ],
  quiz: {
    title: "Social Engineering Assessment",
    description: "Test your ability to recognize and respond to social engineering attempts.",
    passingScore: 70, timeLimitMins: 10,
    questions: [
      { text: "Someone calls claiming to be from IT support and asks for your password to 'fix a problem.' What should you do?", explanation: "Legitimate IT support will never ask for your password. They have admin tools that don't require it. Always verify the caller's identity through official IT channels.", order: 1,
        options: [
          { text: "Give them the password since IT needs it", isCorrect: false, order: 1 },
          { text: "Refuse and report the call to your actual IT department", isCorrect: true, order: 2 },
          { text: "Give them a wrong password to test them", isCorrect: false, order: 3 },
          { text: "Ask them to email you instead", isCorrect: false, order: 4 },
        ],
      },
      { text: "You find a USB drive labeled 'Confidential - Salary Data' in the parking lot. What should you do?", explanation: "USB baiting is a common social engineering tactic. Plugging in an unknown USB drive can install malware instantly. Turn found drives over to your security team.", order: 2,
        options: [
          { text: "Plug it into your computer to find the owner", isCorrect: false, order: 1 },
          { text: "Turn it in to your security team without plugging it in", isCorrect: true, order: 2 },
          { text: "Plug it into a non-work computer to check it safely", isCorrect: false, order: 3 },
          { text: "Throw it in the trash", isCorrect: false, order: 4 },
        ],
      },
      { text: "A well-dressed person carrying equipment says 'Can you hold the door? I'm with the HVAC contractor and my hands are full.' What's the correct response?", explanation: "Tailgating is a common physical social engineering technique. Even if someone looks legitimate, they should have their own access. Direct them to reception where their identity and authorization can be verified.", order: 3,
        options: [
          { text: "Hold the door — they're clearly a contractor", isCorrect: false, order: 1 },
          { text: "Ask to see their badge or contractor pass", isCorrect: false, order: 2 },
          { text: "Politely direct them to reception to get proper access", isCorrect: true, order: 3 },
          { text: "Ignore them and let the door close", isCorrect: false, order: 4 },
        ],
      },
      { text: "Which phase of social engineering involves an attacker researching your LinkedIn profile and company website?", explanation: "Reconnaissance is the first phase where attackers gather information about their targets. LinkedIn is a goldmine for attackers — it reveals org charts, job titles, technologies used, and personal connections.", order: 4,
        options: [
          { text: "Exploitation", isCorrect: false, order: 1 },
          { text: "Pretexting", isCorrect: false, order: 2 },
          { text: "Reconnaissance", isCorrect: true, order: 3 },
          { text: "Exit", isCorrect: false, order: 4 },
        ],
      },
      { text: "What is the biggest red flag that a phone call might be a social engineering attempt?", explanation: "Legitimate business interactions always allow time for verification. Urgency is the attacker's most powerful tool — it prevents you from thinking critically or checking with colleagues.", order: 5,
        options: [
          { text: "The caller knows your name", isCorrect: false, order: 1 },
          { text: "The caller creates extreme urgency and resists verification", isCorrect: true, order: 2 },
          { text: "The caller has an unfamiliar accent", isCorrect: false, order: 3 },
          { text: "The call comes from an unknown number", isCorrect: false, order: 4 },
        ],
      },
    ],
  },
};

const module4: ModuleSeed = {
  title: "Data Protection & Classification",
  description: "Learn how to handle, store, share, and dispose of sensitive data according to classification levels. Understand your role in protecting customer data, intellectual property, and personal information.",
  category: "DATA_PROTECTION",
  difficulty: "INTERMEDIATE",
  durationMins: 18,
  order: 4,
  keyTakeaways: [
    "Classify data before sharing — not all information requires the same protection",
    "Encrypt sensitive files before sending them externally",
    "Use approved tools for file sharing — not personal email or consumer cloud storage",
    "Follow the principle of least privilege — only access data you need for your role",
    "Properly dispose of sensitive information — shred paper, wipe devices",
  ],
  realExamples: [
    "In 2019, Capital One suffered a breach exposing 100 million customer records because a misconfigured firewall allowed access to an AWS S3 bucket containing unclassified sensitive data.",
    "A Morgan Stanley employee improperly disposed of hard drives containing customer data in 2020, leading to a $35 million fine from the SEC.",
    "The 2017 Equifax breach exposed the personal data of 147 million people, partly because sensitive data was stored unencrypted in systems that lacked adequate access controls.",
  ],
  lessons: [
    { title: "Understanding data classification", description: "The four levels of data sensitivity and how to apply them", type: "READING", durationMins: 5, order: 1,
      content: `# Understanding data classification

## Why classify data?

Not all data needs the same level of protection. Treating everything as top-secret is impractical — treating nothing as sensitive is dangerous. Classification helps you make the right decisions about how to store, share, and dispose of information.

## The four classification levels

**Public** — Information intended for or safe for public consumption. Examples: marketing materials, published blog posts, job postings, press releases. Protection: none required beyond accuracy.

**Internal** — Information for employees only, but not sensitive enough to cause significant harm if disclosed. Examples: internal newsletters, meeting notes, organizational charts, general policies. Protection: keep within the organization; don't post externally.

**Confidential** — Sensitive information that could cause harm to the organization or individuals if disclosed. Examples: financial reports, employee records, customer lists, business strategies, contracts, source code. Protection: encrypted storage, access controls, approved sharing tools only.

**Restricted** — Highly sensitive information with legal, regulatory, or critical business impact. Examples: Social Security numbers, credit card data, medical records, trade secrets, encryption keys, authentication credentials. Protection: strong encryption, strict access controls, logging of all access, regulatory compliance requirements.

## How to classify

Ask yourself: "What would happen if this information was leaked to the public?" If the answer is "nothing" — it's Public. If "some embarrassment" — Internal. If "financial or reputational damage" — Confidential. If "legal liability, regulatory fines, or existential business risk" — Restricted.`,
    },
    { title: "Handling data safely day to day", description: "Practical rules for storing, sharing, and disposing of data at each classification level", type: "READING", durationMins: 6, order: 2,
      content: `# Handling data safely day to day

## Storage

**Public/Internal**: Company-approved cloud storage (Google Drive, SharePoint, OneDrive) with default access settings.

**Confidential**: Encrypted storage. Use company-approved platforms with access controls. Never store on personal devices, USB drives, or consumer cloud services (personal Dropbox, Google Drive with a personal account).

**Restricted**: Encrypted at rest and in transit. Access logged. Stored only in approved systems with audit trails. Your organization likely has specific systems designated for restricted data.

## Sharing

**The golden rule**: Use the most secure method appropriate for the classification level.

- Public: Any method
- Internal: Company email, internal chat, company file sharing
- Confidential: Company-approved secure file sharing with access controls. Encrypt attachments. Verify recipient authorization. Never use personal email.
- Restricted: Encrypted transfer only. Verify recipient identity and authorization. Log the transfer. Some restricted data may never leave specific systems.

**Email is not secure for sensitive data.** Email is transmitted in plain text between servers. If you must email confidential data, encrypt the file first and send the password through a different channel (e.g., phone call or text).

## Disposal

**Paper documents**: Cross-cut shred confidential and restricted documents. Internal documents should go in secure recycling bins.

**Digital files**: Simply deleting a file doesn't destroy the data — it remains recoverable. Use secure deletion tools for confidential data. For restricted data, follow your organization's data destruction policy.

**Hardware**: Hard drives, USB drives, phones, and laptops must be properly wiped or physically destroyed before disposal. Formatting is NOT sufficient — data can be recovered from formatted drives.`,
    },
    { title: "Privacy regulations and your responsibilities", description: "Key privacy laws and what they mean for employees", type: "READING", durationMins: 5, order: 3,
      content: `# Privacy regulations and your responsibilities

## Key regulations

**GDPR (General Data Protection Regulation)** — Applies to any data from EU residents, regardless of where your company is based. Key principles: data minimization (collect only what you need), purpose limitation (use data only for the stated purpose), and the right to erasure (individuals can request deletion of their data).

**CCPA/CPRA (California Consumer Privacy Act)** — Similar rights for California residents. Requires disclosure of what data you collect and how it's used.

**HIPAA (Health Insurance Portability and Accountability Act)** — Protects medical information in the US. If you handle any health data, even an employee's doctor's note, HIPAA may apply.

**PCI DSS (Payment Card Industry Data Security Standard)** — Applies if your organization processes, stores, or transmits credit card data. Extremely strict requirements around encryption, access, and logging.

## Your individual responsibilities

You don't need to be a privacy lawyer, but you do need to understand these principles:

1. **Collect only what's needed**: Don't gather data "just in case." If you don't need someone's date of birth, don't ask for it.

2. **Use data only for its intended purpose**: Customer email addresses collected for invoicing shouldn't be used for marketing without consent.

3. **Respect data retention policies**: Delete data when it's no longer needed. Don't hoard old spreadsheets of customer data.

4. **Report breaches immediately**: If you discover or suspect that personal data has been exposed, report it to your security team immediately. Many regulations require notification within 72 hours.

5. **Honor access requests**: If someone asks what data you hold about them or requests deletion, escalate to your privacy team.`,
    },
  ],
  quiz: {
    title: "Data Protection Assessment",
    description: "Test your understanding of data classification, handling, and privacy regulations.",
    passingScore: 70, timeLimitMins: 10,
    questions: [
      { text: "A spreadsheet containing customer names, email addresses, and purchase history should be classified as:", explanation: "Customer personal data and purchase history is Confidential. Its exposure could cause reputational damage and potentially trigger privacy regulation violations (GDPR, CCPA).", order: 1,
        options: [ { text: "Public", isCorrect: false, order: 1 }, { text: "Internal", isCorrect: false, order: 2 }, { text: "Confidential", isCorrect: true, order: 3 }, { text: "Restricted", isCorrect: false, order: 4 } ],
      },
      { text: "What is the safest way to share a confidential document with an external partner?", explanation: "Company-approved secure file sharing ensures encryption, access controls, and audit trails. Personal email and consumer cloud storage lack these protections.", order: 2,
        options: [ { text: "Attach it to a personal Gmail", isCorrect: false, order: 1 }, { text: "Upload to a personal Dropbox and share the link", isCorrect: false, order: 2 }, { text: "Use a company-approved secure file sharing platform with access controls", isCorrect: true, order: 3 }, { text: "Print it and mail a physical copy", isCorrect: false, order: 4 } ],
      },
      { text: "Under GDPR, how quickly must a data breach be reported to the supervisory authority?", explanation: "GDPR requires notification to the supervisory authority within 72 hours of becoming aware of a breach, unless the breach is unlikely to result in a risk to individuals' rights and freedoms.", order: 3,
        options: [ { text: "24 hours", isCorrect: false, order: 1 }, { text: "72 hours", isCorrect: true, order: 2 }, { text: "1 week", isCorrect: false, order: 3 }, { text: "30 days", isCorrect: false, order: 4 } ],
      },
      { text: "Why is simply deleting a file or formatting a hard drive NOT sufficient for disposing of confidential data?", explanation: "Deleting a file only removes the file system's reference to the data. The actual data remains on the disk until overwritten and can be recovered with freely available tools.", order: 4,
        options: [ { text: "It takes too much time", isCorrect: false, order: 1 }, { text: "The data remains on the disk and can be recovered", isCorrect: true, order: 2 }, { text: "It requires admin privileges", isCorrect: false, order: 3 }, { text: "Regulatory rules prohibit deletion", isCorrect: false, order: 4 } ],
      },
      { text: "What does the principle of 'data minimization' mean?", explanation: "Data minimization is a core principle of GDPR and good privacy practice. Collecting only necessary data reduces risk — data you don't have can't be breached.", order: 5,
        options: [ { text: "Compress all data to minimize storage costs", isCorrect: false, order: 1 }, { text: "Collect only the data that is necessary for a specific, stated purpose", isCorrect: true, order: 2 }, { text: "Delete all data after 30 days", isCorrect: false, order: 3 }, { text: "Store data in the smallest possible file format", isCorrect: false, order: 4 } ],
      },
    ],
  },
};

const module5: ModuleSeed = {
  title: "Remote Work Security",
  description: "Secure your home office environment. Learn to protect company data on personal networks, use VPNs properly, and maintain security when working from anywhere.",
  category: "BROWSING", difficulty: "BEGINNER", durationMins: 15, order: 5,
  keyTakeaways: [ "Always use the company VPN when accessing work resources", "Secure your home WiFi with WPA3/WPA2 and a strong password", "Lock your screen when stepping away, even at home", "Never use public WiFi for work without a VPN", "Keep work data on work devices — avoid personal device shortcuts" ],
  realExamples: [ "During the COVID-19 shift to remote work, phishing attacks increased by 600% as attackers exploited employees' unfamiliarity with remote access tools.", "A 2021 survey found that 56% of remote employees used personal devices for work, and 25% didn't know what security protocols their company had for remote work.", "In 2022, Cisco was breached after an employee's personal Google account (which synced saved passwords) was compromised, giving attackers VPN access." ],
  lessons: [
    { title: "Securing your home network", description: "Protect the network your work device connects to", type: "READING", durationMins: 5, order: 1,
      content: `# Securing your home network\n\n## Your router is the front door\n\nYour home router controls all traffic between your devices and the internet. If it's compromised, every device on your network is at risk.\n\n**Essential router security steps**:\n\n1. **Change the default admin password**: Routers ship with passwords like 'admin/admin' or 'admin/password'. These are publicly known. Set a strong, unique admin password.\n\n2. **Use WPA3 or WPA2 encryption**: Check your router settings — if it says WEP or 'Open', your WiFi traffic is readable by anyone nearby. WPA3 is best; WPA2 is acceptable.\n\n3. **Set a strong WiFi password**: At least 16 characters. Your WiFi password is different from your router admin password.\n\n4. **Update firmware**: Router manufacturers release security patches. Check for updates quarterly.\n\n5. **Disable WPS (WiFi Protected Setup)**: The 'easy connect' button on routers has known vulnerabilities.\n\n6. **Create a guest network**: If your router supports it, put IoT devices (smart speakers, cameras, thermostats) on a separate guest network from your work devices.\n\n## Public WiFi: just don't\n\nCoffee shop, hotel, airport WiFi is unencrypted and potentially monitored. If you must work remotely from a public location, use your phone's hotspot or ensure your VPN is active before doing anything work-related.` },
    { title: "VPN and secure access", description: "How and when to use VPN for remote work", type: "READING", durationMins: 4, order: 2,
      content: `# VPN and secure access\n\n## What a VPN does\n\nA VPN (Virtual Private Network) creates an encrypted tunnel between your device and your company's network. All your traffic travels through this tunnel, making it unreadable to anyone monitoring the network.\n\n**When to use the VPN**:\n- Always when accessing internal company systems (email, intranet, databases)\n- When connected to any network you don't fully control (hotel, coworking space, café)\n- When accessing sensitive documents or customer data\n\n**Common mistakes**:\n- Disconnecting the VPN because it's slow — talk to IT about split-tunnel options\n- Assuming HTTPS alone is sufficient — HTTPS protects data in transit to a website, but your DNS queries and traffic metadata are still visible without a VPN\n- Using a personal VPN service instead of the company VPN — personal VPN providers can see and log your traffic\n\n## Device security essentials\n\n- **Lock your screen**: Win+L (Windows) or Cmd+Ctrl+Q (Mac) every time you step away\n- **Enable full-disk encryption**: BitLocker (Windows) or FileVault (Mac)\n- **Keep OS and software updated**: Enable auto-updates\n- **Use company antivirus/EDR**: Don't disable it even if it slows things down\n- **Don't let family use your work device**: Children downloading games or partners checking email can introduce malware` },
    { title: "Physical security at home and in public", description: "Protecting devices and data outside the office", type: "READING", durationMins: 4, order: 3,
      content: `# Physical security outside the office\n\n## At home\n\n- **Dedicated workspace**: If possible, work in a room where your screen isn't visible to visitors, delivery people, or through windows\n- **Secure documents**: Don't leave printed work documents on the kitchen table. Shred them when done.\n- **Smart speakers**: Consider whether Alexa, Google Home, or Siri should be in your workspace. They are always listening for wake words and may capture sensitive conversations\n- **Video calls**: Be aware of what's visible on camera. Whiteboards with strategy notes, sticky notes with passwords, or sensitive documents in the background are visible to everyone on the call\n\n## Traveling\n\n- **Never leave devices unattended**: Not in hotel rooms (use the safe), not at airport gates, not in car seats (lock in trunk or take with you)\n- **Disable Bluetooth when not in use**: Bluetooth can be exploited for device tracking and data interception\n- **Use a privacy screen**: Prevents shoulder surfing on planes and trains\n- **Report lost devices immediately**: Call IT the moment a device goes missing — they can remotely wipe it, but only if you report quickly\n- **Avoid charging stations**: Public USB charging stations can be compromised (juice jacking). Use your own charger plugged into a power outlet, or a USB data blocker` },
  ],
  quiz: { title: "Remote Work Security Assessment", description: "Test your knowledge of remote work security practices.", passingScore: 70, timeLimitMins: 8,
    questions: [
      { text: "When should you connect to your company VPN?", explanation: "The VPN should be used whenever you access company resources, especially on networks you don't control. It encrypts your traffic and protects against network monitoring.", order: 1,
        options: [ { text: "Only when working from a coffee shop", isCorrect: false, order: 1 }, { text: "Whenever accessing company systems or sensitive data", isCorrect: true, order: 2 }, { text: "Only when your home WiFi is slow", isCorrect: false, order: 3 }, { text: "Only when IT reminds you", isCorrect: false, order: 4 } ] },
      { text: "What is the FIRST thing you should do if your work laptop is stolen?", explanation: "Immediately reporting a lost device allows IT to remotely wipe it, protecting company data. The faster you report, the less time an attacker has to access the device.", order: 2,
        options: [ { text: "Try to find it by retracing your steps", isCorrect: false, order: 1 }, { text: "Report it to IT immediately so they can remotely wipe it", isCorrect: true, order: 2 }, { text: "Change your passwords first", isCorrect: false, order: 3 }, { text: "File a police report", isCorrect: false, order: 4 } ] },
      { text: "Why should IoT devices be on a separate network from your work computer?", explanation: "IoT devices (smart speakers, cameras, thermostats) often have weak security and rarely receive updates. If compromised, they could be used to attack other devices on the same network, including your work computer.", order: 3,
        options: [ { text: "To improve WiFi speed", isCorrect: false, order: 1 }, { text: "To prevent compromised IoT devices from accessing your work computer", isCorrect: true, order: 2 }, { text: "IoT devices use too much bandwidth", isCorrect: false, order: 3 }, { text: "It's a legal requirement", isCorrect: false, order: 4 } ] },
      { text: "What is 'juice jacking'?", explanation: "Juice jacking involves compromised USB charging stations that can install malware or steal data when you connect your device. Use your own charger with a wall outlet, or a USB data blocker.", order: 4,
        options: [ { text: "Stealing electricity from a neighbor's outlet", isCorrect: false, order: 1 }, { text: "Data theft through compromised public USB charging stations", isCorrect: true, order: 2 }, { text: "Overcharging a battery to cause damage", isCorrect: false, order: 3 }, { text: "Using someone else's charger without permission", isCorrect: false, order: 4 } ] },
    ],
  },
};

const module6: ModuleSeed = {
  title: "Ransomware Prevention & Response",
  description: "Understand how ransomware works, how it spreads, and what to do if you suspect an infection. Learn the preventive measures that stop ransomware before it encrypts your files.",
  category: "MALWARE", difficulty: "INTERMEDIATE", durationMins: 18, order: 6,
  keyTakeaways: [ "Ransomware enters primarily through phishing emails and unpatched software", "Regular backups (3-2-1 rule) are your best defense against ransomware", "Never pay the ransom — it funds criminals and doesn't guarantee data recovery", "Disconnect from the network immediately if you suspect ransomware", "Report suspicious behavior to IT before opening unknown files" ],
  realExamples: [ "The WannaCry ransomware attack in 2017 affected over 200,000 computers across 150 countries, crippling the UK's National Health Service and costing an estimated $4 billion globally.", "In 2021, the Colonial Pipeline paid $4.4 million in ransom after attackers accessed systems through a compromised VPN password. The attack caused fuel shortages across the US East Coast.", "The city of Baltimore was hit by ransomware in 2019, disrupting city services for weeks and costing over $18 million in recovery — far more than the $76,000 ransom demanded." ],
  lessons: [
    { title: "How ransomware works", description: "Understanding the ransomware attack chain", type: "READING", durationMins: 5, order: 1,
      content: `# How ransomware works\n\n## The attack chain\n\n**Step 1 — Initial access**: The attacker gets a foothold. Most commonly through phishing emails (malicious attachments or links), exploiting unpatched software vulnerabilities, compromised remote access (RDP with weak passwords), or infected websites (drive-by downloads).\n\n**Step 2 — Lateral movement**: Once inside, the ransomware spreads to other systems on the network. It looks for file shares, network drives, backup servers, and other connected systems.\n\n**Step 3 — Data exfiltration (double extortion)**: Modern ransomware gangs steal your data before encrypting it. This means even if you have backups, they threaten to publish your sensitive data unless you pay.\n\n**Step 4 — Encryption**: The ransomware encrypts files on every system it has reached. Documents, databases, images, spreadsheets — anything it can access. Files become unreadable without the decryption key.\n\n**Step 5 — Ransom demand**: A note appears demanding payment (usually in cryptocurrency) in exchange for the decryption key. Demands range from thousands to millions of dollars depending on the target.\n\n## Types of ransomware\n\n**Crypto ransomware**: Encrypts your files. The most common type. Examples: LockBit, BlackCat, Clop.\n\n**Locker ransomware**: Locks you out of your entire device. Less common but more disruptive.\n\n**Wiper disguised as ransomware**: Destroys data permanently while pretending to be ransomware. No key exists. Examples: NotPetya (2017) caused $10 billion in damage while posing as ransomware.` },
    { title: "Prevention and backup strategy", description: "Practical steps to prevent ransomware and ensure recovery", type: "READING", durationMins: 5, order: 2,
      content: `# Prevention and backup strategy\n\n## Prevention (your part)\n\n1. **Don't open suspicious attachments**: If you weren't expecting a file, don't open it — especially .zip, .exe, .docm, .xlsm, .js, .vbs, or .scr files\n2. **Keep software updated**: Enable auto-updates on your OS and applications. Many ransomware attacks exploit known vulnerabilities that patches already fix\n3. **Don't enable macros**: If a document asks you to "Enable Content" or "Enable Macros," close it and report it to IT\n4. **Use strong, unique passwords**: Especially for remote access tools (VPN, RDP)\n5. **Be cautious with USB drives**: Unknown USB drives can carry ransomware\n\n## The 3-2-1 backup rule\n\n- **3 copies** of your data (the original + 2 backups)\n- **2 different types** of storage media (e.g., hard drive + cloud)\n- **1 copy offsite** (cloud backup or physically separate location)\n\nCritical: at least one backup must be **offline** (air-gapped). Ransomware that reaches your network will also encrypt any connected backup drives.\n\n## What your organization should have\n\n- Endpoint detection and response (EDR) on all devices\n- Network segmentation to limit lateral movement\n- Email filtering to block malicious attachments\n- Regular backup testing (backups are useless if they don't restore)\n- Incident response plan that everyone knows about BEFORE an attack happens` },
    { title: "What to do during an attack", description: "Immediate response steps if you suspect ransomware", type: "READING", durationMins: 5, order: 3,
      content: `# What to do during a ransomware attack\n\nSpeed matters. The faster you act, the less damage occurs.\n\n## If you see signs of ransomware\n\nSigns: unusual file extensions appearing (.encrypted, .locked, .cry), files won't open, a ransom note appears on screen, unusually slow system performance, antivirus alerts.\n\n## Immediate steps (do these in order)\n\n1. **DISCONNECT from the network**: Unplug the Ethernet cable and turn off WiFi. This prevents the ransomware from spreading to other systems. If on VPN, disconnect immediately.\n\n2. **DON'T turn off the computer**: Forensic information in memory can help the response team. Leave it on but disconnected.\n\n3. **CALL IT/Security immediately**: Use your phone, not your computer. Report what you saw and when. Don't try to fix it yourself.\n\n4. **DON'T pay the ransom**: Paying doesn't guarantee you'll get your data back. It funds criminal operations. It marks you as a willing payer for future attacks. In some jurisdictions, paying ransoms to sanctioned groups is illegal.\n\n5. **DOCUMENT what happened**: Write down what you were doing when you noticed the problem, any emails or files you opened recently, and the exact time.\n\n6. **DON'T attempt recovery yourself**: Don't try to decrypt files, run antivirus scans, or restore from backups. The incident response team needs to analyze the situation first to prevent reinfection.\n\n## After the incident\n\nYour organization's incident response team will handle containment, investigation, and recovery. Your role is to be available to answer their questions, cooperate fully, and follow their instructions for getting back to work safely.` },
  ],
  quiz: { title: "Ransomware Assessment", description: "Test your understanding of ransomware threats and response procedures.", passingScore: 70, timeLimitMins: 8,
    questions: [
      { text: "What is the FIRST action you should take if you suspect your computer has been infected with ransomware?", explanation: "Disconnecting from the network is the top priority. Ransomware spreads laterally across network connections. Every second you stay connected, it can encrypt files on more systems.", order: 1,
        options: [ { text: "Run a full antivirus scan", isCorrect: false, order: 1 }, { text: "Disconnect from the network immediately", isCorrect: true, order: 2 }, { text: "Try to identify the ransomware type", isCorrect: false, order: 3 }, { text: "Shut down the computer", isCorrect: false, order: 4 } ] },
      { text: "Why should you NOT pay a ransomware demand?", explanation: "Paying ransoms funds criminal enterprises, doesn't guarantee data recovery, marks your org as a future target, and may violate sanctions laws. Organizations with good backups can recover without paying.", order: 2,
        options: [ { text: "Payment guarantees data recovery", isCorrect: false, order: 1 }, { text: "It funds criminal operations and doesn't guarantee recovery", isCorrect: true, order: 2 }, { text: "The ransom amount is always too high", isCorrect: false, order: 3 }, { text: "The police will find the criminals anyway", isCorrect: false, order: 4 } ] },
      { text: "What does the '3-2-1 backup rule' specify?", explanation: "The 3-2-1 rule ensures that no single failure point can destroy all your data. Three copies on two different media types with one offsite means ransomware, hardware failure, and natural disasters are all survivable.", order: 3,
        options: [ { text: "3 backups per day, 2 antivirus scans, 1 firewall", isCorrect: false, order: 1 }, { text: "3 copies of data, 2 different media types, 1 copy offsite", isCorrect: true, order: 2 }, { text: "3 password changes, 2 MFA methods, 1 VPN connection", isCorrect: false, order: 3 }, { text: "3 security tools, 2 encryption methods, 1 backup", isCorrect: false, order: 4 } ] },
      { text: "What is 'double extortion' in ransomware attacks?", explanation: "Double extortion means attackers steal your data before encrypting it. Even if you have backups and can restore, they threaten to publish the stolen data unless you pay. This makes backups alone insufficient — prevention is critical.", order: 4,
        options: [ { text: "Demanding ransom from two different departments", isCorrect: false, order: 1 }, { text: "Encrypting data AND threatening to publish stolen data", isCorrect: true, order: 2 }, { text: "Using two different types of encryption", isCorrect: false, order: 3 }, { text: "Attacking twice with different ransomware variants", isCorrect: false, order: 4 } ] },
      { text: "Which is the MOST common way ransomware initially enters an organization?", explanation: "Phishing emails remain the #1 initial access vector for ransomware. A single employee clicking a malicious attachment or link can lead to an organization-wide encryption event.", order: 5,
        options: [ { text: "Physical break-in to server rooms", isCorrect: false, order: 1 }, { text: "Phishing emails with malicious attachments or links", isCorrect: true, order: 2 }, { text: "Hacking through the firewall", isCorrect: false, order: 3 }, { text: "Insider threats from disgruntled employees", isCorrect: false, order: 4 } ] },
    ],
  },
};

const module7: ModuleSeed = {
  title: "Email Security Best Practices",
  description: "Go beyond phishing recognition. Learn to use email securely for daily communication, handle sensitive information in emails, and configure email security settings.",
  category: "PHISHING", difficulty: "BEGINNER", durationMins: 12, order: 7,
  keyTakeaways: [ "Verify recipient addresses before sending sensitive information", "Use BCC for large distribution lists to protect recipients' privacy", "Never send passwords or credentials via email", "Be cautious with auto-complete — it can send emails to the wrong person", "Check email rules/forwarding periodically — attackers set up silent forwarding" ],
  realExamples: [ "In 2020, a UK law firm accidentally sent confidential merger documents to the wrong client due to email auto-complete, resulting in a potential insider trading investigation.", "A common post-compromise tactic: attackers set up email forwarding rules to silently copy all incoming emails to an external address, maintaining persistent access even after password changes." ],
  lessons: [
    { title: "Sending email safely", description: "Prevent accidental data leaks through email", type: "READING", durationMins: 4, order: 1,
      content: `# Sending email safely\n\n## Double-check before you send\n\n**Verify recipients**: Auto-complete is dangerous. "John Smith (Marketing)" and "John Smith (External Client)" are one misclick apart. For sensitive emails, manually verify every address in the To, CC, and BCC fields.\n\n**Use BCC for mass communications**: When emailing a large group (customers, vendors, external contacts), use BCC to prevent exposing everyone's email address. CC shows every recipient to everyone.\n\n**Check attachments**: Before sending, open the attachment one more time. Is it the right version? Does it contain hidden sheets (in Excel) or tracked changes (in Word) with sensitive information? Use "Inspect Document" in Office to remove hidden data.\n\n## Rules for sensitive content\n\n- **Never email passwords, API keys, or credentials**. Use a password manager's sharing feature or an encrypted channel.\n- **Encrypt sensitive attachments** before sending. Use your organization's approved encryption tool. Send the password through a different channel (phone, text).\n- **Mark sensitive emails appropriately**: Use your email client's sensitivity labels (if available) to flag confidential content.\n- **Be cautious with "Reply All"**: Not everyone on the thread needs your response. Ask yourself: does everyone in this chain need to see this?` },
    { title: "Protecting your email account", description: "Settings and habits that prevent email compromise", type: "READING", durationMins: 4, order: 2,
      content: `# Protecting your email account\n\n## Account security\n\n1. **Enable MFA**: Your email is the master key to your digital life. Most password resets go to email. If your email is compromised, everything else follows.\n\n2. **Use a unique, strong password**: Your email password should never be reused anywhere else.\n\n3. **Check connected apps periodically**: Revoke access for apps you no longer use. Each connected app is a potential entry point.\n\n## Post-compromise checks\n\nIf you suspect your email was compromised (or periodically as hygiene):\n\n- **Check email forwarding rules**: Attackers set up rules to silently forward emails to external addresses. In Outlook: File → Rules → Manage Rules. In Gmail: Settings → Forwarding.\n- **Review sent items**: Look for emails you didn't send.\n- **Check connected devices**: Remove any devices or sessions you don't recognize.\n- **Change your password and review MFA settings**.\n\n## Email encryption\n\nStandard email is sent in plain text between servers. For sensitive communications:\n- Use your organization's email encryption feature (e.g., Microsoft 365 Message Encryption)\n- Encrypt file attachments before sending\n- For highly sensitive discussions, consider whether email is the right channel at all — an encrypted messaging platform may be more appropriate` },
    { title: "Business email compromise (BEC)", description: "Understanding the most financially devastating email attack", type: "READING", durationMins: 4, order: 3,
      content: `# Business email compromise (BEC)\n\nBEC is the most financially damaging type of cyber attack. The FBI reports BEC losses exceeding $50 billion globally since 2013.\n\n## How BEC works\n\nUnlike phishing which targets many people with generic emails, BEC targets specific individuals with carefully crafted, personalized messages. The attacker typically:\n\n1. Compromises or spoofs a real executive's email account\n2. Studies the organization's communication patterns and ongoing transactions\n3. Sends a convincing request to someone with financial authority\n\n## Common BEC scenarios\n\n**CEO fraud**: "I'm in a meeting and need you to wire $50,000 to this vendor immediately. I'll explain later."\n\n**Vendor impersonation**: "Our banking details have changed. Please update our payment information to this new account." (Sent from a compromised or spoofed vendor email)\n\n**Payroll diversion**: "Hi HR, I've changed banks. Please update my direct deposit to this account number." (Sent from a compromised employee email)\n\n**Attorney impersonation**: "I'm handling a confidential acquisition. Please wire the escrow funds to this account. This is time-sensitive and must remain confidential."\n\n## Defense\n\n- **Verify all financial requests** through a separate channel (phone call to a known number)\n- **Establish approval workflows**: No single person should be able to authorize large transfers\n- **Be suspicious of urgency and secrecy**: "Do this now" + "Keep this confidential" = red flag\n- **Check the actual email address**, not just the display name\n- **Flag external emails**: Many organizations add banners to emails from outside the organization` },
  ],
  quiz: { title: "Email Security Assessment", description: "Test your knowledge of email security practices.", passingScore: 70, timeLimitMins: 8,
    questions: [
      { text: "You need to send a spreadsheet containing employee salary data to the HR director. What is the safest approach?", explanation: "Sensitive data should be encrypted before email transmission. The encryption password should be communicated through a different channel to prevent interception.", order: 1,
        options: [ { text: "Attach it to a regular email", isCorrect: false, order: 1 }, { text: "Encrypt the file and email it, then send the password via phone or text", isCorrect: true, order: 2 }, { text: "Upload it to your personal cloud and share the link", isCorrect: false, order: 3 }, { text: "Print it and hand-deliver it", isCorrect: false, order: 4 } ] },
      { text: "After a suspected email compromise, what should you check for in your email settings?", explanation: "A common persistence technique: attackers create forwarding rules that silently copy all incoming mail to an external address. Changing your password alone doesn't stop this.", order: 2,
        options: [ { text: "Spam filter settings", isCorrect: false, order: 1 }, { text: "Forwarding rules and connected apps", isCorrect: true, order: 2 }, { text: "Email signature", isCorrect: false, order: 3 }, { text: "Theme and appearance settings", isCorrect: false, order: 4 } ] },
      { text: "What makes BEC (Business Email Compromise) different from regular phishing?", explanation: "BEC is highly targeted and personalized. Attackers research specific individuals and organizations, often compromising real accounts to make requests appear authentic. Unlike mass phishing, BEC may have no malicious links or attachments.", order: 3,
        options: [ { text: "BEC always contains malware attachments", isCorrect: false, order: 1 }, { text: "BEC targets specific individuals with personalized, researched requests", isCorrect: true, order: 2 }, { text: "BEC only targets large corporations", isCorrect: false, order: 3 }, { text: "BEC is always sent from external domains", isCorrect: false, order: 4 } ] },
      { text: "When sending an email to 200 external contacts about a company event, which field should you use for their addresses?", explanation: "BCC (Blind Carbon Copy) hides recipients from each other. Using CC or To would expose all 200 email addresses to everyone, which is a privacy violation and gives attackers a harvested contact list.", order: 4,
        options: [ { text: "To", isCorrect: false, order: 1 }, { text: "CC", isCorrect: false, order: 2 }, { text: "BCC", isCorrect: true, order: 3 }, { text: "It doesn't matter", isCorrect: false, order: 4 } ] },
    ],
  },
};

const module8: ModuleSeed = {
  title: "Incident Reporting & Response",
  description: "Learn when and how to report security incidents. Understand that early reporting is the most valuable thing any employee can do to minimize damage from a security event.",
  category: "GENERAL", difficulty: "BEGINNER", durationMins: 12, order: 8,
  keyTakeaways: [ "Report security incidents immediately — minutes matter", "It's always better to report a false alarm than to stay silent about a real threat", "You will never be punished for reporting a suspected incident in good faith", "Know your organization's reporting channels before an incident occurs", "Document what you observed: what happened, when, and what you did" ],
  realExamples: [ "The Target breach of 2013 exposed 40 million credit card numbers. Security alerts were triggered weeks before the breach was discovered, but reports weren't escalated.", "Studies show the average time to identify a breach is 207 days. Organizations with strong reporting cultures reduce this to under 50 days, saving millions in damage." ],
  lessons: [
    { title: "What counts as a security incident", description: "Recognizing events that need to be reported", type: "READING", durationMins: 4, order: 1,
      content: `# What counts as a security incident\n\nAn incident is any event that threatens the confidentiality, integrity, or availability of information or systems. Many employees hesitate to report because they're unsure if something qualifies. When in doubt, report it.\n\n## Definite incidents (report immediately)\n\n- You clicked a link or opened an attachment in a suspicious email\n- You see a ransom note or your files have been encrypted\n- You notice unauthorized access to accounts or systems\n- You accidentally sent sensitive data to the wrong person\n- A device containing company data was lost or stolen\n- You shared your password with someone\n- You notice someone in a restricted area without authorization\n\n## Probable incidents (report promptly)\n\n- Your computer is behaving unusually (slow, pop-ups, unknown programs)\n- You received a phone call asking for sensitive information\n- You found an unknown USB drive\n- A colleague's account appears to be sending strange emails\n- You notice data or files that have been modified unexpectedly\n\n## The golden rule\n\n**If you're asking yourself "Should I report this?" — the answer is yes.** Your security team would rather investigate 100 false alarms than miss one real incident. There is no penalty for reporting something that turns out to be benign.` },
    { title: "How to report an incident", description: "Step-by-step reporting process", type: "READING", durationMins: 4, order: 2,
      content: `# How to report an incident\n\n## Step 1: Stop and contain\n\nDon't try to fix it yourself. If you suspect malware, disconnect from the network. If you sent data to the wrong person, don't try to recall the email (recalls often fail and alert the recipient). If you clicked a suspicious link, close the browser but don't clear history (forensics may need it).\n\n## Step 2: Report through official channels\n\nUse your organization's designated reporting method:\n- **Phishing report button** in your email client (for suspicious emails)\n- **IT help desk** phone number or ticket system (for general incidents)\n- **Security team direct line** (for urgent incidents)\n- **Manager** (if you can't reach IT/Security)\n\n## Step 3: Provide key information\n\nWhen reporting, include:\n- **What happened**: Describe what you observed in simple terms\n- **When**: Date and time as precisely as possible\n- **What you did**: Did you click a link, open an attachment, enter credentials?\n- **Affected systems**: Which device, which account, which data\n- **Current state**: Is the problem ongoing? Have you disconnected?\n\n## Step 4: Follow instructions\n\nThe security team may ask you to preserve evidence (don't delete emails or clear browser history), change passwords, run specific scans, or provide additional information.\n\n## Step 5: Learn from it\n\nAfter the incident is resolved, take any recommended training. Incidents are learning opportunities, not failures.` },
    { title: "Building a reporting culture", description: "Why organizations with strong reporting cultures are more secure", type: "READING", durationMins: 3, order: 3,
      content: `# Building a reporting culture\n\n## Why speed matters\n\nThe difference between a minor incident and a catastrophic breach is often just hours. The faster a security team knows about a problem, the faster they can contain it.\n\n- **0-1 hours**: Attacker may still be on a single system. Containment is straightforward.\n- **1-24 hours**: Attacker has likely moved laterally. Multiple systems may be affected.\n- **Days-weeks**: Attacker has established persistence, exfiltrated data, and may have encrypted systems.\n\nYour early report can be the difference between categories one and three.\n\n## Overcoming barriers to reporting\n\n**"I'll get in trouble"**: A healthy security culture never punishes the reporter. Clicking a phishing link is human. Not reporting it is a problem.\n\n**"It's probably nothing"**: The security team is trained to assess severity. Let them decide — that's their job.\n\n**"I can handle it myself"**: Well-intentioned troubleshooting can destroy forensic evidence, spread malware further, or alert an attacker that they've been detected.\n\n**"I'm too busy"**: A 2-minute report now can prevent weeks of incident response later.\n\n**"I don't know who to contact"**: This is an organizational failure, not yours. But find out now, before you need it. Save the IT security help desk number in your phone today.` },
  ],
  quiz: { title: "Incident Reporting Assessment", description: "Test your understanding of security incident reporting.", passingScore: 70, timeLimitMins: 7,
    questions: [
      { text: "You accidentally sent a spreadsheet with customer data to someone outside the company. What should you do FIRST?", explanation: "Reporting immediately allows the security team to assess the exposure and take appropriate action (contacting the recipient, legal review). Trying to recall the email rarely works and wastes critical time.", order: 1,
        options: [ { text: "Try to recall the email", isCorrect: false, order: 1 }, { text: "Report it to your security team immediately", isCorrect: true, order: 2 }, { text: "Email the recipient asking them to delete it", isCorrect: false, order: 3 }, { text: "Wait to see if anyone notices", isCorrect: false, order: 4 } ] },
      { text: "You clicked a link in an email that now seems suspicious. The page asked for your password but you didn't enter it. Should you report this?", explanation: "Yes — clicking a phishing link can be enough to compromise your system, even without entering credentials. The page may have downloaded malware or exploited a browser vulnerability.", order: 2,
        options: [ { text: "No — you didn't enter your password so no harm done", isCorrect: false, order: 1 }, { text: "Yes — clicking the link alone may have been enough to compromise your system", isCorrect: true, order: 2 }, { text: "Only if your antivirus flags something", isCorrect: false, order: 3 }, { text: "No — just clear your browser history and move on", isCorrect: false, order: 4 } ] },
      { text: "Why is it important NOT to try fixing a suspected malware infection yourself?", explanation: "Amateur troubleshooting can destroy forensic evidence the security team needs, spread the infection to clean systems, or alert the attacker that they've been detected, causing them to accelerate their attack.", order: 3,
        options: [ { text: "It might violate company policy", isCorrect: false, order: 1 }, { text: "It could destroy forensic evidence, spread the infection, or alert the attacker", isCorrect: true, order: 2 }, { text: "Only IT has the right antivirus software", isCorrect: false, order: 3 }, { text: "It wastes your time", isCorrect: false, order: 4 } ] },
      { text: "What is the ideal timeframe for reporting a suspected security incident?", explanation: "The difference between a contained incident and a major breach is often hours. Report immediately — your security team can triage and determine if it's a real threat. A false alarm costs minutes; a delayed report can cost millions.", order: 4,
        options: [ { text: "Within 24 hours", isCorrect: false, order: 1 }, { text: "Immediately", isCorrect: true, order: 2 }, { text: "At the end of the work day", isCorrect: false, order: 3 }, { text: "During the next team meeting", isCorrect: false, order: 4 } ] },
    ],
  },
};

const module9: ModuleSeed = {
  title: "Safe Web Browsing",
  description: "Navigate the web safely. Learn to evaluate website legitimacy, manage browser security settings, and avoid common web-based threats like drive-by downloads and malvertising.",
  category: "BROWSING", difficulty: "BEGINNER", durationMins: 12, order: 9,
  keyTakeaways: [ "Check for HTTPS and valid certificates — but know HTTPS alone doesn't mean a site is safe", "Keep your browser and extensions updated", "Be cautious with browser extensions — they can read all your browsing data", "Avoid downloading software from unofficial sources", "Use your organization's approved browser and settings" ],
  realExamples: [ "In 2023, malicious ads on Google search results for popular software (Slack, Zoom, OBS) redirected users to convincing fake download pages that installed malware.", "The SolarWinds attack of 2020 started when attackers compromised the software update mechanism, highlighting the risk of even trusted download sources." ],
  lessons: [
    { title: "Evaluating website legitimacy", description: "How to verify a website is genuine before entering information", type: "READING", durationMins: 4, order: 1,
      content: `# Evaluating website legitimacy\n\n## The URL is your first defense\n\nBefore entering any information on a website, check the URL carefully:\n\n**Check the domain**: The domain is the core part of the URL. In https://login.microsoft.com/oauth, the domain is microsoft.com. In https://microsoft.com.evil-site.com/login, the domain is evil-site.com.\n\n**How to find the real domain**: Read the URL right-to-left from the first single slash (/). The domain is the last two segments before that slash: amazon.com, google.com, bankofamerica.com.\n\n**HTTPS is necessary but not sufficient**: A padlock icon means the connection is encrypted — it does NOT mean the website is legitimate. Attackers get HTTPS certificates for their phishing sites. HTTPS protects data in transit; it doesn't verify who runs the site.\n\n**Watch for look-alike domains**: paypa1.com (with a number 1), arnazon.com (rn looks like m), gooogle.com (extra o), microsoft-support.com (added word).\n\n## Before entering credentials\n\n1. Did you navigate here yourself, or did a link bring you here?\n2. Does the URL match exactly what you expect?\n3. If you're unsure, close the tab and navigate to the site directly by typing the URL or using a bookmark` },
    { title: "Browser security settings", description: "Configuring your browser for safety without sacrificing usability", type: "READING", durationMins: 4, order: 2,
      content: `# Browser security settings\n\n## Essential settings\n\n- **Keep your browser updated**: Enable auto-updates. Browser updates patch security vulnerabilities\n- **Enable safe browsing**: Chrome, Firefox, and Edge all have built-in protections that warn about dangerous sites. Keep them enabled.\n- **Block pop-ups**: Pop-ups are a common vector for fake alerts and malware downloads\n- **Don't save passwords in the browser**: Use a dedicated password manager instead. Browser password storage is less secure.\n\n## Browser extensions: handle with care\n\nExtensions can read and modify everything you see in the browser. A malicious or compromised extension can steal credentials, inject ads, track browsing, or exfiltrate data.\n\n**Rules for extensions**:\n- Install only extensions approved by your IT department\n- Review permissions before installing — does a weather extension really need access to "all your data on all websites"?\n- Remove extensions you no longer use\n- Keep extensions updated\n\n## Downloads\n\n- Only download software from official sources (vendor websites, official app stores)\n- Be wary of search engine ads for software — attackers buy ads for popular software names\n- Verify downloaded files when possible (check file hash against the vendor's published hash)\n- Don't ignore browser download warnings` },
    { title: "Malvertising and drive-by downloads", description: "Web-based attacks that require no user interaction", type: "READING", durationMins: 3, order: 3,
      content: `# Malvertising and drive-by downloads\n\n## Malvertising\n\nMalicious advertisements on legitimate websites. Attackers buy ad space on popular sites, and the ads either redirect to malicious sites or exploit browser vulnerabilities directly. You don't have to click the ad — just loading the page can be enough.\n\n**Defense**: Keep your browser updated, use an ad blocker (if permitted by your organization), and ensure your browser's built-in protections are enabled.\n\n## Drive-by downloads\n\nMalware that downloads and installs automatically when you visit a compromised website, without you clicking anything. These exploit vulnerabilities in browsers, plugins, or operating systems.\n\n**Defense**: The single most effective protection is keeping your software updated. Most drive-by downloads exploit known vulnerabilities that patches have already fixed.\n\n## Fake browser alerts\n\n"Your computer is infected! Call this number immediately!" or "Your browser needs an urgent update. Click here."\n\nThese are scams. Real browser updates happen automatically. Real virus alerts come from your antivirus software, not from a website.\n\n**Defense**: Close the tab. If the tab won't close, use Task Manager (Ctrl+Shift+Esc) to force-close the browser. Never call a phone number displayed in a browser alert.` },
  ],
  quiz: { title: "Safe Browsing Assessment", description: "Test your understanding of web browsing security.", passingScore: 70, timeLimitMins: 7,
    questions: [
      { text: "A website has a padlock icon (HTTPS) in the address bar. Does this mean the website is safe and legitimate?", explanation: "HTTPS only means the connection between your browser and the server is encrypted. Attackers can and do obtain HTTPS certificates for phishing sites. You must also verify the domain name.", order: 1,
        options: [ { text: "Yes — HTTPS guarantees the site is legitimate", isCorrect: false, order: 1 }, { text: "No — HTTPS means the connection is encrypted, not that the site is trustworthy", isCorrect: true, order: 2 }, { text: "Yes — only legitimate sites can get HTTPS certificates", isCorrect: false, order: 3 }, { text: "It depends on the type of certificate", isCorrect: false, order: 4 } ] },
      { text: "What is 'malvertising'?", explanation: "Malvertising uses legitimate advertising networks to distribute malicious ads. Even reputable websites can unknowingly serve malicious ads because they use third-party ad networks.", order: 2,
        options: [ { text: "Advertising for malware products", isCorrect: false, order: 1 }, { text: "Malicious advertisements served through legitimate ad networks on real websites", isCorrect: true, order: 2 }, { text: "Email advertisements with viruses", isCorrect: false, order: 3 }, { text: "Pop-up ads that slow down your computer", isCorrect: false, order: 4 } ] },
      { text: "You see a browser pop-up saying 'Your computer is infected! Call 1-800-XXX-XXXX for Microsoft support.' What should you do?", explanation: "Real virus alerts come from your installed antivirus software, not from websites. These are tech support scams. Close the tab (or force-close the browser), do not call the number.", order: 3,
        options: [ { text: "Call the number immediately", isCorrect: false, order: 1 }, { text: "Close the tab — it's a scam. Real alerts come from your antivirus software", isCorrect: true, order: 2 }, { text: "Run a virus scan from the pop-up window", isCorrect: false, order: 3 }, { text: "Write down the number for later reference", isCorrect: false, order: 4 } ] },
      { text: "Why is it risky to install many browser extensions?", explanation: "Extensions often have broad permissions to read and modify web page content, including passwords and sensitive data. Each extension is a potential attack surface — if compromised, it can silently steal data from every site you visit.", order: 4,
        options: [ { text: "They slow down the browser", isCorrect: false, order: 1 }, { text: "They can read and modify all your browsing data, including credentials", isCorrect: true, order: 2 }, { text: "They use too much memory", isCorrect: false, order: 3 }, { text: "They conflict with each other", isCorrect: false, order: 4 } ] },
    ],
  },
};

const module10: ModuleSeed = {
  title: "Mobile Device Security",
  description: "Protect company data on smartphones and tablets. Learn about mobile-specific threats, secure device configuration, and safe app practices for both company-owned and BYOD devices.",
  category: "MOBILE", difficulty: "BEGINNER", durationMins: 12, order: 10,
  keyTakeaways: [ "Enable device encryption and a strong screen lock (PIN, biometric)", "Only install apps from official app stores", "Keep your device OS and apps updated", "Be cautious with app permissions — a flashlight app doesn't need access to your contacts", "Enable remote wipe capability on any device with company data" ],
  realExamples: [ "The Jeff Bezos phone hack in 2019 reportedly started with a malicious video file sent via WhatsApp from the Saudi Crown Prince's account, exploiting a vulnerability in the messaging app.", "In 2023, the Pegasus spyware was found on phones of journalists and activists worldwide, installed through zero-click exploits that required no user interaction — just receiving a message was enough." ],
  lessons: [
    { title: "Mobile threat landscape", description: "Understanding threats unique to mobile devices", type: "READING", durationMins: 4, order: 1,
      content: `# Mobile threat landscape\n\nMobile devices face unique security challenges because they're always connected, always with you, and mix personal and work use.\n\n## Mobile-specific threats\n\n**Malicious apps**: Apps that look legitimate but steal data, display ads, or install backdoors. Even official app stores occasionally host malicious apps before detection.\n\n**Unsecured WiFi**: Your phone automatically connects to known networks. Attackers create networks with common names ("Starbucks WiFi", "Airport Free WiFi") to intercept your traffic.\n\n**SMS phishing (smishing)**: Text messages with malicious links. Mobile browsers show less of the URL, making it harder to verify legitimacy.\n\n**Lost and stolen devices**: A phone without a strong lock screen gives instant access to email, corporate apps, saved passwords, photos, and authentication tokens.\n\n**Outdated software**: Many phone users delay updates for weeks or months. Each delay is a window for attackers exploiting known vulnerabilities.\n\n**Excessive app permissions**: Apps requesting access to contacts, location, camera, microphone, and storage beyond what they need for their stated function.` },
    { title: "Securing your device", description: "Essential security settings for smartphones and tablets", type: "READING", durationMins: 4, order: 2,
      content: `# Securing your device\n\n## Lock screen\n\n- Use a 6-digit PIN minimum, or a strong alphanumeric password\n- Enable biometric authentication (fingerprint or face recognition) for convenience\n- Set auto-lock to 1-2 minutes maximum\n- Disable lock screen notification previews for sensitive apps (email, messaging)\n\n## Device encryption\n\nModern iOS devices are encrypted by default. Android devices may need encryption enabled manually (Settings → Security → Encrypt device). Encryption means a stolen phone's data is unreadable without the unlock code.\n\n## App security\n\n- Install apps ONLY from official stores (Apple App Store, Google Play)\n- Review permissions before installing: does this app genuinely need access to your camera, location, and contacts?\n- Periodically review and revoke unnecessary permissions\n- Delete apps you no longer use\n- Keep apps updated — enable auto-updates\n\n## Network security\n\n- Turn off WiFi and Bluetooth when not in use\n- Remove saved networks you no longer use\n- Don't auto-join open networks\n- Use your company VPN when accessing work resources on mobile\n\n## Remote management\n\n- Enable Find My iPhone / Find My Device\n- Ensure your IT department can remotely wipe the device if lost\n- Register your device with your company's MDM (Mobile Device Management) if required\n\n## BYOD considerations\n\nIf using your personal phone for work, your company may require an MDM profile that can separate work data from personal data, enforce security policies, and wipe work data if you leave the company (without affecting personal data).` },
    { title: "Safe mobile practices", description: "Daily habits for mobile security", type: "READING", durationMins: 3, order: 3,
      content: `# Safe mobile practices\n\n## Communication hygiene\n\n- Don't click links in text messages from unknown numbers\n- Be wary of unexpected messages even from known contacts — their phone may be compromised\n- Don't send sensitive information (passwords, financial data) via SMS — texts are not encrypted\n- Use your organization's approved messaging apps for work communication\n\n## Physical security\n\n- Never leave your phone unattended in public\n- Be aware of shoulder surfers when entering PINs or passwords\n- Don't lend your unlocked phone to strangers\n- Use a screen privacy filter for sensitive work in public places\n\n## If your phone is lost or stolen\n\n1. Use Find My iPhone/Device to locate it\n2. If it can't be recovered, remotely lock and wipe it\n3. Report to your IT department immediately if it has access to company data\n4. Change passwords for any accounts logged in on the device\n5. Contact your mobile carrier to suspend the SIM\n6. Monitor your accounts for suspicious activity` },
  ],
  quiz: { title: "Mobile Security Assessment", description: "Test your knowledge of mobile device security.", passingScore: 70, timeLimitMins: 7,
    questions: [
      { text: "A free flashlight app requests access to your contacts, location, and microphone. What should you do?", explanation: "A flashlight only needs camera/flash access. Requesting contacts, location, and microphone permissions is a strong indicator the app is harvesting personal data. Deny these permissions or choose a different app.", order: 1,
        options: [ { text: "Allow all permissions — the app needs them to function", isCorrect: false, order: 1 }, { text: "Deny unnecessary permissions — a flashlight doesn't need contacts or microphone access", isCorrect: true, order: 2 }, { text: "Allow them temporarily and revoke later", isCorrect: false, order: 3 }, { text: "It doesn't matter for free apps", isCorrect: false, order: 4 } ] },
      { text: "What is the FIRST thing you should do if your work phone is lost or stolen?", explanation: "Time is critical. IT can remotely wipe the device to prevent data access. Simultaneously, use Find My Device to try locating it, but don't delay the IT notification.", order: 2,
        options: [ { text: "Retrace your steps to find it", isCorrect: false, order: 1 }, { text: "Notify your IT department so they can remotely wipe it", isCorrect: true, order: 2 }, { text: "File a police report", isCorrect: false, order: 3 }, { text: "Buy a new phone", isCorrect: false, order: 4 } ] },
      { text: "Why should you avoid auto-joining open WiFi networks?", explanation: "Attackers create fake WiFi networks with common names. If your phone auto-joins these networks, all your unencrypted traffic can be intercepted, including login credentials for apps that don't use end-to-end encryption.", order: 3,
        options: [ { text: "Open networks are always slow", isCorrect: false, order: 1 }, { text: "Attackers create fake networks with common names to intercept your traffic", isCorrect: true, order: 2 }, { text: "It drains your battery faster", isCorrect: false, order: 3 }, { text: "It uses too much mobile data", isCorrect: false, order: 4 } ] },
      { text: "What is the security benefit of disabling lock screen notification previews?", explanation: "Lock screen previews can display sensitive information (email contents, authentication codes, meeting details) to anyone who can see your phone — even without unlocking it.", order: 4,
        options: [ { text: "It saves battery life", isCorrect: false, order: 1 }, { text: "It prevents sensitive information from being visible without unlocking the device", isCorrect: true, order: 2 }, { text: "It reduces spam notifications", isCorrect: false, order: 3 }, { text: "It makes the phone faster", isCorrect: false, order: 4 } ] },
    ],
  },
};

// =============================================================================
// SEED FUNCTION
// =============================================================================

const allModules: ModuleSeed[] = [
  module1, module2, module3, module4, module5,
  module6, module7, module8, module9, module10,
];

async function seedModules(organizationId: string): Promise<{ modules: any[], quizzes: any[] }> {
  console.log("🌱 Seeding 10 training modules...\n");

  const createdModules: any[] = [];
  const createdQuizzes: any[] = [];

  for (const mod of allModules) {
    // Create the module
    const createdModule = await prisma.module.create({
      data: {
        title: mod.title,
        description: mod.description,
        category: mod.category,
        difficulty: mod.difficulty,
        durationMins: mod.durationMins,
        order: mod.order,
        isPublished: true,
        organizationId,
        keyTakeaways: mod.keyTakeaways,
        realExamples: mod.realExamples,
      },
    });

    console.log(`  ✅ Module: ${mod.title}`);

    // Create lessons
    for (const lesson of mod.lessons) {
      await prisma.lesson.create({
        data: {
          title: lesson.title,
          description: lesson.description,
          type: lesson.type,
          content: lesson.content,
          durationMins: lesson.durationMins,
          order: lesson.order,
          moduleId: createdModule.id,
        },
      });
    }
    console.log(`     📄 ${mod.lessons.length} lessons created`);
    createdModules.push(createdModule);

    // Create quiz
    const createdQuiz = await prisma.quiz.create({
      data: {
        title: mod.quiz.title,
        description: mod.quiz.description,
        moduleId: createdModule.id,
        difficulty: mod.difficulty,
        category: mod.category,
        passingScore: mod.quiz.passingScore,
        timeLimitMins: mod.quiz.timeLimitMins,
        status: "PUBLISHED" as QuizStatus,
        isCustom: false,
        organizationId,
      },
    });

    // Create questions with options
    for (const q of mod.quiz.questions) {
      await prisma.question.create({
        data: {
          quizId: createdQuiz.id,
          text: q.text,
          explanation: q.explanation,
          order: q.order,
          options: {
            create: q.options.map((opt) => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
              order: opt.order,
            })),
          },
        },
      });
    }
    createdQuizzes.push(createdQuiz);
    console.log(`     📝 Quiz: ${mod.quiz.questions.length} questions created`);
    console.log("");
  }

  console.log("✅ All 10 modules seeded successfully!\n");

  return { modules: createdModules, quizzes: createdQuizzes };
}

  const { modules: createdModules, quizzes: createdQuizzes } = await seedModules(organization.id);
  console.log("Created " + createdModules.length + " modules and " + createdQuizzes.length + " quizzes");

  // =============================================
  // PHISHING SIMULATION TEMPLATES
  // =============================================
  const phishingTemplates = [
    {
      name: "IT Password Reset",
      subject: "Urgent: Your Password Expires Today",
      senderName: "IT Help Desk",
      senderEmail: "it-helpdesk@{{companyDomain}}",
      difficulty: "BEGINNER" as Difficulty,
      category: "PHISHING" as ModuleCategory,
      bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1a73e8; padding: 15px 20px; border-radius: 8px 8px 0 0;">
    <h2 style="color: white; margin: 0;">IT Security Alert</h2>
  </div>
  <div style="border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
    <p>Dear {{firstName}},</p>
    <p>Our security system has detected that your password will expire in <strong>24 hours</strong>. To avoid losing access to your account, please update your password immediately.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{clickUrl}}" style="background: #1a73e8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password Now</a>
    </p>
    <p style="color: #666; font-size: 13px;">If you did not request this change, please contact IT support at ext. 4357.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 11px;">This is an automated message from IT Help Desk.<br>Do not reply to this email.</p>
  </div>
  <img src="{{trackingUrl}}" width="1" height="1" style="display:none" />
</div>`,
      landingPageHtml: `<h2>🔐 Password Reset Phishing</h2><p>This email impersonated your IT department to trick you into entering credentials on a fake page.</p><h3>Red Flags:</h3><ul><li>Urgency tactics: "expires in 24 hours"</li><li>Generic greeting instead of your full name</li><li>The sender domain doesn't match your real IT department</li><li>Hover over the link — the URL doesn't go to your company's real domain</li></ul>`,
    },
    {
      name: "CEO Wire Transfer Request",
      subject: "Confidential: Urgent Wire Transfer Needed",
      senderName: "CEO Office",
      senderEmail: "ceo@{{companyDomain}}",
      difficulty: "INTERMEDIATE" as Difficulty,
      category: "SOCIAL_ENGINEERING" as ModuleCategory,
      bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hi {{firstName}},</p>
  <p>I need you to handle something urgently and confidentially. We have an acquisition deal closing today and I need a wire transfer processed immediately.</p>
  <p>I'm in back-to-back meetings and can't call right now. Please click the link below to view the transfer details and process it ASAP.</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="{{clickUrl}}" style="background: #333; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View Transfer Details</a>
  </p>
  <p>Please keep this confidential — do not discuss with anyone else until the deal is announced.</p>
  <p>Thanks,<br>Sent from my iPhone</p>
  <img src="{{trackingUrl}}" width="1" height="1" style="display:none" />
</div>`,
      landingPageHtml: `<h2>🏦 CEO Fraud / BEC Attack</h2><p>This is a classic Business Email Compromise (BEC) attack where an attacker impersonates a CEO or executive.</p><h3>Red Flags:</h3><ul><li>Urgency and pressure: "handle something urgently"</li><li>Request for confidentiality: "do not discuss with anyone"</li><li>Financial request via email (wire transfers should always be verified by phone)</li><li>"Sent from my iPhone" — used to excuse informal tone and typos</li><li>The email address may look similar but isn't your real CEO's address</li></ul>`,
    },
    {
      name: "Microsoft 365 Login Alert",
      subject: "Unusual Sign-in Activity on Your Account",
      senderName: "Microsoft Security",
      senderEmail: "security@microsoft-alerts.com",
      difficulty: "BEGINNER" as Difficulty,
      category: "PHISHING" as ModuleCategory,
      bodyHtml: `<div style="font-family: Segoe UI, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31" width="120" alt="Microsoft" style="display:inline-block">
    </div>
    <h2 style="color: #333; text-align: center;">Unusual Sign-in Activity</h2>
    <p>Dear {{firstName}} {{lastName}},</p>
    <p>We detected a sign-in attempt to your Microsoft 365 account from an unusual location:</p>
    <div style="background: #f8f8f8; border-left: 4px solid #e74c3c; padding: 15px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Location:</strong> Lagos, Nigeria</p>
      <p style="margin: 5px 0;"><strong>IP Address:</strong> 197.210.xx.xx</p>
      <p style="margin: 5px 0;"><strong>Device:</strong> Unknown Android Device</p>
      <p style="margin: 5px 0;"><strong>Time:</strong> Today at 3:42 AM</p>
    </div>
    <p>If this wasn't you, please secure your account immediately:</p>
    <p style="text-align: center; margin: 25px 0;">
      <a href="{{clickUrl}}" style="background: #0078d4; color: white; padding: 12px 40px; text-decoration: none; border-radius: 4px; font-weight: 600;">Review Activity</a>
    </p>
    <p style="color: #999; font-size: 12px;">If you recognize this activity, you can safely ignore this message.</p>
  </div>
  <p style="color: #999; font-size: 11px; text-align: center; margin-top: 15px;">Microsoft Corporation, One Microsoft Way, Redmond, WA 98052</p>
  <img src="{{trackingUrl}}" width="1" height="1" style="display:none" />
</div>`,
      landingPageHtml: `<h2>🔑 Fake Microsoft Login Alert</h2><p>This email mimics Microsoft's security alerts to steal your credentials.</p><h3>Red Flags:</h3><ul><li>Sender domain "microsoft-alerts.com" is NOT a real Microsoft domain</li><li>Real Microsoft emails come from @accountprotection.microsoft.com</li><li>Scary details (Lagos, Nigeria) designed to trigger panic</li><li>The "Review Activity" button leads to a fake login page</li><li>Always go directly to account.microsoft.com instead of clicking email links</li></ul>`,
    },
    {
      name: "HR Benefits Enrollment",
      subject: "Action Required: Open Enrollment Closes Tomorrow",
      senderName: "HR Benefits Team",
      senderEmail: "benefits@{{companyDomain}}",
      difficulty: "INTERMEDIATE" as Difficulty,
      category: "SOCIAL_ENGINEERING" as ModuleCategory,
      bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 8px 8px 0 0;">
    <h2 style="color: white; margin: 0;">Benefits Open Enrollment</h2>
    <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0;">Annual Benefits Selection Period</p>
  </div>
  <div style="border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
    <p>Dear {{firstName}},</p>
    <p>This is a <strong>final reminder</strong> that the open enrollment period for your 2025 benefits closes <strong>tomorrow at 11:59 PM</strong>.</p>
    <p>If you don't complete your selections, you will be automatically enrolled in the <strong>minimum coverage plan</strong>, which may result in higher out-of-pocket costs.</p>
    <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #856404;">⚠️ <strong>Important:</strong> You must verify your identity before making selections.</p>
    </div>
    <p style="text-align: center; margin: 25px 0;">
      <a href="{{clickUrl}}" style="background: #667eea; color: white; padding: 14px 35px; text-decoration: none; border-radius: 5px; font-weight: bold;">Complete Enrollment Now</a>
    </p>
    <p style="color: #666;">Thank you,<br>HR Benefits Team</p>
  </div>
  <img src="{{trackingUrl}}" width="1" height="1" style="display:none" />
</div>`,
      landingPageHtml: `<h2>📋 Fake HR Benefits Enrollment</h2><p>This phishing email exploits the urgency of benefits enrollment deadlines to trick employees.</p><h3>Red Flags:</h3><ul><li>Artificial urgency: "closes tomorrow"</li><li>Threat of negative consequences: "minimum coverage plan"</li><li>Request to "verify your identity" — HR already knows who you are</li><li>Always access benefits through your company's official HR portal, never through email links</li><li>When in doubt, call HR directly to confirm</li></ul>`,
    },
    {
      name: "Delivery Notification Scam",
      subject: "Your Package Could Not Be Delivered — Action Required",
      senderName: "DHL Express Delivery",
      senderEmail: "tracking@dhl-delivery-notice.com",
      difficulty: "BEGINNER" as Difficulty,
      category: "PHISHING" as ModuleCategory,
      bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #ffcc00; padding: 15px 20px; border-radius: 8px 8px 0 0;">
    <h2 style="color: #c60a00; margin: 0;">📦 DHL Express</h2>
  </div>
  <div style="border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
    <p>Dear Customer,</p>
    <p>We attempted to deliver your package today but were unable to complete the delivery. Your package is being held at our distribution center.</p>
    <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <p style="margin: 5px 0;"><strong>Tracking Number:</strong> DHL-7829451036{{firstName}}</p>
      <p style="margin: 5px 0;"><strong>Status:</strong> Delivery Failed — Address Verification Required</p>
      <p style="margin: 5px 0;"><strong>Delivery Fee:</strong> $2.99 (re-delivery charge)</p>
    </div>
    <p>Please confirm your delivery address and pay the re-delivery fee to schedule a new delivery:</p>
    <p style="text-align: center; margin: 25px 0;">
      <a href="{{clickUrl}}" style="background: #c60a00; color: white; padding: 12px 35px; text-decoration: none; border-radius: 5px; font-weight: bold;">Schedule Re-Delivery</a>
    </p>
    <p style="color: #999; font-size: 11px;">If not resolved within 48 hours, the package will be returned to sender.</p>
  </div>
  <img src="{{trackingUrl}}" width="1" height="1" style="display:none" />
</div>`,
      landingPageHtml: `<h2>📦 Fake Delivery Notification</h2><p>Package delivery scams are extremely common and use urgency to trick you into providing payment information.</p><h3>Red Flags:</h3><ul><li>Sender domain "dhl-delivery-notice.com" is NOT the real DHL domain (dhl.com)</li><li>Generic greeting: "Dear Customer" instead of your name</li><li>Request for payment via email — legitimate couriers don't do this</li><li>Fake tracking number containing your name</li><li>48-hour deadline creates artificial urgency</li><li>Always track packages directly on the official courier website</li></ul>`,
    },
  ];

  for (const t of phishingTemplates) {
    await prisma.phishingTemplate.create({
      data: {
        ...t,
        organizationId: organization.id,
        isActive: true,
      },
    });
  }
  console.log("Created " + phishingTemplates.length + " phishing simulation templates");

  // =============================================
  // PHISHING EXAMPLES
  // =============================================
  const phishingData = [
    {
      subject: "Your Account Has Been Compromised - Immediate Action Required",
      sender: "security-team@micros0ft-support.com",
      senderEmail: "security-team@micros0ft-support.com",
      body: "Dear Valued Customer,\n\nWe have detected unauthorized access to your Microsoft 365 account from an unrecognized device in Eastern Europe. Your account has been temporarily restricted.\n\nTo restore full access, please verify your identity immediately by clicking the secure link below:\n\nVerify My Account Now\n\nIf you do not verify within 24 hours, your account will be permanently suspended and all data will be deleted.\n\nMicrosoft Security Team\nThis is an automated message. Do not reply.",
      difficulty: Difficulty.BEGINNER,
      category: "email",
      redFlags: ["Sender domain 'micros0ft-support.com' uses a zero instead of 'o'", "Creates extreme urgency with 24-hour deletion threat", "Threatens permanent data loss to cause panic", "Generic greeting instead of your actual name", "Asks you to click a link to verify identity"],
    },
    {
      subject: "Invoice #INV-2024-8847 Payment Overdue",
      sender: "billing@quickbooks-invoicing.net",
      senderEmail: "billing@quickbooks-invoicing.net",
      body: "Hi,\n\nThis is a reminder that Invoice #INV-2024-8847 for $4,750.00 is now 15 days past due. A late fee of $237.50 has been applied to your account.\n\nPlease review and pay your invoice immediately to avoid further penalties and potential collection action.\n\nView and Pay Invoice\n\nIf you believe this is an error, please contact our billing department.\n\nQuickBooks Billing Department",
      difficulty: Difficulty.INTERMEDIATE,
      category: "email",
      redFlags: ["Domain 'quickbooks-invoicing.net' is not the official QuickBooks domain", "No specific company name or account details mentioned", "Threatens collection action to create urgency", "Generic 'Hi' greeting with no personalization", "Specific dollar amounts to appear legitimate"],
    },
    {
      subject: "CEO Request: Urgent Wire Transfer Needed",
      sender: "ceo.john.smith@gmail.com",
      senderEmail: "ceo.john.smith@gmail.com",
      body: "Hi Sarah,\n\nI need you to process an urgent wire transfer of $28,500 to a new vendor. This is for a confidential acquisition we are finalizing today.\n\nPlease do not discuss this with anyone else as it is under NDA. I am in meetings all day and cannot take calls.\n\nHere are the wire details:\nBank: First National Bank\nRouting: 021000089\nAccount: 4438291056\nBeneficiary: GlobalTech Solutions LLC\n\nPlease confirm once sent.\n\nJohn Smith\nCEO",
      difficulty: Difficulty.INTERMEDIATE,
      category: "email",
      redFlags: ["CEO using a personal Gmail address instead of corporate email", "Requests secrecy and says do not discuss with anyone", "Claims to be unavailable for verification calls", "Requests wire transfer to a new unknown vendor", "Extremely urgent with same-day deadline", "Mentions confidential acquisition under NDA"],
    },
    {
      subject: "Package Delivery Failed - Update Your Address",
      sender: "+1-555-0142",
      senderEmail: "+1-555-0142",
      body: "FedEx: Your package (Tracking: FX-8834721) could not be delivered due to incomplete address information. Update your delivery details within 12 hours or the package will be returned to sender: fedex-redelivery.info/update?id=8834721",
      difficulty: Difficulty.BEGINNER,
      category: "sms",
      redFlags: ["Link goes to 'fedex-redelivery.info' not the official fedex.com", "Creates urgency with 12-hour window", "Sent from a regular phone number, not a short code", "Generic tracking number format"],
    },
    {
      subject: "You Have Won a $500 Amazon Gift Card!",
      sender: "rewards@amazon-gift-center.com",
      senderEmail: "rewards@amazon-gift-center.com",
      body: "Congratulations!\n\nYou have been selected as this month's lucky winner of a $500 Amazon Gift Card!\n\nAs a valued Amazon customer, you were randomly chosen from our loyalty program database.\n\nTo claim your reward, simply complete a brief survey (takes only 2 minutes) and provide your shipping details:\n\nClaim Your $500 Gift Card\n\nThis offer expires in 48 hours. Only one gift card per household.\n\nAmazon Rewards Team",
      difficulty: Difficulty.BEGINNER,
      category: "email",
      redFlags: ["Domain 'amazon-gift-center.com' is not amazon.com", "Too good to be true - random prize winnings", "Requires personal information to claim", "48-hour expiration to create urgency", "No specific account details or order history referenced"],
    },
    {
      subject: "IT Department: Mandatory Password Reset",
      sender: "it-helpdesk@yourcompany-portal.com",
      senderEmail: "it-helpdesk@yourcompany-portal.com",
      body: "MANDATORY SECURITY UPDATE\n\nDue to a recent security audit, all employees must reset their passwords within the next 4 hours.\n\nClick the link below to access the password reset portal:\n\nReset Password Now\n\nFailure to comply will result in account lockout and you will need to contact IT support in person with photo ID to regain access.\n\nIT Security Department\nTicket #SEC-2024-0447",
      difficulty: Difficulty.INTERMEDIATE,
      category: "email",
      redFlags: ["Domain 'yourcompany-portal.com' is suspicious - not official", "4-hour deadline is unreasonably short for a company-wide reset", "Threatens lockout to create fear", "Official IT notices would come through internal systems", "Includes a ticket number to appear legitimate"],
    },
    {
      subject: "DocuSign: Contract Ready for Your Signature",
      sender: "noreply@docusign-notifications.com",
      senderEmail: "noreply@docusign-notifications.com",
      body: "Sarah Johnson,\n\nJohn Smith has sent you a document to review and sign.\n\nDocument: Q4 Consulting Agreement - Amendment 3\nSender: John Smith (john.smith@partnercompany.com)\nExpires: March 20, 2026\n\nREVIEW DOCUMENT\n\nDo not share this email. The document contains a secure link for your eyes only.\n\nDocuSign | Trust Center | Privacy Policy",
      difficulty: Difficulty.ADVANCED,
      category: "email",
      redFlags: ["Domain 'docusign-notifications.com' is not official docusign.net", "Uses real names to appear highly targeted", "Document title designed to seem relevant and expected", "Subtle but the sender domain is the giveaway"],
    },
    {
      subject: "Voicemail from +1 (202) 555-0184",
      sender: "voicemail@office365-vm.com",
      senderEmail: "voicemail@office365-vm.com",
      body: "You have a new voicemail message.\n\nFrom: +1 (202) 555-0184\nDuration: 0:47\nReceived: Today at 2:34 PM\nPriority: High\n\nPlay Voicemail Message\n\nIf you cannot play the message, download the audio file attached.\n\nMicrosoft Office 365 Voicemail Service",
      difficulty: Difficulty.ADVANCED,
      category: "email",
      redFlags: ["Domain 'office365-vm.com' is not microsoft.com", "Voicemail notifications with download links are a common malware vector", "Encourages downloading an audio file that could be malware", "High priority marking to create urgency"],
    },
  ];
  for (const p of phishingData) {
    await prisma.phishingExample.create({
      data: {
        subject: p.subject,
        sender: p.sender,
        senderEmail: p.senderEmail,
        body: p.body,
        difficulty: p.difficulty,
        category: p.category,
        redFlags: p.redFlags,
        organizationId: organization.id,
        isGlobal: true,
      }
    });
  }
  console.log("Created " + phishingData.length + " phishing examples");

  // =============================================
  // CAMPAIGNS
  // =============================================
  const campaign1 = await prisma.campaign.create({
    data: {
      name: "Q1 2026 Security Fundamentals",
      description: "Mandatory quarterly security awareness training covering phishing, passwords, and MFA for all employees.",
      status: CampaignStatus.ACTIVE,
      type: CampaignType.TRAINING,
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-03-31"),
      organizationId: organization.id,
    }
  });
  // Link first 5 modules to campaign 1
  for (let i = 0; i < 5 && i < createdModules.length; i++) {
    await prisma.campaignModule.create({ data: { campaignId: campaign1.id, moduleId: createdModules[i].id } });
  }
  // Link first 3 quizzes to campaign 1
  for (let i = 0; i < 3 && i < createdQuizzes.length; i++) {
    await prisma.campaignQuiz.create({ data: { campaignId: campaign1.id, quizId: createdQuizzes[i].id } });
  }
  // Link all departments to campaign 1
  for (const dept of departments) {
    await prisma.campaignDepartment.create({ data: { campaignId: campaign1.id, departmentId: dept.id } });
  }

  const campaign2 = await prisma.campaign.create({
    data: {
      name: "Advanced Threat Defense Program",
      description: "Advanced training for IT and security teams covering malware analysis, insider threats, and incident response.",
      status: CampaignStatus.ACTIVE,
      type: CampaignType.TRAINING,
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-06-30"),
      organizationId: organization.id,
    }
    });
  for (let i = 5; i < createdModules.length; i++) {
    await prisma.campaignModule.create({ data: { campaignId: campaign2.id, moduleId: createdModules[i].id } });
  }
  for (let i = 3; i < createdQuizzes.length; i++) {
    await prisma.campaignQuiz.create({ data: { campaignId: campaign2.id, quizId: createdQuizzes[i].id } });
  }
  // Link IT and Legal departments
  await prisma.campaignDepartment.create({ data: { campaignId: campaign2.id, departmentId: departments[0].id } });
  await prisma.campaignDepartment.create({ data: { campaignId: campaign2.id, departmentId: departments[5].id } });

  const campaign3 = await prisma.campaign.create({
    data: {
      name: "Q1 Phishing Simulation",
      description: "Quarterly phishing simulation campaign to test employee awareness and measure organizational resilience.",
      status: CampaignStatus.ACTIVE,
      type: CampaignType.PHISHING_SIMULATION,
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-03-31"),
      organizationId: organization.id,
    }
  });
  for (const dept of departments) {
    await prisma.campaignDepartment.create({ data: { campaignId: campaign3.id, departmentId: dept.id } });
  }
  console.log("Created 3 campaigns");

  // =============================================
  // SAMPLE ACTIVITIES & PROGRESS
  // =============================================
  // Add module progress for the seeded employee
  for (let i = 0; i < 3 && i < createdModules.length; i++) {
    await prisma.moduleProgress.create({
      data: {
        userId: employee.id,
        moduleId: createdModules[i].id,
        isCompleted: i < 2,
        progress: i < 2 ? 100 : 60,
        completedAt: i < 2 ? new Date(Date.now() - (30 - i * 10) * 24 * 60 * 60 * 1000) : null,
      }
    });
  }

  // Add quiz results for the seeded employee
  for (let i = 0; i < 2 && i < createdQuizzes.length; i++) {
    await prisma.quizResult.create({
      data: {
        userId: employee.id,
        quizId: createdQuizzes[i].id,
        score: 80 + i * 5,
        passed: true,
        timeTaken: (createdQuizzes[i]?.timeLimitMins || 15 - 3) * 60,
        answers: [],
      }
    });
  }

  // Add activities
  const activityData = [
    { userId: employee.id, type: ActivityType.MODULE_COMPLETED, target: "Phishing Awareness Fundamentals", details: "Completed with full progress" },
    { userId: employee.id, type: ActivityType.QUIZ_COMPLETED, target: "Phishing Detection Assessment", details: "Passed with 80%" },
    { userId: employee.id, type: ActivityType.MODULE_COMPLETED, target: "Password Security & Management", details: "Completed with full progress" },
    { userId: employee.id, type: ActivityType.QUIZ_COMPLETED, target: "Password Security Mastery", details: "Passed with 85%" },
    { userId: employee.id, type: ActivityType.BADGE_EARNED, target: "Security Rookie", details: "Earned badge" },
    { userId: admin.id, type: ActivityType.MODULE_COMPLETED, target: "Social Engineering Defense", details: "Completed with full progress" },
    { userId: admin.id, type: ActivityType.QUIZ_COMPLETED, target: "Social Engineering Defense Assessment", details: "Passed with 95%" },
  ];
  for (const a of activityData) {
    await prisma.activity.create({
      data: {
        userId: a.userId,
        type: a.type,
        target: a.target,
        details: a.details,
      }
    });
  }
  console.log("Created activities and progress");

  // Award badges to employee
  await prisma.userBadge.create({ data: { userId: employee.id, badgeId: badges[0].id } });
  await prisma.userBadge.create({ data: { userId: employee.id, badgeId: badges[1].id } });

  // Award badges to some extra employees
  await prisma.userBadge.create({ data: { userId: employees[1].id, badgeId: badges[0].id } });
  await prisma.userBadge.create({ data: { userId: employees[2].id, badgeId: badges[0].id } });
  await prisma.userBadge.create({ data: { userId: employees[2].id, badgeId: badges[2].id } });
  console.log("Awarded badges");

  // Certificate for employee who completed modules
  await prisma.certificate.create({
    data: {
      userId: employee.id,
      moduleName: "Phishing Awareness Fundamentals",
      moduleId: createdModules[0]?.id,
      quizScore: 80,
      issuedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    }
  });
  await prisma.certificate.create({
    data: {
      userId: employee.id,
      moduleName: "Password Security & Management",
      moduleId: createdModules[1]?.id,
      quizScore: 85,
      issuedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    }
  });
  console.log("Created certificates");

  // =============================================
  // SUMMARY
  // =============================================
  const counts = {
    departments: await prisma.department.count(),
    users: await prisma.user.count(),
    modules: await prisma.module.count(),
    lessons: await prisma.lesson.count(),
    quizzes: await prisma.quiz.count(),
    questions: await prisma.question.count(),
    options: await prisma.questionOption.count(),
    phishingExamples: await prisma.phishingExample.count(),
    campaigns: await prisma.campaign.count(),
    badges: await prisma.badge.count(),
    activities: await prisma.activity.count(),
    certificates: await prisma.certificate.count(),
  };
  console.log("\n=== SEED COMPLETE ===");
  console.log(JSON.stringify(counts, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
