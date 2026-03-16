import { z } from "zod";

// Auth validations
export const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(1, "Password is required").max(128),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100)
    .regex(/^[a-zA-Z\s-]+$/, "Name can only contain letters, spaces and hyphens"),
  email: z.string().email("Invalid email address").max(255),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Contact form
export const contactSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Invalid email").max(255),
  company: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

// Profile update
export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  jobTitle: z.string().max(100).optional().nullable(),
});

// User management (admin)
export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum(["ADMIN", "EMPLOYEE", "GUEST"]),
  departmentId: z.string().optional().nullable(),
  jobTitle: z.string().max(100).optional().nullable(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().max(255).optional(),
  role: z.enum(["ADMIN", "EMPLOYEE", "GUEST"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  departmentId: z.string().optional().nullable(),
  jobTitle: z.string().max(100).optional().nullable(),
});

// Campaign
export const createCampaignSchema = z.object({
  name: z.string().min(2, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(["TRAINING", "PHISHING_SIMULATION", "ASSESSMENT", "AWARENESS"]),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  moduleIds: z.array(z.string()).optional(),
  departmentIds: z.array(z.string()).optional(),
  userIds: z.array(z.string()).optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial().extend({
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]).optional(),
});

// Quiz
export const createQuizSchema = z.object({
  title: z.string().min(2, "Title is required").max(200),
  description: z.string().max(2000).optional().nullable(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  category: z.enum([
    "PHISHING", "PASSWORDS", "SOCIAL_ENGINEERING", "MALWARE",
    "BROWSING", "MOBILE", "NETWORK", "DATA_PROTECTION", "COMPLIANCE", "GENERAL"
  ]),
  passingScore: z.number().min(1).max(100).default(70),
  timeLimitMins: z.number().min(1).max(180).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  dueDate: z.string().optional().nullable(),
  visibleFrom: z.string().optional().nullable(),
  visibleUntil: z.string().optional().nullable(),
});

export const createQuestionSchema = z.object({
  text: z.string().min(1, "Question text is required").max(1000),
  explanation: z.string().max(2000).optional().nullable(),
  order: z.number().optional(),
  options: z.array(z.object({
    text: z.string().min(1, "Option text is required").max(500),
    isCorrect: z.boolean(),
    order: z.number().optional(),
  })).min(2, "At least 2 options required").max(6),
}).refine(
  (data) => data.options.some((o) => o.isCorrect),
  { message: "At least one option must be correct", path: ["options"] }
);

// Quiz submission
export const quizSubmissionSchema = z.object({
  answers: z.record(z.string(), z.string()), // questionId -> optionId
  timeTaken: z.number().min(0),
});

// Quiz assignment
export const quizAssignmentSchema = z.object({
  departmentIds: z.array(z.string()).optional(),
  userIds: z.array(z.string()).optional(),
  dueDate: z.string().optional().nullable(),
});

// Contact status update (admin)
export const contactStatusSchema = z.object({
  status: z.enum(["NEW", "IN_REVIEW", "CONTACTED", "CLOSED"]),
  internalNotes: z.string().max(5000).optional().nullable(),
});

// Pagination/filter schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type QuizSubmissionInput = z.infer<typeof quizSubmissionSchema>;
export type QuizAssignmentInput = z.infer<typeof quizAssignmentSchema>;
export type ContactStatusInput = z.infer<typeof contactStatusSchema>;
