import type {
  User, Department, Module, Lesson, Quiz, Question, QuestionOption,
  QuizResult, Campaign, Badge, UserBadge, Certificate, PhishingExample,
  Activity, ContactRequest, ModuleProgress, AuditLog, SubscriptionEvent,
  Organization, Invitation, OrgSetting,
  UserRole, UserStatus, Difficulty, ModuleCategory, LessonType,
  QuizStatus, CampaignStatus, CampaignType, ContactStatus, ActivityType, BadgeColor,
  OrganizationPlan,
  OrganizationStatus,
} from "@prisma/client";

export type {
  User, Department, Module, Lesson, Quiz, Question, QuestionOption,
  QuizResult, Campaign, Badge, UserBadge, Certificate, PhishingExample,
  Activity, ContactRequest, ModuleProgress, AuditLog, SubscriptionEvent,
  Organization, Invitation, OrgSetting,
  UserRole, UserStatus, Difficulty, ModuleCategory, LessonType,
  QuizStatus, CampaignStatus, CampaignType, ContactStatus, ActivityType, BadgeColor,
  OrganizationPlan,
  OrganizationStatus,
};

// Safe user type without password hash
export type SafeUser = Omit<User, "passwordHash">;

// Session user type
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  departmentId: string | null;
  organizationId: string | null;
  organizationSlug: string | null;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard stats
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalModules: number;
  totalQuizzes: number;
  totalCampaigns: number;
  averageQuizScore: number;
  completionRate: number;
  highRiskUsers: number;
  recentActivities: Activity[];
}

export interface EmployeeStats {
  totalModules: number;
  completedModules: number;
  averageScore: number;
  riskScore: number;
  totalQuizzes: number;
  passedQuizzes: number;
  badges: (UserBadge & { badge: Badge })[];
  certificates: Certificate[];
  recentActivities: Activity[];
}

// Quiz submission
export interface QuizSubmission {
  answers: Record<string, string>; // questionId -> optionId
  timeTaken: number;
}

export interface QuizResultDetail {
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  answers: {
    questionId: string;
    selectedOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
  }[];
}


// Super Admin stats
export interface SuperAdminStats {
  totalOrganizations: number;
  activeOrganizations: number;
  suspendedOrganizations: number;
  totalUsers: number;
  orgsByPlan: Record<string, number>;
  recentAuditLogs: AuditLog[];
  recentOrganizations: Organization[];
}
