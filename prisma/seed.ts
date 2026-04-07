import { PrismaClient, UserRole, UserStatus, Difficulty, ModuleCategory, LessonType, QuizStatus, CampaignStatus, CampaignType, ContactStatus, ActivityType, BadgeColor, OrganizationPlan } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding production database...");

  // Clear existing data
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
  // DEFAULT ORGANIZATION
  // =============================================
  const organization = await prisma.organization.create({
    data: {
      name: "SecureAware Demo Corp",
      slug: "secureaware-demo",
      domain: "secureaware.online",
      plan: OrganizationPlan.ENTERPRISE,
      maxUsers: 100,
    },
  });
  console.log("Created default organization: " + organization.name);

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
  // TRAINING MODULES WITH REAL LESSONS
  // =============================================
  interface LessonInput { title: string; description: string; type: LessonType; durationMins: number; order: number; content: string; }
  interface ModuleInput { title: string; description: string; category: ModuleCategory; difficulty: Difficulty; durationMins: number; order: number; keyTakeaways: string[]; realExamples: string[]; lessons: LessonInput[]; }

  const modulesData: ModuleInput[] = [
    {
      title: "Phishing Awareness Fundamentals",
      description: "Learn to recognize and respond to phishing attacks. Covers email phishing, spear phishing, whaling, vishing, and smishing techniques used by modern attackers.",
      category: ModuleCategory.PHISHING, difficulty: Difficulty.BEGINNER, durationMins: 25, order: 1,
      keyTakeaways: ["Identify common phishing indicators in emails", "Understand mass phishing vs targeted attacks", "Know your reporting procedure for suspicious messages", "Recognize urgency and fear tactics"],
      realExamples: ["MGM Resorts lost $100M in 2023 after social engineering attack", "Twitter 2020 breach started with phone-based phishing", "BEC scams cost $2.7 billion in 2022"],
      lessons: [
        { title: "What Is Phishing and Why It Matters", description: "Understanding the scope and impact of phishing attacks", type: LessonType.READING, durationMins: 8, order: 1,
          content: "Phishing is a social engineering attack where criminals impersonate trusted entities to trick you into revealing sensitive information, clicking malicious links, or downloading harmful attachments.\n\nPhishing remains the number one initial attack vector in data breaches worldwide. The FBI reports phishing losses exceeding $10.3 billion annually.\n\nTypes of Phishing:\n\n1. Email Phishing - Mass-sent emails impersonating banks, tech companies, or internal departments.\n2. Spear Phishing - Targeted attacks using personal information. Highly customized and dangerous.\n3. Whaling - Spear phishing aimed at executives and high-value targets.\n4. Vishing (Voice Phishing) - Phone-based attacks impersonating IT support, banks, or agencies.\n5. Smishing (SMS Phishing) - Text messages containing malicious links or urgent requests.\n\nNo email filter is 100% effective. Your ability to recognize phishing is the last critical line of defense." },
        { title: "Anatomy of a Phishing Email", description: "Breaking down phishing emails to spot red flags", type: LessonType.INTERACTIVE, durationMins: 10, order: 2,
          content: "Every phishing email contains identifiable red flags if you know where to look.\n\nRed Flag 1 - Sender Address Mismatch: Check the full email address, not just the display name. Watch for lookalike domains (micros0ft.com), subdomain tricks (microsoft.security-update.com), and free email services.\n\nRed Flag 2 - Urgency and Threats: Phishing creates panic. Watch for messages like 'Your account will be suspended in 24 hours' or 'Unauthorized login detected.'\n\nRed Flag 3 - Suspicious Links: Hover over links to see the actual URL. Check if it matches the sender's domain and uses HTTPS.\n\nRed Flag 4 - Unexpected Attachments: Be cautious with .exe, .scr, .bat files. Office documents asking to Enable Macros are dangerous.\n\nRed Flag 5 - Generic Greetings: Legitimate organizations address you by name. Watch for 'Dear Customer' or 'Dear User.'\n\nAction Steps: Do not click links or download attachments. Do not reply. Report to IT security immediately. Delete after reporting." },
        { title: "Responding to Phishing Attempts", description: "Step-by-step procedures for handling suspected phishing", type: LessonType.READING, durationMins: 7, order: 3,
          content: "How to respond when you spot a phishing email:\n\n1. Do not interact with the email\n2. Report immediately using your phishing report button or forwarding to security\n3. Note key details - sender address, subject line, time received\n4. Delete the email after reporting\n5. Warn colleagues if the attack targets your department\n\nIf you already clicked a link:\n1. Disconnect from the network immediately\n2. Do not enter any credentials\n3. Contact IT Security - time is critical\n4. Change passwords for exposed accounts\n5. Enable MFA on all accounts\n\nIf you entered credentials:\n1. Change the compromised password immediately from a trusted device\n2. Change passwords on accounts using the same credentials\n3. Report the incident with full details\n4. Review recent account activity\n5. Enable MFA everywhere\n\nEvery reported phishing attempt helps protect the entire organization." }
      ]
    },
    {
      title: "Password Security & Management",
      description: "Master creating, managing, and protecting strong passwords. Learn why password hygiene is critical and how to use modern tools to stay secure.",
      category: ModuleCategory.PASSWORDS, difficulty: Difficulty.BEGINNER, durationMins: 20, order: 2,
      keyTakeaways: ["Create strong unique passwords using passphrases", "Use a password manager for all accounts", "Never reuse passwords across services", "Understand how attackers crack weak passwords"],
      realExamples: ["RockYou breach: most common password was 123456", "LinkedIn 2012 breach exposed 117M passwords", "Colonial Pipeline ransomware from a single compromised VPN password"],
      lessons: [
        { title: "Why Passwords Still Matter", description: "Password security in the modern threat landscape", type: LessonType.READING, durationMins: 7, order: 1,
          content: "Despite advances in biometrics and passwordless auth, passwords remain the primary authentication method. Your password is often the only barrier between an attacker and your accounts.\n\nHow Attackers Crack Passwords:\n\nBrute Force - Automated tools try every combination. A 6-character lowercase password is cracked in under 1 second. A 12-character mixed password takes centuries.\n\nDictionary Attacks - Tools use lists of common passwords and words. password123, company2024, and Welcome1 are cracked instantly.\n\nCredential Stuffing - Attackers use breached username/password pairs on other services. This is why password reuse is extremely dangerous.\n\nSocial Engineering - Attackers gather personal info to guess passwords based on names, birthdays, or interests.\n\nKey Statistics: 81% of breaches involve weak or stolen passwords. The average person has 100+ online accounts. 65% of people reuse the same password across sites." },
        { title: "Creating Strong Passwords", description: "Techniques for building uncrackable yet memorable passwords", type: LessonType.INTERACTIVE, durationMins: 8, order: 2,
          content: "The Passphrase Method - Use a string of random unrelated words instead of a complex short password.\n\nWeak: P@ssw0rd! | Strong: correct-horse-battery-staple | Stronger: Maple!Quantum7$Bridge&Falcon\n\nPassword Strength Rules:\n1. Length over complexity - aim for 16+ characters\n2. Use passphrases - 4+ random unrelated words\n3. Add variety - mix uppercase, numbers, symbols between words\n4. Avoid personal info - no names, dates, pet names\n5. Never use common patterns - no qwerty, 12345, or dictionary words alone\n\nPassword Strength Examples:\npassword = cracked instantly (dictionary word)\nP@ssw0rd! = 3 minutes (common substitution)\nSummer2024 = 2 seconds (season + year)\ncorrect-horse-battery = 550 years (passphrase)\n\nEvery account must have a unique password. If one service is breached, attackers try that password everywhere." },
        { title: "Password Managers: Your Security Vault", description: "Using password managers effectively and securely", type: LessonType.READING, durationMins: 5, order: 3,
          content: "A password manager stores, generates, and auto-fills your passwords. You only need to remember one master password.\n\nBenefits:\n- Generates truly random unique passwords for every account\n- Stores hundreds of passwords securely with encryption\n- Auto-fills login forms preventing typos and phishing\n- Syncs across all devices\n- Alerts you to breached, weak, or reused passwords\n\nRecommended: Bitwarden (free, open source), 1Password (enterprise), KeePass (offline)\n\nMaster Password Best Practices:\n- At least 20 characters\n- A memorable passphrase\n- Completely unique - never used elsewhere\n- Enable MFA on your password manager\n\nSecurity Tips: Review vault regularly, use password health checker, set up emergency access for trusted contacts." }
      ]
    },
    {
      title: "Multi-Factor Authentication (MFA)",
      description: "Understand why MFA is essential and learn to set it up correctly. Covers authenticator apps, hardware keys, and MFA bypass techniques.",
      category: ModuleCategory.PASSWORDS, difficulty: Difficulty.BEGINNER, durationMins: 15, order: 3,
      keyTakeaways: ["Enable MFA on every account that supports it", "Prefer authenticator apps over SMS codes", "Understand MFA bypass attacks", "Securely store backup codes"],
      realExamples: ["Microsoft: MFA blocks 99.9% of automated attacks", "Uber 2022 breach via MFA fatigue attack", "Google: hardware keys prevented 100% of phishing"],
      lessons: [
        { title: "Understanding Multi-Factor Authentication", description: "What MFA is and why it is your strongest defense", type: LessonType.READING, durationMins: 5, order: 1,
          content: "MFA requires two or more verification factors. Even if an attacker steals your password, they cannot access your account without the additional factor.\n\nThe Three Factors:\n1. Something You Know - Passwords, PINs\n2. Something You Have - Phone, hardware key\n3. Something You Are - Fingerprint, face scan\n\nMFA Methods Ranked:\n1. Hardware Security Keys (Best) - YubiKey, cannot be phished remotely\n2. Authenticator Apps (Strong) - Google Authenticator, Authy, time-based codes\n3. Push Notifications (Good) - Approve/deny login attempts\n4. SMS Codes (Acceptable) - Vulnerable to SIM-swapping but still better than nothing\n5. Email Codes (Weakest) - If attacker has email access, no protection\n\nAny MFA is dramatically better than no MFA." },
        { title: "Setting Up and Using MFA Securely", description: "Practical guide to enabling MFA on key accounts", type: LessonType.INTERACTIVE, durationMins: 7, order: 2,
          content: "Priority Accounts for MFA:\n1. Email - gateway to password resets\n2. Password manager - contains all credentials\n3. Banking and financial\n4. Work accounts\n5. Social media\n\nSetting Up an Authenticator App:\n1. Download authenticator app\n2. Go to account security settings\n3. Select Enable Two-Factor Authentication\n4. Choose Authenticator App\n5. Scan QR code\n6. Enter 6-digit code to verify\n7. SAVE your backup codes securely\n\nBackup Codes - store in password manager or printed in a safe. Never in an unencrypted file.\n\nAvoiding MFA Fatigue: Attackers trigger repeated push notifications hoping you approve one. Never approve a prompt you did not initiate. Report unexpected prompts immediately." }
      ]
    },
    {
      title: "Social Engineering Defense",
      description: "Recognize and defend against manipulation techniques that bypass technical controls by exploiting human psychology.",
      category: ModuleCategory.SOCIAL_ENGINEERING, difficulty: Difficulty.INTERMEDIATE, durationMins: 30, order: 4,
      keyTakeaways: ["Recognize six principles of persuasion in attacks", "Identify pretexting, baiting, and tailgating", "Verify requests through independent channels", "Maintain professional skepticism"],
      realExamples: ["$25M transferred after deepfake video call impersonated CFO in 2024", "RSA SecurID breach started with a phishing email", "Kevin Mitnick accessed systems primarily through social engineering"],
      lessons: [
        { title: "The Psychology of Social Engineering", description: "How attackers exploit human behavior patterns", type: LessonType.READING, durationMins: 10, order: 1,
          content: "Social engineering exploits fundamental human psychological tendencies.\n\nCialdini's Six Principles:\n\n1. Authority - People comply with authority figures. Attackers impersonate IT directors, executives, or law enforcement.\n\n2. Urgency/Scarcity - Time pressure bypasses thinking. 'Your account will be deleted in 30 minutes.'\n\n3. Social Proof - People follow others. 'Everyone in your department already completed this.'\n\n4. Likability - People help those they like. Attackers build rapport first.\n\n5. Reciprocity - We return favors. 'I fixed your printer. Can you hold the door?'\n\n6. Commitment - Small agreements lead to larger ones.\n\nDefense - The Pause Principle: Before acting on any unexpected request, ask:\n1. Did I expect this communication?\n2. Can I independently verify the sender?\n3. Is there unusual urgency?\n4. Would this be normal through official channels?" },
        { title: "Common Social Engineering Attack Types", description: "Identifying pretexting, baiting, tailgating and more", type: LessonType.READING, durationMins: 10, order: 2,
          content: "Pretexting - Attacker creates a fabricated scenario to gain trust. Example: Someone calls claiming to be from your bank's fraud department asking you to verify your account.\nDefense: Hang up and call using the official number.\n\nBaiting - Offering something enticing. Physical: USB drives labeled 'Salary Information' left in parking lots. Digital: Free software downloads.\nDefense: Never insert found USB drives or download from untrusted sources.\n\nTailgating - Gaining physical access by following authorized personnel. Example: Someone carrying boxes asks you to hold the door.\nDefense: Ask them to badge in or contact reception.\n\nQuid Pro Quo - Offering a service for information. Example: 'Hi, IT support. We need your password for the system update.'\nDefense: IT will never ask for your password.\n\nBusiness Email Compromise - Spoofed executive emails authorizing fraud. Example: CEO email to finance requesting urgent wire transfer.\nDefense: Always verify financial requests through a second channel." },
        { title: "Building Social Engineering Resistance", description: "Organizational strategies and personal defense habits", type: LessonType.READING, durationMins: 10, order: 3,
          content: "Personal Defense:\n- Verify through independent channels using contact info you already have\n- Embrace professional skepticism - better to verify than be compromised\n- Control your digital footprint - limit what you share on social media\n- Follow least privilege - only share information necessary for the request\n\nOrganizational Defenses:\n1. Verification protocols for financial transactions\n2. Callback procedures for unexpected executive requests\n3. Clean desk policies\n4. Visitor management with ID and escort requirements\n5. Regular security awareness training\n6. Incident reporting culture where employees feel safe reporting\n\nSocial engineering targets humans because they are often the weakest link. By being aware and following verification procedures, you become the strongest link." }
      ]
    },
    {
      title: "Safe Browsing & Internet Security",
      description: "Navigate the internet safely by understanding web-based threats, secure connections, and safe download practices.",
      category: ModuleCategory.BROWSING, difficulty: Difficulty.BEGINNER, durationMins: 20, order: 5,
      keyTakeaways: ["Verify HTTPS and certificate validity", "Recognize malicious websites and downloads", "Use browser security features", "Avoid public computers for sensitive tasks"],
      realExamples: ["Watering hole attacks compromised Forbes.com to target defense industry visitors", "Malvertising campaigns on major ad networks infected millions of visitors", "Drive-by downloads from compromised WordPress sites affected thousands"],
      lessons: [
        { title: "Understanding Web-Based Threats", description: "Common internet threats targeting everyday browsing", type: LessonType.READING, durationMins: 7, order: 1,
          content: "Web-Based Threats Overview:\n\nDrive-By Downloads - Malware automatically downloads when visiting a compromised website, no click required. Keep browsers and plugins updated to prevent this.\n\nMalvertising - Malicious code embedded in online advertisements, even on legitimate websites. Use ad blockers and keep browsers updated.\n\nWatering Hole Attacks - Attackers compromise websites frequently visited by their targets. Industry forums, news sites, and professional communities are common targets.\n\nFake Websites - Cloned versions of legitimate sites designed to steal credentials. Always verify the URL carefully before entering any information.\n\nMan-in-the-Middle - Attackers intercept communication between you and a website, especially on unsecured networks. Always verify HTTPS connections." },
        { title: "Secure Browsing Practices", description: "Practical habits for safe daily internet use", type: LessonType.INTERACTIVE, durationMins: 8, order: 2,
          content: "Essential Secure Browsing Habits:\n\n1. Check for HTTPS - Look for the padlock icon. Never enter credentials or personal data on HTTP sites.\n\n2. Verify URLs carefully - Check for misspellings (googIe.com with capital I vs google.com). Bookmark important sites.\n\n3. Keep everything updated - Browser, operating system, and plugins. Updates patch security vulnerabilities.\n\n4. Use browser security features - Enable popup blockers, safe browsing warnings, and cookie controls.\n\n5. Download safely - Only from official sources. Verify file hashes when possible. Scan downloads with antivirus.\n\n6. Be cautious with browser extensions - Only install from official stores. Review permissions. Remove unused extensions.\n\n7. Use private browsing wisely - Private mode does not make you anonymous. It only prevents local history storage.\n\n8. Log out of accounts - Especially on shared or public computers. Close all browser windows when done." },
        { title: "Browser Security Configuration", description: "Configuring your browser for maximum security", type: LessonType.READING, durationMins: 5, order: 3,
          content: "Browser Security Settings:\n\nEssential Settings:\n- Enable automatic updates\n- Block third-party cookies\n- Enable Do Not Track\n- Block pop-ups and redirects\n- Enable safe browsing protection\n\nRecommended Extensions:\n- uBlock Origin (ad/malware blocking)\n- HTTPS Everywhere (force encrypted connections)\n- Password manager extension\n\nAvoid:\n- Saving passwords in the browser (use a dedicated password manager)\n- Allowing all cookies\n- Installing extensions from unknown sources\n- Using outdated browsers\n\nFor Work Devices:\n- Follow your organization IT policy\n- Do not install unauthorized extensions\n- Report suspicious websites to IT security" }
      ]
    },
    {
      title: "Email Security Best Practices",
      description: "Protect yourself and your organization through secure email practices. Learn to handle attachments, verify senders, and prevent data leakage.",
      category: ModuleCategory.PHISHING, difficulty: Difficulty.INTERMEDIATE, durationMins: 20, order: 6,
      keyTakeaways: ["Verify sender identity before acting on requests", "Handle attachments and links safely", "Prevent accidental data leakage via email", "Use encryption for sensitive communications"],
      realExamples: ["Sony Pictures hack in 2014 began with spear phishing emails", "Hillary Clinton email server controversy highlighted classification risks", "Anthem healthcare breach exposing 80M records started with a phishing email"],
      lessons: [
        { title: "Email as an Attack Vector", description: "Why email is the primary target for cybercriminals", type: LessonType.READING, durationMins: 7, order: 1,
          content: "Email remains the most exploited attack vector because every employee has an email address, messages can be spoofed, and attachments can carry malware.\n\n91% of cyberattacks start with an email. Organizations receive thousands of malicious emails daily, and only one needs to succeed.\n\nCommon Email Attacks:\n\nMalicious Attachments - Documents with embedded macros, executable files disguised as PDFs, or archive files containing malware.\n\nMalicious Links - URLs leading to credential harvesting sites, malware downloads, or exploit kits.\n\nBusiness Email Compromise - Impersonating executives or vendors to redirect payments or steal data.\n\nAccount Takeover - Using stolen credentials to send malicious emails from legitimate internal accounts, bypassing external email filters.\n\nEmail Spoofing - Forging the sender address to appear as a trusted source." },
        { title: "Secure Email Handling Procedures", description: "Daily practices for secure email communication", type: LessonType.INTERACTIVE, durationMins: 8, order: 2,
          content: "Before Opening: Check sender address (full address, not just display name). Is this expected? Does the tone match the supposed sender?\n\nAttachment Safety:\n- Never open attachments from unknown senders\n- Be suspicious of unexpected attachments even from known contacts\n- Never enable macros unless verified with the sender through a separate channel\n- Use your organization's file sharing platform instead of email for large files\n\nLink Safety:\n- Hover before clicking to see the actual URL\n- When in doubt, navigate to the website directly instead of clicking the link\n- Be especially careful with shortened URLs\n\nPreventing Data Leakage:\n- Double-check recipients before sending sensitive information\n- Use BCC for large distribution lists\n- Never forward internal emails to personal accounts\n- Use classification labels (Confidential, Internal, Public)\n- Set up email rules to flag external recipients\n\nEncryption: Use email encryption for sensitive data. Your organization may have tools like S/MIME or PGP." },
        { title: "Email Security for Sensitive Communications", description: "Protecting confidential information in email", type: LessonType.READING, durationMins: 5, order: 3,
          content: "Sensitive Email Best Practices:\n\nClassify Before Sending - Determine if the information should be shared via email at all. Some data requires encrypted channels or in-person delivery.\n\nEncryption Options:\n- TLS (Transport Layer Security) - Encrypts email in transit. Most organizations have this by default.\n- S/MIME or PGP - End-to-end encryption. The content is encrypted so only the intended recipient can read it.\n- Encrypted file sharing - Upload to secure platforms and share links instead of attaching files.\n\nDigital Signatures - Verify that emails have not been tampered with and confirm the sender's identity.\n\nRetention and Deletion:\n- Follow your organization's email retention policy\n- Delete sensitive emails after they are no longer needed\n- Empty deleted items regularly\n- Remember that emails may be backed up and discoverable in legal proceedings" }
      ]
    },
    {
      title: "Malware & Ransomware Awareness",
      description: "Understand the types of malware threatening organizations and learn practical defense strategies against ransomware and other malicious software.",
      category: ModuleCategory.MALWARE, difficulty: Difficulty.INTERMEDIATE, durationMins: 25, order: 7,
      keyTakeaways: ["Identify different types of malware and their behaviors", "Recognize ransomware warning signs", "Implement practical defense measures", "Know what to do if you suspect an infection"],
      realExamples: ["WannaCry ransomware affected 200,000 computers across 150 countries in 2017", "NotPetya caused $10 billion in global damages", "Colonial Pipeline paid $4.4M ransom after ransomware shut down fuel distribution"],
      lessons: [
        { title: "Types of Malware Explained", description: "Understanding viruses, trojans, ransomware, spyware and more", type: LessonType.READING, durationMins: 8, order: 1,
          content: "Malware is any software designed to harm, exploit, or compromise computer systems.\n\nViruses - Attach to legitimate programs and spread when executed. Can corrupt files, slow systems, or create backdoors.\n\nTrojans - Disguised as legitimate software. Once installed, they create backdoors, steal data, or download additional malware.\n\nRansomware - Encrypts your files and demands payment for the decryption key. Modern variants also steal data before encrypting, threatening to publish it (double extortion).\n\nSpyware - Secretly monitors your activities, captures keystrokes, screenshots, and credentials.\n\nWorms - Self-replicating malware that spreads across networks without user action. Can consume bandwidth and crash systems.\n\nRootkits - Hide deep in the operating system to maintain persistent access. Extremely difficult to detect and remove.\n\nFileless Malware - Operates entirely in memory without writing files to disk, evading traditional antivirus. Uses legitimate system tools for malicious purposes." },
        { title: "Ransomware Deep Dive", description: "How ransomware works and why it is so dangerous", type: LessonType.READING, durationMins: 10, order: 2,
          content: "Ransomware Attack Lifecycle:\n\n1. Initial Access - Usually through phishing emails, compromised websites, or exposed remote access (RDP).\n\n2. Establishing Foothold - Malware installs itself and establishes communication with attacker servers.\n\n3. Lateral Movement - Spreads across the network, compromising additional systems and accounts.\n\n4. Data Exfiltration - Modern ransomware steals sensitive data before encryption for double extortion.\n\n5. Encryption - Files are encrypted with strong algorithms. Ransom notes appear demanding payment in cryptocurrency.\n\n6. Extortion - Attackers threaten to publish stolen data if ransom is not paid.\n\nWhy Ransomware Succeeds:\n- Organizations lack proper backups\n- Unpatched systems provide easy entry\n- Employees fall for phishing emails\n- Weak or reused passwords\n- Insufficient network segmentation\n\nPrevention:\n- Maintain offline backups tested regularly\n- Keep all systems patched and updated\n- Implement email filtering and web proxies\n- Use endpoint detection and response (EDR) tools\n- Practice least privilege access\n- Conduct regular security awareness training" },
        { title: "Responding to Malware Infections", description: "What to do if you suspect your device is infected", type: LessonType.READING, durationMins: 7, order: 3,
          content: "Signs of Infection:\n- Unusual system slowness\n- Unexpected pop-ups or programs\n- Files that cannot be opened or have changed extensions\n- Antivirus alerts or disabled security software\n- Unusual network traffic or high bandwidth usage\n- Programs launching without your action\n\nImmediate Response:\n1. DISCONNECT from the network immediately (unplug Ethernet, disable WiFi)\n2. DO NOT shut down the computer (forensic evidence may be in memory)\n3. CONTACT IT Security immediately\n4. NOTE what you were doing when symptoms appeared\n5. DO NOT try to fix it yourself\n\nDo Not:\n- Do not pay ransoms - there is no guarantee of recovery\n- Do not delete files or reinstall software\n- Do not connect USB drives or external storage\n- Do not use the infected device for any purpose\n\nPrevention Habits:\n- Keep antivirus updated and running\n- Do not disable security software\n- Avoid downloading from untrusted sources\n- Be cautious with email attachments\n- Keep systems and applications patched" }
      ]
    },
    {
      title: "Removable Media & USB Security",
      description: "Understand the risks of USB drives, external storage, and removable media. Learn safe handling practices to prevent malware infections.",
      category: ModuleCategory.DATA_PROTECTION, difficulty: Difficulty.BEGINNER, durationMins: 15, order: 8,
      keyTakeaways: ["Never insert unknown USB devices into your computer", "Understand autorun attacks and BadUSB threats", "Follow proper procedures for transferring data", "Use encrypted USB drives for sensitive data"],
      realExamples: ["Stuxnet worm targeting Iran nuclear facilities spread via USB drives", "US military banned USB drives after malware compromised classified networks", "Researchers dropped USB drives in parking lots and 48% were plugged in by employees"],
      lessons: [
        { title: "USB and Removable Media Threats", description: "How attackers weaponize physical storage devices", type: LessonType.READING, durationMins: 8, order: 1,
          content: "USB drives are one of the most effective physical attack vectors because they exploit human curiosity and trust.\n\nAutoRun Malware - USB drives configured to automatically execute malware when plugged in. Modern operating systems have mitigations but they are not foolproof.\n\nBadUSB - Modified USB firmware that makes the drive impersonate a keyboard and type malicious commands. Appears as a normal USB drive but can execute any command on your computer.\n\nData Exfiltration - Small USB drives can quickly copy gigabytes of sensitive data. An insider or attacker with brief physical access can steal massive amounts of information.\n\nUSB Drop Attacks - Attackers deliberately leave infected USB drives in parking lots, lobbies, and common areas. Labels like 'Salary Information' or 'Confidential' increase the chance someone will plug them in.\n\nRules:\n1. Never insert a USB drive you found or received unexpectedly\n2. Only use company-approved encrypted USB drives\n3. Scan all removable media before opening files\n4. Report found USB drives to IT security\n5. Use secure file sharing instead of USB whenever possible" },
        { title: "Safe Data Transfer Practices", description: "Approved methods for moving data securely", type: LessonType.INTERACTIVE, durationMins: 7, order: 2,
          content: "Preferred Data Transfer Methods (Ranked by Security):\n\n1. Organization's cloud platform (SharePoint, Google Drive, approved services) - Encrypted, logged, access-controlled\n2. Encrypted email attachments - For smaller files within the organization\n3. Secure file transfer protocol (SFTP) - For large files or automated transfers\n4. Encrypted USB drives (organization-approved) - When network transfer is not possible\n\nIf You Must Use USB:\n- Only use encrypted, organization-approved drives\n- Scan the drive with antivirus before and after use\n- Transfer files and safely eject the drive immediately\n- Do not leave USB drives unattended\n- Never use personal USB drives for work data\n- Wipe the drive securely after the transfer is complete\n\nFor Charging Only:\n- Use charge-only USB cables (no data pins)\n- Avoid public USB charging stations (juice jacking risk)\n- Use a USB data blocker dongle if you must charge from unknown ports" }
      ]
    },
    {
      title: "Mobile Device Security",
      description: "Secure your smartphones and tablets against modern mobile threats. Covers app security, device configuration, and safe mobile work practices.",
      category: ModuleCategory.MOBILE, difficulty: Difficulty.INTERMEDIATE, durationMins: 20, order: 9,
      keyTakeaways: ["Configure device security settings properly", "Identify and avoid malicious mobile apps", "Separate personal and work data on devices", "Respond appropriately to lost or stolen devices"],
      realExamples: ["Pegasus spyware infected phones of journalists and politicians worldwide", "FluBot banking trojan spread via SMS to millions of Android devices", "App store malware disguised as QR code readers and PDF converters infected 300K devices"],
      lessons: [
        { title: "Mobile Threat Landscape", description: "Understanding threats targeting smartphones and tablets", type: LessonType.READING, durationMins: 7, order: 1,
          content: "Your smartphone contains more personal and work data than most computers. It is always connected, always with you, and increasingly targeted.\n\nMobile Threats:\n\nMalicious Apps - Apps that appear legitimate but contain malware, spyware, or adware. Even official app stores occasionally host malicious apps.\n\nSMS Phishing (Smishing) - Text messages with malicious links. Package delivery scams, bank alerts, and prize notifications are common lures.\n\nRogue WiFi Networks - Fake hotspots that intercept your traffic. 'Free Airport WiFi' or 'Starbucks Guest' may not be what they seem.\n\nDevice Theft - Physical theft gives attackers access to email, banking apps, corporate data, and authentication apps.\n\nOutdated Software - Unpatched devices are vulnerable to known exploits. Manufacturers eventually stop providing updates.\n\nJailbreaking/Rooting - Removing security restrictions makes devices significantly more vulnerable to malware." },
        { title: "Securing Your Mobile Device", description: "Essential configuration and usage practices", type: LessonType.INTERACTIVE, durationMins: 8, order: 2,
          content: "Essential Mobile Security Settings:\n\n1. Strong Lock Screen - Use biometrics plus a 6-digit PIN minimum. Avoid pattern locks (easily shoulder surfed).\n\n2. Enable Auto-Updates - Keep operating system and apps updated automatically.\n\n3. Enable Find My Device - iOS: Find My iPhone. Android: Find My Device. Allows remote locate, lock, and wipe.\n\n4. Enable Full-Device Encryption - Most modern phones encrypt by default when a lock screen is set.\n\n5. Review App Permissions - Regularly audit which apps have access to camera, microphone, location, contacts, and storage.\n\nApp Security:\n- Only install from official stores (App Store, Google Play)\n- Check reviews and download counts before installing\n- Remove apps you no longer use\n- Be suspicious of apps requesting excessive permissions\n- Do not sideload apps from unknown sources\n\nIf Your Device Is Lost or Stolen:\n1. Use Find My Device to locate and lock it immediately\n2. Change passwords for email and critical accounts\n3. Notify IT security if it contains work data\n4. Remote wipe if recovery is unlikely\n5. Report to your mobile carrier to disable the SIM" },
        { title: "BYOD and Mobile Work Security", description: "Safely using personal devices for work", type: LessonType.READING, durationMins: 5, order: 3,
          content: "Bring Your Own Device (BYOD) Considerations:\n\nSeparate Work and Personal:\n- Use work profiles or containers (Android Work Profile, iOS managed apps)\n- Do not mix personal and work accounts in the same apps\n- Use your organization's approved apps for work communication\n\nConnectivity:\n- Always use VPN when accessing work resources remotely\n- Avoid conducting work on public WiFi without VPN\n- Disable auto-join for WiFi networks\n- Turn off Bluetooth when not in use\n\nData Protection:\n- Do not store sensitive work data locally unless required\n- Use organization-approved cloud storage\n- Enable screen lock timeout (30 seconds or less)\n- Do not screenshot or photograph sensitive work information\n\nLeaving the Organization:\n- IT must be able to remove work data from your personal device\n- Understand your organization's BYOD policy before enrolling\n- Cooperate with IT during offboarding for data removal" }
      ]
    },
    {
      title: "Remote Work Security",
      description: "Maintain strong security practices while working from home or public locations. Covers VPN usage, home network security, and physical workspace protection.",
      category: ModuleCategory.NETWORK, difficulty: Difficulty.INTERMEDIATE, durationMins: 20, order: 10,
      keyTakeaways: ["Secure your home network and WiFi", "Use VPN for all work connections", "Maintain physical security of your workspace", "Follow clean desk policy at home"],
      realExamples: ["Remote work during COVID-19 led to a 600% increase in cyberattacks", "A remote worker's compromised home router led to a corporate breach", "Video call bombing disrupted sensitive business meetings"],
      lessons: [
        { title: "Home Network Security", description: "Securing your home internet for work use", type: LessonType.READING, durationMins: 7, order: 1,
          content: "Your home network is now an extension of your corporate network. Securing it is essential.\n\nWiFi Security:\n1. Change default router admin credentials immediately\n2. Use WPA3 or WPA2 encryption (never WEP)\n3. Create a strong WiFi password (16+ characters)\n4. Disable WPS (WiFi Protected Setup) - it has known vulnerabilities\n5. Consider a separate network for work devices\n\nRouter Configuration:\n- Update router firmware regularly\n- Disable remote management\n- Change default SSID (network name)\n- Enable the router's built-in firewall\n- Disable UPnP unless specifically needed\n\nNetwork Hygiene:\n- Keep IoT devices (smart speakers, cameras, TVs) on a separate network\n- Regularly check connected devices and remove unknown ones\n- Consider using DNS-level filtering for additional protection" },
        { title: "VPN and Secure Connections", description: "Using VPN and encrypted connections for remote work", type: LessonType.INTERACTIVE, durationMins: 7, order: 2,
          content: "Always Use VPN for Work:\n\nA VPN (Virtual Private Network) creates an encrypted tunnel between your device and your organization's network. All work traffic should flow through the VPN.\n\nVPN Best Practices:\n- Connect to VPN before accessing any work resources\n- Use only your organization's approved VPN client\n- Do not use personal VPN services for work\n- If VPN disconnects, stop work activity until reconnected\n- Report VPN connection issues to IT support\n\nVideo Conferencing Security:\n- Use organization-approved platforms only\n- Enable waiting rooms and meeting passwords\n- Do not share meeting links publicly\n- Lock meetings after all participants join\n- Be aware of what is visible in your camera background\n- Use virtual backgrounds when in public spaces\n\nFile Sharing:\n- Use organization-approved platforms only\n- Do not email sensitive documents to personal accounts\n- Do not use personal cloud storage for work files" },
        { title: "Physical Workspace Security at Home", description: "Protecting your physical remote work environment", type: LessonType.READING, durationMins: 6, order: 3,
          content: "Physical security applies at home too.\n\nWorkspace Setup:\n- Position screen away from windows and common areas\n- Use a privacy screen filter on your monitor\n- Lock your computer when stepping away (Win+L or Cmd+Ctrl+Q)\n- Close and lock your laptop at the end of each workday\n\nDocument Security:\n- Shred sensitive documents - do not put them in regular recycling\n- Do not leave printed documents unattended\n- Store work documents in a locked drawer or cabinet\n\nDevice Security:\n- Keep work devices in a secure location when not in use\n- Do not let family members use work devices\n- Do not connect personal devices to work computers\n- Keep work devices physically separate from personal devices\n\nConversation Security:\n- Be aware of who can hear your calls\n- Use headphones for sensitive discussions\n- Do not discuss sensitive work topics in public spaces\n- Mute when not speaking in video calls" }
      ]
    },
    {
      title: "Data Classification & Handling",
      description: "Learn to properly classify, handle, store, and dispose of sensitive information according to organizational policies and regulatory requirements.",
      category: ModuleCategory.DATA_PROTECTION, difficulty: Difficulty.INTERMEDIATE, durationMins: 25, order: 11,
      keyTakeaways: ["Classify data into appropriate sensitivity levels", "Apply correct handling procedures per classification", "Understand regulatory requirements like GDPR and HIPAA", "Properly dispose of sensitive information"],
      realExamples: ["Equifax breach exposed 147M records due to poor data handling practices", "GDPR fines exceeded 4 billion euros since enforcement began", "Capital One breach of 100M records from misconfigured cloud storage"],
      lessons: [
        { title: "Data Classification Framework", description: "Understanding sensitivity levels and classification criteria", type: LessonType.READING, durationMins: 8, order: 1,
          content: "Data classification organizes information by sensitivity level to determine appropriate protection measures.\n\nClassification Levels:\n\n1. Public - Information approved for external sharing. Annual reports, marketing materials, press releases. No special handling required.\n\n2. Internal - For internal use only. Meeting notes, internal policies, organizational charts. Should not be shared externally without approval.\n\n3. Confidential - Sensitive business information. Financial data, strategic plans, employee records, customer contracts. Access restricted to authorized personnel with a business need.\n\n4. Restricted - Highest sensitivity. Trade secrets, encryption keys, authentication credentials, regulated personal data (health records, financial account numbers). Strictest access controls and encryption required.\n\nClassification Criteria:\n- What would happen if this data was leaked?\n- Is this data subject to regulations (GDPR, HIPAA, PCI-DSS)?\n- Does this data contain personally identifiable information (PII)?\n- What is the financial impact of unauthorized disclosure?" },
        { title: "Handling Sensitive Data", description: "Proper procedures for working with classified information", type: LessonType.INTERACTIVE, durationMins: 10, order: 2,
          content: "Handling Requirements by Classification:\n\nConfidential Data:\n- Encrypt at rest and in transit\n- Share only through approved channels\n- Apply access controls (need-to-know basis)\n- Label documents clearly with classification markings\n- Use secure printing (pull printing)\n- Lock screens when stepping away\n\nRestricted Data:\n- All confidential requirements plus additional controls\n- Multi-factor authentication required for access\n- Encrypted storage with key management\n- Audit logging of all access\n- No storage on personal devices\n- Approval required for each access grant\n\nEmail and Messaging:\n- Check classification before sending\n- Never send restricted data via unencrypted email\n- Verify recipients before clicking send\n- Use approved encrypted channels for confidential data\n- Be cautious of auto-complete filling in wrong recipients\n\nCloud Storage:\n- Use only organization-approved cloud services\n- Never upload restricted data to personal cloud accounts\n- Verify sharing permissions and link expiration settings" },
        { title: "Data Disposal and Retention", description: "Securely destroying data when no longer needed", type: LessonType.READING, durationMins: 7, order: 3,
          content: "Improper data disposal is a leading cause of data breaches. Deleted does not mean destroyed.\n\nDigital Data Disposal:\n- Standard file deletion only removes the directory entry, data remains recoverable\n- Use secure deletion tools that overwrite data multiple times\n- For SSDs, use manufacturer-provided secure erase commands\n- Encrypt drives before disposal so even recovered data is unreadable\n- Destroy drives physically for restricted data (degaussing, shredding)\n\nPhysical Document Disposal:\n- Cross-cut shred all confidential and restricted documents\n- Use locked shredding bins for collection\n- Never place sensitive documents in regular recycling\n- Monitor shredding service providers\n\nRetention Policies:\n- Retain data only as long as required by policy and regulations\n- Review stored data regularly and purge expired items\n- Document retention periods for different data types\n- Automated deletion policies reduce human error\n\nRegulatory Requirements:\n- GDPR: Right to erasure, data minimization, purpose limitation\n- HIPAA: Specific retention and destruction requirements for health data\n- PCI-DSS: Do not store sensitive authentication data after authorization" }
      ]
    },
    {
      title: "Incident Reporting & Response",
      description: "Know how to identify, report, and respond to security incidents. Quick reporting minimizes damage and helps protect the entire organization.",
      category: ModuleCategory.COMPLIANCE, difficulty: Difficulty.BEGINNER, durationMins: 15, order: 12,
      keyTakeaways: ["Recognize what constitutes a security incident", "Follow proper reporting procedures", "Understand your role in incident response", "Preserve evidence and cooperate with responders"],
      realExamples: ["Target breach was detected by security tools but alerts were ignored for weeks", "SolarWinds supply chain attack went undetected for 9 months", "Early reporting at Maersk limited NotPetya damage despite losing entire network"],
      lessons: [
        { title: "Recognizing Security Incidents", description: "What counts as a security incident and warning signs", type: LessonType.READING, durationMins: 5, order: 1,
          content: "A security incident is any event that potentially compromises the confidentiality, integrity, or availability of information or systems.\n\nCommon Incidents:\n- Phishing emails received or clicked\n- Malware detected on devices\n- Unauthorized access to accounts or systems\n- Lost or stolen devices containing work data\n- Accidental data exposure (wrong email recipient, public file share)\n- Suspicious system behavior (unexpected software, unusual network activity)\n- Physical security breaches (unauthorized access to secure areas)\n- Social engineering attempts (suspicious phone calls, impersonation)\n\nWarning Signs:\n- Security software alerts or disabled antivirus\n- Unexpected password reset emails\n- Accounts locked out without your action\n- Colleagues receiving suspicious emails that appear to come from you\n- Unexpected system changes or new programs installed\n- Files that are encrypted, modified, or missing\n\nWhen in doubt, REPORT IT. False alarms are far better than unreported incidents." },
        { title: "How to Report Security Incidents", description: "Step-by-step reporting procedures", type: LessonType.INTERACTIVE, durationMins: 5, order: 2,
          content: "Immediate Steps:\n1. Stop and assess - Do not continue the activity that triggered the incident\n2. Do not try to fix it yourself - You may destroy evidence or worsen the situation\n3. Report immediately - Time is critical in incident response\n\nReporting Channels (in order of preference):\n1. IT Security hotline or dedicated incident reporting email\n2. Your direct manager plus IT department\n3. Help desk as a last resort\n\nInformation to Provide:\n- Date and time of the incident\n- What happened (what you observed)\n- What actions you took\n- Systems or data affected\n- Whether you clicked any links or opened attachments\n- Any other people involved or aware\n\nPreserve Evidence:\n- Do not delete emails, files, or logs related to the incident\n- Take screenshots if possible\n- Note any error messages exactly as displayed\n- Keep the device powered on (unless instructed otherwise)\n- Do not discuss the incident on social media\n\nAfter Reporting:\n- Follow instructions from the incident response team\n- Remain available for follow-up questions\n- Change passwords if instructed\n- Do not discuss details outside the response team" },
        { title: "Your Role in Incident Response", description: "Understanding the incident lifecycle and your responsibilities", type: LessonType.READING, durationMins: 5, order: 3,
          content: "The Incident Response Lifecycle:\n\n1. Detection and Reporting - This is YOUR primary role. Quick detection limits damage.\n\n2. Containment - The IR team isolates affected systems to prevent spread. You may be asked to disconnect from the network.\n\n3. Investigation - The IR team determines scope, cause, and impact. Cooperate fully and provide accurate information.\n\n4. Eradication - Remove the threat from all affected systems.\n\n5. Recovery - Restore systems and data from clean backups. Verify integrity before returning to normal operations.\n\n6. Lessons Learned - Review what happened and improve defenses. Your feedback is valuable.\n\nYour Responsibilities:\n- Report promptly and honestly\n- Follow instructions from the IR team\n- Do not attempt unauthorized investigation\n- Maintain confidentiality about the incident\n- Participate in post-incident reviews\n- Apply lessons learned to prevent future incidents\n\nOrganizational Culture: A strong security culture rewards reporting, not punishes it. Even if you made a mistake, reporting quickly limits damage and is always the right action." }
      ]
    },
    {
      title: "Physical Security & Tailgating Prevention",
      description: "Protect physical assets and prevent unauthorized access to facilities. Covers access control, clean desk policy, and visitor management.",
      category: ModuleCategory.SOCIAL_ENGINEERING, difficulty: Difficulty.BEGINNER, durationMins: 15, order: 13,
      keyTakeaways: ["Never hold doors open for unverified individuals", "Follow clean desk policies consistently", "Challenge unknown visitors politely", "Report physical security concerns immediately"],
      realExamples: ["Pentesters gained access to a bank vault room by tailgating employees", "A journalist accessed secure government areas by following staff through doors", "Stolen laptops from offices account for significant data breaches annually"],
      lessons: [
        { title: "Facility Access Control", description: "Preventing unauthorized physical access", type: LessonType.READING, durationMins: 5, order: 1,
          content: "Physical security is the foundation of information security. If an attacker can physically access your systems, most digital protections become irrelevant.\n\nTailgating Prevention:\n- Never hold doors open for people you do not recognize\n- Politely ask unknown individuals to badge in separately\n- Report doors that do not close or lock properly\n- Use mantrap doors in high-security areas\n\nBadge Security:\n- Always wear your badge visibly\n- Never lend your badge to anyone\n- Report lost or stolen badges immediately\n- Do not use another person's badge\n- Challenge individuals without visible badges\n\nVisitor Management:\n- All visitors must sign in at reception\n- Visitors must be escorted at all times in secure areas\n- Verify visitor identity and appointment\n- Ensure visitors sign out when leaving\n\nHow to Challenge Someone Politely:\n- 'Hi, can I help you find someone?'\n- 'I do not think we have met. Who are you here to see?'\n- 'Let me walk you to reception so they can help you.'" },
        { title: "Clean Desk and Secure Workspace", description: "Maintaining a physically secure work environment", type: LessonType.INTERACTIVE, durationMins: 5, order: 2,
          content: "Clean Desk Policy:\n\nBefore Leaving Your Desk:\n- Lock your computer (Win+L or Cmd+Ctrl+Q)\n- Put sensitive documents in locked drawers\n- Clear whiteboards of sensitive information\n- Remove sticky notes with passwords or sensitive information\n- Secure portable devices\n\nEnd of Day:\n- All sensitive documents locked away\n- Computer shut down or locked\n- Desk cleared of sensitive materials\n- Portable devices taken with you or locked in a cabinet\n\nPrinting Security:\n- Use pull printing (badge to release at printer)\n- Collect printouts immediately\n- Shred documents you no longer need\n- Never leave documents in printer trays\n\nMeeting Room Security:\n- Clear whiteboards after meetings\n- Collect all documents and materials\n- Check the room after video conferences\n- Ensure screens are not visible from windows or corridors" }
      ]
    },
    {
      title: "Public WiFi & Network Safety",
      description: "Understand the dangers of public WiFi networks and learn to protect your data when connecting outside the office.",
      category: ModuleCategory.NETWORK, difficulty: Difficulty.BEGINNER, durationMins: 15, order: 14,
      keyTakeaways: ["Never access sensitive accounts on public WiFi without VPN", "Identify rogue WiFi networks", "Use mobile hotspot as a safer alternative", "Understand man-in-the-middle attacks"],
      realExamples: ["Researchers at Black Hat created fake WiFi hotspots and harvested credentials from thousands of attendees", "Evil twin attacks at airports intercepted business email credentials", "A major hotel chain WiFi was compromised to spy on executive guests"],
      lessons: [
        { title: "Public WiFi Threats", description: "Understanding why public WiFi is dangerous", type: LessonType.READING, durationMins: 5, order: 1,
          content: "Public WiFi networks at airports, hotels, cafes, and conferences are inherently insecure. Anyone on the same network can potentially intercept your traffic.\n\nCommon Attacks:\n\nEvil Twin - An attacker creates a WiFi network with the same name as a legitimate one. Your device connects to the fake network, routing all traffic through the attacker.\n\nMan-in-the-Middle - The attacker intercepts communication between you and the website or service. They can read, modify, or inject content into your traffic.\n\nPacket Sniffing - On unencrypted networks, attackers can capture all data transmitted including credentials, emails, and documents.\n\nSession Hijacking - Attackers steal your authentication cookies to access your accounts without needing your password.\n\nRogue Hotspots - Fake networks named 'Free WiFi' or mimicking nearby businesses to lure connections.\n\nThe Rule: Assume all public WiFi is compromised. Act accordingly." },
        { title: "Staying Safe on Public Networks", description: "Practical protection strategies for public connectivity", type: LessonType.INTERACTIVE, durationMins: 5, order: 2,
          content: "Protection Strategies (Ranked by Effectiveness):\n\n1. Use Your Mobile Hotspot (Best) - Your cellular data connection is encrypted and private. Use your phone as a hotspot for your laptop.\n\n2. Always Use VPN - Encrypts all traffic between your device and the VPN server. Even on compromised networks, your data remains protected.\n\n3. Verify HTTPS - Only visit sites with HTTPS when on public WiFi. Never enter credentials on HTTP sites.\n\n4. Forget Networks After Use - Disable auto-join. Remove public networks from your saved networks list.\n\n5. Disable Sharing - Turn off file sharing, AirDrop, and printer sharing when on public networks.\n\nDo Not:\n- Access banking or financial accounts on public WiFi\n- Log into work accounts without VPN\n- Make purchases or enter credit card details\n- Access sensitive company data or email\n- Leave WiFi and Bluetooth on when not in use\n\nAdditional Tips:\n- Use cellular data for sensitive transactions\n- Verify the exact network name with staff before connecting\n- Use DNS-over-HTTPS for additional protection\n- Consider a portable travel router with built-in VPN" },
        { title: "Securing Your Connections Everywhere", description: "Comprehensive network safety beyond WiFi", type: LessonType.READING, durationMins: 5, order: 3,
          content: "Network Security Beyond WiFi:\n\nBluetooth Security:\n- Disable Bluetooth when not actively using it\n- Do not accept pairing requests from unknown devices\n- Use Bluetooth in non-discoverable mode\n- Be cautious of Bluetooth in crowded public spaces\n\nCharging Security:\n- Avoid public USB charging stations (juice jacking risk)\n- Use your own charger and wall outlet\n- Carry a portable power bank\n- Use data-blocking USB cables if you must use public ports\n\nTravel Security:\n- Use VPN on all hotel WiFi\n- Do not use hotel business center computers for sensitive tasks\n- Keep devices physically secure in hotel safes\n- Be aware of shoulder surfing in airports and lounges\n- Use privacy screen filters on laptops and phones\n\nConference and Event Security:\n- Be cautious of shared conference WiFi\n- Do not connect to unnamed or suspicious networks\n- Disable wireless features you do not need\n- Be aware that attackers target industry events" }
      ]
    },
    {
      title: "Insider Threat Awareness",
      description: "Recognize and respond to insider threats from employees, contractors, or partners who may intentionally or accidentally compromise security.",
      category: ModuleCategory.SOCIAL_ENGINEERING, difficulty: Difficulty.ADVANCED, durationMins: 25, order: 15,
      keyTakeaways: ["Recognize behavioral indicators of insider threats", "Understand both malicious and negligent insider risks", "Report concerns through appropriate channels", "Follow least privilege and need-to-know principles"],
      realExamples: ["Edward Snowden exfiltrated classified NSA documents as a contractor", "Tesla employee sabotaged manufacturing systems after being denied a promotion", "A disgruntled IT admin deleted critical databases before leaving the company"],
      lessons: [
        { title: "Understanding Insider Threats", description: "Types of insider threats and their motivations", type: LessonType.READING, durationMins: 8, order: 1,
          content: "An insider threat is a security risk originating from within the organization. Insiders have legitimate access, making their actions harder to detect.\n\nTypes of Insider Threats:\n\n1. Malicious Insiders - Deliberately steal data, sabotage systems, or aid external attackers. Motivated by financial gain, revenge, ideology, or coercion.\n\n2. Negligent Insiders - Cause breaches through carelessness. Falling for phishing, mishandling data, ignoring security policies. This is the most common type.\n\n3. Compromised Insiders - Their credentials or devices are taken over by external attackers through phishing, malware, or social engineering.\n\nWhy Insider Threats Are Dangerous:\n- Insiders already have authorized access\n- They know where sensitive data is stored\n- They understand security controls and how to bypass them\n- Their activities may appear normal\n- Detection can take months or years\n\nStatistics:\n- 60% of data breaches involve insiders\n- Average insider incident costs $15.4 million\n- Mean time to detect an insider threat is 85 days" },
        { title: "Recognizing Warning Signs", description: "Behavioral and technical indicators of insider threats", type: LessonType.READING, durationMins: 10, order: 2,
          content: "Behavioral Indicators:\n- Unexplained changes in work habits or attitude\n- Working unusual hours without clear reason\n- Expressing dissatisfaction or grievances repeatedly\n- Financial difficulties or unexplained wealth\n- Resistance to security policies or access restrictions\n- Attempting to access systems or data outside their role\n- Frequent policy violations\n\nTechnical Indicators:\n- Downloading large amounts of data, especially before leaving\n- Accessing systems at unusual times\n- Using unauthorized storage devices or cloud services\n- Attempting to bypass security controls\n- Installing unauthorized software\n- Sending sensitive data to personal email accounts\n- Multiple failed access attempts to restricted systems\n\nImportant Considerations:\n- No single indicator confirms a threat. Look for patterns.\n- Cultural sensitivity matters. Do not profile based on background.\n- Some behaviors have innocent explanations.\n- Report concerns through proper channels. Do not investigate yourself.\n- Early intervention and support can prevent incidents." },
        { title: "Preventing and Reporting Insider Threats", description: "Organizational and personal prevention strategies", type: LessonType.READING, durationMins: 7, order: 3,
          content: "Personal Prevention:\n- Follow least privilege. Only access what you need for your role.\n- Protect your credentials. Never share passwords or badges.\n- Report suspicious behavior through proper channels.\n- Support colleagues who may be struggling.\n- Follow all security policies consistently.\n\nReporting:\n- Use your organization's anonymous reporting hotline\n- Speak to your manager or HR confidentially\n- Contact the security team directly if urgent\n- Document specific observations (dates, times, actions)\n- Do not confront the individual directly\n- Do not discuss your concerns with other colleagues\n\nOrganizational Defenses:\n- Role-based access control with regular reviews\n- User activity monitoring on sensitive systems\n- Data loss prevention (DLP) tools\n- Mandatory security training and policy acknowledgment\n- Exit procedures including access revocation\n- Positive workplace culture that reduces motivation for malicious acts\n- Employee assistance programs for those facing difficulties\n\nRemember: Reporting is not about distrust. It is about protecting everyone in the organization including the person whose behavior concerns you." }
      ]
    },
  ];

  // Create modules and lessons in DB
  const createdModules = [];
  for (const mod of modulesData) {
    const module = await prisma.module.create({
      data: {
        title: mod.title,
        description: mod.description,
        category: mod.category,
        difficulty: mod.difficulty,
        durationMins: mod.durationMins,
        order: mod.order,
        isPublished: true,
        organizationId: organization.id,
        isGlobal: true,
      }
    });
    for (const les of mod.lessons) {
      await prisma.lesson.create({
        data: {
          title: les.title,
          description: les.description,
          type: les.type,
          durationMins: les.durationMins,
          order: les.order,
          content: les.content,
          moduleId: module.id,
        }
      });
    }
    createdModules.push(module);
  }
  console.log("Created " + createdModules.length + " modules with lessons");

  // =============================================
  // QUIZZES WITH REAL QUESTIONS
  // =============================================
  interface OptionInput { text: string; isCorrect: boolean; }
  interface QuestionInput { text: string; explanation: string; options: OptionInput[]; }
  interface QuizInput { title: string; description: string; category: ModuleCategory; difficulty: Difficulty; passingScore: number; timeLimitMins: number; moduleIndex: number; questions: QuestionInput[]; }

  const quizzesData: QuizInput[] = [
    {
      title: "Phishing Detection Assessment",
      description: "Test your ability to identify and respond to phishing attacks across email, SMS, and voice channels.",
      category: ModuleCategory.PHISHING, difficulty: Difficulty.BEGINNER, passingScore: 70, timeLimitMins: 15, moduleIndex: 0,
      questions: [
        { text: "You receive an email from 'IT-Support@yourcompany.securityupdate.com' asking you to verify your credentials. What should you do?", explanation: "The domain 'securityupdate.com' is not your company's domain. The real IT department would use your company's official domain. This is a phishing attempt using a subdomain trick.", options: [
          { text: "Click the link since it mentions your company name", isCorrect: false },
          { text: "Reply asking if it is legitimate", isCorrect: false },
          { text: "Report it as phishing - the sender domain is suspicious", isCorrect: true },
          { text: "Forward it to colleagues to check", isCorrect: false },
        ]},
        { text: "Which of the following is the MOST reliable indicator of a phishing email?", explanation: "While all can be indicators, checking the actual sender email address (not just the display name) is the most reliable first check. Display names can be easily spoofed.", options: [
          { text: "The email contains a company logo", isCorrect: false },
          { text: "The sender's full email address does not match the claimed organization", isCorrect: true },
          { text: "The email was received during business hours", isCorrect: false },
          { text: "The email is written in formal language", isCorrect: false },
        ]},
        { text: "You receive a text message saying your bank account has been locked and you must click a link immediately. What is the best action?", explanation: "Banks will never ask you to click links in text messages for account issues. Always contact your bank directly through their official app or phone number.", options: [
          { text: "Click the link to check your account status", isCorrect: false },
          { text: "Call the number provided in the text message", isCorrect: false },
          { text: "Ignore the text and contact your bank through official channels", isCorrect: true },
          { text: "Reply STOP to unsubscribe", isCorrect: false },
        ]},
        { text: "A phishing email creates urgency by saying your account will be deleted in 24 hours. This technique exploits which psychological principle?", explanation: "Creating artificial time pressure is a scarcity/urgency tactic that bypasses rational thinking and pushes victims to act without verification.", options: [
          { text: "Authority", isCorrect: false },
          { text: "Reciprocity", isCorrect: false },
          { text: "Social proof", isCorrect: false },
          { text: "Urgency and scarcity", isCorrect: true },
        ]},
        { text: "You accidentally clicked a link in a suspicious email. The page looks like your company login. What should you do FIRST?", explanation: "If you clicked a phishing link but have not entered credentials, close the page immediately and report to IT. Do not enter any information on the suspicious page.", options: [
          { text: "Enter your credentials to see if it works", isCorrect: false },
          { text: "Close the page immediately and report to IT security", isCorrect: true },
          { text: "Take a screenshot and post it on social media", isCorrect: false },
          { text: "Ignore it since you only clicked the link", isCorrect: false },
        ]},
        { text: "What is spear phishing?", explanation: "Spear phishing targets specific individuals using personalized information gathered from social media, company websites, or previous breaches to make the attack more convincing.", options: [
          { text: "Mass emails sent to thousands of random recipients", isCorrect: false },
          { text: "Targeted attacks customized for specific individuals using personal information", isCorrect: true },
          { text: "Phone-based phishing attacks", isCorrect: false },
          { text: "Attacks that only target fishing industry employees", isCorrect: false },
        ]},
        { text: "Which attachment type poses the HIGHEST risk when received via email from an unknown sender?", explanation: "Executable files (.exe) can run malicious code directly on your computer when opened. While other file types can contain malware, executables are the most directly dangerous.", options: [
          { text: ".jpg image file", isCorrect: false },
          { text: ".txt text file", isCorrect: false },
          { text: ".exe executable file", isCorrect: true },
          { text: ".pdf document", isCorrect: false },
        ]},
        { text: "Your CEO sends an urgent email from a Gmail address asking you to purchase gift cards. What type of attack is this?", explanation: "Business Email Compromise (BEC) involves impersonating executives to authorize fraudulent transactions. A CEO would never use a personal Gmail for official business requests.", options: [
          { text: "Legitimate executive request", isCorrect: false },
          { text: "Business Email Compromise (BEC)", isCorrect: true },
          { text: "Internal communication", isCorrect: false },
          { text: "Spam email", isCorrect: false },
        ]},
      ]
    },
    {
      title: "Password Security Mastery",
      description: "Evaluate your knowledge of password creation, management, and protection strategies.",
      category: ModuleCategory.PASSWORDS, difficulty: Difficulty.BEGINNER, passingScore: 70, timeLimitMins: 12, moduleIndex: 1,
      questions: [
        { text: "Which password is the STRONGEST?", explanation: "Length is the most important factor in password strength. A long passphrase of random words is much harder to crack than a short complex password.", options: [
          { text: "P@ssw0rd!", isCorrect: false },
          { text: "Correct-Horse-Battery-Staple-7!", isCorrect: true },
          { text: "Admin2024", isCorrect: false },
          { text: "Qwerty123$", isCorrect: false },
        ]},
        { text: "Why is password reuse across multiple services dangerous?", explanation: "When one service is breached, attackers use those credentials on other services (credential stuffing). If you reuse passwords, one breach compromises all your accounts.", options: [
          { text: "It makes passwords easier to forget", isCorrect: false },
          { text: "A breach on one service compromises all accounts using the same password", isCorrect: true },
          { text: "It slows down your computer", isCorrect: false },
          { text: "It is only dangerous if you use simple passwords", isCorrect: false },
        ]},
        { text: "What is the primary benefit of using a password manager?", explanation: "Password managers generate, store, and auto-fill unique complex passwords for every account. You only need to remember one master password.", options: [
          { text: "It makes the internet faster", isCorrect: false },
          { text: "It stores unique strong passwords for every account securely", isCorrect: true },
          { text: "It replaces the need for any passwords", isCorrect: false },
          { text: "It prevents all types of cyberattacks", isCorrect: false },
        ]},
        { text: "How long would it take to crack a 6-character lowercase password using modern hardware?", explanation: "Modern GPUs can test billions of combinations per second. A 6-character lowercase password has only about 300 million combinations, crackable in under 1 second.", options: [
          { text: "Several years", isCorrect: false },
          { text: "A few months", isCorrect: false },
          { text: "Less than 1 second", isCorrect: true },
          { text: "About 1 hour", isCorrect: false },
        ]},
        { text: "Your IT department asks for your password over the phone to fix an issue. What should you do?", explanation: "Legitimate IT departments never need your password. They have administrative access to reset passwords or fix issues without your credentials. This is likely social engineering.", options: [
          { text: "Provide it since they are from IT", isCorrect: false },
          { text: "Refuse and report this as a potential social engineering attempt", isCorrect: true },
          { text: "Give them a fake password to test them", isCorrect: false },
          { text: "Email them your password instead for security", isCorrect: false },
        ]},
        { text: "Which is the BEST practice for your password manager master password?", explanation: "Your master password protects all other passwords, so it must be long (20+ characters), unique, and memorable. A passphrase meets all these criteria.", options: [
          { text: "Use your birthday so you never forget it", isCorrect: false },
          { text: "Write it on a sticky note on your monitor", isCorrect: false },
          { text: "Use a long memorable passphrase of 20+ characters unique to this purpose", isCorrect: true },
          { text: "Use the same password as your email for convenience", isCorrect: false },
        ]},
      ]
    },
    {
      title: "Multi-Factor Authentication Quiz",
      description: "Test your understanding of MFA methods, setup procedures, and security implications.",
      category: ModuleCategory.PASSWORDS, difficulty: Difficulty.BEGINNER, passingScore: 70, timeLimitMins: 10, moduleIndex: 2,
      questions: [
        { text: "Which MFA method provides the STRONGEST protection against phishing?", explanation: "Hardware security keys like YubiKey use cryptographic protocols that verify the actual website domain, making them immune to phishing attacks that redirect to fake sites.", options: [
          { text: "SMS text message codes", isCorrect: false },
          { text: "Email verification codes", isCorrect: false },
          { text: "Hardware security keys (e.g., YubiKey)", isCorrect: true },
          { text: "Security questions", isCorrect: false },
        ]},
        { text: "You receive 15 MFA push notifications you did not initiate. What is happening?", explanation: "MFA fatigue attacks flood you with approval requests hoping you will accidentally approve one. Never approve prompts you did not initiate, and report this immediately.", options: [
          { text: "Your authenticator app is malfunctioning", isCorrect: false },
          { text: "This is an MFA fatigue attack - report it immediately", isCorrect: true },
          { text: "Someone is testing the system", isCorrect: false },
          { text: "Approve one to stop the notifications", isCorrect: false },
        ]},
        { text: "Why is SMS-based MFA considered less secure than authenticator apps?", explanation: "SMS messages can be intercepted through SIM swapping, SS7 protocol vulnerabilities, and social engineering of mobile carrier employees.", options: [
          { text: "SMS codes expire too quickly", isCorrect: false },
          { text: "SMS can be intercepted through SIM swapping and network vulnerabilities", isCorrect: true },
          { text: "SMS codes are too short", isCorrect: false },
          { text: "SMS does not work without internet", isCorrect: false },
        ]},
        { text: "What should you do with MFA backup codes after setting up MFA?", explanation: "Backup codes are your recovery method if you lose your MFA device. Store them securely in your password manager or printed in a physical safe.", options: [
          { text: "Delete them since you have the authenticator app", isCorrect: false },
          { text: "Save them in a text file on your desktop", isCorrect: false },
          { text: "Store them securely in your password manager or a physical safe", isCorrect: true },
          { text: "Share them with a trusted colleague", isCorrect: false },
        ]},
        { text: "Which account should be your HIGHEST priority for enabling MFA?", explanation: "Your email account is the gateway to password resets for virtually all other accounts. If attackers control your email, they can reset passwords everywhere.", options: [
          { text: "Social media accounts", isCorrect: false },
          { text: "Shopping websites", isCorrect: false },
          { text: "Email account", isCorrect: true },
          { text: "Gaming platforms", isCorrect: false },
        ]},
      ]
    },
    {
      title: "Social Engineering Defense Assessment",
      description: "Evaluate your ability to recognize and resist social engineering manipulation techniques.",
      category: ModuleCategory.SOCIAL_ENGINEERING, difficulty: Difficulty.INTERMEDIATE, passingScore: 75, timeLimitMins: 15, moduleIndex: 3,
      questions: [
        { text: "A caller claims to be from your bank's fraud department and knows your name and last four digits of your card. They ask you to verify your full card number. What should you do?", explanation: "Partial information like your name and last four digits can be obtained from previous breaches. Always hang up and call your bank directly using the number on your card.", options: [
          { text: "Provide the information since they already know partial details", isCorrect: false },
          { text: "Hang up and call your bank using the official number on your card", isCorrect: true },
          { text: "Ask them to prove they are from the bank", isCorrect: false },
          { text: "Give a wrong number to test them", isCorrect: false },
        ]},
        { text: "You find a USB drive labeled 'Q4 Salary Adjustments - Confidential' in your office parking lot. What should you do?", explanation: "USB drop attacks use enticing labels to trick people into inserting malicious drives. The curiosity factor makes this attack very effective. Turn it in to security.", options: [
          { text: "Plug it into your computer to find the owner", isCorrect: false },
          { text: "Turn it in to IT security without plugging it in", isCorrect: true },
          { text: "Plug it into a non-networked computer to check", isCorrect: false },
          { text: "Leave it where you found it", isCorrect: false },
        ]},
        { text: "Which psychological principle is exploited when an attacker impersonates your CEO in an email?", explanation: "Authority principle - people tend to comply with requests from authority figures without questioning them. Attackers exploit this by impersonating executives.", options: [
          { text: "Reciprocity", isCorrect: false },
          { text: "Authority", isCorrect: true },
          { text: "Likability", isCorrect: false },
          { text: "Scarcity", isCorrect: false },
        ]},
        { text: "Someone carrying heavy boxes asks you to hold the secure door open. They say they forgot their badge. What is the correct response?", explanation: "This is a classic tailgating scenario. Politely offer to call reception or security to help them. Never compromise physical access controls regardless of the situation.", options: [
          { text: "Hold the door open to be helpful", isCorrect: false },
          { text: "Ask them to set down the boxes and badge in", isCorrect: false },
          { text: "Offer to call reception or security to assist them", isCorrect: true },
          { text: "Ask a colleague to verify them", isCorrect: false },
        ]},
        { text: "What is pretexting in the context of social engineering?", explanation: "Pretexting involves creating a fabricated scenario or identity to manipulate the victim. The attacker builds a believable context to extract information or gain access.", options: [
          { text: "Sending mass spam emails", isCorrect: false },
          { text: "Creating a fabricated scenario to gain trust and extract information", isCorrect: true },
          { text: "Installing malware through USB drives", isCorrect: false },
          { text: "Breaking into buildings at night", isCorrect: false },
        ]},
        { text: "The Pause Principle in social engineering defense recommends asking yourself four questions before acting. Which is NOT one of them?", explanation: "The Pause Principle asks: Was this expected? Can I verify the sender? Is there unusual urgency? Would this be normal through official channels? Technical sophistication of the email is not part of this framework.", options: [
          { text: "Did I expect this communication?", isCorrect: false },
          { text: "Can I independently verify the sender?", isCorrect: false },
          { text: "How technically sophisticated is this email?", isCorrect: true },
          { text: "Is there unusual urgency?", isCorrect: false },
        ]},
      ]
    },
    {
      title: "Malware & Ransomware Knowledge Check",
      description: "Test your understanding of malware types, ransomware tactics, and proper incident response.",
      category: ModuleCategory.MALWARE, difficulty: Difficulty.INTERMEDIATE, passingScore: 75, timeLimitMins: 15, moduleIndex: 6,
      questions: [
        { text: "What distinguishes ransomware from other types of malware?", explanation: "Ransomware specifically encrypts files and demands payment for the decryption key. Modern variants also exfiltrate data for double extortion.", options: [
          { text: "It only targets mobile devices", isCorrect: false },
          { text: "It encrypts your files and demands payment for decryption", isCorrect: true },
          { text: "It always spreads through USB drives", isCorrect: false },
          { text: "It only affects Windows computers", isCorrect: false },
        ]},
        { text: "Your computer suddenly shows a message saying all files are encrypted and you must pay 2 Bitcoin within 48 hours. What is your FIRST action?", explanation: "Disconnecting from the network prevents the ransomware from spreading to other systems and stops data exfiltration. Then contact IT security immediately.", options: [
          { text: "Pay the ransom to recover your files", isCorrect: false },
          { text: "Shut down the computer immediately", isCorrect: false },
          { text: "Disconnect from the network and contact IT security", isCorrect: true },
          { text: "Try to find the ransomware and delete it", isCorrect: false },
        ]},
        { text: "What is fileless malware?", explanation: "Fileless malware operates entirely in memory using legitimate system tools (like PowerShell), leaving no traditional files on disk. This makes it extremely difficult for traditional antivirus to detect.", options: [
          { text: "Malware that deletes all files on your computer", isCorrect: false },
          { text: "Malware that operates in memory without writing files to disk", isCorrect: true },
          { text: "A virus that only affects files but not programs", isCorrect: false },
          { text: "Malware that is too small to be detected", isCorrect: false },
        ]},
        { text: "Which is the MOST effective protection against ransomware?", explanation: "Regular offline backups that are tested for restoration are the most effective defense. If ransomware encrypts your files, you can restore from a clean backup without paying.", options: [
          { text: "Antivirus software alone", isCorrect: false },
          { text: "Regular tested offline backups", isCorrect: true },
          { text: "A strong firewall", isCorrect: false },
          { text: "Paying the ransom quickly", isCorrect: false },
        ]},
        { text: "What is double extortion in ransomware attacks?", explanation: "Modern ransomware gangs first steal sensitive data, then encrypt files. If the victim does not pay, they threaten to publish the stolen data publicly.", options: [
          { text: "Encrypting files twice with different keys", isCorrect: false },
          { text: "Attacking two companies simultaneously", isCorrect: false },
          { text: "Stealing data before encrypting and threatening to publish it", isCorrect: true },
          { text: "Demanding payment in two different cryptocurrencies", isCorrect: false },
        ]},
        { text: "You notice your antivirus has been disabled without your action. What does this indicate?", explanation: "Malware often disables security software to avoid detection. Disabled antivirus you did not turn off is a strong indicator of compromise requiring immediate investigation.", options: [
          { text: "A normal Windows update occurred", isCorrect: false },
          { text: "Your antivirus license expired", isCorrect: false },
          { text: "Possible malware infection - report to IT security immediately", isCorrect: true },
          { text: "Nothing to worry about, just re-enable it", isCorrect: false },
        ]},
      ]
    },
    {
      title: "Safe Browsing & Internet Security Quiz",
      description: "Assess your knowledge of web-based threats and secure browsing practices.",
      category: ModuleCategory.BROWSING, difficulty: Difficulty.BEGINNER, passingScore: 70, timeLimitMins: 10, moduleIndex: 4,
      questions: [
        { text: "What does the padlock icon in your browser address bar indicate?", explanation: "The padlock indicates an HTTPS connection with a valid SSL/TLS certificate. Traffic between you and the site is encrypted, but it does not guarantee the site itself is safe.", options: [
          { text: "The website is completely safe and trustworthy", isCorrect: false },
          { text: "The connection is encrypted with a valid SSL certificate", isCorrect: true },
          { text: "The website has been verified by the government", isCorrect: false },
          { text: "Your antivirus is active", isCorrect: false },
        ]},
        { text: "What is a drive-by download attack?", explanation: "Drive-by downloads automatically install malware when you visit a compromised website, requiring no clicks or interaction. Keeping browsers updated is the primary defense.", options: [
          { text: "Downloading files while driving", isCorrect: false },
          { text: "Malware that downloads automatically when visiting a compromised website", isCorrect: true },
          { text: "Downloading software from a USB drive", isCorrect: false },
          { text: "A fast internet download technique", isCorrect: false },
        ]},
        { text: "Which browser extension practice is MOST dangerous?", explanation: "Extensions from unknown sources can contain malware, spyware, or credential stealers. Only install from official browser stores and review permissions carefully.", options: [
          { text: "Using an ad blocker from the official store", isCorrect: false },
          { text: "Installing extensions from third-party websites", isCorrect: true },
          { text: "Using a password manager extension", isCorrect: false },
          { text: "Having fewer than five extensions installed", isCorrect: false },
        ]},
        { text: "You see a URL that looks like 'www.arnazon.com' in an email. What is suspicious about it?", explanation: "This is a typosquatting attack. The URL uses 'rn' which looks like 'm' at a glance. The real domain is amazon.com. Always read URLs carefully character by character.", options: [
          { text: "Nothing, it looks normal", isCorrect: false },
          { text: "The domain uses 'rn' instead of 'm' to mimic a legitimate site", isCorrect: true },
          { text: "It starts with www", isCorrect: false },
          { text: "It does not have https", isCorrect: false },
        ]},
        { text: "What is the safest way to access your bank's website?", explanation: "Typing the URL directly or using a saved bookmark eliminates the risk of clicking malicious links that redirect to fake banking sites.", options: [
          { text: "Click a link in an email from the bank", isCorrect: false },
          { text: "Search for it on Google and click the first result", isCorrect: false },
          { text: "Type the URL directly or use a saved bookmark", isCorrect: true },
          { text: "Follow a link shared on social media", isCorrect: false },
        ]},
      ]
    },
    {
      title: "Email Security Best Practices Quiz",
      description: "Test your knowledge of secure email handling, attachment safety, and data leakage prevention.",
      category: ModuleCategory.PHISHING, difficulty: Difficulty.INTERMEDIATE, passingScore: 75, timeLimitMins: 12, moduleIndex: 5,
      questions: [
        { text: "A colleague sends you an unexpected Word document asking you to 'Enable Macros' to view the content. What should you do?", explanation: "Macros can execute malicious code. If you did not expect the document, verify with the sender through a separate channel before enabling anything.", options: [
          { text: "Enable macros since it is from a colleague", isCorrect: false },
          { text: "Contact the colleague through a separate channel to verify they sent it", isCorrect: true },
          { text: "Forward it to other colleagues for their opinion", isCorrect: false },
          { text: "Open it on your phone instead", isCorrect: false },
        ]},
        { text: "What is the biggest risk of using BCC incorrectly when sending emails?", explanation: "Using CC instead of BCC exposes all recipient email addresses to everyone, potentially violating privacy regulations like GDPR and revealing contacts to unintended parties.", options: [
          { text: "The email might be slower to deliver", isCorrect: false },
          { text: "Accidentally exposing all recipient email addresses via CC", isCorrect: true },
          { text: "The email might go to spam", isCorrect: false },
          { text: "BCC emails cannot include attachments", isCorrect: false },
        ]},
        { text: "Why should you never forward work emails to your personal email account?", explanation: "Personal email lacks corporate security controls, encryption, and data loss prevention. Forwarding work data creates compliance risks and potential data breaches.", options: [
          { text: "Personal email is slower", isCorrect: false },
          { text: "It creates a security and compliance risk by moving data outside corporate controls", isCorrect: true },
          { text: "It uses more storage", isCorrect: false },
          { text: "It is only a problem for executives", isCorrect: false },
        ]},
        { text: "You need to send a sensitive contract to a client. What is the MOST secure method?", explanation: "Encrypted file sharing via approved platforms provides access controls, audit logging, link expiration, and encryption that regular email cannot match.", options: [
          { text: "Regular email attachment", isCorrect: false },
          { text: "Post it on social media as a private message", isCorrect: false },
          { text: "Use your organization's encrypted file sharing platform with link expiration", isCorrect: true },
          { text: "Send it via personal WhatsApp", isCorrect: false },
        ]},
        { text: "An email appears to come from your CEO requesting an urgent wire transfer. The email address looks correct. What should you do?", explanation: "Email addresses can be spoofed to look identical. For financial requests, always verify through a separate communication channel such as a phone call to the known number.", options: [
          { text: "Process it immediately since the CEO requested it urgently", isCorrect: false },
          { text: "Reply to the email asking for confirmation", isCorrect: false },
          { text: "Verify the request by calling the CEO directly using a known phone number", isCorrect: true },
          { text: "Forward it to the finance team to handle", isCorrect: false },
        ]},
      ]
    },
    {
      title: "Remote Work Security Assessment",
      description: "Evaluate your knowledge of secure remote work practices including home network security and VPN usage.",
      category: ModuleCategory.NETWORK, difficulty: Difficulty.INTERMEDIATE, passingScore: 70, timeLimitMins: 12, moduleIndex: 9,
      questions: [
        { text: "What is the FIRST thing you should do before accessing work resources from home?", explanation: "A VPN encrypts all traffic between your device and your organization's network, protecting work data even on your home network.", options: [
          { text: "Check social media", isCorrect: false },
          { text: "Connect to your organization's VPN", isCorrect: true },
          { text: "Open your email directly in the browser", isCorrect: false },
          { text: "Restart your computer", isCorrect: false },
        ]},
        { text: "What encryption standard should your home WiFi use?", explanation: "WPA3 is the latest and most secure WiFi encryption. WPA2 is acceptable. WEP is severely outdated and can be cracked in minutes.", options: [
          { text: "WEP", isCorrect: false },
          { text: "No encryption needed at home", isCorrect: false },
          { text: "WPA3 or WPA2", isCorrect: true },
          { text: "Open network for convenience", isCorrect: false },
        ]},
        { text: "Why should IoT devices (smart speakers, cameras) be on a separate network from your work devices?", explanation: "IoT devices often have poor security and rarely receive updates. If compromised, an attacker on the same network could access your work devices.", options: [
          { text: "IoT devices use too much bandwidth", isCorrect: false },
          { text: "Compromised IoT devices could provide attackers access to your work devices", isCorrect: true },
          { text: "It makes the internet faster", isCorrect: false },
          { text: "IoT devices do not work on the same network", isCorrect: false },
        ]},
        { text: "You are on a video call discussing confidential business strategy. What precaution is MOST important?", explanation: "Ensuring no unauthorized people can see or hear your confidential discussions prevents information leakage through physical observation.", options: [
          { text: "Use the highest video resolution", isCorrect: false },
          { text: "Ensure you are in a private space where no one can overhear", isCorrect: true },
          { text: "Keep the meeting under 30 minutes", isCorrect: false },
          { text: "Use a virtual background", isCorrect: false },
        ]},
        { text: "A family member asks to use your work laptop to check their email. What should you do?", explanation: "Work devices contain sensitive data and have security configurations. Family members could accidentally install malware, access confidential data, or compromise security settings.", options: [
          { text: "Let them use it briefly", isCorrect: false },
          { text: "Create a guest account for them", isCorrect: false },
          { text: "Politely decline - work devices should only be used by authorized employees", isCorrect: true },
          { text: "Let them use it but supervise them", isCorrect: false },
        ]},
      ]
    },
    {
      title: "Data Classification & Protection Quiz",
      description: "Test your understanding of data classification levels, handling procedures, and regulatory compliance.",
      category: ModuleCategory.DATA_PROTECTION, difficulty: Difficulty.INTERMEDIATE, passingScore: 75, timeLimitMins: 12, moduleIndex: 10,
      questions: [
        { text: "Which data classification level requires the STRICTEST access controls?", explanation: "Restricted data includes trade secrets, encryption keys, and regulated personal data. It requires the highest level of protection including encryption, MFA, and audit logging.", options: [
          { text: "Public", isCorrect: false },
          { text: "Internal", isCorrect: false },
          { text: "Confidential", isCorrect: false },
          { text: "Restricted", isCorrect: true },
        ]},
        { text: "You accidentally sent a confidential document to the wrong email recipient. What should you do FIRST?", explanation: "Immediately notifying your security team allows them to take action such as requesting deletion, assessing impact, and documenting the incident for compliance.", options: [
          { text: "Hope they do not open it", isCorrect: false },
          { text: "Send a follow-up email asking them to delete it", isCorrect: false },
          { text: "Report the incident to your security team immediately", isCorrect: true },
          { text: "Recall the email using the email recall feature", isCorrect: false },
        ]},
        { text: "What does GDPR's 'Right to Erasure' mean?", explanation: "GDPR gives individuals the right to request deletion of their personal data. Organizations must comply within specific timeframes when the legal basis for processing no longer applies.", options: [
          { text: "Companies must use erasable storage only", isCorrect: false },
          { text: "Individuals can request their personal data be deleted", isCorrect: true },
          { text: "All data must be encrypted", isCorrect: false },
          { text: "Companies must erase data every 30 days", isCorrect: false },
        ]},
        { text: "Why is standard file deletion NOT sufficient for sensitive data disposal?", explanation: "Standard deletion only removes the directory entry pointing to the file. The actual data remains on disk and can be recovered using forensic tools.", options: [
          { text: "It is too slow", isCorrect: false },
          { text: "The data remains on disk and can be recovered with forensic tools", isCorrect: true },
          { text: "It only works on small files", isCorrect: false },
          { text: "It requires administrator access", isCorrect: false },
        ]},
        { text: "Which scenario represents a data classification violation?", explanation: "Uploading confidential financial data to a personal Dropbox moves it outside corporate security controls, violating data handling policies for confidential information.", options: [
          { text: "Sharing a public press release on social media", isCorrect: false },
          { text: "Sending internal meeting notes to a colleague via corporate email", isCorrect: false },
          { text: "Uploading confidential financial reports to a personal Dropbox account", isCorrect: true },
          { text: "Printing a public document on the office printer", isCorrect: false },
        ]},
      ]
    },
    {
      title: "Incident Reporting Readiness Quiz",
      description: "Verify you know how to recognize, report, and respond to security incidents.",
      category: ModuleCategory.COMPLIANCE, difficulty: Difficulty.BEGINNER, passingScore: 70, timeLimitMins: 10, moduleIndex: 11,
      questions: [
        { text: "Which of the following IS a security incident that should be reported?", explanation: "Receiving a phishing email is a security incident even if you did not click anything. Reporting it helps the security team warn others and block the attack.", options: [
          { text: "Your computer takes a few seconds to start an application", isCorrect: false },
          { text: "You receive a phishing email even though you did not click it", isCorrect: true },
          { text: "A colleague asks you for directions to the cafeteria", isCorrect: false },
          { text: "Your monitor brightness changed", isCorrect: false },
        ]},
        { text: "You suspect your computer has malware. What is the correct order of actions?", explanation: "The priority is: stop the spread (disconnect), get expert help (contact IT), provide information (document what happened). Never try to fix it yourself.", options: [
          { text: "Try to remove the malware, then tell your manager", isCorrect: false },
          { text: "Disconnect from network, contact IT security, document what you observed", isCorrect: true },
          { text: "Shut down the computer and go home", isCorrect: false },
          { text: "Continue working and report it tomorrow", isCorrect: false },
        ]},
        { text: "Why is it important to report security incidents even if no damage occurred?", explanation: "Failed attacks provide intelligence about attacker techniques, help identify vulnerabilities, and allow the security team to strengthen defenses before a successful attack occurs.", options: [
          { text: "It is not important if no damage occurred", isCorrect: false },
          { text: "For entertainment purposes", isCorrect: false },
          { text: "It helps identify attack patterns and strengthen defenses before damage occurs", isCorrect: true },
          { text: "To make the IT team look busy", isCorrect: false },
        ]},
        { text: "You accidentally clicked a link and entered your password on a suspicious site. How quickly should you report this?", explanation: "Every minute counts after credentials are compromised. Attackers can use stolen credentials within minutes to access accounts, steal data, or move laterally.", options: [
          { text: "Within the next week", isCorrect: false },
          { text: "At the end of the business day", isCorrect: false },
          { text: "Immediately - time is critical", isCorrect: true },
          { text: "Only if you notice suspicious activity later", isCorrect: false },
        ]},
        { text: "During an incident investigation, the security team asks you to keep your potentially infected laptop running. Why?", explanation: "Volatile evidence in RAM (running processes, network connections, encryption keys) is lost when a computer shuts down. This evidence is crucial for forensic investigation.", options: [
          { text: "So you can continue working", isCorrect: false },
          { text: "To preserve forensic evidence in memory that would be lost on shutdown", isCorrect: true },
          { text: "The shutdown process would spread the malware", isCorrect: false },
          { text: "It is easier to clean malware on a running system", isCorrect: false },
        ]},
      ]
    },
    {
      title: "Insider Threat Awareness Assessment",
      description: "Test your ability to recognize insider threat indicators and understand prevention strategies.",
      category: ModuleCategory.SOCIAL_ENGINEERING, difficulty: Difficulty.ADVANCED, passingScore: 80, timeLimitMins: 15, moduleIndex: 14,
      questions: [
        { text: "Which scenario is MOST likely an indicator of an insider threat?", explanation: "Downloading large amounts of data shortly before leaving is a classic indicator of data theft. While each indicator alone may be innocent, this pattern is highly suspicious.", options: [
          { text: "An employee taking their lunch break off-site", isCorrect: false },
          { text: "An employee downloading large data files two weeks before their resignation date", isCorrect: true },
          { text: "An employee asking for help with a new software tool", isCorrect: false },
          { text: "An employee working from home on approved days", isCorrect: false },
        ]},
        { text: "What percentage of data breaches involve insiders according to industry research?", explanation: "Industry research consistently shows that approximately 60% of data breaches involve insider actions, whether malicious, negligent, or through compromised credentials.", options: [
          { text: "Less than 10%", isCorrect: false },
          { text: "About 25%", isCorrect: false },
          { text: "About 60%", isCorrect: true },
          { text: "Over 90%", isCorrect: false },
        ]},
        { text: "Which type of insider threat is the MOST common?", explanation: "Negligent insiders who cause breaches through carelessness (falling for phishing, mishandling data, ignoring policies) account for the majority of insider incidents.", options: [
          { text: "Malicious insiders seeking financial gain", isCorrect: false },
          { text: "Negligent insiders causing accidental breaches", isCorrect: true },
          { text: "Ideologically motivated insiders", isCorrect: false },
          { text: "Foreign intelligence operatives", isCorrect: false },
        ]},
        { text: "You notice a colleague accessing systems outside their job role after hours. What should you do?", explanation: "Report through proper channels allows trained investigators to assess the situation. Do not confront the individual or investigate yourself as this could compromise an investigation.", options: [
          { text: "Confront them directly and ask what they are doing", isCorrect: false },
          { text: "Ignore it since they are your colleague", isCorrect: false },
          { text: "Report it through your organization's confidential reporting channel", isCorrect: true },
          { text: "Tell other colleagues about it", isCorrect: false },
        ]},
        { text: "What is the principle of least privilege and why does it help prevent insider threats?", explanation: "Least privilege means users only have access to the minimum resources needed for their role. This limits the damage any insider can cause, whether malicious or negligent.", options: [
          { text: "Giving everyone the same level of access for fairness", isCorrect: false },
          { text: "Restricting access to the minimum needed for each role, limiting potential damage", isCorrect: true },
          { text: "Only allowing managers to access systems", isCorrect: false },
          { text: "Requiring approval for every action", isCorrect: false },
        ]},
      ]
    },
  ];

  // Create quizzes with questions and options in DB
  const createdQuizzes = [];
  for (const q of quizzesData) {
    const quiz = await prisma.quiz.create({
      data: {
        title: q.title,
        description: q.description,
        category: q.category,
        difficulty: q.difficulty,
        passingScore: q.passingScore,
        timeLimitMins: q.timeLimitMins,
        status: QuizStatus.PUBLISHED,
        moduleId: createdModules[q.moduleIndex]?.id,
        organizationId: organization.id,
      }
    });
    for (let qi = 0; qi < q.questions.length; qi++) {
      const qData = q.questions[qi];
      const question = await prisma.question.create({
        data: {
          text: qData.text,
          explanation: qData.explanation,
          order: qi + 1,
          quizId: quiz.id,
        }
      });
      for (let oi = 0; oi < qData.options.length; oi++) {
        await prisma.questionOption.create({
          data: {
            text: qData.options[oi].text,
            isCorrect: qData.options[oi].isCorrect,
            order: oi + 1,
            questionId: question.id,
          }
        });
      }
    }
    createdQuizzes.push(quiz);
  }
  console.log("Created " + createdQuizzes.length + " quizzes with questions");

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
        timeTaken: (quizzesData[i].timeLimitMins - 3) * 60,
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
